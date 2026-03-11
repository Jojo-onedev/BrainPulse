const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
    get: async (endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return response.json();
    },

    post: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return response.json();
    },

    // Stats spécifiques au dashboard
    getStats: () => api.get('/admin/stats'),

    // Gestion des questions
    getQuestions: (limit = 10) => api.get(`/admin/questions?limit=${limit}`),
    createQuestion: (data: any) => api.post('/admin/questions', data),

    deleteQuestion: (id: string) => fetch(`${API_BASE_URL}/admin/questions/${id}`, { method: 'DELETE' }).then(r => r.json()),

    deleteAllQuestions: () => fetch(`${API_BASE_URL}/admin/questions`, { method: 'DELETE' }).then(r => r.json()),

    importQuestions: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch(`${API_BASE_URL}/admin/questions/import`, {
            method: 'POST',
            body: formData,
        }).then(r => r.json());
    },

    downloadTemplate: () => {
        window.open(`${API_BASE_URL}/admin/questions/template`, '_blank');
    },

    // Gestion des utilisateurs
    getUsers: (limit = 100) => api.get(`/admin/users?limit=${limit}`),
    deleteUser: (id: string) => fetch(`${API_BASE_URL}/admin/users/${id}`, { method: 'DELETE' }).then(r => r.json()),
    togglePremium: (id: string) => fetch(`${API_BASE_URL}/admin/users/${id}/premium`, { method: 'PATCH' }).then(r => r.json()),

    // Déblocage freemium
    unlockCompetition: (userId: string, amount: number) =>
        api.post('/competition/unlock', { user_id: userId, amount }),
};
