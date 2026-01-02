// ESLint configuration for Next.js
// Note: The circular structure warning is a known Next.js/ESLint issue
// and doesn't affect build functionality
module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  ignorePatterns: ['node_modules/', '.next/', 'out/'],
};
