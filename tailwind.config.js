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
          DEFAULT: '#1890FF',
          hover: '#40A9FF',
          light: '#E6F7FF',
        },
        success: '#52C41A',
        warning: '#FAAD14',
        error: '#FF4D4F',
        info: '#1890FF',
        bg: {
          primary: '#F5F7FA',
          secondary: '#FFFFFF',
          dark: '#001529',
        },
        text: {
          primary: '#262626',
          secondary: '#8C8C8C',
          light: '#BFBFBF',
        },
        border: '#E8E8E8',
        highlight: {
          yellow: '#FFFBE6',
          border: '#FFE58F',
        }
      },
      borderRadius: {
        'card': '8px',
        'button': '6px',
        'bubble': '12px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}
