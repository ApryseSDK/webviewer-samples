import globals from 'globals';
import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/essential'],
  {
    ignores: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/public/webviewer/**',
      '**/public/lib/webviewer/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,ts,vue}'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@stylistic/js': stylisticJs,
    },
    rules: {
      '@stylistic/js/indent': ['error', 2, { SwitchCase: 1 }], // Tab indentation (size of 2 spaces)
      '@stylistic/js/quotes': [
        'error',
        'single',
        { allowTemplateLiterals: true },
      ], // `'` instead of `"`
      curly: 'error', // Curly braces for block statements
      '@stylistic/js/brace-style': 'error', // 1TBS brace style
      '@stylistic/js/semi': ['error', 'always'], // Semicolon at the end of each statement
      'object-shorthand': ['error', 'always'], // Object shorthand for ES6
      '@stylistic/js/arrow-parens': ['error', 'always'], // Parenthesis around arrow function argument

      // Minimum line breaks
      '@stylistic/js/keyword-spacing': 'error',
      '@stylistic/js/no-multiple-empty-lines': 'error',

      strict: ['error', 'never'], // No `use strict`

      '@stylistic/js/eol-last': 'error', // files end with a newline (LF)
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
