import { ReactNode } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NAV_THEME } from '../../<%= folderNames.designLib %>/constants';
import { useColorScheme } from '../../<%= folderNames.designLib %>/hooks';

const DARK_THEME: Theme = { dark: true, colors: NAV_THEME.dark };
const LIGHT_THEME: Theme = { dark: false, colors: NAV_THEME.light };

export default function Providers({ children }: { children: ReactNode }) {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          {children}
        </BottomSheetModalProvider>
        <PortalHost />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
