import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, ChevronLeft, Target, Zap, Trophy, History } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { CATEGORIES } from '../../types';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export const StatisticsScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [categoryStats, setCategoryStats] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            // For now, we simulate category breakdown or fetch if we had that data
            // In a real app, we'd query the 'scores' table and group by category
            const { data: scores, error } = await supabase
                .from('scores')
                .select('*')
                .eq('user_id', user?.uid);

            if (error) throw error;

            // Group by category manually for now
            const statsMap: Record<string, { count: number; totalScore: number; maxScore: number }> = {};
            
            scores?.forEach((s: any) => {
                const cat = s.category_id || 'general';
                if (!statsMap[cat]) {
                    statsMap[cat] = { count: 0, totalScore: 0, maxScore: 0 };
                }
                statsMap[cat].count += 1;
                statsMap[cat].totalScore += s.score;
                statsMap[cat].maxScore = Math.max(statsMap[cat].maxScore, s.score);
            });

            const processedStats = CATEGORIES.map(cat => ({
                ...cat,
                played: statsMap[cat.id]?.count || 0,
                avgScore: statsMap[cat.id] ? Math.round((statsMap[cat.id].totalScore / (statsMap[cat.id].count * 10)) * 100) : 0,
            })).sort((a, b) => b.played - a.played);

            setCategoryStats(processedStats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, subValue, color, delay }: any) => (
        <Animated.View 
            entering={FadeInDown.delay(delay).duration(600)}
            style={[styles.mainStatCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
        >
            <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
                <Icon size={24} color={color} />
            </View>
            <View>
                <Text style={styles.mainStatLabel}>{label}</Text>
                <Text style={styles.mainStatValue}>{value}</Text>
                {subValue && <Text style={styles.mainStatSubValue}>{subValue}</Text>}
            </View>
        </Animated.View>
    );

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Statistiques Détaillées</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Hero Stats */}
                    <View style={styles.statsGrid}>
                        <StatCard 
                            icon={Trophy} 
                            label="Score Total" 
                            value={user?.stats.totalScore || 0} 
                            color="#FFD700" 
                            delay={100}
                        />
                        <StatCard 
                            icon={Zap} 
                            label="Quiz Réalisés" 
                            value={user?.stats.totalQuizzesPlayed || 0} 
                            color={COLORS.secondary} 
                            delay={200}
                        />
                        <StatCard 
                            icon={Target} 
                            label="Précision Moyenne" 
                            value={`${user?.stats.averageScore || 0}%`} 
                            color={COLORS.success} 
                            delay={300}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Performance par Catégorie</Text>
                    
                    {categoryStats.map((item, index) => (
                        <Animated.View 
                            key={item.id}
                            entering={FadeInRight.delay(400 + index * 100).duration(600)}
                            style={styles.categoryStatItem}
                        >
                            <View style={styles.categoryInfo}>
                                <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                                <Text style={styles.categoryLabel}>{item.label}</Text>
                                <Text style={styles.categoryPlayed}>{item.played} joués</Text>
                            </View>
                            
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBarBg}>
                                    <View 
                                        style={[
                                            styles.progressBarFill, 
                                            { width: `${item.avgScore}%`, backgroundColor: item.color }
                                        ]} 
                                    />
                                </View>
                                <Text style={styles.progressText}>{item.avgScore}%</Text>
                            </View>
                        </Animated.View>
                    ))}

                    <View style={styles.historyCard}>
                        <View style={styles.historyHeader}>
                            <History size={20} color={COLORS.text} />
                            <Text style={styles.historyTitle}>Activité Récente</Text>
                        </View>
                        <Text style={styles.historySubtitle}>Les derniers quiz seront affichés ici très bientôt.</Text>
                    </View>
                </ScrollView>
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
    scrollContent: {
        padding: SPACING.m,
    },
    statsGrid: {
        gap: SPACING.m,
        marginBottom: SPACING.xl,
    },
    mainStatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: SPACING.l,
        ...SHADOWS.small,
        gap: SPACING.m,
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainStatLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    mainStatValue: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.text,
    },
    mainStatSubValue: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.text,
        marginBottom: SPACING.m,
        marginTop: SPACING.s,
    },
    categoryStatItem: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: SPACING.m,
        marginBottom: SPACING.s,
        ...SHADOWS.tiny,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    categoryLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.text,
        flex: 1,
    },
    categoryPlayed: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.border + '50',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 13,
        fontWeight: '900',
        color: COLORS.textSecondary,
        width: 35,
    },
    historyCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: SPACING.l,
        marginTop: SPACING.m,
        borderStyle: 'dashed',
        borderWidth: 1.5,
        borderColor: COLORS.border,
        alignItems: 'center',
        opacity: 0.7,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    historySubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
});
