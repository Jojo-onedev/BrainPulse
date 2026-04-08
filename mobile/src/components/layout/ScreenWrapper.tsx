import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme';

interface ScreenWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
    withScrollView?: boolean;
    withBottomInset?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, style, withBottomInset = true }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[
            styles.container, 
            { paddingTop: insets.top },
            withBottomInset && { paddingBottom: insets.bottom },
            style
        ]}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
});
