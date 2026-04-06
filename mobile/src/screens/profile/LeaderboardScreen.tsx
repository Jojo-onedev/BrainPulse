import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { supabase } from '../../services/supabase';
import { Trophy, ChevronLeft, User as UserIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const LeaderboardScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('total_score', { ascending: false })
                .limit(20);

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const isTop3 = index < 3;
        const medalColor = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32';

        return (
            <Animated.View 
                entering={FadeInDown.delay(index * 50)}
                style={[styles.userCard, isTop3 && styles.topUserCard]}
            >
                <View style={styles.rankContainer}>
                    {isTop3 ? (
                        <Trophy size={20} color={medalColor} fill={medalColor} />
                    ) : (
                        <Text style={styles.rankText}>{index + 1}</Text>
                    )}
                </View>

                <View style={styles.avatarContainer}>
                    {item.photo_url ? (
                        <Image source={{ uri: item.photo_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primary + '20' }]}>
                            <UserIcon size={20} color={COLORS.primary} />
                        </View>
                    )}
                </View>

                <View style={styles.userInfo}>
                    <Text style={styles.displayName} numberOfLines={1}>
                        {item.display_name || 'Utilisateur Anonyme'}
                    </Text>
                    <Text style={styles.userStats}>
                        {item.total_games || 0} quiz joués
                    </Text>
                </View>

                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreValue}>{item.total_score || 0}</Text>
                    <Text style={styles.scoreLabel}>pts</Text>
                </View>
            </Animated.View>
        );
    };

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Classement Mondial</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Aucune donnée disponible</Text>
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
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: SPACING.m,
        marginBottom: SPACING.s,
        ...SHADOWS.small,
    },
    topUserCard: {
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
        backgroundColor: COLORS.primary + '05',
    },
    rankContainer: {
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
    },
    avatarContainer: {
        marginHorizontal: SPACING.m,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
    },
    displayName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    userStats: {
        fontSize: 12,
        color: COLORS.textSecondary,
        opacity: 0.7,
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    scoreValue: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.primary,
    },
    scoreLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        marginTop: -2,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
});
