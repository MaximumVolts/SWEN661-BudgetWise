import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import type { CashFlowChartData } from '../models/cashFlow';
import type { SpendChartData } from '../models/dashboard';
import type { BarDatum } from '../models/spending';
import { useDisplay } from '../state/PreferencesContext';
import { Fmt } from './format';

/** Measures its width so a chart can draw to it. */
function useWidth() {
  const [width, setWidth] = useState(0);
  return { width, onLayout: (e: { nativeEvent: { layout: { width: number } } }) => setWidth(e.nativeEvent.layout.width) };
}

type Pt = { x: number; y: number };
const pathOf = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

/** Area + line chart for "spend so far", with a dashed projection and the previous period. */
export function SpendAreaChart({ data, height = 150 }: { data: SpendChartData; height?: number }) {
  const { colors: c, colorblind } = useDisplay();
  const { width, onLayout } = useWidth();
  const parts = ['Spending trend chart.'];
  if (data.actual.length) parts.push(`Spent so far ${Fmt.money(data.actual.at(-1)!, 0)}.`);
  if (data.projected.length) parts.push(`Projected to reach ${Fmt.money(data.projected.at(-1)!, 0)}.`);
  if (data.previous.length) parts.push(`Previous period ended at ${Fmt.money(data.previous.at(-1)!, 0)}.`);

  const all = [...data.actual, ...data.projected, ...data.previous];
  const maxY = all.length ? Math.max(...all) : 0;
  const slots = Math.max(data.previous.length, data.actual.length + data.projected.length);
  const drawable = width > 0 && data.actual.length > 0 && maxY > 0 && slots >= 2;
  const pad = 6;
  const pt = (i: number, v: number): Pt => ({ x: (i / (slots - 1)) * width, y: pad + (height - 2 * pad) * (1 - v / maxY) });

  let content = null;
  if (drawable) {
    const actual = data.actual.map((v, i) => pt(i, v));
    const last = actual.at(-1)!;
    const area = `${pathOf([{ x: actual[0].x, y: height }, ...actual, { x: last.x, y: height }])} Z`;
    const projected = [last, ...data.projected.map((v, i) => pt(data.actual.length + i, v))];
    content = (
      <>
        {data.previous.length > 1 && (
          <Path
            d={pathOf(data.previous.map((v, i) => pt(i, v)))}
            stroke={c.previous}
            strokeWidth={2}
            fill="none"
            strokeDasharray={colorblind ? '2,3' : undefined}
          />
        )}
        <Path d={area} fill={c.lime} />
        <Path d={pathOf(actual)} stroke={c.ink} strokeWidth={2} fill="none" strokeLinejoin="round" />
        {projected.length > 1 && <Path d={pathOf(projected)} stroke={c.muted} strokeWidth={2} fill="none" strokeDasharray="6,4" />}
        <Circle cx={last.x} cy={last.y} r={5} fill={c.ink} />
      </>
    );
  }
  return (
    <View onLayout={onLayout} accessible accessibilityRole="image" accessibilityLabel={parts.join(' ')} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          {content}
        </Svg>
      )}
    </View>
  );
}

/** Bar chart; bar heights scale to the max value. Each bar is its own accessible element. */
export function BarChart({
  bars,
  highlighted,
  onBarPress,
  height = 120,
}: {
  bars: BarDatum[];
  highlighted?: number;
  onBarPress?: (i: number) => void;
  height?: number;
}) {
  const { colors: c, colorblind } = useDisplay();
  if (!bars.length) return <View style={{ height }} />;
  const maxV = Math.max(...bars.map((b) => b.value));
  return (
    <View>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end' }}>
        {bars.map((b, i) => {
          const selected = i === highlighted;
          const h = maxV <= 0 ? 2 : Math.min(height, Math.max(2, (height * b.value) / maxV));
          return (
            <Pressable
              key={i}
              accessibilityRole={onBarPress ? 'button' : undefined}
              accessibilityState={{ selected }}
              accessibilityLabel={`${b.semanticLabel ?? (b.label || `Bar ${i + 1}`)}: ${Fmt.money(b.value)}`}
              onPress={onBarPress ? () => onBarPress(i) : undefined}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height }}
            >
              <View
                style={{
                  width: '70%',
                  height: h,
                  overflow: 'hidden',
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 6,
                  backgroundColor: selected ? c.lime : c.chip,
                  borderWidth: selected ? 1.5 : 1,
                  borderColor: selected ? c.olive : c.outline,
                }}
              >
                {/* Colorblind mode: the selected bar is hatched, not only a different color. */}
                {selected && colorblind && (
                  <Svg width="100%" height={h}>
                    {Array.from({ length: 30 }, (_, k) => -h + k * 6).map((x) => (
                      <Line key={x} x1={x} y1={h} x2={x + h} y2={0} stroke={c.olive} strokeWidth={1.5} />
                    ))}
                  </Svg>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 10 }} importantForAccessibility="no-hide-descendants">
        {bars.map((b, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: c.muted }}>
            {b.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const LEFT_GUTTER = 34;

/** Line chart for projected cash with dashed gridlines and low-point / end-point labels. */
export function CashFlowChart({ data, height = 170 }: { data: CashFlowChartData; height?: number }) {
  const { colors: c } = useDisplay();
  const { width, onLayout } = useWidth();
  const v = data.values;
  const summary = v.length
    ? `Projected cash chart. Starts at ${Fmt.money(v[0])}, lowest ${Fmt.money(Math.min(...v))}, ends at ${Fmt.money(v.at(-1)!)}.`
    : 'Projected cash chart with no data.';

  let content = null;
  if (width > 0 && v.length >= 2) {
    const all = [...v, ...data.gridValues];
    let minY = Math.min(...all);
    let maxY = Math.max(...all);
    if (maxY === minY) maxY = minY + 1;
    const span = maxY - minY;
    minY -= span * 0.1;
    maxY += span * 0.1;
    const w = width - LEFT_GUTTER;
    const y = (val: number) => height * (1 - (val - minY) / (maxY - minY));
    const pts = v.map((val, i) => ({ x: LEFT_GUTTER + (w * i) / (v.length - 1), y: y(val) }));
    const low = data.lowIndex !== undefined && data.lowIndex >= 0 && data.lowIndex < pts.length ? pts[data.lowIndex] : undefined;
    const last = pts.at(-1)!;
    content = (
      <>
        {data.gridValues.map((g) => (
          <Line key={`g${g}`} x1={LEFT_GUTTER} x2={width} y1={y(g)} y2={y(g)} stroke={c.line} strokeWidth={1} strokeDasharray="5,4" />
        ))}
        {data.gridValues.map((g) => (
          <SvgText key={`t${g}`} x={0} y={y(g) + 4} fontSize={11} fill={c.muted}>
            {Fmt.compact(g)}
          </SvgText>
        ))}
        <Path d={pathOf(pts)} stroke={c.ink} strokeWidth={2} fill="none" strokeLinejoin="round" />
        {low && <Circle cx={low.x} cy={low.y} r={5} fill="#FFFFFF" stroke={c.ink} strokeWidth={2} />}
        {low && data.lowLabel && (
          <SvgText x={low.x - 6} y={Math.min(height - 2, low.y + 20)} fontSize={11} fill={c.ink}>
            {data.lowLabel}
          </SvgText>
        )}
        <Circle cx={last.x} cy={last.y} r={5} fill={c.ink} />
        {data.endLabel && (
          <SvgText x={last.x - 10} y={Math.max(12, last.y - 10)} fontSize={11} fill={c.ink} textAnchor="end">
            {data.endLabel}
          </SvgText>
        )}
      </>
    );
  }
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={summary}>
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {content}
          </Svg>
        )}
      </View>
      {data.xLabels.length > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginLeft: LEFT_GUTTER }}>
          {data.xLabels.map((l, i) => (
            <Text key={i} style={{ fontSize: 11, color: c.muted }}>
              {l}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
