import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocbc: {
          red: "#EC0000",
          redDark: "#C40000",
          redDeep: "#A30000",
          ink: "#1A1A1A",
          slate: "#5B6471",
          mute: "#8A93A0",
          line: "#E7E9ED",
          bg: "#F2F3F5",
          card: "#F4F1EF",
          cream: "#FBEFE9",
          peach: "#FCEBD9",
          green: "#13A05B",
          amber: "#E89A2C",
          blue: "#0A6FB8",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 12px rgba(20, 20, 30, 0.06)",
        float: "0 8px 28px rgba(20, 20, 30, 0.12)",
        nav: "0 -2px 16px rgba(20, 20, 30, 0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
