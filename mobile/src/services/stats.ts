import { supabase } from './supabase';
import { Score } from '../types';

const USERS_TABLE = 'users';
const SCORES_TABLE = 'scores';

export const saveQuizResult = async (userId: string, quizId: string, score: number, totalQuestions: number, categoryId: string) => {
    try {
        // 1. Fetch current user stats
        const { data: profile, error: fetchError } = await supabase
            .from(USERS_TABLE)
            .select('total_score, total_games, best_category')
            .eq('id', userId)
            .single();

        if (fetchError) throw fetchError;

        // 2. Calculate new stats
        const newTotalPlayed = (profile.total_games || 0) + 1;
        const newTotalScore = (profile.total_score || 0) + score;

        // Simple logic for best category
        let bestCategory = profile.best_category;
        if (!bestCategory) bestCategory = categoryId;

        // 3. Update user profile
        const { error: updateError } = await supabase
            .from(USERS_TABLE)
            .update({
                total_games: newTotalPlayed,
                total_score: newTotalScore,
                best_category: bestCategory
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        // 4. Save individual score record
        const { error: scoreError } = await supabase
            .from(SCORES_TABLE)
            .insert([
                {
                    user_id: userId,
                    quiz_id: quizId,
                    score: score,
                    total_questions: totalQuestions,
                    created_at: new Date().toISOString()
                }
            ]);

        if (scoreError) throw scoreError;

        console.log('Quiz result saved successfully in Supabase!');
    } catch (e) {
        console.error("Error saving quiz result: ", e);
        throw e;
    }
};
