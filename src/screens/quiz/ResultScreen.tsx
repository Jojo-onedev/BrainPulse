import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Trophy, RefreshCw, Home } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { saveQuizResult } from '../../services/stats';
import { MOCK_QUIZZES } from '../../data/mock';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export const ResultScreen = ({ route, navigation }: Props) => {
    const { score, total, quizId } = route.params;
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);

    const percentage = Math.round((score / total) * 100);

    useEffect(() => {
        if (user) {
            saveResult();
        }
    }, []);

    const saveResult = async () => {
        if (!user) return;
        setSaving(true);
        try {
            // Find category from mock data for now
            const quiz = MOCK_QUIZZES.find(q => q.id === quizId);
            const categoryId = quiz ? quiz.category : 'general';

            await saveQuizResult(user.uid, quizId, score, total, categoryId);
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', 'Impossible de sauvegarder le score.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.content}>
                <Trophy size={80} color={COLORS.warning} style={styles.icon} />

                <Text style={styles.title}>Quiz Terminé !</Text>

                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Votre score</Text>
                    <Text style={styles.scoreValue}>{score} / {total}</Text>
                    <Text style={styles.percentage}>{percentage}% de réussite</Text>
                    {saving && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 10 }} />}
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={() => navigation.replace('Quiz', { quizId })}
                        disabled={saving}
                    >
                        <RefreshCw color="#FFF" size={20} style={{ marginRight: 8 }} />
                        <Text style={styles.buttonText}>Rejouer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={() => navigation.popToTop()} // Go back to Home (via Tab)
                        disabled={saving}
                    >
                        <Home color={COLORS.primary} size={20} style={{ marginRight: 8 }} />
                        <Text style={[styles.buttonText, { color: COLORS.primary }]}>Accueil</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    icon: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xl,
    },
    scoreContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
        backgroundColor: COLORS.card,
        padding: SPACING.xl,
        borderRadius: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    scoreLabel: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.s,
    },
    percentage: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.success,
    },
    actions: {
        width: '100%',
        gap: SPACING.m,
    },
    button: {
        paddingVertical: SPACING.m,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
});
