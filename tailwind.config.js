/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./source/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
