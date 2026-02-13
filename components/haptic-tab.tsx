import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

// Use a simple Pressable wrapper instead of PlatformPressable to avoid
// platform-specific navigation/button integration issues in production builds.
export function HapticTab(props: BottomTabBarButtonProps) {
  const { children, onPressIn, onPress, onLongPress, accessibilityLabel, testID, style } = props as any;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={(ev) => {
        try {
          // soft haptic feedback when available; guard against runtime failures
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        } catch (e) {
          // ignore
        }
        onPressIn?.(ev);
      }}
      // ensure children (icon + label) are centered and spaced like default tab buttons
      style={[{ alignItems: 'center', justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 12 }, style]}
    >
      {children}
    </Pressable>
  );
}
