import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  { ignores: ['**/node_modules/', '**/.git/', '**/app/lib/*'] },
  { files: ['**/*.{js,mjs}'] },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    'rules': {
      'quotes': [
        2,
        'single',
        {
          'allowTemplateLiterals': true
        }
      ],
      'curly': 2,
      'strict': [2, 'never'],
      'semi': [2, 'always'],
      'no-redeclare': [
        2,
        {
          'builtinGlobals': true
        }
      ],
      'brace-style': 2,
      'no-alert': 0,
      'no-console': [
        0,
        {
          'allow': ['warn', 'error']
        }
      ],
      'object-shorthand': [2, 'always'],
      'arrow-parens': [2, 'as-needed'],
      'no-useless-escape': 0,
      'eqeqeq': 2,
      'jsx-quotes': 2,
      'indent': [
        2,
        2,
        {
          'MemberExpression': 1,
          'ArrayExpression': 1,
          'ImportDeclaration': 1,
          'SwitchCase': 1,
          'FunctionExpression': {
            'body': 1
          }
        }
      ],
      'keyword-spacing': 2,
      'space-before-blocks': 2,
      'arrow-spacing': 2,
      'object-curly-spacing': [2, 'always'],
      '@pdftron/webviewer/no-string-events': 0,

      // these are inherited from git WebViewer's eslint configuration
      'no-use-before-define': 0,
      'implicit-arrow-linebreak': 0,
      'operator-linebreak': 0,
      'function-paren-newline': 0,
      'object-curly-newline': 0,
      'no-nested-ternary': 0,
      'no-unexpected-multiline': 0,
      'no-unused-expressions': 0
    }
  }
];