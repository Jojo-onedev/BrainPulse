import { Question, CategoryId } from '../types';
import { fetchQuestionsFromSupabase } from './supabaseQuiz';

const BASE_URL = 'https://quizzapi.jomoreschi.fr/api/v2/quiz';

const CATEGORY_MAP: Record<CategoryId, string> = {
    'history': 'histoire',
    'geography': 'geographie',
    'science': 'science',
    'sports': 'sport',
    'culture_africa': 'culture_generale',
    'news': 'actu_politique',
    'general': 'culture_generale',
};

/**
 * Main entry point for fetching questions. 
 * Tries Supabase first, then falls back to the external API if needed.
 */
export const fetchQuestions = async (categoryId: CategoryId, limit: number = 5): Promise<Question[]> => {
    try {
        // 1. Try Supabase first
        console.log('Trying Supabase for category:', categoryId);
        const supabaseQuestions = await fetchQuestionsFromSupabase(categoryId, limit);

        if (supabaseQuestions.length > 0) {
            console.log(`Found ${supabaseQuestions.length} questions in Supabase.`);
            return supabaseQuestions;
        }

        // 2. Fallback to External API if no questions in Supabase
        console.log('No questions in Supabase, falling back to external API...');
        return await fetchQuestionsFromExternalApi(categoryId, limit);
    } catch (error) {
        console.error('Error in fetchQuestions coordination:', error);
        // Last resort fallback
        return fetchQuestionsFromExternalApi(categoryId, limit);
    }
};

const fetchQuestionsFromExternalApi = async (categoryId: CategoryId, limit: number = 5): Promise<Question[]> => {
    try {
        const apiCategory = CATEGORY_MAP[categoryId] || 'culture_generale';
        const url = `${BASE_URL}?limit=${limit}&category=${apiCategory}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        if (!data.quizzes || !Array.isArray(data.quizzes)) throw new Error('Invalid API response');

        return data.quizzes.map((item: any, index: number) => {
            // Robustly handle badAnswers
            const badAnswers = Array.isArray(item.badAnswers) ? item.badAnswers : [];
            const answer = item.answer || "Réponse inconnue";

            const allOptions = [...badAnswers, answer];
            const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
            const correctIndex = shuffledOptions.indexOf(answer);

            return {
                id: item._id || `api_${Date.now()}_${index}`,
                type: 'single',
                text: item.question || "",
                options: shuffledOptions.map(opt => String(opt)),
                correctAnswers: [correctIndex !== -1 ? correctIndex : 0],
                explanation: item.difficulty ? `Difficulté : ${item.difficulty}` : undefined,
            } as Question;
        });
    } catch (error) {
        console.error('Error fetching questions from API:', error);
        throw error;
    }
};

// Deprecated, use fetchQuestions instead
export const fetchQuestionsFromApi = fetchQuestions;
