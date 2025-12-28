import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Image } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, CheckCircle, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { PremiumAlert } from '../../components/ui/PremiumAlert';
import { mapAuthError } from '../../services/alertService';

export const SignupScreen = ({ navigation }: any) => {
    const { signUp, loading } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type?: 'error' | 'success' }>({
        visible: false,
        title: '',
        message: '',
        type: 'error'
    });

    const PRESET_AVATARS = [
        'https://api.dicebear.com/7.x/avataaars/png?seed=Felix',
        'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka',
        'https://api.dicebear.com/7.x/avataaars/png?seed=Boots',
        'https://api.dicebear.com/7.x/avataaars/png?seed=Buddy',
        'https://api.dicebear.com/7.x/avataaars/png?seed=Cuddles',
        'https://api.dicebear.com/7.x/avataaars/png?seed=Daisy',
    ];

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setSelectedPhoto(result.assets[0].uri);
        }
    };

    const handleSignup = async () => {
        if (!displayName || !email || !password) {
            setAlert({
                visible: true,
                title: 'Champs requis',
                message: 'Veuillez remplir tous les champs pour continuer.',
            });
            return;
        }

        if (password !== confirmPassword) {
            setAlert({
                visible: true,
                title: 'Mots de passe',
                message: 'Les deux mots de passe ne correspondent pas.',
            });
            return;
        }

        try {
            await signUp(email, password, displayName, selectedPhoto || undefined);
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (error: any) {
            setAlert({
                visible: true,
                title: 'Erreur d\'inscription',
                message: mapAuthError(error.code || error.message),
            });
        }
    };

    return (
        <ScreenWrapper style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.title}>Créer un compte</Text>
                    <Text style={styles.subtitle}>Rejoins la communauté BrainPulse !</Text>

                    <View style={styles.avatarPickerSection}>
                        <View style={styles.mainAvatarContainer}>
                            {selectedPhoto ? (
                                <View style={styles.imageWrapper}>
                                    <Image
                                        source={{ uri: selectedPhoto }}
                                        style={styles.fullImage}
                                    />
                                </View>
                            ) : (
                                <View style={styles.placeholderAvatar}>
                                    <User size={40} color={COLORS.primary} />
                                </View>
                            )}
                            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                                <Camera size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.avatarLabel}>Ou choisis un avatar :</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                            {PRESET_AVATARS.map((avatar, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.presetAvatar,
                                        selectedPhoto === avatar && styles.selectedPreset
                                    ]}
                                    onPress={() => setSelectedPhoto(avatar)}
                                >
                                    <View style={styles.presetInner}>
                                        <Image source={{ uri: avatar }} style={styles.presetImage} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <User color={COLORS.textSecondary} size={20} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Pseudo"
                                value={displayName}
                                onChangeText={setDisplayName}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Mail color={COLORS.textSecondary} size={20} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Lock color={COLORS.textSecondary} size={20} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Mot de passe"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <CheckCircle color={COLORS.textSecondary} size={20} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirmer mot de passe"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.buttonText}>S'inscrire</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.footerLink}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.linkText}>Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text></Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            <PremiumAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ ...alert, visible: false })}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        padding: SPACING.xl,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.s,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xl * 2,
    },
    form: {
        gap: SPACING.m,
    },
    inputContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        height: 56,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    icon: {
        marginRight: SPACING.m,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    button: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.m,
        ...SHADOWS.medium,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footerLink: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    linkText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    linkBold: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    avatarPickerSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    mainAvatarContainer: {
        width: 100,
        height: 100,
        position: 'relative',
        marginBottom: SPACING.m,
    },
    placeholderAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary + '30',
        borderStyle: 'dashed',
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: 100,
        height: 100,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    avatarLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
    },
    presetScroll: {
        flexDirection: 'row',
    },
    presetAvatar: {
        padding: 4,
        borderRadius: 30,
        marginRight: SPACING.s,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedPreset: {
        borderColor: COLORS.primary,
    },
    presetInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    presetImage: {
        width: '100%',
        height: '100%',
    },
});
