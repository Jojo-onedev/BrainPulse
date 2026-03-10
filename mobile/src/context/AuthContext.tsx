import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AppUser } from '../types';
import { supabase } from '../services/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { uploadImage } from '../services/storage';

interface AuthContextType {
    user: AppUser | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string, photoURL?: string) => Promise<{ user: SupabaseUser | null; session: Session | null; requiresConfirmation: boolean }>;
    updateProfile: (displayName: string, photoURL?: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => ({ user: null, session: null, requiresConfirmation: false }),
    updateProfile: async () => { },
    signOut: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Map Supabase user + DB profile to AppUser type
    const mapToAppUser = (supabaseUser: SupabaseUser, profile: any): AppUser => {
        return {
            uid: supabaseUser.id,
            email: supabaseUser.email || '',
            displayName: profile?.display_name || profile?.displayName || '',
            createdAt: profile?.created_at ? new Date(profile.created_at).getTime() : Date.now(),
            isPremium: profile?.is_premium || false,
            photoURL: profile?.photo_url || profile?.photoURL || '',
            stats: {
                totalQuizzesPlayed: profile?.total_games || 0,
                totalScore: profile?.total_score || 0,
                averageScore: profile?.average_score || 0,
                bestCategory: profile?.best_category || '',
            },
            favorites: profile?.favorites || [],
        };
    };

    const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', supabaseUser.id)
                .single();

            if (error) {
                // If profile doesn't exist yet, we might want to wait or retry
                console.log('Profile not found for user:', supabaseUser.id);
                return null;
            }
            return data;
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            return null;
        }
    };

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!isMounted) return;

            setSession(session);
            if (session?.user) {
                const profile = await fetchUserProfile(session.user);
                if (isMounted && profile) {
                    setUser(mapToAppUser(session.user, profile));
                }
            }
            setLoading(false);
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event change:', event);
            if (!isMounted) return;

            setSession(session);
            if (session?.user) {
                // Fetch profile. If it's a new signup, it might take a moment to be created
                let profile = await fetchUserProfile(session.user);

                // Simple retry if not found (Supabase triggers can be async)
                if (!profile && event === 'SIGNED_IN') {
                    console.log('Retrying profile fetch in 1.5s...');
                    await new Promise(r => setTimeout(r, 1500));
                    if (!isMounted) return;
                    profile = await fetchUserProfile(session.user);
                }

                if (isMounted) {
                    if (profile) {
                        setUser(mapToAppUser(session.user, profile));
                    } else {
                        // Still no profile? Maybe it failed during signup
                        setUser(null);
                    }
                }
            } else {
                setUser(null);
            }

            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        console.log('Attempting signIn for:', email);
        setLoading(true);
        try {
            const { error, data } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error('Supabase signIn error:', error);
                setLoading(false);
                throw error;
            }

            console.log('Supabase signIn success for user:', data.user?.id);
        } catch (err) {
            setLoading(false);
            throw err;
        }
    };

    const signUp = async (email: string, password: string, displayName: string, photoURL?: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;
            if (!data.user) throw new Error('Sign up failed');

            console.log('Signup success, id:', data.user.id);
            // If session is null, it means email confirmation is required
            const requiresConfirmation = data.session === null;
            console.log('Requires confirmation:', requiresConfirmation);

            let finalPhotoURL = photoURL || '';

            // Handle image upload if photoURL is a local path
            if (photoURL && !photoURL.startsWith('http')) {
                try {
                    console.log('Uploading avatar...');
                    finalPhotoURL = await uploadImage(photoURL, `avatars/${data.user.id}_${Date.now()}.jpg`);
                    console.log('Avatar uploaded:', finalPhotoURL);
                } catch (uploadError) {
                    console.error('Initial avatar upload failed:', uploadError);
                }
            }

            console.log('Checking for dangling profile...');

            // 1. Check if a profile already exists for this email (dangling profile from a deleted auth account)
            const { data: existingProfile, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .maybeSingle(); // maybeSingle() avoids error if no row found

            if (existingProfile && existingProfile.id !== data.user.id) {
                console.log('Cleaning up dangling profile for email:', email);
                const { error: deleteError } = await supabase
                    .from('users')
                    .delete()
                    .eq('id', existingProfile.id);

                if (deleteError) {
                    console.error('Failed to delete dangling profile:', deleteError);
                    // We continue anyway, the upsert might still work or will fail with the same error
                }
            }

            console.log('Upserting profile for user:', data.user.id);
            // 2. Create/Update profile in PostgreSQL
            const { error: profileError } = await supabase
                .from('users')
                .upsert([
                    {
                        id: data.user.id,
                        email: data.user.email,
                        display_name: displayName,
                        photo_url: finalPhotoURL,
                        wallet_balance: 0,
                        total_games: 0,
                        total_wins: 0,
                        is_premium: false,
                    }
                ]);

            if (profileError) {
                console.error('Error creating profile during signup:', profileError);
                // Throwing here so the user knows the registration isn't complete
                throw new Error('Votre compte auth est créé mais la synchronisation du profil a échoué : ' + profileError.message);
            }

            console.log('Profile created/synced successfully');

            return { user: data.user, session: data.session, requiresConfirmation };

        } catch (error) {
            setLoading(false);
            throw error;
        } finally {
            // Only stop loading if we are NOT redirecting or waiting for auto-confirmation
            // Actually, let the screen handle the end of loading state based on the result
        }
    };

    const updateProfile = async (displayName: string, photoURL?: string) => {
        if (!session?.user) throw new Error('No user logged in');

        try {
            let finalPhotoURL = photoURL || '';

            if (photoURL && !photoURL.startsWith('http')) {
                finalPhotoURL = await uploadImage(photoURL, `avatars/${session.user.id}_${Date.now()}.jpg`);
            }

            const { error } = await supabase
                .from('users')
                .update({
                    display_name: displayName,
                    photo_url: finalPhotoURL,
                })
                .eq('id', session.user.id);

            if (error) throw error;

            // Local update will happen via onAuthStateChange listener if profile is re-fetched
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error(error);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, updateProfile, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
