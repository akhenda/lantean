/**
 * Name of the library
 */
export const libName = 'mobile';

/**
 * Common tags for the library
 */
export const commonTags = ['mobile'] as const;

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
  design: 'design',
  features: 'features',
  hooks: 'hooks',
  providers: 'providers',
  stores: 'stores',
  utils: 'utils',
} as const;

/**
 * Dependencies to be installed
 */
export const dependencies = {
  '@react-native-async-storage/async-storage': '^2.0.0',
  '@react-navigation/native': '^6.1.18',
  '@rn-primitives/portal': '^1.0.4',
  'class-variance-authority': '^0.7.0',
  clsx: '^2.1.1',
  'expo-navigation-bar': '^3.0.7',
  'expo-router': '^3.5.23',
  'expo-status-bar': '^1.12.1',
  'lucide-react-native': '^0.447.0',
  'nativewind': '^4.1.10',
  'prettier-plugin-tailwindcss': '^0.6.6',
  'react-native-reanimated': '^3.15.4',
  'react-native-svg': '^15.7.1',
  'tailwindcss-animate': '^1.0.7',
  'tailwind-merge': '^2.5.2',
  'usehooks-ts': '^3.1.0',
  zustand: '^4.5.5',
} as const;

/**
 * Dev Dependencies to be installed
 */
export const devDependencies = {
  tailwindcss: '^3.4.11',
  prettier: '^3.3.3',
} as const;

/**
 * VSCode extensions to be installed
 */
export const vscodeExtensions = [
  'bradlc.vscode-tailwindcss',
] as const;
