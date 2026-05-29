/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"IBM Plex Arabic"', '"IBM Plex Sans Arabic"', "system-ui", "sans-serif"]
      },
      colors: {
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857"
        }
      }
    }
  },
  plugins: []
};
