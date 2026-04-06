export const formatTimeAgo = (timestampMs: number): string => {
    const now = new Date().getTime();
    const diffInSeconds = Math.floor((now - timestampMs) / 1000);

    if (diffInSeconds < 60) {
        return "À l'instant";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }

    // Si plus d'une semaine, on affiche la date au format court "JJ/MM/AAAA"
    const date = new Date(timestampMs);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};
