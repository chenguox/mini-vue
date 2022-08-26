import commonjs from "@rollup/plugin-commonjs"

export default {
  // 入口
  input: "./src/main.js",
  output: {
    format: "umd",
    name: 'vue-utils',
    file: "dist/vue-utils.js"
  },
  plugins: []
}