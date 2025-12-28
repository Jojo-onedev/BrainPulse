import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, SHADOWS, FONTS } from '../../theme';
import { CATEGORIES } from '../../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, MainTabParamList } from '../../types/navigation';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Brain } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

// Type navigation prop correctly for nested navigator
type Props = CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.m * 3) / 2;

export const HomeScreen = ({ navigation }: Props) => {
    const { user } = useAuth();

    const getGreeting = () => {
        const hour = new Date().getHours();
        const name = user?.displayName ? ` ${user.displayName}` : '';

        if (hour >= 5 && hour < 13) {
            return `Bonjour${name} 👋`;
        } else if (hour >= 13 && hour < 22) {
            return `Bonsoir${name} 🌙`;
        } else {
            return `Bonne nuit${name} 😴`;
        }
    };

    const getSubtitle = () => {
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 5) {
            return "À demain pour s'entraîner !";
        }
        return "Prêt à apprendre ?";
    };

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                    <Text style={styles.subtitle}>{getSubtitle()}</Text>
                </View>
                <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                    <Brain color={COLORS.primary} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Catégories</Text>
                <View style={styles.grid}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.card, { backgroundColor: cat.color + '15' }]} // Tinted background
                            onPress={() => {
                                const { MOCK_QUIZZES } = require('../../data/mock');
                                const firstQuiz = MOCK_QUIZZES.find((q: any) => q.category === cat.id);
                                if (firstQuiz) {
                                    navigation.navigate('Quiz', { quizId: firstQuiz.id });
                                } else {
                                    navigation.navigate('QuizList', { categoryId: cat.id, categoryName: cat.label });
                                }
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: cat.color }]}>
                                {/* Placeholder for icon, using first letter */}
                                <Text style={styles.iconText}>{cat.label[0]}</Text>
                            </View>
                            <Text style={styles.cardTitle}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 18,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    profileButton: {
        padding: SPACING.s,
        backgroundColor: COLORS.card,
        borderRadius: 12,
        ...SHADOWS.small,
    },
    scrollContent: {
        padding: SPACING.m,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: SPACING.m,
        color: COLORS.text,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: CARD_WIDTH,
        padding: SPACING.m,
        borderRadius: 16,
        marginBottom: SPACING.m,
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    iconText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
    },
});
