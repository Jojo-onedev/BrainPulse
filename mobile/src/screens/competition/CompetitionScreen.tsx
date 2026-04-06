import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView, Dimensions } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { Lock, Zap, Clock, Trophy, X, Search, UserPlus, ArrowRight, CheckCircle2, Home, Swords, Target, Users, Medal } from 'lucide-react-native';
import { useCompetition } from '../../hooks/useCompetition';
import { challengeService } from '../../services/challenges';
import { Challenge, User, CATEGORIES } from '../../types';
import { PremiumAlert } from '../../components/ui/PremiumAlert';
import { formatTimeAgo } from '../../utils/dateUtils';
import Animated, { 
    FadeIn, 
    FadeInDown, 
    FadeInUp, 
    Layout, 
    SlideInRight, 
    useAnimatedStyle, 
    useSharedValue, 
    withRepeat, 
    withTiming,
    interpolate,
    Easing
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const CompetitionScreen = () => {
    const { user, loading } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { state, startMatch, startChallenge, acceptChallenge, handleAnswer, leaveMatch, cancelChallenge } = useCompetition(user);

    const [view, setView] = useState<'lobby' | 'search' | 'category_select'>('lobby');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedDefender, setSelectedDefender] = useState<User | null>(null);
    const [receivedChallenges, setReceivedChallenges] = useState<Challenge[]>([]);
    const [sentChallenges, setSentChallenges] = useState<Challenge[]>([]);
    const [discoveryResults, setDiscoveryResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [alert, setAlert] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({
        show: false,
        title: '',
        message: '',
        type: 'info'
    });

    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const rotationStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value * 360}deg` }]
        };
    });

    useEffect(() => {
        if (user && state.gameState === 'waiting') {
            loadChallenges();
            if (view === 'search') {
                loadInitialOpponents();
            }
        }
    }, [user, state.gameState, view]);

    const loadChallenges = async () => {
        if (!user) return;
        const [received, sent] = await Promise.all([
            challengeService.getReceivedChallenges(user.uid),
            challengeService.getSentChallenges(user.uid)
        ]);
        setReceivedChallenges(received);
        setSentChallenges(sent);
    };

    const loadInitialOpponents = async () => {
        if (!user) return;
        setIsSearching(true);
        const results = await challengeService.getPotentialOpponents(user.uid);
        setDiscoveryResults(results);
        setIsSearching(false);
    };

    const handleSearch = async () => {
        if (!user || !searchTerm.trim()) return;
        setIsSearching(true);
        const results = await challengeService.searchUsers(searchTerm, user.uid);
        setSearchResults(results);
        setIsSearching(false);
    };

    const onSelectDefender = (defender: User) => {
        setSelectedDefender(defender);
        setView('category_select');
    };

    const onStartChallenge = (category: string) => {
        if (selectedDefender) {
            startChallenge(selectedDefender, category as any);
        }
    };

    const handleLeave = () => {
        if (state.gameState === 'playing') {
            Alert.alert(
                'Quitter la partie ?',
                'Es-tu sûr de vouloir abandonner ce match ?',
                [
                    { text: 'Rester', style: 'cancel' },
                    { text: 'Quitter', style: 'destructive', onPress: leaveMatch }
                ]
            );
        } else {
            leaveMatch();
        }
    };

    if (loading) return (
        <ScreenWrapper style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Vérification de la session...</Text>
        </ScreenWrapper>
    );

    if (!user) {
        return (
            <ScreenWrapper style={styles.container}>
                <View style={styles.lockedContent}>
                    <Lock size={64} color={COLORS.textSecondary} style={{ marginBottom: SPACING.m }} />
                    <Text style={styles.title}>Mode Compétition</Text>
                    <Text style={styles.subtitle}>
                        Connectez-vous pour défier d'autres joueurs et grimper dans le classement !
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.buttonText}>Se connecter</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    if (state.gameState === 'loading') {
        return (
            <ScreenWrapper style={styles.container}>
                <View style={[styles.centerContent, { flex: 1 }]}>
                    <Animated.View 
                        entering={FadeInDown.duration(800)}
                        style={styles.searchAnimationContainer}
                    >
                        <LinearGradient
                            colors={[COLORS.primary + '20', COLORS.secondary + '20']}
                            style={styles.searchPulse}
                        >
                            <Animated.View 
                                style={[styles.rotatingSwords, rotationStyle]}
                            >
                                <Swords size={60} color={COLORS.primary} />
                            </Animated.View>
                        </LinearGradient>
                    </Animated.View>
                    
                    <Animated.Text 
                        entering={FadeIn.delay(400)}
                        style={styles.matchmakingTitle}
                    >
                        Recherche d'un adversaire
                    </Animated.Text>
                    <Animated.Text 
                        entering={FadeIn.delay(600)}
                        style={styles.matchmakingSubtitle}
                    >
                        Duelio prépare votre combat...
                    </Animated.Text>

                    <TouchableOpacity
                        style={styles.matchmakingCancelBtn}
                        onPress={handleLeave}
                    >
                        <Text style={styles.matchmakingCancelText}>Abandonner la recherche</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    if (state.gameState === 'waiting') {
        if (view === 'category_select') {
            return (
                <ScreenWrapper style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setView('search')} style={styles.backButton}>
                            <X size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Choisir un thème</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.categoryCard, { backgroundColor: cat.color + '15', borderColor: cat.color }]}
                                onPress={() => onStartChallenge(cat.id)}
                            >
                                <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </ScreenWrapper>
            );
        }

        if (view === 'search') {
            return (
                <ScreenWrapper style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setView('lobby')} style={styles.backButton}>
                            <X size={24} color={COLORS.text} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Défier un ami</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.searchSection}>
                        <View style={styles.searchInputWrapper}>
                            <Search size={20} color={COLORS.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Rechercher par pseudo..."
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                                placeholderTextColor={COLORS.textSecondary}
                                autoCapitalize="none"
                            />
                        </View>
                        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                            {isSearching ? <ActivityIndicator color="#FFF" /> : <Text style={styles.searchBtnText}>Rechercher</Text>}
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.resultsList}>
                        {searchTerm.length === 0 && !isSearching && discoveryResults.length > 0 && (
                            <Text style={styles.sectionSubtitle}>Adversaires suggérés</Text>
                        )}
                        {searchResults.length === 0 && !isSearching && searchTerm.length > 0 && (
                            <Text style={styles.noResultsText}>Aucun utilisateur trouvé.</Text>
                        )}
                        {(searchTerm.length > 0 ? searchResults : discoveryResults).map((u) => (
                            <TouchableOpacity key={u.uid} style={styles.userCard} onPress={() => onSelectDefender(u)}>
                                <View style={styles.userInfo}>
                                    <View style={styles.userAvatar}>
                                        <Text style={styles.avatarInitial}>{u.displayName[0].toUpperCase()}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.userName}>{u.displayName}</Text>
                                        <Text style={styles.userPoints}>{u.stats?.totalScore || 0} pts</Text>
                                    </View>
                                </View>
                                <UserPlus size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </ScreenWrapper>
            );
        }

        return (
            <ScreenWrapper style={styles.container}>
                <ScrollView contentContainerStyle={styles.lobbyContentScroller}>
                    <Animated.View entering={FadeInDown.delay(200)} style={styles.lobbyHeader}>
                        <View style={styles.iconHeaderContainer}>
                            <Trophy size={80} color={COLORS.winner} />
                        </View>
                        <Text style={styles.title}>Arène de Duel</Text>
                        <Text style={styles.subtitle}>Défie les meilleurs et deviens une légende !</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400)} style={styles.actionContainer}>
                        <TouchableOpacity
                            style={styles.mainActionButton}
                            onPress={() => setView('search')}
                        >
                            <LinearGradient
                                colors={[COLORS.primary, COLORS.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.gradientButton}
                            >
                                <Zap color="#FFF" size={24} style={{ marginRight: 12 }} />
                                <Text style={styles.buttonText}>Trouver un adversaire</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    <View>
                        {receivedChallenges.length > 0 && (
                            <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
                                <Text style={styles.sectionTitle}>Défis reçus ({receivedChallenges.length})</Text>
                                {receivedChallenges.map((challenge, index) => (
                                    <Animated.View
                                        entering={SlideInRight.delay(700 + index * 100)}
                                        key={challenge.id}
                                    >
                                        <TouchableOpacity
                                            style={styles.challengeItem}
                                            onPress={() => acceptChallenge(challenge)}
                                        >
                                            <View style={styles.userInfo}>
                                                <View style={[styles.userAvatar, { backgroundColor: COLORS.secondary }]}>
                                                    <Swords size={20} color="#FFF" />
                                                </View>
                                                <View>
                                                    <Text style={styles.challengeSender}>{challenge.attackerName}</Text>
                                                    <Text style={styles.challengeMeta}>
                                                        Thème: {CATEGORIES.find(c => c.id === challenge.quizCategory)?.label} • {formatTimeAgo(challenge.createdAt)}
                                                    </Text>
                                                </View>
                                            </View>
                                            <ArrowRight size={20} color={COLORS.primary} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </Animated.View>
                        )}

                        {sentChallenges.length > 0 && (
                            <Animated.View entering={FadeInUp.delay(800)} style={styles.section}>
                                <Text style={styles.sectionTitle}>Défis envoyés</Text>
                                {sentChallenges.map((challenge, index) => (
                                    <Animated.View
                                        entering={SlideInRight.delay(900 + index * 100)}
                                        key={challenge.id}
                                        style={{ width: '100%' }}
                                    >
                                        <View style={styles.challengeItem}>
                                            <View style={[styles.userInfo, { flex: 1 }]}>
                                            <View style={[
                                                styles.userAvatar, 
                                                { 
                                                    backgroundColor: challenge.status === 'pending' ? COLORS.card : COLORS.primary + '20', 
                                                    borderWidth: challenge.status === 'pending' ? 1 : 0, 
                                                    borderColor: COLORS.border 
                                                }
                                            ]}>
                                                <Target size={20} color={challenge.status === 'pending' ? COLORS.textSecondary : COLORS.primary} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.challengeSender}>{challenge.defenderName}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                    {challenge.status === 'pending' ? (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                             <Clock size={12} color={COLORS.warning} style={{ marginRight: 4 }} />
                                                             <Text style={[styles.challengeMeta, { color: COLORS.warning }]}>
                                                                 En attente... • {formatTimeAgo(challenge.createdAt)}
                                                             </Text>
                                                        </View>
                                                    ) : (
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            <Medal size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
                                                            <Text style={[styles.challengeMeta, { color: COLORS.primary, fontWeight: '600' }]}>
                                                                Score: {challenge.attackerScore} - {challenge.defenderScore} • {formatTimeAgo(challenge.createdAt)}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                        {challenge.status === 'completed' ? (
                                            <CheckCircle2 size={20} color={COLORS.success} />
                                        ) : (
                                            <View style={styles.challengeActionRow}>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        Alert.alert(
                                                            'Annuler le défi',
                                                            'Voulez-vous vraiment supprimer ce défi ?',
                                                            [
                                                                { text: 'Non', style: 'cancel' },
                                                                {
                                                                    text: 'Oui',
                                                                    style: 'destructive',
                                                                    onPress: async () => {
                                                                        await cancelChallenge(challenge.id);
                                                                        loadChallenges();
                                                                    }
                                                                }
                                                            ]
                                                        );
                                                    }}
                                                    style={styles.deleteIconButton}
                                                >
                                                    <X size={16} color={COLORS.error} />
                                                </TouchableOpacity>
                                                <Clock size={16} color={COLORS.warning} />
                                            </View>
                                        )}
                                        </View>
                                    </Animated.View>
                                ))}
                            </Animated.View>
                        )}
                    </View>
                </ScrollView>
            </ScreenWrapper>
        );
    }

    if (state.gameState === 'finished') {
        const won = state.score > state.opponentScore;
        return (
            <ScreenWrapper style={styles.container}>
                <View style={styles.lobbyContent}>
                    <Text style={[styles.title, { color: won ? COLORS.success : COLORS.error }]}>
                        {won ? 'VICTOIRE !' : 'DÉFAITE...'}
                    </Text>
                    <Text style={styles.scoreText}>{state.score} - {state.opponentScore}</Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => startMatch()} // Restart
                    >
                        <Text style={styles.buttonText}>Rejouer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.homeButton]}
                        onPress={() => {
                            leaveMatch();
                            setView('lobby');
                        }}
                    >
                        <Home color={COLORS.primary} size={20} style={{ marginRight: 8 }} />
                        <Text style={styles.homeButtonText}>Quitter le salon</Text>
                    </TouchableOpacity>
                </View>
            </ScreenWrapper>
        );
    }

    // PLAYING STATE
    return (
        <ScreenWrapper style={styles.gameContainer}>
            {/* Header / Scoreboard */}
            <View style={styles.scoreBoard}>
                <View style={styles.playerScore}>
                    <Text style={styles.playerName}>Toi</Text>
                    <Text style={styles.points}>{state.score}</Text>
                </View>
                <View style={styles.timerContainer}>
                    <Clock size={20} color={COLORS.textSecondary} />
                    <Text style={[styles.timerText, state.timeLeft < 4 && { color: COLORS.error }]}>
                        {state.timeLeft}s
                    </Text>
                </View>
                <View style={styles.playerScore}>
                    <Text style={styles.playerName}>Adversaire</Text>
                    <Text style={styles.points}>{state.opponentScore}</Text>
                </View>

                <TouchableOpacity
                    style={styles.leaveButtonHeader}
                    onPress={handleLeave}
                >
                    <X color={COLORS.textSecondary} size={20} />
                </TouchableOpacity>
            </View>

            {/* Question */}
            <View style={styles.questionCard}>
                <Text style={styles.questionText}>
                    {state.currentQuestion?.text}
                </Text>
            </View>

            {/* Answers */}
            <View style={styles.answersContainer}>
                {state.currentQuestion?.options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.answerButton}
                        onPress={() => handleAnswer(index)}
                    >
                        <Text style={styles.answerText}>{option}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    backButton: {
        padding: 8,
    },
    leaveButtonHeader: {
        padding: 8,
        marginLeft: 8,
    },
    cancelButton: {
        marginTop: SPACING.xl,
        backgroundColor: COLORS.border,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    loadingText: {
        marginTop: SPACING.m,
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    gameContainer: {
        flex: 1,
        padding: SPACING.m,
    },
    lockedContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    lobbyContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 24,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    playButton: {
        backgroundColor: COLORS.secondary,
        paddingVertical: SPACING.l,
        paddingHorizontal: SPACING.xxl,
        borderRadius: 16,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    homeButton: {
        backgroundColor: 'transparent',
        marginTop: SPACING.l,
        borderWidth: 1.5,
        borderColor: COLORS.primary,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: 14,
    },
    homeButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: SPACING.l,
        width: '100%',
        marginBottom: SPACING.xl * 2,
        ...SHADOWS.small,
    },
    statRow: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: COLORS.border,
    },
    statLabel: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },

    // Game Styles
    scoreBoard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
        backgroundColor: COLORS.card,
        borderRadius: 16,
        marginBottom: SPACING.l,
        ...SHADOWS.small,
    },
    playerScore: {
        alignItems: 'center',
    },
    playerName: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    points: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    timerContainer: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 4,
    },
    questionCard: {
        backgroundColor: COLORS.card,
        padding: SPACING.xl,
        borderRadius: 20,
        minHeight: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        ...SHADOWS.medium,
    },
    questionText: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
        lineHeight: 28,
    },
    answersContainer: {
        gap: SPACING.m,
    },
    answerButton: {
        backgroundColor: '#FFF',
        padding: SPACING.l,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    answerText: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500',
    },
    scoreText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: COLORS.text,
        marginVertical: SPACING.xl,
    },
    fullWidth: {
        width: '100%',
    },
    lobbyHeader: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    lobbyContentScroller: {
        padding: SPACING.xl,
        paddingTop: SPACING.xxl,
        alignItems: 'stretch',
    },
    section: {
        width: '100%',
        marginTop: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.m,
    },
    challengeItem: {
        width: '100%',
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.card,
        padding: SPACING.m,
        borderRadius: 16,
        marginBottom: SPACING.s,
        ...SHADOWS.small,
    },
    challengeSender: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    challengeMeta: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    searchSection: {
        flexDirection: 'row',
        padding: SPACING.m,
        gap: SPACING.s,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 12,
        paddingHorizontal: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        height: 48,
        marginLeft: SPACING.s,
        color: COLORS.text,
    },
    searchBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.m,
        borderRadius: 12,
        justifyContent: 'center',
    },
    searchBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    resultsList: {
        flex: 1,
        padding: SPACING.m,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        padding: SPACING.l,
        borderRadius: 18,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    userAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    userPoints: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    noResultsText: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        marginTop: SPACING.xl,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: SPACING.m,
        gap: SPACING.m,
    },
    categoryCard: {
        width: '47%',
        padding: SPACING.l,
        borderRadius: 20,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
    },
    categoryLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Matchmaking Styles
    searchAnimationContainer: {
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        alignSelf: 'center',
    },
    searchPulse: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rotatingSwords: {
        padding: 20,
    },
    matchmakingTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: SPACING.s,
        textAlign: 'center',
    },
    matchmakingSubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xxl,
        textAlign: 'center',
    },
    matchmakingCancelBtn: {
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.error + '20',
        alignSelf: 'center',
    },
    matchmakingCancelText: {
        color: COLORS.error,
        fontWeight: '800',
        fontSize: 14,
    },
    // Premium Competition Styles
    iconHeaderContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.winner + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    actionContainer: {
        width: '100%',
        marginTop: SPACING.xl,
    },
    mainActionButton: {
        width: '100%',
        height: 64,
        borderRadius: 16,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    gradientButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    challengeActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    deleteIconButton: {
        padding: 6,
        backgroundColor: COLORS.error + '15',
        borderRadius: 8,
    },
});
