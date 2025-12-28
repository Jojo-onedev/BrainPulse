/**
 * Utility to map Firebase Auth error codes to user-friendly French messages.
 */
export const mapAuthError = (errorCode: string): string => {
    switch (errorCode) {
        // Sign In / General Errors
        case 'auth/invalid-email':
            return "L'adresse email n'est pas valide.";
        case 'auth/user-disabled':
            return "Ce compte a été désactivé.";
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return "Email ou mot de passe incorrect.";

        // Sign Up Errors
        case 'auth/email-already-in-use':
            return "Cet email est déjà utilisé par un autre compte.";
        case 'auth/operation-not-allowed':
            return "La création de compte n'est pas activée.";
        case 'auth/weak-password':
            return "Le mot de passe est trop court (min. 6 caractères).";

        // Other Errors
        case 'auth/network-request-failed':
            return "Problème de connexion réseau. Vérifie ton internet.";
        case 'auth/too-many-requests':
            return "Trop de tentatives. Réessaie dans quelques minutes.";

        default:
            console.warn('Unknown Firebase error code:', errorCode);
            return "Une erreur inattendue est survenue. Réessaie plus tard.";
    }
};
