import React from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING } from '../../theme';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const PrivacyScreen = () => {
    const navigation = useNavigation();

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Confidentialité</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Politique de Confidentialité</Text>
                <Text style={styles.date}>Dernière mise à jour : 6 Avril 2026</Text>

                <Text style={styles.paragraph}>
                    Chez Duelio, nous prenons votre vie privée au sérieux. Cette politique explique comment nous collectons, utilisons et protégeons vos données.
                </Text>

                <Text style={styles.bulletTitle}>1. Collecte des données</Text>
                <Text style={styles.paragraph}>
                    Nous collectons uniquement les informations nécessaires au bon fonctionnement de l'application : votre adresse email, votre pseudonyme et vos statistiques de jeu.
                </Text>

                <Text style={styles.bulletTitle}>2. Utilisation des données</Text>
                <Text style={styles.paragraph}>
                    Vos données sont utilisées pour synchroniser votre progression sur différents appareils, afficher votre score dans le classement mondial et vous proposer des défis adaptés.
                </Text>

                <Text style={styles.bulletTitle}>3. Sécurité</Text>
                <Text style={styles.paragraph}>
                    Toutes vos données sont stockées de manière sécurisée via nos services partenaires (Supabase). Nous ne partageons jamais vos informations personnelles avec des tiers à des fins commerciales.
                </Text>

                <Text style={styles.bulletTitle}>4. Vos droits</Text>
                <Text style={styles.paragraph}>
                    Vous pouvez à tout moment demander la suppression de votre compte et de toutes les données associées directement depuis les paramètres ou en nous contactant.
                </Text>
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
        padding: SPACING.l,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xl,
    },
    bulletTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SPACING.l,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 16,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
});
