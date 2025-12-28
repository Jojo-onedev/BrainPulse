import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';

export const PaywallScreen = () => {
    return (
        <ScreenWrapper style={styles.container}>
            <Text>Abonnez-vous pour débloquer le mode compétition !</Text>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
