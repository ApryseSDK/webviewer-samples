module.exports = {
  "extends": [
    "airbnb-base", 
    "plugin:@typescript-eslint/recommended",
  ],
  "parser": "@typescript-eslint/parser",
  "rules": {
    "array-callback-return": "error",
    "object-curly-spacing": ["error", "always"],
    "curly": ["error", "all"],
    "brace-style": ["error", "1tbs"],
    "space-before-blocks": "error",
    "space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always"
    }],
    "keyword-spacing": ["error", { "before": true, "after": true }],
    "no-undef": "error",
    "no-trailing-spaces": "error",
    "semi": "error",
    "arrow-parens": ["error", "always"],
    "arrow-body-style": 0,
    "array-bracket-spacing": "error",
    "quotes": ["error", "single", { "avoidEscape": true }],
    "prefer-template": "error",
    "no-tabs": "error",
    "import/no-duplicates": "error",
    "no-unused-vars": "error",
    "no-unused-expressions": 0,
    "no-useless-rename": 0,
    "no-await-in-loop": 0,
    "no-lonely-if": 0,
    "guard-for-in": 0,
    "function-paren-newline": 0,
    "indent": ["error", 2, { "SwitchCase": 1 }],
    "no-case-declarations": 0,
    "no-restricted-syntax": 0,
    "no-new": 0,
    "symbol-description": 0,
    "comma-dangle": 0,
    "no-empty": [2, { "allowEmptyCatch":  true }],
    "lines-between-class-members": 0,
    "no-fallthrough": 0,
    "func-names": 0,
    "operator-linebreak": 0,
    "no-var": 2,
    "quote-props": 0,
    "prefer-arrow-callback": 0, // would like to remove this rule https://eslint.org/docs/rules/prefer-arrow-callback#require-using-arrow-functions-for-callbacks-prefer-arrow-callback
    "dot-notation": 0,
    "class-methods-use-this": 0,
    "object-curly-newline": 0,
    "vars-on-top": 0,
    "prefer-destructuring": 0,
    "eol-last": 0,
    "max-len": 0,
    "prefer-rest-params": 0, // would like to remove this rule https://eslint.org/docs/rules/prefer-rest-params#suggest-using-the-rest-parameters-instead-of-arguments-prefer-rest-params
    "no-underscore-dangle": 0,
    "object-shorthand": 0, // would like to remove this rule https://eslint.org/docs/rules/object-shorthand#require-object-literal-shorthand-syntax-object-shorthand
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-param-reassign": 0,
    "no-plusplus": 0,
    "consistent-return": 0,
    "new-cap": 0,
    "linebreak-style": 0,
    "no-throw-literal": 0,
    "no-script-url": 0,
    "no-restricted-globals": 0, // would like to remove this rule https://eslint.org/docs/rules/no-restricted-globals#disallow-specific-global-variables-no-restricted-globals
    "no-multi-assign": 0, // would like to remove this rule https://eslint.org/docs/rules/no-multi-assign#disallow-use-of-chained-assignment-expressions-no-multi-assign
    "no-bitwise": 0,
    "no-prototype-builtins": 0,
    "no-nested-ternary": 0,
    "prefer-promise-reject-errors": 0,
    "prefer-spread": 0, // would like to remove this rule https://eslint.org/docs/rules/prefer-spread#suggest-using-spread-syntax-instead-of-apply-prefer-spread
    "no-mixed-operators": 0,
    "no-cond-assign": 0,
    "no-extend-native": 0, // would be nice to remove, not critical https://eslint.org/docs/rules/no-extend-native#disallow-extending-of-native-objects-no-extend-native
    "no-restricted-properties": 0,
    "no-proto": 0, // would like to remove this rule https://eslint.org/docs/rules/no-proto#disallow-use-of-__proto__-no-proto
    "no-continue": 0,
    "default-case": 0,
    "no-shadow": 0, // would like to eventually remove this but its super hard right now https://eslint.org/docs/rules/no-shadow#disallow-variable-declarations-from-shadowing-variables-declared-in-the-outer-scope-no-shadow
    "no-useless-escape": 0,
    "wrap-iife": 0,
    "import/no-cycle": 0,
    "import/order": 0,
    "import/named": 0,
    "import/no-named-as-default": 0,
    "import/prefer-default-export": 0,
    "import/no-extraneous-dependencies": 0,
    "import/no-unresolved": 0,
    "import/no-webpack-loader-syntax": 0,
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "ts": "never"
      }
    ],
    "@typescript-eslint/no-useless-constructor": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-this-alias": "off",
    "@typescript-eslint/no-empty-function": "off",
    "import/extensions": "off",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/class-name-casing": "off",
    "@typescript-eslint/no-useless-constructor": "off"
  },
  "overrides": [
    {
        "files": "**/*.ts",
        "rules": {
          "no-useless-constructor": "off",
        }
    }
  ],
  "env": {
    "browser": true,
    "jquery": true,
    "mocha": true,
    "es6": true,
    "node": true,
  },
  "plugins": ["typescript", "import"],
  "globals": {
    "getPageHeight": true,
    "debounceJS": true,
  },
  "settings": {
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true
      }
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    }
  }
}
