const base = require("@mendix/pluggable-widgets-tools/configs/eslint.ts.base.json");

module.exports = {
    ...base,
    ignorePatterns: ["dev/**", "dist/**", "node_modules/**", "*.config.js", "*.config.ts"]
};
