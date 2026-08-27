import { Image } from 'expo-image';

/** The Ledger mark — the user-provided logo image, used as-is. */
export function LogoMark({ size = 56 }: { size?: number }) {
  return (
    <Image
      source={require('@/assets/images/logo.jpeg')}
      style={{ width: size, height: size, borderRadius: size * 0.29 }}
      contentFit="cover"
    />
  );
}
