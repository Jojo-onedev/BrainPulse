import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { Lock, Zap, Clock, Trophy, X } from 'lucide-react-native';
import { useCompetition } from '../../hooks/useCompetition';
import { MotiView } from 'moti';

export const CompetitionScreen = () => {
    const { user, loading } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { state, startMatch, handleAnswer, leaveMatch } = useCompetition(user);

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
        <ScreenWrapper style={styles.container}>
            <Text>Chargement...</Text>
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
            <ScreenWrapper style={styles.centerContent}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Recherche d'un adversaire...</Text>

                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleLeave}
                >
                    <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
            </ScreenWrapper>
        );
    }

    if (state.gameState === 'waiting') {
        return (
            <ScreenWrapper style={styles.container}>
                <View style={styles.lobbyContent}>
                    <Trophy size={80} color={COLORS.winner} style={{ marginBottom: SPACING.l }} />
                    <Text style={styles.title}>Prêt à combattre ?</Text>
                    <Text style={styles.subtitle}>
                        Affronte un adversaire aléatoire dans un duel de culture générale.
                    </Text>

                    <View style={styles.statsCard}>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Tes points</Text>
                            <Text style={styles.statValue}>1250</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Classement</Text>
                            <Text style={styles.statValue}>#42</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, styles.playButton]}
                        onPress={startMatch}
                    >
                        <Zap color="#FFF" size={24} style={{ marginRight: 8 }} />
                        <Text style={styles.buttonText}>Trouver un adversaire</Text>
                    </TouchableOpacity>
                </View>
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
});
