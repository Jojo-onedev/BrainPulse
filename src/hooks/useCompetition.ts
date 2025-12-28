import { useState, useEffect, useRef } from 'react';
import { Quiz, Question, User } from '../types';
import { MOCK_QUIZZES } from '../data/mock';
import { fetchQuestionsFromApi } from '../services/quizApi';

const ANSWER_TIME_LIMIT = 10; // seconds per question

interface CompetitionState {
    currentQuestionIndex: number;
    score: number;
    opponentScore: number;
    timeLeft: number;
    gameState: 'waiting' | 'loading' | 'playing' | 'finished';
    currentQuestion: Question | null;
}

export const useCompetition = (user: User | null) => {
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
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const opponentTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Start a match
    const startMatch = async () => {
        setState(prev => ({ ...prev, gameState: 'loading' }));

        try {
            // Randomly select a category from valid quizzes
            const validQuizzes = MOCK_QUIZZES;
            const randomQuiz = validQuizzes[Math.floor(Math.random() * validQuizzes.length)];

            setQuiz(randomQuiz);

            // Fetch 5 questions for competition
            const questions = await fetchQuestionsFromApi(randomQuiz.category, 5);
            setMatchQuestions(questions);

            setState(prev => ({
                ...prev,
                gameState: 'playing',
                currentQuestion: questions[0],
                timeLeft: ANSWER_TIME_LIMIT,
                score: 0,
                opponentScore: 0,
                currentQuestionIndex: 0,
            }));
        } catch (error) {
            console.error('Failed to start competition match:', error);
            // Fallback or error state
            setState(prev => ({ ...prev, gameState: 'waiting' }));
        }
    };

    // Timer logic
    useEffect(() => {
        if (state.gameState === 'playing' && state.timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
            }, 1000);
        } else if (state.timeLeft === 0 && state.gameState === 'playing') {
            handleNextQuestion();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [state.timeLeft, state.gameState]);

    // Mock Opponent Logic
    useEffect(() => {
        if (state.gameState === 'playing') {
            // Opponent answers randomly between 2s and 8s
            const randomDelay = Math.floor(Math.random() * 6000) + 2000;

            opponentTimerRef.current = setTimeout(() => {
                // Opponent has 60% chance of being correct
                const isCorrect = Math.random() > 0.4;
                if (isCorrect) {
                    setState(prev => ({ ...prev, opponentScore: prev.opponentScore + 10 }));
                }
            }, randomDelay);
        }
        return () => {
            if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
        };
    }, [state.currentQuestionIndex, state.gameState]);


    const handleAnswer = (selectedOptionIndex: number) => {
        if (state.gameState !== 'playing' || !state.currentQuestion) return;

        const isCorrect = state.currentQuestion.correctAnswers.includes(selectedOptionIndex);
        const points = isCorrect ? 10 + Math.ceil(state.timeLeft / 2) : 0; // Bonus for speed

        setState(prev => ({
            ...prev,
            score: prev.score + points,
        }));

        handleNextQuestion();
    };

    const handleNextQuestion = () => {
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
    };

    const finishMatch = () => {
        setState(prev => ({ ...prev, gameState: 'finished' }));
    };

    const leaveMatch = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);

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

    return {
        state,
        startMatch,
        handleAnswer,
        leaveMatch,
    };
};
