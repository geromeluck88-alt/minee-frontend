/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0f1117',
          50: '#161922',
          100: '#1e2330',
          200: '#252d3d',
        },
        brand: {
          cyan:   '#22d3ee',
          purple: '#818cf8',
          green:  '#34d399',
          amber:  '#f59e0b',
          red:    '#dc3545',
        },
        text: {
          DEFAULT: '#e2e8f0',
          muted:   '#94a3b8',
          dim:     '#64748b',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
