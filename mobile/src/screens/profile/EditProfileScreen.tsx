import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
    Image,
    Dimensions
} from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { User, Camera, Check, ArrowLeft, Save } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { PremiumAlert } from '../../components/ui/PremiumAlert';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

const { width } = Dimensions.get('window');

const PRESET_AVATARS = [
    'https://api.dicebear.com/7.x/avataaars/png?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Boots',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Buddy',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Cuddles',
    'https://api.dicebear.com/7.x/avataaars/png?seed=Daisy',
];

export const EditProfileScreen = ({ navigation }: Props) => {
    const { user, updateProfile } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(user?.photoURL || null);
    const [isSaving, setIsSaving] = useState(false);
    const [alert, setAlert] = useState<{ visible: boolean; title: string; message: string; type?: 'error' | 'success' }>({
        visible: false,
        title: '',
        message: '',
        type: 'error'
    });

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setSelectedPhoto(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!displayName.trim()) {
            setAlert({
                visible: true,
                title: 'Champ requis',
                message: 'Le pseudo ne peut pas être vide.',
                type: 'error'
            });
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile(displayName, selectedPhoto || undefined);
            setAlert({
                visible: true,
                title: 'Succès',
                message: 'Votre profil a été mis à jour avec succès.',
                type: 'success'
            });
        } catch (error: any) {
            setAlert({
                visible: true,
                title: 'Erreur',
                message: 'Impossible de mettre à jour le profil. Veuillez réessayer.',
                type: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseAlert = () => {
        const wasSuccess = alert.type === 'success';
        setAlert({ ...alert, visible: false });
        if (wasSuccess) {
            navigation.goBack();
        }
    };

    return (
        <ScreenWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={COLORS.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Modifier le profil</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.avatarSection}>
                        <View style={styles.mainAvatarContainer}>
                            <View style={styles.avatarWrapper}>
                                {selectedPhoto ? (
                                    <Image source={{ uri: selectedPhoto }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.placeholderAvatar}>
                                        <User size={40} color={COLORS.primary} />
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                                <Camera size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Choisis un avatar</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                            {PRESET_AVATARS.map((avatar, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.presetItem,
                                        selectedPhoto === avatar && styles.selectedPreset
                                    ]}
                                    onPress={() => setSelectedPhoto(avatar)}
                                >
                                    <View style={styles.presetInner}>
                                        <Image source={{ uri: avatar }} style={styles.presetImage} />
                                        {selectedPhoto === avatar && (
                                            <View style={styles.checkBadge}>
                                                <Check size={10} color="#FFF" strokeWidth={3} />
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.inputLabel}>Pseudo</Text>
                        <View style={styles.inputContainer}>
                            <User color={COLORS.textSecondary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Ton pseudo"
                                value={displayName}
                                onChangeText={setDisplayName}
                                maxLength={20}
                            />
                        </View>
                        <Text style={styles.inputHint}>C'est le nom qui s'affichera lors des compétitions.</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            <PremiumAlert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type === 'success' ? 'success' : 'error'}
                onClose={handleCloseAlert}
            />
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: '#FFF',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    scrollContent: {
        padding: SPACING.xl,
        paddingBottom: SPACING.xxl,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl * 1.5,
    },
    mainAvatarContainer: {
        width: 120,
        height: 120,
        position: 'relative',
        marginBottom: SPACING.xl,
    },
    avatarWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        backgroundColor: COLORS.primary + '10',
        borderWidth: 3,
        borderColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    placeholderAvatar: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
        ...SHADOWS.small,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    presetScroll: {
        width: width - SPACING.xl * 2,
    },
    presetItem: {
        marginRight: SPACING.m,
        padding: 4,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedPreset: {
        borderColor: COLORS.primary,
    },
    presetInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.card,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.border,
        position: 'relative',
    },
    presetImage: {
        width: '100%',
        height: '100%',
    },
    checkBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    formSection: {
        marginBottom: SPACING.xl * 2,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        paddingHorizontal: SPACING.m,
        height: 56,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.tiny,
    },
    inputIcon: {
        marginRight: SPACING.m,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500',
    },
    inputHint: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 8,
        opacity: 0.7,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        height: 56,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
});
