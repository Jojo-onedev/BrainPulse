import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, Share } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    RotateCcw, User, Settings, LogOut, Trophy, Zap,
    Target, Star, ChevronRight, CreditCard, Bell,
    Shield, HelpCircle, Share2, Heart, BarChart3
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

export const ProfileScreen = () => {
    const { user, signOut } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const shareApp = async () => {
        try {
            await Share.share({
                message: 'Viens tester tes connaissances sur Duelio ! L\'application de quiz ultime. 🧠🏆',
                url: 'https://duelio.app', // Placeholder URL
                title: 'Duelio'
            });
        } catch (error: any) {
            console.error(error.message);
        }
    };

    if (!user) {
        return (
            <ScreenWrapper style={styles.centerContent}>
                <View style={styles.emptyState}>
                    <User size={64} color={COLORS.border} />
                    <Text style={styles.emptyTitle}>Non connecté</Text>
                    <Text style={styles.emptySubtitle}>Connectez-vous pour accéder à votre profil et vos statistiques.</Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.primaryButtonText}>Se connecter</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    const MenuOption = ({ icon: Icon, label, onPress, color = COLORS.primary, rightElement, description }: any) => (
        <TouchableOpacity style={styles.optionItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: color + '15' }]}>
                    <Icon size={20} color={color} strokeWidth={2.5} />
                </View>
                <View>
                    <Text style={styles.optionText}>{label}</Text>
                    {description && <Text style={styles.optionDescription}>{description}</Text>}
                </View>
            </View>
            {rightElement || <ChevronRight size={18} color={COLORS.textSecondary} opacity={0.5} />}
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header Section */}
                <Animated.View entering={FadeInDown.duration(600)} style={styles.profileHeader}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarGlow} />
                        <View style={styles.avatarInner}>
                            {user.photoURL ? (
                                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
                            ) : (
                                <User size={48} color={COLORS.primary} strokeWidth={2.5} />
                            )}
                        </View>
                        {user.isPremium && (
                            <View style={styles.premiumBadgeLarge}>
                                <Star size={14} color="#FFF" fill="#FFF" />
                            </View>
                        )}
                    </View>

                    <Text style={styles.usernameText}>{user.displayName}</Text>
                    <Text style={styles.emailText}>{user.email}</Text>

                    <TouchableOpacity
                        style={styles.editPill}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Settings size={14} color={COLORS.primary} />
                        <Text style={styles.editPillText}>Éditer le profil</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Stats Dashboard */}
                <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.statsDashboard}>
                    <View style={styles.statBox}>
                        <View style={[styles.statBadge, { backgroundColor: '#FFD70015' }]}>
                            <Trophy size={18} color="#FFD700" />
                        </View>
                        <Text style={styles.statValue}>{user.stats.totalScore}</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>

                    <View style={styles.statBox}>
                        <View style={[styles.statBadge, { backgroundColor: COLORS.secondary + '15' }]}>
                            <Zap size={18} color={COLORS.secondary} />
                        </View>
                        <Text style={styles.statValue}>{user.stats.totalQuizzesPlayed}</Text>
                        <Text style={styles.statLabel}>Quiz</Text>
                    </View>

                    <View style={styles.statBox}>
                        <View style={[styles.statBadge, { backgroundColor: COLORS.success + '15' }]}>
                            <Target size={18} color={COLORS.success} />
                        </View>
                        <Text style={styles.statValue}>{user.stats.averageScore}%</Text>
                        <Text style={styles.statLabel}>Précision</Text>
                    </View>
                </Animated.View>

                {/* Main Menu Groups */}
                <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.menuGroup}>
                    <Text style={styles.groupTitle}>Activité</Text>
                    <MenuOption
                        icon={BarChart3}
                        label="Statistiques"
                        description="Voir votre progression détaillée"
                        onPress={() => navigation.navigate('Statistics')}
                    />
                    <MenuOption
                        icon={Heart}
                        label="Favoris"
                        description="Retrouvez vos questions préférées"
                        onPress={() => navigation.navigate('Favorites')}
                    />
                    <MenuOption
                        icon={Trophy}
                        label="Leaderboard"
                        description="Classement des meilleurs joueurs"
                        onPress={() => navigation.navigate('Leaderboard')}
                    />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.menuGroup}>
                    <Text style={styles.groupTitle}>Compte & Sécurité</Text>
                    <MenuOption
                        icon={CreditCard}
                        label="Abonnement Duelio"
                        color={COLORS.warning}
                        onPress={() => navigation.navigate('Paywall')}
                        rightElement={
                            <View style={[styles.badge, { backgroundColor: COLORS.warning + '20' }]}>
                                <Text style={[styles.badgeText, { color: COLORS.warning }]}>
                                    {user.isPremium ? 'ACTIF' : 'UPGRADE'}
                                </Text>
                            </View>
                        }
                    />
                    <MenuOption
                        icon={Bell}
                        label="Notifications"
                        onPress={() => navigation.navigate('Notifications')}
                    />
                    <MenuOption
                        icon={Shield}
                        label="Confidentialité"
                        onPress={() => navigation.navigate('Privacy')}
                    />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.menuGroup}>
                    <Text style={styles.groupTitle}>Support & Infos</Text>
                    <MenuOption
                        icon={HelpCircle}
                        label="Centre d'aide"
                        onPress={() => navigation.navigate('HelpCenter')}
                    />
                    <MenuOption
                        icon={Share2}
                        label="Partager l'application"
                        onPress={shareApp}
                    />
                </Animated.View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={signOut}
                >
                    <LogOut size={20} color={COLORS.error} />
                    <Text style={styles.logoutText}>Se déconnecter</Text>
                </TouchableOpacity>

                <Text style={styles.versionLabel}>Duelio • Version 1.0.0 (Alpha)</Text>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingTop: SPACING.l,
        paddingBottom: SPACING.xl * 2,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SPACING.m,
        marginBottom: SPACING.s,
    },
    emptySubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: 16,
        ...SHADOWS.medium,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: SPACING.m,
    },
    avatarGlow: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 60,
        backgroundColor: COLORS.primary + '20',
        zIndex: -1,
    },
    avatarInner: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
        ...SHADOWS.medium,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    premiumBadgeLarge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: COLORS.warning,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
        ...SHADOWS.small,
    },
    usernameText: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: 2,
        letterSpacing: -0.5,
    },
    emailText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        opacity: 0.7,
        marginBottom: SPACING.m,
    },
    editPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.tiny,
    },
    editPillText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    statsDashboard: {
        flexDirection: 'row',
        marginHorizontal: SPACING.m,
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: SPACING.m,
        marginBottom: SPACING.xl,
        ...SHADOWS.small,
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statBadge: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.text,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        marginTop: 2,
        opacity: 0.6,
    },
    menuGroup: {
        marginHorizontal: SPACING.m,
        marginBottom: SPACING.l,
    },
    groupTitle: {
        fontSize: 13,
        fontWeight: '900',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: SPACING.m,
        marginLeft: SPACING.s,
        opacity: 0.5,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginBottom: SPACING.s,
        ...SHADOWS.tiny,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
        flex: 1,
    },
    optionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
    },
    optionDescription: {
        fontSize: 12,
        color: COLORS.textSecondary,
        opacity: 0.6,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.error + '10',
        marginHorizontal: SPACING.m,
        paddingVertical: SPACING.m,
        borderRadius: 20,
        gap: 10,
        marginTop: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.error + '20',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.error,
    },
    versionLabel: {
        textAlign: 'center',
        marginTop: SPACING.xl,
        fontSize: 12,
        color: COLORS.textSecondary,
        opacity: 0.4,
    },
});
