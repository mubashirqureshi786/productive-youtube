/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./src/popup.html"],
  theme: {
    extend: {
      colors: {
        "youtube-red": "#FF0000",
        "youtube-dark": "#181818",
        "youtube-gray": "#F9F9F9",
      },
      fontFamily: {
        youtube: ["YouTube Sans", "Roboto", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
