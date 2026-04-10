/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
    "./global.css", // Add this line
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        babyshopSky: "#29beb3",
        babyshopBlack: "#000000",
        babyshopWhite: "#ffffff",
        babyShopLightWhite: "#ededed",
        babyshopRed: "#ec2b04",
        babyshopTextLight: "#999999",
        babyshopPurple: "#a96bde",
        babyshopLightBg: "#f8f8f8",
      },
    },
  },
  plugins: [],
}