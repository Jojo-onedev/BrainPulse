import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, FONTS } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RotateCcw, User, Settings, LogOut, Trophy, Zap, Target, Star, ChevronRight } from 'lucide-react-native';
import { SHADOWS } from '../../theme';

export const ProfileScreen = () => {
    const { user, signOut } = useAuth();

    const handleResetOnboarding = async () => {
        try {
            await AsyncStorage.removeItem('alreadyLaunched');
            Alert.alert(
                'Succès',
                'Le statut "Déjà lancé" a été réinitialisé. Redémarrez l\'application pour revoir l\'Onboarding.',
                [{ text: 'OK' }]
            );
        } catch (e) {
            console.error(e);
        }
    };

    if (!user) {
        return (
            <ScreenWrapper style={styles.centerContent}>
                <Text style={styles.sectionTitle}>Non connecté</Text>
                <Text style={{ color: COLORS.textSecondary, marginBottom: 20 }}>Connectez-vous pour voir votre profil</Text>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarInner}>
                        {user.photoURL ? (
                            <Image
                                source={{ uri: user.photoURL }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <User size={48} color={COLORS.primary} strokeWidth={2.5} />
                        )}
                    </View>
                    {user.isPremium && (
                        <View style={styles.premiumBadge}>
                            <Star size={12} color="#FFF" fill="#FFF" />
                        </View>
                    )}
                </View>
                <Text style={styles.username}>{user.displayName}</Text>
                <Text style={styles.email}>{user.email}</Text>
            </View>

            <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>Performances</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: '#FFD70020' }]}>
                            <Trophy size={20} color="#FFD700" />
                        </View>
                        <Text style={styles.statCardValue}>{user.stats.totalScore}</Text>
                        <Text style={styles.statCardLabel}>Points</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: COLORS.secondary + '20' }]}>
                            <Zap size={20} color={COLORS.secondary} />
                        </View>
                        <Text style={styles.statCardValue}>{user.stats.totalQuizzesPlayed}</Text>
                        <Text style={styles.statCardLabel}>Quiz</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '20' }]}>
                            <Target size={20} color={COLORS.success} />
                        </View>
                        <Text style={styles.statCardValue}>{user.stats.averageScore}%</Text>
                        <Text style={styles.statCardLabel}>Moyenne</Text>
                    </View>
                </View>
            </View>

            <View style={styles.optionsSection}>
                <Text style={styles.sectionTitle}>Plus</Text>

                <TouchableOpacity style={styles.optionItem} onPress={handleResetOnboarding}>
                    <View style={styles.optionLeft}>
                        <View style={[styles.optionIcon, { backgroundColor: COLORS.primary + '10' }]}>
                            <RotateCcw size={18} color={COLORS.primary} />
                        </View>
                        <Text style={styles.optionText}>Revoir l'Onboarding</Text>
                    </View>
                    <ChevronRight size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem} onPress={signOut}>
                    <View style={styles.optionLeft}>
                        <View style={[styles.optionIcon, { backgroundColor: COLORS.error + '10' }]}>
                            <LogOut size={18} color={COLORS.error} />
                        </View>
                        <Text style={[styles.optionText, { color: COLORS.error }]}>Se déconnecter</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.versionText}>BrainPulse Version 1.0.0</Text>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        paddingVertical: SPACING.xl * 1.5,
        backgroundColor: '#FFF',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SPACING.m,
    },
    avatarInner: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary + '20',
        ...SHADOWS.small,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    premiumBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#FFD700',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 15,
        color: COLORS.textSecondary,
        opacity: 0.8,
    },
    statsSection: {
        paddingHorizontal: SPACING.m,
        paddingBottom: SPACING.l,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.m,
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.6,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: SPACING.m,
        borderRadius: 20,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    statCardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statCardLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    optionsSection: {
        paddingHorizontal: SPACING.m,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: SPACING.s,
        ...SHADOWS.tiny,
    },
    optionIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text,
    },
    footer: {
        marginTop: 'auto',
        padding: SPACING.xl,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        opacity: 0.5,
    },
});
