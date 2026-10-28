/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366F1',
          accent: '#4F46E5',
        },
        surface: {
          page: '#0F172A',
          card: '#1E293B',
        },
        text: {
          primary: '#F8FAFC',
          muted: '#94A3B8',
        },
        type: {
          feature: '#10B981',
          bug: '#EF4444',
        },
        due: {
          safe: '#334155',
          warning: '#D97706',
          overdue: '#DC2626',
          neutral: '#1E293B',
        }
      },
    },
  },
  plugins: [],
};