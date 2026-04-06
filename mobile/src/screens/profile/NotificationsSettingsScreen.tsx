import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { ChevronLeft, Bell, Swords, Trophy, Zap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const NotificationsSettingsScreen = () => {
    const navigation = useNavigation();
    const [settings, setSettings] = useState({
        challenges: true,
        leaderboard: false,
        news: true,
        points: true
    });

    const toggleSwitch = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const SettingItem = ({ icon: Icon, label, description, value, onToggle, color }: any) => (
        <View style={styles.settingItem}>
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                <Icon size={22} color={color} />
            </View>
            <View style={styles.info}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
            <Switch
                trackColor={{ false: '#767577', true: COLORS.primary + '80' }}
                thumbColor={value ? COLORS.primary : '#f4f3f4'}
                onValueChange={onToggle}
                value={value}
            />
        </View>
    );

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.hero}>
                    <Bell size={40} color={COLORS.primary} style={{ marginBottom: 16 }} />
                    <Text style={styles.heroTitle}>Gérez vos alertes</Text>
                    <Text style={styles.heroSubtitle}>Choisissez ce que vous voulez recevoir comme notifications.</Text>
                </View>

                <View style={styles.settingsGroup}>
                    <SettingItem 
                        icon={Swords}
                        label="Défis reçus"
                        description="Quand un ami vous lance un défi."
                        value={settings.challenges}
                        onToggle={() => toggleSwitch('challenges')}
                        color={COLORS.secondary}
                    />
                    <SettingItem 
                        icon={Trophy}
                        label="Classement"
                        description="Quand vous gagnez ou perdez une place."
                        value={settings.leaderboard}
                        onToggle={() => toggleSwitch('leaderboard')}
                        color={COLORS.warning}
                    />
                    <SettingItem 
                        icon={Zap}
                        label="Actualités"
                        description="Nouveaux quiz et mises à jour."
                        value={settings.news}
                        onToggle={() => toggleSwitch('news')}
                        color={COLORS.success}
                    />
                    <SettingItem 
                        icon={Bell}
                        label="Points & Récompenses"
                        description="Alertes sur vos gains."
                        value={settings.points}
                        onToggle={() => toggleSwitch('points')}
                        color={COLORS.primary}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.saveButtonText}>Enregistrer les préférences</Text>
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
    hero: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    settingsGroup: {
        gap: SPACING.m,
        marginBottom: SPACING.xl,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: SPACING.m,
        borderRadius: 20,
        ...SHADOWS.small,
        gap: SPACING.m,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    description: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.m,
        borderRadius: 16,
        alignItems: 'center',
        ...SHADOWS.medium,
        marginBottom: SPACING.xl,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
