import globals from "globals";
import pluginJs from "@eslint/js";

export default [
    {
        files: ["renaissance/**/*.{js,mjs,cjs}"],
        languageOptions: {
            ecmaVersion: "latest",
            globals: {
                ...globals.browser,
                MathJax: "readonly",
            },
        },
        rules: {
            ...pluginJs.configs.recommended.rules,
        },
    },
];
