/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./context/**/*.{js,ts,jsx,tsx}",
        "./views/**/*.{js,ts,jsx,tsx}",
        "./lib/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                // Custom Hietakulma colors inferred from usage
                hieta: {
                    black: '#1a1a1a',    // Dark header/sidebar
                    sand: '#dcc6a0',     // Gold/Sand accent
                    blue: '#005470',     // Corporate blue
                    light: '#f8fafc',    // Main background
                    'wood-accent': '#c28e5f',
                    'wood-light': '#f0e6dd'
                }
            },
            fontFamily: {
                sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['ui-sans-serif', 'system-ui', 'sans-serif'], // Fallback
            }
        },
    },
    plugins: [],
}
