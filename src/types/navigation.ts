import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
    Onboarding: undefined;
    MainTabs: NavigatorScreenParams<MainTabParamList>;
    QuizList: { categoryId: string; categoryName: string };
    Quiz: { quizId: string };
    Login: undefined;
    Signup: undefined;
    Result: { score: number; total: number; quizId: string };
    Paywall: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Competition: undefined;
    Profile: undefined;
    Favorites: undefined; // Bonus
};
