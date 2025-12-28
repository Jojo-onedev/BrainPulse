export interface User {
    uid: string;
    email: string;
    displayName: string;
    createdAt: number; // Timestamp as number for easier serialization
    isPremium: boolean;
    photoURL?: string;
    stats: {
        totalQuizzesPlayed: number;
        totalScore: number;
        averageScore: number;
        bestCategory: string; // ID of the category
    };
    favorites: string[];
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    category: CategoryId;
    difficulty: 'easy' | 'medium' | 'hard';
    questionsCount: number;
    imageUrl?: string;
    isPremium: boolean;
}

export type QuestionType = 'single' | 'multiple' | 'boolean';

export interface Question {
    id: string;
    type: QuestionType;
    text: string;
    options: string[];
    correctAnswers: number[]; // Indices of correct options
    explanation?: string;
    timeLimit?: number; // Seconds
}

export interface Match {
    id: string;
    players: string[]; // User UIDs
    scores: Record<string, number>;
    status: 'pending' | 'active' | 'finished';
    winnerId?: string;
    createdAt: number;
}

export interface Score {
    id?: string;
    userId: string;
    quizId: string;
    score: number;
    totalQuestions: number;
    date: number;
}

export type CategoryId = 'history' | 'geography' | 'science' | 'sports' | 'culture_africa' | 'news' | 'general';

export const CATEGORIES: { id: CategoryId; label: string; color: string }[] = [
    { id: 'history', label: 'Histoire', color: '#FF5733' },
    { id: 'geography', label: 'Géographie', color: '#33FF57' },
    { id: 'science', label: 'Sciences', color: '#3357FF' },
    { id: 'sports', label: 'Sport', color: '#FF33A8' },
    { id: 'culture_africa', label: 'Culture Africaine', color: '#FFC300' },
    { id: 'news', label: 'Actualité', color: '#00C3FF' },
    { id: 'general', label: 'Culture Générale', color: '#8833FF' },
];
