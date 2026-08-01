import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Paleta "elegante negro" — fondo negro profundo, acento dorado.
        // deep: se mantiene sin tocar (se usa como botón/fondo Y como texto
        // en decenas de archivos; la legibilidad del texto se resuelve en
        // globals.css). sand y teal sí se redefinen porque solo se usan
        // como fondo/acento respectivamente, así que no rompen nada.
        deep: {
          DEFAULT: "#0E3A4C",
          50: "#E7EEF1",
          100: "#C4D6DC",
          400: "#255E75",
          600: "#0E3A4C",
          800: "#092832",
          900: "#050D10",
        },
        teal: {
          // repurposed as el acento dorado elegante
          DEFAULT: "#C9A24B",
          50: "#3A3120",
          100: "#4A3D26",
          300: "#D9BA72",
          500: "#C9A24B",
          600: "#B8912F",
          700: "#93741F",
        },
        forest: {
          DEFAULT: "#1F4D38",
          50: "#12291D",
          100: "#173521",
          400: "#2C6A48",
          600: "#1F4D38",
          800: "#0B1D14",
        },
        sand: {
          // repurposed como superficies oscuras (antes era el fondo claro)
          DEFAULT: "#141416",
          50: "#0B0B0D",
          100: "#151517",
          300: "#28282C",
        },
        stone: {
          DEFAULT: "#9A9488",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(0,0,0,0.55)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
