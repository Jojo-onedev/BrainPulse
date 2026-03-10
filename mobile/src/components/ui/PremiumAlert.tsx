import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, SPACING, SHADOWS, FONTS } from '../../theme';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react-native';

interface PremiumAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'info';
    onClose: () => void;
    buttonText?: string;
}

const { width } = Dimensions.get('window');

export const PremiumAlert: React.FC<PremiumAlertProps> = ({
    visible,
    title,
    message,
    type = 'error',
    onClose,
    buttonText = 'D\'accord'
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={32} color={COLORS.success} />;
            case 'info':
                return <Info size={32} color={COLORS.primary} />;
            default:
                return <AlertCircle size={32} color={COLORS.error} />;
        }
    };

    const getAccentColor = () => {
        switch (type) {
            case 'success':
                return COLORS.success;
            case 'info':
                return COLORS.primary;
            default:
                return COLORS.error;
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <View style={[styles.iconContainer, { backgroundColor: getAccentColor() + '15' }]}>
                        {getIcon()}
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: getAccentColor() }]}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.l,
    },
    alertContainer: {
        width: Math.min(width - SPACING.l * 2, 340),
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: SPACING.xl,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.xl,
    },
    button: {
        width: '100%',
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
