import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { MOCK_QUIZZES } from '../../data/mock';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { Clock, BookOpen, ChevronRight } from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizList'>;

export const QuizListScreen = ({ route, navigation }: Props) => {
    const { categoryId, categoryName } = route.params;

    const quizzes = MOCK_QUIZZES.filter(q => q.category === categoryId);

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'easy': return COLORS.success;
            case 'medium': return COLORS.warning;
            case 'hard': return COLORS.error;
            default: return COLORS.textSecondary;
        }
    };

    const renderItem = ({ item }: { item: typeof MOCK_QUIZZES[0] }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Quiz', { quizId: item.id })}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <Text style={styles.quizTitle}>{item.title}</Text>
                    <View style={[styles.badge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
                        <Text style={[styles.badgeText, { color: getDifficultyColor(item.difficulty) }]}>
                            {item.difficulty.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                <View style={styles.footerRow}>
                    <View style={styles.metaItem}>
                        <BookOpen size={16} color={COLORS.textSecondary} />
                        <Text style={styles.metaText}>{item.questionsCount} questions</Text>
                    </View>
                    {item.isPremium && (
                        <View style={[styles.metaItem, { marginLeft: SPACING.m }]}>
                            <Text style={{ color: COLORS.secondary, fontWeight: 'bold' }}>Premium</Text>
                        </View>
                    )}
                </View>
            </View>
            <ChevronRight color={COLORS.border} />
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{categoryName}</Text>
            </View>

            <FlatList
                data={quizzes}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucun quiz disponible pour le moment.</Text>
                    </View>
                }
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: SPACING.m,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    backButton: {
        padding: SPACING.s,
        marginRight: SPACING.s,
    },
    backText: {
        fontSize: 24,
        color: COLORS.text,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    listContent: {
        padding: SPACING.m,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...SHADOWS.small,
    },
    cardContent: {
        flex: 1,
        marginRight: SPACING.m,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    quizTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    emptyContainer: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
});
