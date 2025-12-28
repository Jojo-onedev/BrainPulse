import { Question, CategoryId } from '../types';

const BASE_URL = 'https://quizzapi.jomoreschi.fr/api/v2/quiz';

// Map our internal CategoryId to API category slugs provided by the user
const CATEGORY_MAP: Record<CategoryId, string> = {
    'history': 'histoire',
    'geography': 'geographie',
    'science': 'science',
    'sports': 'sport',
    'culture_africa': 'culture_generale', // Mapping to general if no specific Africa slug
    'news': 'actu_politique',
    'general': 'culture_generale',
};

export const fetchQuestionsFromApi = async (categoryId: CategoryId, limit: number = 5): Promise<Question[]> => {
    try {
        const apiCategory = CATEGORY_MAP[categoryId] || 'culture_generale';
        // v2 uses 'quiz' endpoint and different query params
        const url = `${BASE_URL}?limit=${limit}&category=${apiCategory}`;

        console.log('Fetching from API:', url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.quizzes || !Array.isArray(data.quizzes)) {
            throw new Error('Invalid API response format: missing quizzes array');
        }

        return data.quizzes.map((item: any, index: number) => {
            // Shuffle answers
            const allOptions = [...item.badAnswers, item.answer];
            const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
            const correctIndex = shuffledOptions.indexOf(item.answer);

            return {
                id: item._id || `api_${Date.now()}_${index}`,
                type: 'single',
                text: item.question,
                options: shuffledOptions,
                correctAnswers: [correctIndex],
                explanation: item.difficulty ? `Difficulté : ${item.difficulty}` : undefined,
            } as Question;
        });
    } catch (error) {
        console.error('Error fetching questions from API:', error);
        throw error;
    }
};
