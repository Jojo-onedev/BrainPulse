import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, SHADOWS, FONTS } from '../../theme';
import { CATEGORIES } from '../../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../../types/navigation';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Brain, Trophy, Star, BarChart3, History, Globe, Beaker, Trophy as SportIcon, Palmtree, Newspaper, BookOpen } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { ComingSoonModal } from '../../components/ui/ComingSoonModal';

// Type navigation prop correctly for nested navigator
type Props = CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.m * 3) / 2;

export const HomeScreen = ({ navigation }: Props) => {
    const { user } = useAuth();
    const [comingSoon, setComingSoon] = React.useState<{ visible: boolean; feature: string }>({
        visible: false,
        feature: ''
    });

    const showComingSoon = (feature: string) => {
        setComingSoon({ visible: true, feature });
    };

    const getCategoryIcon = (id: string, color: string, size: number = 24) => {
        const props = { color, size };
        switch (id) {
            case 'history': return <History {...props} />;
            case 'geography': return <Globe {...props} />;
            case 'science': return <Beaker {...props} />;
            case 'sports': return <SportIcon {...props} />;
            case 'culture_africa': return <Palmtree {...props} />;
            case 'news': return <Newspaper {...props} />;
            case 'general': return <BookOpen {...props} />;
            default: return <BookOpen {...props} />;
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        const name = user?.displayName ? `, ${user.displayName}` : '';

        if (hour >= 5 && hour < 13) return `Bonjour${name} 👋`;
        if (hour >= 13 && hour < 18) return `Bon après-midi${name} ☀️`;
        if (hour >= 18 && hour < 22) return `Bonsoir${name} 🌙`;
        return `Bonne nuit${name} 😴`;
    };

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                    <Text style={styles.subtitle}>Prêt pour un défi ?</Text>
                </View>
                <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                    <Brain color={COLORS.primary} size={28} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.actionItem} onPress={() => showComingSoon('Classement')}>
                        <View style={[styles.actionIconContainer, { backgroundColor: '#FFD70015' }]}>
                            <Trophy size={22} color="#FFD700" />
                        </View>
                        <Text style={styles.actionLabel}>Classement</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={() => showComingSoon('Favoris')}>
                        <View style={[styles.actionIconContainer, { backgroundColor: '#FF658415' }]}>
                            <Star size={22} color="#FF6584" />
                        </View>
                        <Text style={styles.actionLabel}>Favoris</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem} onPress={() => showComingSoon('Statistiques')}>
                        <View style={[styles.actionIconContainer, { backgroundColor: '#6C63FF15' }]}>
                            <BarChart3 size={22} color="#6C63FF" />
                        </View>
                        <Text style={styles.actionLabel}>Stats</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Explorer les thèmes</Text>
                    <TouchableOpacity onPress={() => showComingSoon('Toutes les catégories')}>
                        <Text style={styles.seeAll}>Tout voir</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.card}
                            onPress={() => {
                                const { MOCK_QUIZZES } = require('../../data/mock');
                                const firstQuiz = MOCK_QUIZZES.find((q: any) => q.category === cat.id);
                                if (firstQuiz) {
                                    navigation.navigate('Quiz', { quizId: firstQuiz.id });
                                } else {
                                    navigation.navigate('QuizList', { categoryId: cat.id, categoryName: cat.label });
                                }
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.cardBackground, { backgroundColor: cat.color + '10' }]} />
                            <View style={[styles.iconContainer, { backgroundColor: cat.color }]}>
                                {getCategoryIcon(cat.id, '#FFF', 26)}
                            </View>
                            <Text style={styles.cardTitle}>{cat.label}</Text>
                            <View style={styles.cardFooter}>
                                <Text style={styles.questionCount}>20+ Questions</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <ComingSoonModal
                visible={comingSoon.visible}
                featureName={comingSoon.feature}
                onClose={() => setComingSoon({ ...comingSoon, visible: false })}
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
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    profileButton: {
        width: 50,
        height: 50,
        backgroundColor: '#FFF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    scrollContent: {
        paddingHorizontal: SPACING.m,
        paddingTop: SPACING.s,
        paddingBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    seeAll: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: CARD_WIDTH,
        borderRadius: 24,
        marginBottom: SPACING.m,
        alignItems: 'center',
        padding: SPACING.m,
        height: 160,
        backgroundColor: '#FFF',
        ...SHADOWS.small,
        overflow: 'hidden',
    },
    cardBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.6,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.m,
        ...SHADOWS.small,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 4,
    },
    cardFooter: {
        marginTop: 'auto',
    },
    questionCount: {
        fontSize: 11,
        color: COLORS.textSecondary,
        fontWeight: '600',
        opacity: 0.7,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SPACING.xl,
        backgroundColor: '#FFF',
        paddingVertical: SPACING.m,
        borderRadius: 24,
        ...SHADOWS.medium,
    },
    actionItem: {
        alignItems: 'center',
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.text,
    },
});
