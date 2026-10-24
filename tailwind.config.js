/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        musify: {
          primary: "#f43f5e",
          hover: "#e11d48",
          light: "#fb7185",
          dark: "#be123c",
          black: "#0d0811",
          card: "#17101a",
          cardhover: "#261a2b",
          subtext: "#b3b3b3",
          border: "rgba(255, 255, 255, 0.08)",
        },
        spotify: {
          green: "#f43f5e",
          lightgreen: "#fb7185",
          darkgreen: "#be123c",
          black: "#0d0811",
          dark: "#08050c",
          card: "#17101a",
          cardhover: "#261a2b",
          subtext: "#b3b3b3",
          border: "rgba(255, 255, 255, 0.08)",
        },
      },
      backgroundImage: {
        "musify-gradient":
          "radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.22) 0%, rgba(13, 8, 17, 0) 70%), linear-gradient(180deg, #110915 0%, #08050c 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-glow": "0 0 25px rgba(244, 63, 94, 0.35)",
        "musify-btn": "0 8px 24px rgba(244, 63, 94, 0.45)",
        "spotify-btn": "0 8px 24px rgba(244, 63, 94, 0.45)",
      },
      animation: {
        slideup: "slideup 0.4s ease-in-out",
        slidedown: "slidedown 0.4s ease-in-out",
        fadeIn: "fadeIn 0.3s ease-in-out",
      },
      keyframes: {
        slideup: {
          from: { opacity: 0, transform: "translateY(25%)" },
          to: { opacity: 1, transform: "none" },
        },
        slidedown: {
          from: { opacity: 0, transform: "translateY(-25%)" },
          to: { opacity: 1, transform: "none" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
