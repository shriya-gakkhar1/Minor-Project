/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        panel: "#0f1a2c",
        line: "#24334c",
        mint: "#2dd4bf",
        sky: "#38bdf8",
        amber: "#f59e0b",
        rose: "#fb7185",
      },
      boxShadow: {
        glow: "0 20px 80px rgba(45, 212, 191, 0.12)",
      },
    },
  },
  plugins: [],
};
