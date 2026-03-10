import { supabase } from './supabase';
import { Question, CategoryId } from '../types';

const CATEGORY_LABEL_TO_ID: Record<string, CategoryId> = {
    'Histoire': 'history',
    'Géographie': 'geography',
    'Sciences': 'science',
    'Sport': 'sports',
    'Culture Africaine': 'culture_africa',
    'Actualité': 'news',
    'Culture Générale': 'general',
    'Général': 'general'
};

/**
 * Récupère les questions depuis la table 'questions' de Supabase
 */
export const fetchQuestionsFromSupabase = async (categoryId: CategoryId, limit: number = 5): Promise<Question[]> => {
    try {
        // Find the label matching this categoryId
        const categoryLabel = Object.keys(CATEGORY_LABEL_TO_ID).find(key => CATEGORY_LABEL_TO_ID[key] === categoryId);

        let query = supabase.from('questions').select('*').limit(limit);

        // Filter by slug OR by label (to be compatible with both formats in DB)
        if (categoryLabel) {
            query = query.or(`category.eq.${categoryId},category.eq.${categoryLabel}`);
        } else {
            query = query.eq('category', categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (!data || data.length === 0) {
            return [];
        }

        // Mapping PostgreSQL (snake_case) -> Mobile (camelCase)
        return data.map((q: any) => {
            let finalOptions: string[] = [];

            // 1. Extract options
            const rawOptions = q.options;
            if (Array.isArray(rawOptions)) {
                finalOptions = rawOptions.map(o => String(o));
            } else if (rawOptions !== null && rawOptions !== undefined) {
                finalOptions = [String(rawOptions)];
            }

            // 2. Handle boolean type specifically
            if (q.type === 'boolean') {
                // If we have 0 or 1 option, we assume we need to fill Vrai/Faux
                if (finalOptions.length < 2) {
                    finalOptions = ['Vrai', 'Faux'];
                }
            }

            // 3. Ensure we have at least SOME options for other types too
            if (finalOptions.length === 0) {
                // Fallback for empty options
                finalOptions = ["Option A", "Option B", "Option C", "Option D"];
            }

            return {
                id: q.id,
                type: q.type || 'single',
                text: q.question_text || "",
                options: finalOptions,
                correctAnswers: Array.isArray(q.correct_answers) ? q.correct_answers : [0],
                timeLimit: q.time_limit || 30,
                explanation: q.explanation || undefined,
            } as Question;
        });
    } catch (error) {
        console.error('Error fetching questions from Supabase:', error);
        return [];
    }
};
