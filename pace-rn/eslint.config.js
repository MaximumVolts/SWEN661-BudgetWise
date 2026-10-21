// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
// Static security analysis (eval, unsafe regexes, non-literal requires, timing attacks…).
const security = require("eslint-plugin-security");

/** Import paths inside any of [layers] (folders under src/), however deep the importing file is. */
const layer = (...layers) => layers.map((l) => `**/${l}/**`);

/**
 * MVCS + repository layering. Each layer may only import from the layers below it:
 *   routes       → views (Expo Router's file-based routes: read URL params, render a View)
 *   views        → controllers + screens (connect a controller to its screen)
 *   screens / ui → models, ui, display state, controller *types*
 *   controllers  → services (through ServicesContext), navigation, models
 *   services     → repository *interfaces*, models
 *   repositories → models
 * Type-only imports are allowed where noted, so a view can name its controller's type.
 */
const restrict = (files, patterns) => ({
  files,
  rules: {
    '@typescript-eslint/no-restricted-imports': ['error', { patterns }],
  },
});

module.exports = defineConfig([
  expoConfig,
  security.configs.recommended,
  {
    ignores: ["dist/*", "coverage/*"],
  },
  {
    rules: {
      // Flags every obj[key]. Keys here are typed (unions / Records), never raw user input, so it
      // only produces noise; see SECURITY.md.
      'security/detect-object-injection': 'off',
    },
  },
  // Tests read their own fixture and route files from disk; jest.mock factories must use require().
  {
    files: ['__tests__/**', 'jest.setup.tsx'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-non-literal-require': 'off',
    },
  },
  restrict(['src/models/**'], [
    { group: layer('repositories', 'services', 'controllers', 'views', 'ui', 'state', 'navigation', 'routes'), message: 'Models are plain data: they import nothing but other models.' },
    { group: ['react', 'react-native', 'expo-*'], message: 'Models are plain data: they import nothing but other models.' },
  ]),
  restrict(['src/repositories/**'], [
    { group: layer('services', 'controllers', 'views', 'ui', 'state', 'navigation', 'routes'), message: 'Repositories only know models (and their data sources).' },
  ]),
  restrict(['src/services/**'], [
    { group: layer('controllers', 'views', 'ui', 'state', 'navigation', 'routes'), message: 'Services hold business rules and never know about screens.' },
    { group: ['react', 'react-native', 'expo-router'], message: 'Services hold business rules and never know about screens.' },
  ]),
  // Except in the composition root (appServices.ts), services see repositories only as interfaces.
  {
    files: ['src/services/**'],
    ignores: ['src/services/appServices.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': ['error', {
        patterns: [
          { group: layer('controllers', 'views', 'ui', 'state', 'navigation', 'routes'), message: 'Services hold business rules and never know about screens.' },
          { group: ['react', 'react-native', 'expo-router'], message: 'Services hold business rules and never know about screens.' },
          { group: layer('repositories'), allowTypeImports: true, message: 'Services depend on repository interfaces (import type); appServices.ts picks the implementations.' },
        ],
      }],
    },
  },
  restrict(['src/controllers/**'], [
    { group: layer('views'), message: 'Controllers never know about views.' },
    { group: layer('ui'), allowTypeImports: true, message: 'Controllers never render: no UI components.' },
    { group: layer('repositories'), message: 'Controllers talk to services, never to repositories.' },
    { group: layer('services'), allowTypeImports: true, message: 'Business logic belongs in services: call them through useServices(), don\'t import their helpers.' },
    { group: ['react-native'], message: 'Controllers never render: no React Native components.' },
    { group: ['expo-router'], message: 'Navigate through useAppNavigator() (src/navigation), not the router.' },
  ]),
  // Screens (and shared UI) only render: data and actions come from the controller they're given.
  restrict(['src/views/screens/**', 'src/ui/**'], [
    { group: layer('services', 'repositories', 'navigation', 'routes'), message: 'Screens only render: they get data and actions from their controller.' },
    { group: layer('controllers'), allowTypeImports: true, message: 'Screens get their controller as a prop (import type only).' },
    { group: ['**/state/ServicesContext', '**/state/SessionContext'], message: 'Screens only render: services and the session are for controllers.' },
    { group: ['expo-router'], message: 'Screens never navigate: call the controller.' },
  ]),
  // Views connect a controller to its screen, and nothing else.
  restrict(['src/views/*.tsx'], [
    { group: layer('services', 'repositories', 'navigation', 'routes'), message: 'Views only connect a controller to its screen.' },
    { group: ['**/state/ServicesContext', '**/state/SessionContext'], message: 'Views only connect a controller to its screen.' },
    { group: ['expo-router'], message: 'Views get route params as props; reading the URL is the route\'s job.' },
  ]),
  // Routes (Expo Router's file-based routes) read the URL and render a View.
  restrict(['src/views/routes/**'], [
    { group: layer('services', 'repositories', 'controllers', 'screens'), message: 'Routes only read URL params and render a View.' },
  ]),
]);
