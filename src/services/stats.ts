import { firestore } from './firebase';
import { doc, runTransaction, collection, addDoc } from 'firebase/firestore';
import { Score, User } from '../types';

export const saveQuizResult = async (userId: string, quizId: string, score: number, totalQuestions: number, categoryId: string) => {
    try {
        await runTransaction(firestore, async (transaction) => {
            const userRef = doc(firestore, 'users', userId);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists()) {
                throw new Error("User does not exist!");
            }

            const userData = userDoc.data() as User;
            const currentStats = userData.stats || {
                totalQuizzesPlayed: 0,
                totalScore: 0,
                averageScore: 0,
                bestCategory: '',
            };

            // Calculate new stats
            const newTotalPlayed = currentStats.totalQuizzesPlayed + 1;
            const newTotalScore = currentStats.totalScore + score;
            const newAverage = Math.round(newTotalScore / newTotalPlayed);

            // Simple logic for best category (can be improved later to track per-category stats)
            // For now, we only update it if it's empty, or we could leave it as is.
            let bestCategory = currentStats.bestCategory;
            if (!bestCategory) bestCategory = categoryId;

            const newStats = {
                totalQuizzesPlayed: newTotalPlayed,
                totalScore: newTotalScore,
                averageScore: newAverage,
                bestCategory: bestCategory,
            };

            // 1. Create Score Document reference (we can't await addDoc inside transaction for ID generation easily if we want to include it, 
            // but we can just let Firestore generate ID or use a doc ref)
            // For simplicity in transaction, we usually just update the user. 
            // However, to keep distinct records, we should ideally write to 'scores' collection too.
            // Note: runTransaction requires all reads before writes. 

            // We will do the writes now.
            transaction.update(userRef, { stats: newStats });

            // We can't strictly 'addDoc' inside the transaction object method directly in standard SDK unless we get a ref first.
            // But we can create a ref for a new document.
            const newScoreRef = doc(collection(firestore, 'scores'));
            const scoreData: Score = {
                id: newScoreRef.id,
                userId,
                quizId,
                score,
                totalQuestions,
                date: Date.now(),
            };
            transaction.set(newScoreRef, scoreData);
        });
        console.log('Quiz result saved successfully!');
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
    }
};
