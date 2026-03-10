/**
 * Utility to map Firebase Auth error codes to user-friendly French messages.
 */
export const mapAuthError = (errorCode: string): string => {
    const code = errorCode ? errorCode.toLowerCase() : '';

    switch (code) {
        // Supabase / General Errors
        case 'invalid_credentials':
        case 'invalid login credentials':
        case 'invalid-credential':
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return "Email ou mot de passe incorrect.";

        case 'email_not_confirmed':
        case 'email not confirmed':
            return "Veuillez confirmer votre e-mail avant de vous connecter.";

        case 'user_already_exists':
        case 'auth/email-already-in-use':
            return "Cet email est déjà utilisé par un autre compte.";

        case 'auth/invalid-email':
        case 'invalid email':
            return "L'adresse email n'est pas valide.";

        case 'auth/weak-password':
            return "Le mot de passe est trop court (min. 6 caractères).";

        case 'too_many_requests':
        case 'auth/too-many-requests':
            return "Trop de tentatives. Réessaie dans quelques minutes.";

        case 'network_request_failed':
        case 'auth/network-request-failed':
            return "Problème de connexion réseau. Vérifie ton internet.";

        default:
            console.warn('--- DUELIO_AUTH_DIAGNOSTIC --- Code:', code, 'Original:', errorCode);
            return errorCode || "Une erreur inattendue est survenue. Réessaie plus tard.";
    }
};
