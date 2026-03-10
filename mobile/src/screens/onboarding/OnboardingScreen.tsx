import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING } from '../../theme';
import { ChevronRight, ChevronLeft, GraduationCap, Users, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: 1,
        title: 'Développe ta culture',
        description: 'Enrichis tes connaissances générales en t’amusant avec des quiz variés.',
        icon: GraduationCap,
        color: '#6C63FF',
    },
    {
        id: 2,
        title: 'Défie tes amis',
        description: 'Prépare tes examens et affronte d’autres joueurs en mode compétition.',
        icon: Users,
        color: '#FF6584',
    },
    {
        id: 3,
        title: 'Progresse chaque jour',
        description: 'Suis tes statistiques et deviens incollable sur tous les sujets.',
        icon: TrendingUp,
        color: '#00B894',
    },
];

export const OnboardingScreen = ({ navigation }: any) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            navigation.replace('MainTabs');
        }
    };

    const handleBack = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const CurrentIcon = SLIDES[currentSlide].icon;

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.slideContainer}>
                {/* Illustration Section */}
                <View style={styles.illustrationContent}>
                    <View style={[styles.iconContainer, { backgroundColor: SLIDES[currentSlide].color + '15' }]}>
                        <CurrentIcon size={120} color={SLIDES[currentSlide].color} />
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>{SLIDES[currentSlide].title}</Text>
                    <Text style={styles.description}>{SLIDES[currentSlide].description}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.dots}>
                        {SLIDES.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === currentSlide && styles.activeDot,
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.buttonsContainer}>
                        {/* Back Button (Hidden on first slide) */}
                        <View style={styles.leftButtonContainer}>
                            {currentSlide > 0 && (
                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={handleBack}
                                    activeOpacity={0.7}
                                >
                                    <ChevronLeft color={COLORS.textSecondary} size={24} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Next/Start Button */}
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleNext}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>
                                {currentSlide === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
                            </Text>
                            {currentSlide !== SLIDES.length - 1 && (
                                <ChevronRight color="#FFF" size={20} />
                            )}
                        </TouchableOpacity>

                        {/* Empty View to balance layout if needed or just use flex logic */}
                        <View style={styles.rightSpacer} />
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slideContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    illustrationContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    content: {
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: SPACING.m,
    },
    description: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        padding: SPACING.xl,
        paddingBottom: SPACING.xxl + 20, // Extra padding for bottom
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.border,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: COLORS.primary,
        width: 20,
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftButtonContainer: {
        width: 60,
        alignItems: 'flex-start',
    },
    rightSpacer: {
        width: 60,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        minWidth: 160,
    },
    secondaryButton: {
        padding: SPACING.s,
        borderRadius: 12,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
    },
});

