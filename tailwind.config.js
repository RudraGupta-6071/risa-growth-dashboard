/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#241310',
        'brand-surface': '#2B1613',
        'brand-surface-hover': '#381D19',
        'brand-border': '#3E201B',
        'brand-border-light': '#592E27',
        'brand-yellow': '#F6C445',
        'brand-yellow-light': '#FDE047',
        'brand-cream': '#FFFBF5',
        'brand-muted': '#C4ABA1',
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '16px',
        sm: '10px',
        md: '14px',
        lg: '18px',
        xl: '22px',
        '2xl': '26px',
        '3xl': '32px',
      }
    },
  },
  plugins: [],
}
