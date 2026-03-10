import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp,
    orderBy,
    limit,
    getDoc,
    increment
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Challenge, Question, User } from '../types';

const CHALLENGES_COLLECTION = 'challenges';
const USERS_COLLECTION = 'users';

export const challengeService = {
    /**
     * Search for users by display name (simple prefix search)
     */
    searchUsers: async (searchTerm: string, currentUserId: string): Promise<User[]> => {
        if (!searchTerm.trim()) return [];

        try {
            // Firestore doesn't support full-text search easily. 
            // We use a simple strategy: search for names starting with the term.
            const usersRef = collection(firestore, USERS_COLLECTION);
            const q = query(
                usersRef,
                where('displayName', '>=', searchTerm),
                where('displayName', '<=', searchTerm + '\uf8ff'),
                limit(10)
            );

            const querySnapshot = await getDocs(q);
            const users: User[] = [];
            querySnapshot.forEach((doc) => {
                const userData = doc.data() as User;
                if (userData.uid !== currentUserId) {
                    users.push(userData);
                }
            });

            return users;
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    },

    /**
     * Create a new challenge
     */
    createChallenge: async (
        attacker: { uid: string; displayName: string; photoURL?: string },
        defender: { uid: string; displayName: string },
        quizCategory: string,
        questions: Question[],
        attackerScore: number
    ): Promise<string> => {
        try {
            const challengesRef = collection(firestore, CHALLENGES_COLLECTION);
            const newChallenge = {
                attackerId: attacker.uid,
                attackerName: attacker.displayName,
                attackerPhotoURL: attacker.photoURL || null,
                defenderId: defender.uid,
                defenderName: defender.displayName,
                status: 'pending',
                quizCategory,
                questions,
                attackerScore,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const docRef = await addDoc(challengesRef, newChallenge);
            return docRef.id;
        } catch (error) {
            console.error('Error creating challenge:', error);
            throw error;
        }
    },

    /**
     * Get challenges where user is the defender and status is pending
     */
    getReceivedChallenges: async (userId: string): Promise<Challenge[]> => {
        try {
            const challengesRef = collection(firestore, CHALLENGES_COLLECTION);
            const q = query(
                challengesRef,
                where('defenderId', '==', userId),
                where('status', '==', 'pending'),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const challenges: Challenge[] = [];
            querySnapshot.forEach((doc) => {
                challenges.push({ id: doc.id, ...doc.data() } as Challenge);
            });

            return challenges;
        } catch (error) {
            console.error('Error getting received challenges:', error);
            return [];
        }
    },

    /**
     * Get challenges where user is the attacker
     */
    getSentChallenges: async (userId: string): Promise<Challenge[]> => {
        try {
            const challengesRef = collection(firestore, CHALLENGES_COLLECTION);
            const q = query(
                challengesRef,
                where('attackerId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(20)
            );

            const querySnapshot = await getDocs(q);
            const challenges: Challenge[] = [];
            querySnapshot.forEach((doc) => {
                challenges.push({ id: doc.id, ...doc.data() } as Challenge);
            });

            return challenges;
        } catch (error) {
            console.error('Error getting sent challenges:', error);
            return [];
        }
    },

    /**
     * Complete a challenge by the defender
     */
    completeChallenge: async (challengeId: string, defenderScore: number): Promise<void> => {
        try {
            const challengeRef = doc(firestore, CHALLENGES_COLLECTION, challengeId);
            const challengeSnap = await getDoc(challengeRef);

            if (!challengeSnap.exists()) throw new Error('Challenge not found');

            const challengeData = challengeSnap.data() as Challenge;
            const winnerId = defenderScore > challengeData.attackerScore
                ? challengeData.defenderId
                : (challengeData.attackerScore > defenderScore ? challengeData.attackerId : 'draw');

            await updateDoc(challengeRef, {
                defenderScore,
                status: 'completed',
                winnerId,
                updatedAt: Date.now(),
            });
        } catch (error) {
            console.error('Error completing challenge:', error);
            throw error;
        }
    },

    /**
     * Update user stats after a match
     */
    updatePlayerStats: async (userId: string, score: number): Promise<void> => {
        try {
            const userRef = doc(firestore, USERS_COLLECTION, userId);
            await updateDoc(userRef, {
                'stats.totalScore': increment(score),
                'stats.totalQuizzesPlayed': increment(1)
            });
        } catch (error) {
            console.error('Error updating player stats:', error);
        }
    }
};
