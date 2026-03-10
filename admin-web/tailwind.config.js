/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    hover: '#4f46e5',
                    light: 'rgba(99, 102, 241, 0.1)',
                },
                secondary: '#ec4899',
                accent: '#8b5cf6',
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
            },
            boxShadow: {
                'sidebar': '4px 0 24px -10px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
