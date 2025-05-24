// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // 1️⃣ Allow Metro to load CJS files
  config.resolver.sourceExts.push('cjs');

  // 2️⃣ Disable Node.js "exports" resolution so deep imports work
  config.resolver.unstable_enablePackageExports = false;

  return config;
})();