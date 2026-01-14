import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Today Shawarma Brand Palette
        shawarma: {
          // Primary
          DEFAULT: "#F7451B",
          primary: "#F7451B",
          // Light shades
          50: "#FDDAD1",
          100: "#FCB5A4",
          200: "#FA8F76",
          300: "#F96A49",
          // Dark shades
          600: "#C63716",
          700: "#942910",
          800: "#631C0B",
          900: "#310E05",
          // Accent variations
          accent: "#E15331",
          muted: "#CB6047",
          subtle: "#B56E5D",
          faded: "#9F7B73",
        },
        // Complementary colors
        brand: {
          primary: "#F7451B",     // Main orange-red
          cyan: "#1BCDF7",        // Complement - cool accent
          pink: "#F71B5F",        // Complement - vibrant
          gold: "#F7B31B",        // Complement - warm
          green: "#1BF745",       // Complement - fresh
          purple: "#451BF7",      // Complement - bold
        },
        // UI shortcuts
        flame: {
          light: "#FA8F76",
          DEFAULT: "#F7451B",
          dark: "#C63716",
        },
        // Legacy compatibility
        coffee: {
          dark: "#310E05",
          medium: "#F7451B",
          light: "#FA8F76",
          latte: "#FCB5A4",
          cream: "#FDDAD1",
          DEFAULT: "#F7451B",
        },
        brown: {
          dark: "#310E05",
          medium: "#631C0B",
          light: "#942910",
          DEFAULT: "#310E05",
        },
        cream: {
          background: "#FDDAD1",
          light: "#FFF8F0",
          DEFAULT: "#FDDAD1",
        },
        gold: {
          primary: "#F7B31B",
          secondary: "#F96A49",
        },
        black: {
          primary: "#310E05",
          DEFAULT: "#310E05",
        },
        charcoal: "#631C0B",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Anton", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        display: ["var(--font-heading)", "Anton", "sans-serif"],
      },
      letterSpacing: {
        heading: "0.02em",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "rise": {
          "0%": { height: "0%", opacity: "0.8" },
          "50%": { height: "100%", opacity: "1" },
          "100%": { height: "0%", opacity: "0.8" },
        },
        "bubble": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.6" },
          "50%": { transform: "translateY(-8px) scale(1.2)", opacity: "1" },
          "100%": { transform: "translateY(-16px) scale(0.8)", opacity: "0" },
        },
        "dot": {
          "0%, 80%, 100%": { transform: "scale(0.8)", opacity: "0.5" },
          "40%": { transform: "scale(1.2)", opacity: "1" },
        },
        "colorTransition": {
          "0%": { color: "rgb(9 9 11)", borderColor: "rgb(9 9 11 / 0.1)", backgroundColor: "rgb(9 9 11 / 0.05)" },
          "50%": { color: "rgb(255 255 255)", borderColor: "rgb(255 255 255 / 0.3)", backgroundColor: "rgb(255 255 255 / 0.1)" },
          "100%": { color: "rgb(9 9 11)", borderColor: "rgb(9 9 11 / 0.1)", backgroundColor: "rgb(9 9 11 / 0.05)" },
        },
        "bgTransition": {
          "0%": { backgroundColor: "rgb(255 255 255)" },
          "50%": { backgroundColor: "rgb(9 9 11)" },
          "100%": { backgroundColor: "rgb(255 255 255)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
