import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Heart, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { MOCK_QUIZZES } from '../../data/mock'; // Fallback / Base
import { QuizCard } from '../../components/ui/QuizCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const FavoritesScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            loadFavorites();
        }
    }, [user]);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            // Filter MOCK_QUIZZES or fetch from DB if quizzes were in DB
            // For now, matches against user.favorites array
            const favIds = user?.favorites || [];
            const favQuizzes = MOCK_QUIZZES.filter(q => favIds.includes(q.id));
            setFavorites(favQuizzes);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Mes Favoris</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInDown.delay(index * 100)}>
                            <QuizCard
                                quiz={item}
                                onPress={() => navigation.navigate('Quiz', { quizId: item.id })}
                            />
                        </Animated.View>
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Heart size={48} color={COLORS.border} />
                            </View>
                            <Text style={styles.emptyTitle}>Aucun favori</Text>
                            <Text style={styles.emptySubtitle}>
                                Les quiz que vous marquez d'un cœur apparaîtront ici pour un accès rapide.
                            </Text>
                            <TouchableOpacity 
                                style={styles.browseButton}
                                onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                            >
                                <Text style={styles.browseButtonText}>Parcourir les quiz</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m,
        backgroundColor: '#FFF',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -0.5,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SPACING.m,
        paddingBottom: SPACING.xl,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    emptySubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.xl,
    },
    browseButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: 16,
        ...SHADOWS.medium,
    },
    browseButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
