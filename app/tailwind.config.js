/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      boxShadow: {
        even: "0 0 20px 1px rgba(0, 0, 0, 0.5)", // Custom evenly distributed shadow
      },
      colors: {
        main: {
          1: "#ECECEC",
          2: "#515151",
          3: "#d4d4d4",
        },
        blues: {
          2: "#eafafe",
          3: "#0fcefe",
          4: "#009cc3",
        },
      },
    },
  },
  plugins: [],
};
