/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      boxShadow: {
        even: "0 0 20px 1px rgba(0, 0, 0, 0.5)", // Custom evenly distributed shadow
      },
      colors: {
        background: {
          1: "#FAFAFA",
          2: "#ECECEC",
        },

        main: {
          1: "#FAFAFA",
          2: "#515151",
          3: "#d4d4d4",
          4: "#6e6e6e",
        },
        blues: {
          1: "#E7EEF9",
          2: "#5788d6",
          3: "#6F99DC",
          4: "#224A8A",
          5: "#CFDDF3",
        },
        priority: {
          1: "#B7EF6C",
          2: "#F5EFA1",
          3: "#EFB96C",
          4: "#EF6C6C",
          5: "#609C11",
          6: "#69630B",
          7: "#86540F",
          8: "#6F0C0C",
        },
        type: {
          1: "#58D68C",
          2: "#58C9D6",
          3: "#6858D6",
          4: "#BF58D6",
          5: "#155730",
          6: "#196068",
          7: "#2A1D79",
          8: "#77228A",
        },
      },
    },
  },
  plugins: [],
};
