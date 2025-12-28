import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { MOCK_QUIZZES } from '../../data/mock';
import { useQuiz } from '../../hooks/useQuiz';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { X, Check } from 'lucide-react-native';
import { fetchQuestionsFromApi } from '../../services/quizApi';
import { Question } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export const QuizScreen = ({ route, navigation }: Props) => {
    const { quizId } = route.params;
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    const quizData = MOCK_QUIZZES.find(q => q.id === quizId);

    const {
        currentQuestion,
        currentIndex,
        totalQuestions,
        score,
        selectedOption,
        isAnswered,
        isFinished,
        progress,
        selectOption,
        validateAnswer,
        nextQuestion,
    } = useQuiz({ questions });

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const category = quizData?.category || 'general';
            // Fetch 10 questions for a better experience
            const apiQuestions = await fetchQuestionsFromApi(category, 10);
            setQuestions(apiQuestions);
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', 'Impossible de charger les questions depuis l\'API. Utilisation des questions locales.', [
                { text: 'OK' }
            ]);
            // Fallback to mock questions if any
            const { MOCK_QUESTIONS } = require('../../data/mock');
            setQuestions(MOCK_QUESTIONS[quizId] || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && questions.length === 0) {
            Alert.alert('Erreur', 'Aucune question trouvée pour ce quiz.', [
                { text: 'Retour', onPress: () => navigation.goBack() }
            ]);
        }
    }, [loading, questions]);

    useEffect(() => {
        if (isFinished) {
            navigation.replace('Result', { score, total: totalQuestions, quizId });
        }
    }, [isFinished]);

    if (loading) {
        return (
            <ScreenWrapper style={styles.centerContent}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Chargement des questions...</Text>
            </ScreenWrapper>
        );
    }

    if (!currentQuestion) return null;

    const handleOptionPress = (index: number) => {
        selectOption(index);
    };

    const isCorrect = (index: number) => currentQuestion.correctAnswers.includes(index);

    const getOptionStyle = (index: number) => {
        let style: any = { borderColor: COLORS.border, backgroundColor: COLORS.card };

        if (isAnswered) {
            if (isCorrect(index)) {
                style = { borderColor: COLORS.success, backgroundColor: COLORS.success + '20' };
            } else if (selectedOption === index) {
                style = { borderColor: COLORS.error, backgroundColor: COLORS.error + '20' };
            }
        } else if (selectedOption === index) {
            style = { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' };
        }

        return style;
    };

    return (
        <ScreenWrapper style={styles.container}>
            {/* Header / Progress */}
            <View style={styles.header}>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>Question {currentIndex + 1}/{totalQuestions}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.questionText}>{currentQuestion.text}</Text>

                <View style={styles.optionsList}>
                    {currentQuestion.options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.optionCard, getOptionStyle(index)]}
                            onPress={() => handleOptionPress(index)}
                            disabled={isAnswered}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.optionText}>{option}</Text>
                            {isAnswered && isCorrect(index) && <Check color={COLORS.success} size={20} />}
                            {isAnswered && selectedOption === index && !isCorrect(index) && <X color={COLORS.error} size={20} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {isAnswered && currentQuestion.explanation && (
                    <View style={styles.explanationBox}>
                        <Text style={styles.explanationTitle}>Le saviez-vous ?</Text>
                        <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                {!isAnswered ? (
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton, selectedOption === null && styles.disabledButton]}
                        onPress={validateAnswer}
                        disabled={selectedOption === null}
                    >
                        <Text style={styles.buttonText}>Valider</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={nextQuestion}
                    >
                        <Text style={styles.buttonText}>{currentIndex === totalQuestions - 1 ? 'Terminer' : 'Suivant'}</Text>
                    </TouchableOpacity>
                )}
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
    loadingText: {
        marginTop: SPACING.m,
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    header: {
        padding: SPACING.m,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        marginBottom: SPACING.s,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    progressText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        padding: SPACING.m,
        paddingBottom: 100,
    },
    questionText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xl,
        marginTop: SPACING.s,
    },
    optionsList: {
        gap: SPACING.m,
    },
    optionCard: {
        padding: SPACING.m,
        borderRadius: 12,
        borderWidth: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    optionText: {
        fontSize: 16,
        color: COLORS.text,
        flex: 1,
        marginRight: 8,
    },
    explanationBox: {
        marginTop: SPACING.xl,
        backgroundColor: COLORS.background,
        padding: SPACING.m,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.secondary,
    },
    explanationTitle: {
        fontWeight: 'bold',
        color: COLORS.secondary,
        marginBottom: 4,
    },
    explanationText: {
        color: COLORS.text,
        fontStyle: 'italic',
    },
    footer: {
        padding: SPACING.m,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    button: {
        paddingVertical: SPACING.m,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
    },
    disabledButton: {
        backgroundColor: COLORS.border,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
