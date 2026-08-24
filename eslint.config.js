// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // These react-hooks "compiler readiness" rules assume every effect is
    // pure derivation of render state. That doesn't hold for two patterns
    // this app relies on throughout: fetch-on-mount effects (dashboard,
    // invoices, clients, projects all sync a Supabase query + sqlite cache
    // into state on mount) and Reanimated, where mutating a shared value's
    // `.value` from an effect is the library's documented API, not React
    // state. Both trip these rules as false positives.
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
]);
