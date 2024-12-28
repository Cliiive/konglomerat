/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
      },
      gridTemplateColumns: {
        // Simple 16 column grid
        "70/30": "70% 30%",
      },
      colors: {
        abbey: {
          50: "#f5f5f6",
          100: "#e5e6e8",
          200: "#ceced3",
          300: "#acadb4",
          400: "#82838e",
          500: "#676873",
          600: "#585862",
          700: "#505058",
          800: "#434248",
          900: "#3a3a3f",
          950: "#242428",
        },
      },
    },
  },
  plugins: [],
};
