import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './TabNavigator';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { QuizScreen } from '../screens/quiz/QuizScreen';
import { QuizListScreen } from '../screens/quiz/QuizListScreen';
import { ResultScreen } from '../screens/quiz/ResultScreen';
import { PaywallScreen } from '../screens/paywall/PaywallScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
    const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

    useEffect(() => {
        // Simple logic to check if already onboarded
        // For manual testing we might want to reset this or default to true
        AsyncStorage.getItem('alreadyLaunched').then(value => {
            if (value === null) {
                setIsFirstLaunch(true);
                AsyncStorage.setItem('alreadyLaunched', 'true');
            } else {
                setIsFirstLaunch(false);
            }
        });
    }, []);

    if (isFirstLaunch === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    animationDuration: 300,
                    gestureEnabled: true,
                }}
            >
                {isFirstLaunch ? (
                    <Stack.Screen
                        name="Onboarding"
                        component={OnboardingScreen}
                        options={{ animation: 'fade' }}
                    />
                ) : null}
                <Stack.Screen
                    name="MainTabs"
                    component={TabNavigator}
                    options={{ animation: 'fade' }}
                />
                <Stack.Screen name="QuizList" component={QuizListScreen} />
                <Stack.Screen name="Quiz" component={QuizScreen} />
                <Stack.Screen
                    name="Result"
                    component={ResultScreen}
                    options={{
                        gestureEnabled: false,
                        animation: 'fade_from_bottom'
                    }}
                />
                <Stack.Screen
                    name="Paywall"
                    component={PaywallScreen}
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom'
                    }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom'
                    }}
                />
                <Stack.Screen
                    name="Signup"
                    component={SignupScreen}
                    options={{
                        presentation: 'modal',
                        animation: 'slide_from_bottom'
                    }}
                />
                <Stack.Screen
                    name="EditProfile"
                    component={EditProfileScreen}
                    options={{
                        headerShown: false,
                        animation: 'slide_from_right'
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
