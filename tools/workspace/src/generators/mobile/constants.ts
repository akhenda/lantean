/**
 * Name of the library
 */
export const libName = 'mobile';

/**
 * Common tags for the library
 */
export const commonTags = ['mobile'];

/**
 * Common Design System tags for the library
 */
export const commonDSTags = [...commonTags, 'design', 'ds', 'design-system'];

/**
 * UI tags for the library
 */
export const uiTags = [...commonDSTags, 'ui', 'ui-library'];

/**
 * Utils tags for the library
 */
export const utilsTags = [...commonDSTags, 'utils', 'utils-library'];

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
};

/**
 * Dependencies to be installed
 */
export const dependencies = {
  '@react-native-async-storage/async-storage': '^2.0.0',
  'class-variance-authority': '^0.7.0',
  clsx: '^2.1.1',
  'lucide-react-native': '^0.447.0',
  'prettier-plugin-tailwindcss': '^0.6.6',
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
