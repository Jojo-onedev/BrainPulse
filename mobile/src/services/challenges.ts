import { supabase } from './supabase';
import { Challenge, Question, User } from '../types';

const USERS_TABLE = 'users';
const CHALLENGES_TABLE = 'challenges';

const searchUsers = async (searchTerm: string, currentUserId: string): Promise<User[]> => {
    if (!searchTerm.trim()) return [];

    try {
        const { data, error } = await supabase
            .from(USERS_TABLE)
            .select('*')
            .ilike('display_name', `%${searchTerm}%`)
            .neq('id', currentUserId)
            .limit(10);

        if (error) throw error;

        return (data || []).map(profile => ({
            uid: profile.id,
            email: profile.email,
            displayName: profile.display_name,
            createdAt: new Date(profile.created_at).getTime(),
            isPremium: profile.is_premium,
            photoURL: profile.photo_url,
            stats: {
                totalQuizzesPlayed: profile.total_games || 0,
                totalScore: profile.total_score || 0,
                averageScore: profile.average_score || 0,
                bestCategory: profile.best_category || '',
            },
            favorites: profile.favorites || [],
        }));
    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
};

const getPotentialOpponents = async (currentUserId: string): Promise<User[]> => {
    try {
        const { data, error } = await supabase
            .from(USERS_TABLE)
            .select('*')
            .neq('id', currentUserId)
            .order('display_name')
            .limit(20);

        if (error) throw error;

        return (data || []).map(profile => ({
            uid: profile.id,
            email: profile.email,
            displayName: profile.display_name,
            createdAt: new Date(profile.created_at).getTime(),
            isPremium: profile.is_premium,
            photoURL: profile.photo_url,
            stats: {
                totalQuizzesPlayed: profile.total_games || 0,
                totalScore: profile.total_score || 0,
                averageScore: profile.average_score || 0,
                bestCategory: profile.best_category || '',
            },
            favorites: profile.favorites || [],
        }));
    } catch (error) {
        console.error('Error getting potential opponents:', error);
        return [];
    }
};

const createChallenge = async (
    attacker: { uid: string; displayName: string; photoURL?: string },
    defender: { uid: string; displayName: string },
    quizCategory: string,
    questions: Question[],
    attackerScore: number
): Promise<string> => {
    try {
        const { data, error } = await supabase
            .from(CHALLENGES_TABLE)
            .insert([
                {
                    attacker_id: attacker.uid,
                    attacker_name: attacker.displayName,
                    attacker_photo_url: attacker.photoURL || null,
                    defender_id: defender.uid,
                    defender_name: defender.displayName,
                    status: 'pending',
                    quiz_category: quizCategory,
                    questions: questions,
                    attacker_score: attackerScore,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data.id;
    } catch (error) {
        console.error('Error creating challenge:', error);
        throw error;
    }
};

const getReceivedChallenges = async (userId: string): Promise<Challenge[]> => {
    try {
        const { data, error } = await supabase
            .from(CHALLENGES_TABLE)
            .select('*')
            .eq('defender_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(c => ({
            id: c.id,
            attackerId: c.attacker_id,
            attackerName: c.attacker_name,
            attackerPhotoURL: c.attacker_photo_url,
            defenderId: c.defender_id,
            defenderName: c.defender_name,
            status: c.status,
            quizCategory: c.quiz_category,
            questions: c.questions,
            attackerScore: c.attacker_score,
            defenderScore: c.defender_score,
            winnerId: c.winner_id,
            createdAt: new Date(c.created_at).getTime(),
            updatedAt: new Date(c.updated_at).getTime(),
        } as Challenge));
    } catch (error) {
        console.error('Error getting received challenges:', error);
        return [];
    }
};

const getSentChallenges = async (userId: string): Promise<Challenge[]> => {
    try {
        const { data, error } = await supabase
            .from(CHALLENGES_TABLE)
            .select('*')
            .eq('attacker_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        return (data || []).map(c => ({
            id: c.id,
            attackerId: c.attacker_id,
            attackerName: c.attacker_name,
            attackerPhotoURL: c.attacker_photo_url,
            defenderId: c.defender_id,
            defenderName: c.defender_name,
            status: c.status,
            quizCategory: c.quiz_category,
            questions: c.questions,
            attackerScore: c.attacker_score,
            defenderScore: c.defender_score,
            winnerId: c.winner_id,
            createdAt: new Date(c.created_at).getTime(),
            updatedAt: new Date(c.updated_at).getTime(),
        } as Challenge));
    } catch (error) {
        console.error('Error getting sent challenges:', error);
        return [];
    }
};

const completeChallenge = async (challengeId: string, defenderScore: number): Promise<void> => {
    try {
        // Fetch challenge data first to determine winner
        const { data: challengeData, error: fetchError } = await supabase
            .from(CHALLENGES_TABLE)
            .select('*')
            .eq('id', challengeId)
            .single();

        if (fetchError) throw fetchError;

        const winnerId = defenderScore > challengeData.attacker_score
            ? challengeData.defender_id
            : (challengeData.attacker_score > defenderScore ? challengeData.attacker_id : 'draw');

        const { error } = await supabase
            .from(CHALLENGES_TABLE)
            .update({
                defender_score: defenderScore,
                status: 'completed',
                winner_id: winnerId,
                updated_at: new Date().toISOString(),
            })
            .eq('id', challengeId);

        if (error) throw error;
    } catch (error) {
        console.error('Error completing challenge:', error);
        throw error;
    }
};

const deleteChallenge = async (challengeId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from(CHALLENGES_TABLE)
            .delete()
            .eq('id', challengeId);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting challenge:', error);
        throw error;
    }
};

const updatePlayerStats = async (userId: string, score: number): Promise<void> => {
    try {
        // In PostgreSQL, we can't easily do increment in a single call without RPC or native SQL
        // But Supabase allows it via .rpc or we fetch then update
        // For simplicity, we use the current profile and update
        const { data: profile } = await supabase
            .from(USERS_TABLE)
            .select('total_score, total_games')
            .eq('id', userId)
            .single();

        if (profile) {
            await supabase
                .from(USERS_TABLE)
                .update({
                    total_score: (profile.total_score || 0) + score,
                    total_games: (profile.total_games || 0) + 1
                })
                .eq('id', userId);
        }
    } catch (error) {
        console.error('Error updating player stats:', error);
    }
};

export const challengeService = {
    searchUsers,
    getPotentialOpponents,
    createChallenge,
    getReceivedChallenges,
    getSentChallenges,
    completeChallenge,
    deleteChallenge,
    updatePlayerStats
};
