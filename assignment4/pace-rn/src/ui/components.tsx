import DateTimePicker from '@react-native-community/datetimepicker';
import { type ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  type GestureResponderEvent,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line, Rect } from 'react-native-svg';
import type { AsyncState } from '../utils/asyncState';
import { BUDGET_STATUS_LABEL, type BudgetStatus } from '../models/budget';
import { useDialogs } from '../state/DialogContext';
import { useDisplay } from '../state/PreferencesContext';
import { DateLabels } from '../utils/dateLabels';
import { Icon, type IconName } from './icons';

// ── Layout ────────────────────────────────────────────────────────────────────

/** A full screen with the app background, inside the safe area. */
export function Screen({ children, edges = ['top', 'bottom'] }: { children: ReactNode; edges?: ('top' | 'bottom')[] }) {
  const { colors: c } = useDisplay();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: c.bg }}>
      {children}
    </SafeAreaView>
  );
}

/** Scrolling content with the usual side padding. */
export function Scroll({ children, padded = true, style }: { children: ReactNode; padded?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[padded && { paddingHorizontal: 20 }, { paddingBottom: 32 }, style]}>
      {children}
    </ScrollView>
  );
}

export const Gap = ({ h = 0, w = 0 }: { h?: number; w?: number }) => <View style={{ height: h, width: w }} />;

/** Top bar: optional back arrow, title, trailing element. */
export function TopBar({ title, onBack, trailing }: { title: string; onBack?: () => void; trailing?: ReactNode }) {
  const { colors: c, type: t } = useDisplay();
  return (
    <View style={styles.topBar}>
      {onBack && (
        <Tap onPress={onBack} label="Back" style={{ marginRight: 8, marginLeft: -12 }}>
          <Icon name="arrow-back" size={26} color={c.ink} />
        </Tap>
      )}
      <Heading style={[t.appBar, { fontSize: onBack ? 20 : 24, flex: 1 }]}>{title}</Heading>
      {trailing}
    </View>
  );
}

/** Text marked as a heading for screen readers. */
export function Heading({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text accessibilityRole="header" style={style}>
      {children}
    </Text>
  );
}

/** Uppercase small section header, optional olive action on the right. */
export function SectionHeader({ title, action, onAction, big }: { title: string; action?: string; onAction?: () => void; big?: boolean }) {
  const { type: t } = useDisplay();
  return (
    <View style={styles.sectionHeader}>
      <Heading style={[big ? { fontSize: 18, fontWeight: '500', letterSpacing: 0.3 } : t.label, { flex: 1, color: t.label.color }]}>
        {title}
      </Heading>
      {action && (
        <Tap onPress={onAction}>
          <Text style={t.link}>{action}</Text>
        </Tap>
      )}
    </View>
  );
}

/** White rounded card with a hairline border. */
export function Card({ children, style, padding = 16, color }: { children: ReactNode; style?: StyleProp<ViewStyle>; padding?: number; color?: string }) {
  const { colors: c } = useDisplay();
  return (
    <View style={[{ backgroundColor: color ?? c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.line, padding }, style]}>
      {children}
    </View>
  );
}

/** Thin horizontal divider used inside grouped cards. */
export function HairLine({ indent = 0 }: { indent?: number }) {
  const { colors: c } = useDisplay();
  return <View style={{ height: 1, backgroundColor: c.line, marginLeft: indent }} />;
}

// ── Touch ─────────────────────────────────────────────────────────────────────

/**
 * Tap target with press feedback (a slight shrink and overlay). Icon-only targets must pass a
 * [label] and get a 48×48 minimum size; with text inside, the text is the label.
 */
export function Tap({
  onPress,
  children,
  label,
  hint,
  selected,
  style,
  role = 'button',
  disabled,
}: {
  onPress?: (e: GestureResponderEvent) => unknown;
  children: ReactNode;
  label?: string;
  hint?: string;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  role?: 'button' | 'link' | 'tab' | 'radio' | 'checkbox';
  disabled?: boolean;
}) {
  const { colors: c } = useDisplay();
  const enabled = !!onPress && !disabled;
  return (
    <Pressable
      // Handlers may await dialogs; the press itself never waits for them.
      onPress={enabled ? (e) => void onPress!(e) : undefined}
      disabled={!enabled}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !enabled, selected }}
      style={({ pressed }) => [
        label && { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
        style,
        pressed && enabled && { transform: [{ scale: 0.97 }], backgroundColor: `${c.ink}1F`, borderRadius: 8 },
      ]}
    >
      {children}
    </Pressable>
  );
}

/** Large pill button (filled dark or outlined). */
export function PillButton({
  label,
  onPress,
  filled = true,
  icon,
  disabled,
  background,
  foreground,
}: {
  label: string;
  onPress?: () => unknown;
  filled?: boolean;
  icon?: IconName;
  disabled?: boolean;
  background?: string;
  foreground?: string;
}) {
  const { colors: c } = useDisplay();
  const fg = foreground ?? (filled ? '#FFFFFF' : c.ink);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress ? () => void onPress() : undefined}
      style={({ pressed }) => [
        styles.pill,
        filled ? { backgroundColor: background ?? c.ink } : { borderWidth: 1, borderColor: c.outline, backgroundColor: background },
        (pressed || disabled) && { opacity: disabled ? 0.6 : 0.85 },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      {icon && <Icon name={icon} size={20} color={fg} />}
      <Text numberOfLines={1} style={{ color: fg, fontSize: 16, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Small outlined / filled rounded chip. */
export function Chip({
  label,
  selected,
  onPress,
  icon,
  showCheck,
  selectedBg,
  selectedFg,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  showCheck?: boolean;
  selectedBg?: string;
  selectedFg?: string;
}) {
  const { colors: c } = useDisplay();
  const fill = selectedBg ?? c.chip;
  const fg = selected ? (selectedFg ?? c.ink) : c.ink;
  return (
    <Tap onPress={onPress} selected={selected} role={onPress ? 'button' : undefined} label={label}>
      <View
        style={[
          styles.chip,
          { backgroundColor: selected ? fill : c.surface, borderColor: selected ? fill : c.outline },
        ]}
      >
        {showCheck && selected && <Icon name="check" size={18} color={fg} />}
        {icon && <Icon name={icon} size={18} color={fg} />}
        <Text style={{ fontSize: 14, fontWeight: '600', color: fg }}>{label}</Text>
      </View>
    </Tap>
  );
}

/** Two/three segment toggle (e.g. Upcoming | Recurring). */
export function SegTabs({ labels, selected, onChange }: { labels: string[]; selected: number; onChange: (i: number) => void }) {
  const { colors: c } = useDisplay();
  return (
    <View accessibilityRole="tablist" style={[styles.seg, { borderColor: c.outline, backgroundColor: c.surface }]}>
      {labels.map((l, i) => (
        <Pressable
          key={l}
          accessibilityRole="tab"
          accessibilityLabel={l}
          accessibilityState={{ selected: i === selected }}
          onPress={() => onChange(i)}
          style={[
            styles.segItem,
            { backgroundColor: i === selected ? c.chip : c.surface },
            i > 0 && { borderLeftWidth: 1, borderLeftColor: c.outline },
          ]}
        >
          <Text style={{ fontSize: 15, fontWeight: i === selected ? '700' : '500', color: c.ink }}>{l}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Circular (or rounded-square) icon badge. */
export function IconBadge({ icon, bg, fg, size = 44, square }: { icon: IconName; bg?: string; fg?: string; size?: number; square?: boolean }) {
  const { colors: c } = useDisplay();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: square ? 8 : size / 2,
        backgroundColor: bg ?? c.chip,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={size * 0.48} color={fg ?? c.ink} />
    </View>
  );
}

/** Generic list row: leading element, title + subtitle, trailing element. */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  titleStyle,
  label,
}: {
  leading?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  titleStyle?: StyleProp<TextStyle>;
  label?: string;
}) {
  const { colors: c, type: t } = useDisplay();
  const row = (
    <View style={styles.row}>
      {leading && <View style={{ marginRight: 16 }}>{leading}</View>}
      <View style={{ flex: 1 }}>
        <Text style={[{ fontSize: 16.5, color: c.ink }, titleStyle]}>{title}</Text>
        {typeof subtitle === 'string' ? <Text style={[t.sub, { marginTop: 2 }]}>{subtitle}</Text> : subtitle}
      </View>
      {trailing}
    </View>
  );
  return onPress ? (
    <Tap onPress={onPress} hint={label}>
      {row}
    </Tap>
  ) : (
    row
  );
}

// ── Progress & status ─────────────────────────────────────────────────────────

/** Progress bar: solid, or diagonal-striped (near-limit / over-budget in colorblind mode). */
export function ProgressBar({
  value,
  color,
  track,
  striped,
  height = 8,
  label,
}: {
  value: number;
  color?: string;
  track?: string;
  striped?: boolean;
  height?: number;
  /** What the bar measures; without it the bar is decorative (nearby text says the numbers). */
  label?: string;
}) {
  const { colors: c } = useDisplay();
  const [width, setWidth] = useState(0);
  const v = Math.min(1, Math.max(0, value));
  const fill = color ?? c.ink;
  const w = width * v;
  const stripes = (to: number, stroke: string) =>
    Array.from({ length: Math.ceil((to + height) / 7) + 1 }, (_, i) => -height + i * 7).map((x) => (
      <Line key={x} x1={x} y1={height} x2={x + height} y2={0} stroke={stroke} strokeWidth={3} />
    ));
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessible={!!label}
      accessibilityLabel={label}
      accessibilityValue={label ? { text: `${Math.round(v * 100)} percent` } : undefined}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
      style={{ height, borderRadius: height / 2, overflow: 'hidden', backgroundColor: track ?? c.chip }}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          {!striped ? (
            <Rect x={0} y={0} width={w} height={height} fill={fill} />
          ) : (
            <>
              {stripes(width, `${fill}40`)}
              <Rect x={0} y={0} width={w} height={height} fill={fill} opacity={0.55} />
              <Svg width={w} height={height}>
                {stripes(w, fill)}
              </Svg>
            </>
          )}
        </Svg>
      )}
    </View>
  );
}

export const statusColor = (status: BudgetStatus, c: { red: string; olive: string }) => (status === 'over' ? c.red : c.olive);
const STATUS_ICON: Record<BudgetStatus, IconName> = { onTrack: 'check-circle-outline', nearLimit: 'warning-amber', over: 'error-outline' };

/**
 * Marks a budget status next to its label. In colorblind mode each status has its own shape (a
 * check, a warning triangle or an error circle); otherwise it's a colored dot. Decorative.
 */
export function StatusMark({ status, color, size = 16 }: { status: BudgetStatus; color?: string; size?: number }) {
  const { colors: c, colorblind } = useDisplay();
  const tint = color ?? statusColor(status, c);
  if (!colorblind) return <View style={{ width: size / 2, height: size / 2, borderRadius: size / 4, backgroundColor: tint }} />;
  return <Icon name={STATUS_ICON[status]} size={size} color={tint} />;
}

/**
 * A budget's status as icon + label: near limit / over in bold, in their color, with their icon;
 * on track as plain text (with the ✓ shape in colorblind mode), or nothing when [hideOnTrack].
 */
export function StatusLabel({ status, hideOnTrack, onTrackColor }: { status: BudgetStatus; hideOnTrack?: boolean; onTrackColor?: string }) {
  const { colors: c, colorblind } = useDisplay();
  const color = statusColor(status, c);
  if (status === 'onTrack') {
    if (hideOnTrack) return null;
    return (
      <View style={styles.inline}>
        {colorblind && <StatusMark status={status} size={18} />}
        <Text style={{ fontSize: 14, color: onTrackColor ?? c.muted }}>{BUDGET_STATUS_LABEL.onTrack}</Text>
      </View>
    );
  }
  return (
    <View style={styles.inline}>
      <Icon name={STATUS_ICON[status]} size={18} color={color} />
      <Text style={{ fontSize: 14, fontWeight: '700', color }}>{BUDGET_STATUS_LABEL[status]}</Text>
    </View>
  );
}

// ── Loading / error ───────────────────────────────────────────────────────────

export function Loading() {
  const { colors: c } = useDisplay();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={c.ink} accessibilityLabel="Loading" />
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { colors: c, type: t } = useDisplay();
  return (
    <View style={[styles.center, { padding: 32 }]}>
      <Icon name="error-outline" size={40} color={c.ink} />
      <Text style={[t.body, { textAlign: 'center', marginVertical: 16 }]}>{message}</Text>
      <View style={{ width: 200 }}>
        <PillButton label="Try again" onPress={onRetry} />
      </View>
    </View>
  );
}

/** Renders loading / error (with retry) for [state], and [children] once the data is ready. */
export function AsyncView<T>({ state, onRetry, children }: { state: AsyncState<T>; onRetry: () => void; children: (data: T) => ReactNode }) {
  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error') return <ErrorView message={state.error} onRetry={onRetry} />;
  return <>{children(state.data)}</>;
}

export function EmptyText({ children }: { children: string }) {
  const { type: t } = useDisplay();
  return <Text style={[t.body, { textAlign: 'center', paddingVertical: 32, paddingHorizontal: 20 }]}>{children}</Text>;
}

// ── Form fields ───────────────────────────────────────────────────────────────

/** The app's outlined text field: label, inline error and helper text, optional show/hide for secrets. */
export function Field({
  label,
  error,
  helper,
  secure,
  prefix,
  ...input
}: TextInputProps & { label: string; error?: string; helper?: string; secure?: boolean; prefix?: string }) {
  const { colors: c, type: t } = useDisplay();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={[t.sub, { marginBottom: 6, color: error ? c.red : c.ink, fontWeight: '600' }]}>{label}</Text>
      <View
        style={[
          styles.field,
          { borderColor: error ? c.red : focused ? c.ink : c.outline, borderWidth: focused || error ? 2 : 1, backgroundColor: c.surface },
        ]}
      >
        {prefix && <Text style={{ fontSize: 18, color: c.muted, marginRight: 4 }}>{prefix}</Text>}
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error ?? helper}
          placeholderTextColor={c.muted}
          secureTextEntry={secure && hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ flex: 1, fontSize: 18, color: c.ink, paddingVertical: 14 }}
          {...input}
        />
        {secure && (
          <Tap onPress={() => setHidden(!hidden)} label={hidden ? `Show ${label.toLowerCase()}` : `Hide ${label.toLowerCase()}`}>
            <Icon name={hidden ? 'visibility' : 'visibility-off'} color={c.ink} />
          </Tap>
        )}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={{ color: c.red, fontSize: 13, marginTop: 4 }}>
          {error}
        </Text>
      ) : helper ? (
        <Text style={[t.sub, { marginTop: 4 }]}>{helper}</Text>
      ) : null}
    </View>
  );
}

/** A field whose value is picked from a list (opens a bottom sheet). */
export function SelectField({
  label,
  value,
  options,
  onChange,
  error,
  placeholder = 'Choose…',
}: {
  label: string;
  value?: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const { colors: c, type: t } = useDisplay();
  const { choose } = useDialogs();
  const current = options.find((o) => o.id === value);
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={[t.sub, { marginBottom: 6, color: error ? c.red : c.ink, fontWeight: '600' }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current?.label ?? 'not chosen'}`}
        accessibilityHint={error}
        onPress={() =>
          void choose({ title: label, options, selectedId: value }).then((id) => id !== undefined && onChange(id))
        }
        style={[styles.field, { borderColor: error ? c.red : c.outline, borderWidth: error ? 2 : 1, backgroundColor: c.surface, minHeight: 56 }]}
      >
        <Text numberOfLines={1} style={{ flex: 1, fontSize: 18, color: current ? c.ink : c.muted }}>
          {current?.label ?? placeholder}
        </Text>
        <Icon name="expand-more" color={c.ink} />
      </Pressable>
      {error && <Text style={{ color: c.red, fontSize: 13, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

/** A date field that opens the system date picker. */
export function DateField({
  label,
  value,
  onChange,
  error,
  helper,
  minimumDate,
  placeholder = 'Choose a date',
}: {
  label: string;
  value?: Date;
  onChange: (d: Date | undefined) => void;
  error?: string;
  helper?: string;
  minimumDate?: Date;
  placeholder?: string;
}) {
  const { colors: c, type: t } = useDisplay();
  const [picking, setPicking] = useState(false);
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={[t.sub, { marginBottom: 6, color: error ? c.red : c.ink, fontWeight: '600' }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? DateLabels.long(value) : 'not chosen'}`}
        accessibilityHint={error ?? helper}
        onPress={() => setPicking(true)}
        style={[styles.field, { borderColor: error ? c.red : c.outline, borderWidth: error ? 2 : 1, backgroundColor: c.surface, minHeight: 56 }]}
      >
        <Icon name="event" color={c.ink} />
        <Text style={{ flex: 1, fontSize: 18, marginLeft: 10, color: value ? c.ink : c.muted }}>
          {value ? DateLabels.long(value) : placeholder}
        </Text>
        {value && (
          <Tap onPress={() => onChange(undefined)} label={`Clear ${label.toLowerCase()}`}>
            <Icon name="close" color={c.muted} />
          </Tap>
        )}
      </Pressable>
      {picking && (
        <DateTimePicker
          value={value ?? minimumDate ?? new Date()}
          mode="date"
          minimumDate={minimumDate}
          onChange={(event, date) => {
            setPicking(false);
            if (event.type === 'set' && date) onChange(date);
          }}
        />
      )}
      {error ? (
        <Text style={{ color: c.red, fontSize: 13, marginTop: 4 }}>{error}</Text>
      ) : helper ? (
        <Text style={[t.sub, { marginTop: 4 }]}>{helper}</Text>
      ) : null}
    </View>
  );
}

/** A settings row with a switch. */
export function SwitchRow({ title, subtitle, value, onChange, icon }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; icon?: IconName }) {
  const { colors: c, type: t } = useDisplay();
  return (
    <View style={[styles.row, { paddingHorizontal: 14 }]}>
      {icon && (
        <View style={{ marginRight: 14 }}>
          <IconBadge icon={icon} size={38} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={t.row}>{title}</Text>
        {subtitle && <Text style={t.sub}>{subtitle}</Text>}
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: c.ink, false: c.chip }}
        thumbColor={value ? c.lime : '#FFFFFF'}
      />
    </View>
  );
}

// ── Sandbox notices ───────────────────────────────────────────────────────────

/** Always visible where a bank is linked: makes it clear no real bank is involved. */
export function TestModeBanner() {
  const { colors: c } = useDisplay();
  return (
    <View accessible accessibilityLabel="Test mode. Plaid Sandbox. No real bank accounts." style={[styles.banner, { backgroundColor: c.lime }]}>
      <Icon name="science" size={22} color="#1A1A1A" />
      <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>Test mode · Plaid Sandbox · no real bank accounts</Text>
    </View>
  );
}

/** Shown while connecting: a status message, never a form. */
export function ConnectingNotice() {
  const { colors: c } = useDisplay();
  return (
    <Card style={{ borderRadius: 24 }} padding={20}>
      <View accessibilityLiveRegion="polite">
        <View style={styles.inline}>
          <ActivityIndicator color={c.ink} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: c.ink, flex: 1, marginLeft: 6 }}>Connecting to a test endpoint…</Text>
        </View>
        <Text style={{ fontSize: 16, color: c.muted, lineHeight: 22, marginTop: 14 }}>
          Pace is linking Plaid&apos;s sandbox test bank (sandbox.plaid.com). This is a test environment: no real bank is contacted, and
          you don&apos;t need to (and can&apos;t) enter any real account information.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, minHeight: 56 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  pill: { height: 54, borderRadius: 27, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  seg: { height: 44, borderRadius: 22, borderWidth: 1, flexDirection: 'row', overflow: 'hidden' },
  segItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, minHeight: 56 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  field: { flexDirection: 'row', alignItems: 'center', borderRadius: 6, paddingHorizontal: 14 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
});
