import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

interface IconProps {
  color?: string;
  size?: number;
}

const DEFAULT_COLOR = '#6b5a42';

function base(color = DEFAULT_COLOR, size = 20) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

export function IcoDashboard({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Rect x={3} y={3} width={7} height={7} rx={1.5} />
      <Rect x={14} y={3} width={7} height={7} rx={1.5} />
      <Rect x={3} y={14} width={7} height={7} rx={1.5} />
      <Rect x={14} y={14} width={7} height={7} rx={1.5} />
    </Svg>
  );
}

export function IcoClients({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Circle cx={9} cy={7} r={3.5} />
      <Path d="M2 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
      <Path d="M19 11.5a3 3 0 0 0 0-5M22 20c0-2.8-2-4.8-4-5.5" />
    </Svg>
  );
}

export function IcoInvoices({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Polyline points="14 2 14 8 20 8" />
      <Line x1={8} y1={13} x2={16} y2={13} />
      <Line x1={8} y1={17} x2={13} y2={17} />
    </Svg>
  );
}

export function IcoProjects({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </Svg>
  );
}

export function IcoSettings({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}

export function IcoBell({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  );
}

export function IcoSearch({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Circle cx={11} cy={11} r={7} />
      <Line x1={21} y1={21} x2={16.65} y2={16.65} />
    </Svg>
  );
}

export function IcoFilter({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Line x1={4} y1={6} x2={20} y2={6} />
      <Line x1={8} y1={12} x2={16} y2={12} />
      <Line x1={11} y1={18} x2={13} y2={18} />
    </Svg>
  );
}

export function IcoChevronRight({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Polyline points="9 18 15 12 9 6" />
    </Svg>
  );
}

export function IcoChevronLeft({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

export function IcoPlus({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Line x1={12} y1={5} x2={12} y2={19} />
      <Line x1={5} y1={12} x2={19} y2={12} />
    </Svg>
  );
}

export function IcoCheck({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

export function IcoMail({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <Polyline points="22,6 12,13 2,6" />
    </Svg>
  );
}

export function IcoLink({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  );
}

export function IcoSend({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Line x1={22} y1={2} x2={11} y2={13} />
      <Polygon points="22 2 15 22 11 13 2 9 22 2" />
    </Svg>
  );
}

export function IcoUser({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx={12} cy={7} r={4} />
    </Svg>
  );
}

export function IcoCreditCard({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Rect x={1} y={4} width={22} height={16} rx={2} ry={2} />
      <Line x1={1} y1={10} x2={23} y2={10} />
    </Svg>
  );
}

export function IcoMoreHoriz({ color, size }: IconProps) {
  const fill = color ?? DEFAULT_COLOR;
  return (
    <Svg {...base(color, size)}>
      <Circle cx={5} cy={12} r={1} fill={fill} />
      <Circle cx={12} cy={12} r={1} fill={fill} />
      <Circle cx={19} cy={12} r={1} fill={fill} />
    </Svg>
  );
}

export function IcoClip({ color, size }: IconProps) {
  return (
    <Svg {...base(color, size)}>
      <Path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </Svg>
  );
}
