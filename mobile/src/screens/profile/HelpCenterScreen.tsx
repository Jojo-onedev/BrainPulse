import React from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { ChevronLeft, ChevronRight, HelpCircle, Mail, MessageSquare } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const HelpCenterScreen = () => {
    const navigation = useNavigation();

    const FAQItem = ({ question, answer }: any) => (
        <View style={styles.faqItem}>
            <Text style={styles.question}>{question}</Text>
            <Text style={styles.answer}>{answer}</Text>
        </View>
    );

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Centre d'aide</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <HelpCircle size={48} color={COLORS.primary} />
                    <Text style={styles.heroTitle}>Comment pouvons-nous vous aider ?</Text>
                </View>

                <Text style={styles.sectionTitle}>Questions Fréquentes</Text>
                
                <FAQItem 
                    question="Comment gagner des points ?"
                    answer="Chaque bonne réponse vous rapporte des points basés sur la rapidité et la difficulté."
                />
                
                <FAQItem 
                    question="C'est quoi le mode Matchfinding ?"
                    answer="C'est un mode compétitif où vous êtes mis en relation avec d'autres joueurs en temps réel."
                />

                <FAQItem 
                    question="Mon score ne s'affiche pas dans le classement."
                    answer="Il faut parfois quelques minutes pour que le classement mondial se mette à jour."
                />

                <Text style={styles.sectionTitle}>Contactez-nous</Text>

                <TouchableOpacity style={styles.contactCard}>
                    <Mail color={COLORS.primary} size={24} />
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Email Support</Text>
                        <Text style={styles.contactValue}>support@duelio.app</Text>
                    </View>
                    <ChevronRight size={18} color={COLORS.border} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactCard}>
                    <MessageSquare color={COLORS.secondary} size={24} />
                    <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Chat en direct</Text>
                        <Text style={styles.contactValue}>Disponible 9h - 18h</Text>
                    </View>
                    <ChevronRight size={18} color={COLORS.border} />
                </TouchableOpacity>
            </ScrollView>
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
    },
    content: {
        padding: SPACING.m,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        gap: SPACING.m,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.text,
        marginTop: SPACING.l,
        marginBottom: SPACING.m,
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.6,
    },
    faqItem: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.small,
    },
    question: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    answer: {
        fontSize: 14,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.small,
        gap: SPACING.m,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
});
