/**
 * Name of the library
 */
export const libName = 'universal';

/**
 * Common tags for the library
 */
export const commonTags = ['universal'] as const;

/**
 * Common Design System tags for the library
 */
export const commonDSTags = [...commonTags, 'design', 'ds', 'design-system'] as const;

/**
 * UI tags for the library
 */
export const uiTags = [...commonDSTags, 'ui', 'ui-library'] as const;

/**
 * Utils tags for the library
 */
export const libTags = [...commonDSTags, 'ds-lib'] as const;

/**
 * Folder names
 */
export const folderNames = {
  core: 'core',
  design: 'design',
  features: 'features',
} as const;

/**
 * Dependencies to be installed
 */
export const dependencies = {
  '@expo/next-adapter': '^6.0.0',
  '@gorhom/bottom-sheet': '^5.0.5',
  '@react-native-async-storage/async-storage': '^2.0.0',
  '@react-navigation/material-top-tabs': '^6.6.14',
  '@react-navigation/native': '^6.1.18',
  '@rn-primitives/portal': '^1.0.4',
  '@sentry/types': '^8.37.1',
  '@tanstack/react-query': '^5.59.19',
  '@tanstack/react-query-persist-client': '^5.59.19',
  '@testing-library/react-native': '^12.8.1',
  apisauce: '^3.1.0',
  axios: '^1.7.7',
  'class-variance-authority': '^0.7.0',
  clsx: '^2.1.1',
  'expo-application': '^5.9.1',
  'expo-constants': '^16.0.2',
  'expo-device': '^6.0.2',
  'expo-image': '^1.13.0',
  'expo-linking': '^6.3.1',
  'expo-localization': '^15.0.3',
  'expo-navigation-bar': '^3.0.7',
  'expo-network': '^6.0.1',
  'expo-router': '^3.5.23',
  'expo-splash-screen': '^0.27.6',
  'expo-status-bar': '^1.12.1',
  'expo-updates': '^0.25.27',
  i18next: '^23.16.4',
  'lucide-react-native': '^0.447.0',
  nativewind: '4.1.20',
  'next-themes': '^0.3.0',
  'react-error-boundary': '^4.1.2',
  'react-i18next': '^15.1.0',
  'react-native-flagsmith': '^7.0.2',
  'react-native-gesture-handler': '^2.20.2',
  'react-native-keyboard-controller': '^1.14.3',
  'react-native-mmkv': '^3.1.0',
  'react-native-onesignal': '^5.2.6',
  'react-native-pager-view': '6.3.0',
  'react-native-purchases': '^8.2.5',
  'react-native-reanimated': '3.10.1',
  'react-native-safe-area-context': '^4.14.0',
  'react-native-screens': '^3.34.0',
  'react-native-svg': '^15.7.1',
  'react-native-toast-message': '^2.2.1',
  'sp-react-native-in-app-updates': '^1.4.0',
  'tailwind-merge': '^2.5.2',
  'tailwindcss-animate': '^1.0.7',
  'usehooks-ts': '^3.1.0',
  zustand: '^4.5.5',
} as const;

/**
 * Dev Dependencies to be installed
 */
export const devDependencies = {
  tailwindcss: '^3.4.11',
  prettier: '^3.3.3',
  'prettier-plugin-tailwindcss': '^0.6.6',
} as const;

/**
 * VSCode extensions to be installed
 */
export const vscodeExtensions = ['bradlc.vscode-tailwindcss'] as const;

/**
 * RN Packages to be transpiled in Next.js
 */
export const transpilePackages = [
  // internal lib
  // e.g. '@lantean/universal/design/ui-kit',

  // core
  'react-native',
  'react-native-web',
  'expo',
  'react-native-css-interop',

  // others
  'nativewind',
  'react-native-reanimated',
  '@expo/html-elements',
  '@expo/metro-config',
  '@expo/metro-runtime',
  '@react-native-async-storage/async-storage',
  '@react-native-masked-view/masked-view',
  '@react-navigation/native',
  'expo-constants',
  'expo-linking',
  'expo-navigation-bar',
  'expo-router',
  'expo-splash-screen',
  'expo-status-bar',
  'lucide-react-native',
  'react-native-safe-area-context',
  'react-native-screens',
  'react-native-svg',
  'react-native-svg-transformer',

  // rn-primitives
  '@rn-primitives/accordion',
  '@rn-primitives/alert-dialog',
  '@rn-primitives/aspect-ratio',
  '@rn-primitives/avatar',
  '@rn-primitives/checkbox',
  '@rn-primitives/collapsible',
  '@rn-primitives/context-menu',
  '@rn-primitives/dialog',
  '@rn-primitives/dropdown-menu',
  '@rn-primitives/hover-card',
  '@rn-primitives/label',
  '@rn-primitives/menubar',
  '@rn-primitives/navigation-menu',
  '@rn-primitives/popover',
  '@rn-primitives/portal',
  '@rn-primitives/progress',
  '@rn-primitives/radio-group',
  '@rn-primitives/select',
  '@rn-primitives/separator',
  '@rn-primitives/slider',
  '@rn-primitives/slot',
  '@rn-primitives/switch',
  '@rn-primitives/table',
  '@rn-primitives/tabs',
  '@rn-primitives/toast',
  '@rn-primitives/toggle',
  '@rn-primitives/toggle-group',
  '@rn-primitives/toolbar',
  '@rn-primitives/tooltip',
  '@rn-primitives/types',
] as const;

/**
 * Next.js with Expo config
 */
export const nextWithExpoConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages,
  experimental: { forceSwcTransforms: true },
} as const;
