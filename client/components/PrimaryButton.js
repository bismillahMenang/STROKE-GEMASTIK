import { Pressable, Text } from 'react-native';
import styles from './exerciseSessionStyles';

export default function PrimaryButton({ label, onPress, disabled, colors }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: disabled ? '#C8C6BE' : colors.accent },
        !disabled && pressed && { transform: [{ scale: 0.975 }] },
      ]}
    >
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}
