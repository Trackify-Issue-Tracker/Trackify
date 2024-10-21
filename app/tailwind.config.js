/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        main: {
          1: "#ECECEC",
          2: "#414141",
        },
        blues: {
          2: "#eafafe",
          3: "#0fcefe",
        },
      },
    },
  },
  plugins: [],
};
