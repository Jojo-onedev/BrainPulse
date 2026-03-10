import { useState, useCallback } from 'react';
import { Question } from '../types';

interface UseQuizProps {
    questions: Question[];
}

export const useQuiz = ({ questions }: UseQuizProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const currentQuestion = questions[currentIndex];
    // Calculate progress safely (avoid division by zero if questions is empty)
    const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

    const selectOption = useCallback((index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
    }, [isAnswered]);

    const validateAnswer = useCallback(() => {
        if (selectedOption === null || isAnswered) return;

        setIsAnswered(true);
        // For single choice, check if selectedOption is in correctAnswers
        const isCorrect = currentQuestion.correctAnswers.includes(selectedOption);
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
    }, [selectedOption, isAnswered, currentQuestion]);

    const nextQuestion = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
        }
    }, [currentIndex, questions.length]);

    return {
        currentIndex,
        currentQuestion,
        totalQuestions: questions.length,
        score,
        selectedOption,
        isAnswered,
        isFinished,
        progress,
        selectOption,
        validateAnswer,
        nextQuestion,
    };
};
