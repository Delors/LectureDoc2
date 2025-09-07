import globals from "globals";
import pluginJs from "@eslint/js";
import html from "eslint-plugin-html";

export default [
    {
        files: ["renaissance/**/*.{js,mjs,html}"],
        plugins: { html },
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
