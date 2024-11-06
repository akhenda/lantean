import { StyleSheet } from 'react-native';
import type {
  BaseToastProps,
  ToastShowParams,
} from 'react-native-toast-message';
import Toast, {
  BaseToast,
  ErrorToast,
  InfoToast,
} from 'react-native-toast-message';

interface ToasterType extends ToastShowParams {
  type?: 'success' | 'error' | 'info';
}

const fontFamily = {
  light: 'WorkSans-Light',
  regular: 'WorkSans-Regular',
  medium: 'WorkSans-Medium',
  bold: 'WorkSans-Bold',
};

const styles = StyleSheet.create({
  // Global styles
  wrapper: { height: 'auto', width: '90%', paddingVertical: 8 },
  container: {
    paddingHorizontal: 16,
  },
  text1: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  text2: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 17,
  },
  // Scoped styles
  success: {
    borderLeftColor: '#2a9d8f',
  },
  error: {
    borderLeftColor: '#ef233c',
  },
  info: {
    borderLeftColor: '#e9c46a',
  },
});

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      contentContainerStyle={styles.container}
      style={[styles.wrapper, styles.success]}
      text1Style={styles.text1}
      text2NumberOfLines={2}
      text2Style={styles.text2}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      contentContainerStyle={styles.container}
      style={[styles.wrapper, styles.error]}
      text1Style={styles.text1}
      text2NumberOfLines={2}
      text2Style={styles.text2}
    />
  ),
  info: (props: BaseToastProps) => (
    <InfoToast
      {...props}
      contentContainerStyle={styles.container}
      style={[styles.wrapper, styles.info]}
      text1Style={styles.text1}
      text2NumberOfLines={2}
      text2Style={styles.text2}
    />
  ),
};

export const Toaster = {
  show(showParams: ToasterType) {
    Toast.show({
      type: 'error',
      visibilityTime: 5000,
      topOffset: 50,
      ...showParams,
    });
  },

  hide() {
    Toast.hide();
  },
};
