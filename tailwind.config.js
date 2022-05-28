module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },

      },
      animation: {
        'fade-in-down': 'fade-in-down 0.8s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
      },
      colors: {
        'regal-blue': '#3F5374',
        'error-red':'#fff2f0',
        'exam-editor-blue': '#535B6C',
      },
    },
  },
  plugins: [],
};
