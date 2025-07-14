import { Platform, Alert } from 'react-native';

export const showAlert = (title: string, message: string, buttons?: Array<{
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}>) => {
  if (Platform.OS === 'web') {
    // On web, use native confirm/alert
    if (buttons && buttons.length > 1) {
      const confirmMessage = `${title}\n\n${message}`;
      if (window.confirm(confirmMessage)) {
        const confirmButton = buttons.find(b => b.style === 'destructive' || b.text.toLowerCase().includes('ok') || b.text.toLowerCase().includes('yes'));
        if (confirmButton && confirmButton.onPress) {
          confirmButton.onPress();
        }
      } else {
        const cancelButton = buttons.find(b => b.style === 'cancel');
        if (cancelButton && cancelButton.onPress) {
          cancelButton.onPress();
        }
      }
    } else {
      window.alert(`${title}\n\n${message}`);
      if (buttons && buttons[0] && buttons[0].onPress) {
        buttons[0].onPress();
      }
    }
  } else {
    // On mobile, use React Native Alert
    Alert.alert(title, message, buttons);
  }
};

export const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
  if (Platform.OS === 'web') {
    const confirmMessage = `${title}\n\n${message}`;
    if (window.confirm(confirmMessage)) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'OK',
          style: 'default',
          onPress: onConfirm,
        },
      ]
    );
  }
};

export const isWeb = Platform.OS === 'web';
export const isMobile = Platform.OS !== 'web';