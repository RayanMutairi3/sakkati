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
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#d62839",
          600: "#c1121f",
          700: "#9f1239"
        }
      }
    }
  },
  plugins: []
};
