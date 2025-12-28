import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { PremiumAlert } from '../../components/ui/PremiumAlert';
import { mapAuthError } from '../../services/alertService';

export const LoginScreen = ({ navigation }: any) => {
    const { signIn, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string }>({
        visible: false,
        title: '',
        message: '',
    });

    const handleLogin = async () => {
        try {
            await signIn(email, password);
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (error: any) {
            setAlert({
                visible: true,
                title: 'Oups !',
                message: mapAuthError(error.code || error.message),
            });
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScreenWrapper style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Bon retour !</Text>
                    <Text style={styles.subtitle}>Connectez-vous pour reprendre la compétition.</Text>

                    <View style={styles.form}>
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

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>Se connecter</Text>
                                    <LogIn color="#FFF" size={20} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.footerLink}
                    onPress={() => navigation.navigate('Signup')} // Stubb nav to signup
                >
                    <Text style={styles.linkText}>Pas encore de compte ? <Text style={styles.linkBold}>S'inscrire</Text></Text>
                </TouchableOpacity>
            </ScreenWrapper>

            <PremiumAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                onClose={() => setAlert({ ...alert, visible: false })}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.xl,
        justifyContent: 'center',
    },
    content: {
        flex: 1,
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
        gap: SPACING.s,
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
});
