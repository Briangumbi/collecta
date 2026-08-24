import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

/**
 * Very low-opacity tiled-feeling grain over a screen's background — what
 * separates "flat digital" from "textured/tactile." `resizeMode: 'repeat'`
 * isn't reliable across platforms, so this uses a single large noise source
 * stretched to cover instead; imperceptible at this opacity.
 */
export function NoiseOverlay() {
  return (
    <Image source={require('@/assets/images/noise.png')} style={styles.fill} contentFit="cover" pointerEvents="none" />
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.035,
  },
});
