import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Paleta extraída de las fotografías de Travesías AnSup
        deep: {
          DEFAULT: "#0E3A4C", // azul profundo del agua
          50: "#E7EEF1",
          100: "#C4D6DC",
          400: "#255E75",
          600: "#0E3A4C",
          800: "#092832",
          900: "#061B22",
        },
        teal: {
          DEFAULT: "#189AA6", // turquesa de las tablas AF
          50: "#E7F6F7",
          100: "#C7ECEF",
          300: "#5BC2CC",
          500: "#189AA6",
          600: "#127C86",
          700: "#0C5A61",
        },
        forest: {
          DEFAULT: "#2E5D45", // verde bosque de Chiloé
          50: "#EAF1EC",
          100: "#CBDED2",
          400: "#4A7D5E",
          600: "#2E5D45",
          800: "#1D3C2C",
        },
        sand: {
          DEFAULT: "#EDE3CE", // arena / madera clara
          50: "#FAF7F0",
          100: "#F3ECDB",
          300: "#E3D5B0",
        },
        stone: {
          DEFAULT: "#6B7280",
        },
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(14,58,76,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
