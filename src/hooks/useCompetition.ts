import { useState, useEffect, useRef, useCallback } from 'react';
import { Quiz, Question, User, Challenge, CategoryId } from '../types';
import { MOCK_QUIZZES } from '../data/mock';
import { fetchQuestionsFromApi } from '../services/quizApi';
import { challengeService } from '../services/challenges';

const ANSWER_TIME_LIMIT = 10; // seconds per question

interface CompetitionState {
    currentQuestionIndex: number;
    score: number;
    opponentScore: number;
    timeLeft: number;
    gameState: 'waiting' | 'loading' | 'playing' | 'finished';
    currentQuestion: Question | null;
    challenge?: Challenge;
}

export function useCompetition(user: User | null) {
    const [state, setState] = useState<CompetitionState>({
        currentQuestionIndex: 0,
        score: 0,
        opponentScore: 0,
        timeLeft: ANSWER_TIME_LIMIT,
        gameState: 'waiting',
        currentQuestion: null,
    });

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [matchQuestions, setMatchQuestions] = useState<Question[]>([]);
    const timerRef = useRef<any>(null);
    const opponentTimerRef = useRef<any>(null);
    const matchmakingTimerRef = useRef<any>(null);

    // Start a match
    const startMatch = async () => {
        if (matchmakingTimerRef.current) clearTimeout(matchmakingTimerRef.current);
        setState(prev => ({ ...prev, gameState: 'loading' }));

        try {
            const randomQuiz = MOCK_QUIZZES[Math.floor(Math.random() * MOCK_QUIZZES.length)];
            setQuiz(randomQuiz);
            const questions = await fetchQuestionsFromApi(randomQuiz.category, 5);
            setMatchQuestions(questions);

            matchmakingTimerRef.current = setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    gameState: 'playing',
                    currentQuestion: questions[0],
                    timeLeft: ANSWER_TIME_LIMIT,
                    score: 0,
                    opponentScore: 0,
                    currentQuestionIndex: 0,
                }));
            }, 3000);
        } catch (error) {
            console.error('Failed to start competition match:', error);
            setState(prev => ({ ...prev, gameState: 'waiting' }));
        }
    };

    const startChallenge = async (defender: { uid: string; displayName: string }, category: CategoryId) => {
        setState(prev => ({ ...prev, gameState: 'loading' }));
        try {
            const questions = await fetchQuestionsFromApi(category, 5);
            setMatchQuestions(questions);
            setQuiz({
                id: 'temp-' + Date.now(),
                title: 'Défi',
                description: 'Duel contre ' + defender.displayName,
                category: category as any,
                questionsCount: 5,
                isPremium: false,
                difficulty: 'medium'
            });

            setState(prev => ({
                ...prev,
                challenge: { defenderId: defender.uid, defenderName: defender.displayName, quizCategory: category } as any,
                gameState: 'playing',
                currentQuestion: questions[0],
                timeLeft: ANSWER_TIME_LIMIT,
                score: 0,
                opponentScore: 0,
                currentQuestionIndex: 0,
            }));
        } catch (error) {
            console.error('Failed to start challenge:', error);
            setState(prev => ({ ...prev, gameState: 'waiting' }));
        }
    };

    const acceptChallenge = async (challenge: Challenge) => {
        setMatchQuestions(challenge.questions);
        setQuiz({
            id: challenge.id,
            title: 'Revanche',
            description: 'Duel contre ' + challenge.attackerName,
            category: challenge.quizCategory,
            questionsCount: challenge.questions.length,
            isPremium: false,
            difficulty: 'medium'
        });

        setState(prev => ({
            ...prev,
            challenge: challenge,
            gameState: 'playing',
            currentQuestion: challenge.questions[0],
            timeLeft: ANSWER_TIME_LIMIT,
            score: 0,
            opponentScore: challenge.attackerScore,
            currentQuestionIndex: 0,
        }));
    };

    const handleNextQuestion = useCallback(() => {
        if (!quiz) return;
        const nextIndex = state.currentQuestionIndex + 1;
        if (nextIndex < matchQuestions.length) {
            setState(prev => ({
                ...prev,
                currentQuestionIndex: nextIndex,
                currentQuestion: matchQuestions[nextIndex],
                timeLeft: ANSWER_TIME_LIMIT,
            }));
        } else {
            finishMatch();
        }
    }, [quiz, state.currentQuestionIndex, matchQuestions.length]);

    const handleAnswer = (selectedOptionIndex: number) => {
        if (state.gameState !== 'playing' || !state.currentQuestion) return;
        const isCorrect = state.currentQuestion.correctAnswers.includes(selectedOptionIndex);
        const points = isCorrect ? 10 + Math.ceil(state.timeLeft / 2) : 0;
        setState(prev => ({ ...prev, score: prev.score + points }));
        handleNextQuestion();
    };

    const finishMatch = async () => {
        setState(prev => ({ ...prev, gameState: 'finished' }));
        if (user) {
            try {
                await challengeService.updatePlayerStats(user.uid, state.score);
                if (state.challenge) {
                    if (state.challenge.id) {
                        await challengeService.completeChallenge(state.challenge.id, state.score);
                    } else {
                        await challengeService.createChallenge(
                            { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL },
                            { uid: state.challenge.defenderId, displayName: state.challenge.defenderName },
                            state.challenge.quizCategory,
                            matchQuestions,
                            state.score
                        );
                    }
                }
            } catch (error) {
                console.error('Error saving match result:', error);
            }
        }
    };

    const leaveMatch = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
        if (matchmakingTimerRef.current) clearTimeout(matchmakingTimerRef.current);
        setState({
            currentQuestionIndex: 0,
            score: 0,
            opponentScore: 0,
            timeLeft: ANSWER_TIME_LIMIT,
            gameState: 'waiting',
            currentQuestion: null,
        });
        setMatchQuestions([]);
        setQuiz(null);
    };

    useEffect(() => {
        if (state.gameState === 'playing' && state.timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
            }, 1000);
        } else if (state.timeLeft === 0 && state.gameState === 'playing') {
            handleNextQuestion();
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [state.timeLeft, state.gameState, handleNextQuestion]);

    useEffect(() => {
        if (state.gameState === 'playing' && !state.challenge) {
            const randomDelay = Math.floor(Math.random() * 6000) + 2000;
            opponentTimerRef.current = setTimeout(() => {
                const isCorrect = Math.random() > 0.4;
                if (isCorrect) setState(prev => ({ ...prev, opponentScore: prev.opponentScore + 10 }));
            }, randomDelay);
        }
        return () => { if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current); };
    }, [state.currentQuestionIndex, state.gameState, state.challenge]);

    return {
        state,
        startMatch,
        startChallenge,
        acceptChallenge,
        handleAnswer,
        leaveMatch,
    };
}
