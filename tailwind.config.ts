import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#2040e8",
        "pot-purple": "#c084fc",
        "pot-purple-dim": "rgba(192,132,252,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
