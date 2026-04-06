import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { Quiz } from '../../types';
import { ChevronRight, Clock, Star } from 'lucide-react-native';

interface QuizCardProps {
    quiz: Quiz;
    onPress: () => void;
}

export const QuizCard = ({ quiz, onPress }: QuizCardProps) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '10' }]}>
                    <Star size={24} color={COLORS.primary} />
                </View>
                
                <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>{quiz.title}</Text>
                    <Text style={styles.description} numberOfLines={2}>{quiz.description}</Text>
                    
                    <View style={styles.meta}>
                        <View style={styles.metaItem}>
                            <Clock size={12} color={COLORS.textSecondary} />
                            <Text style={styles.metaText}>{quiz.questionsCount} questions</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: quiz.difficulty === 'easy' ? COLORS.success + '20' : COLORS.warning + '20' }]}>
                            <Text style={[styles.badgeText, { color: quiz.difficulty === 'easy' ? COLORS.success : COLORS.warning }]}>
                                {quiz.difficulty.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>
                
                <ChevronRight size={20} color={COLORS.border} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.small,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    info: {
        flex: 1,
        marginRight: SPACING.s,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 2,
    },
    description: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 8,
        opacity: 0.7,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
});
