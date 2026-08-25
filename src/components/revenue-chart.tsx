import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const CHART_HEIGHT = 110;
const PADDING_TOP = 8;
const PADDING_BOTTOM = 4;

/** Smooth line through a set of points, via quadratic curves through each pair's midpoint. */
function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  d += ` Q ${secondLast.x} ${secondLast.y} ${last.x} ${last.y}`;
  return d;
}

export function RevenueChart({ data }: { data: { month: string; total: number }[] }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const max = Math.max(...data.map((d) => d.total), 1);
  const points = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * width : width / 2,
    y: PADDING_TOP + (1 - d.total / max) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM),
  }));

  const linePath = smoothPath(points);
  const areaPath = linePath ? `${linePath} L ${width} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z` : '';

  return (
    <View>
      <View onLayout={onLayout} style={{ height: CHART_HEIGHT }}>
        {width > 0 && linePath ? (
          <Svg width={width} height={CHART_HEIGHT}>
            <Defs>
              <LinearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={theme.primary} stopOpacity={0.3} />
                <Stop offset="100%" stopColor={theme.primary} stopOpacity={0.01} />
              </LinearGradient>
            </Defs>
            <Path d={areaPath} fill="url(#revenueFill)" stroke="none" />
            <Path d={linePath} fill="none" stroke={theme.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ) : null}
      </View>
      <View style={[styles.labels, { width }]}>
        {data.map((d, i) => (
          <ThemedText key={`${d.month}-${i}`} type="code" themeColor="textSecondary">
            {d.month}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
