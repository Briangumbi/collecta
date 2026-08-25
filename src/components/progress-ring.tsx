import Svg, { Circle } from 'react-native-svg';

/** Circular progress indicator — stroke-dasharray trick, rotated so 0% starts at 12 o'clock. */
export function ProgressRing({
  pct,
  color,
  size = 64,
  trackColor = 'rgba(255,255,255,0.06)',
  strokeWidth = 5,
}: {
  pct: number;
  color: string;
  size?: number;
  trackColor?: string;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * circumference;

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
      />
    </Svg>
  );
}
