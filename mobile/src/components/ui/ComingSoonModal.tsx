import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../theme';
import { Rocket, X } from 'lucide-react-native';

interface ComingSoonModalProps {
    visible: boolean;
    featureName: string;
    onClose: () => void;
}

const { width } = Dimensions.get('window');

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
    visible,
    featureName,
    onClose,
}) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <X size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <Rocket size={48} color={COLORS.secondary} />
                    </View>

                    <Text style={styles.title}>Prochainement !</Text>
                    <Text style={styles.message}>
                        La fonctionnalité <Text style={styles.featureHighlight}>{featureName}</Text> est en cours de développement. Restez connectés !
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>J'ai hâte !</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.l,
    },
    container: {
        width: Math.min(width - SPACING.l * 2, 340),
        backgroundColor: '#FFF',
        borderRadius: 28,
        padding: SPACING.xl,
        alignItems: 'center',
        ...SHADOWS.large,
    },
    closeButton: {
        position: 'absolute',
        top: SPACING.m,
        right: SPACING.m,
        padding: 4,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.secondary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l,
        marginTop: SPACING.m,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SPACING.xl,
        paddingHorizontal: SPACING.s,
    },
    featureHighlight: {
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    button: {
        width: '100%',
        height: 56,
        backgroundColor: COLORS.secondary,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
