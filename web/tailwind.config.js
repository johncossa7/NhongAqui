/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effcf5",
          100: "#d9f8e7",
          500: "#008037",
          600: "#006d31",
          700: "#075528",
          900: "#05351d"
        },
        accent: {
          red: "#e53935",
          yellow: "#ffc928",
          ink: "#101418",
          cream: "#fbfaf6"
        }
      },
      boxShadow: {
        soft: "0 8px 24px rgba(16, 20, 24, 0.06)",
        lift: "0 18px 45px rgba(16, 20, 24, 0.12)",
        glow: "0 18px 60px rgba(0, 128, 55, 0.18)"
      }
    }
  },
  plugins: []
};
