import globals from "globals";
import pluginJs from "@eslint/js";
import airbnbBase from "eslint-config-airbnb-base";
import importPlugin from "eslint-plugin-import";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node, // Mengaktifkan variabel global dari Node.js seperti `process`
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      ...airbnbBase.rules, // Memakai Airbnb style
    },
  },
  pluginJs.configs.recommended
];
