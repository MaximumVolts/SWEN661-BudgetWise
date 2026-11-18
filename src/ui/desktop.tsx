import { Children, Fragment, type ReactNode, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, type StyleProp, StyleSheet, Text, type TextStyle, View, type ViewStyle } from 'react-native';
import { useDisplay } from '../state/PreferencesContext';
import { focusRing, Heading, Tap } from './components';
import { Icon, type IconName } from './icons';
import { Backdrop, dialogName, FocusPressable, KeyGroup, phoneLabel, pressKeyProps, tabCycleProps } from './keyboard';

/**
 * Building blocks for the desktop layout (the design's sidebar app): a page with a title row,
 * panels, tables, buttons and chips. Phones and tablets keep using components.tsx.
 */

/** Body text sizes on desktop. */
export const DText = {
  title: { fontSize: 28, lineHeight: 36, fontWeight: '400' },
  panelTitle: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  body: { fontSize: 16, lineHeight: 24 },
  small: { fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
  big: { fontSize: 36, lineHeight: 44, fontWeight: '400' },
} satisfies Record<string, TextStyle>;

/**
 * A desktop page: its title (with actions on the right), an optional trail under it ("Budgets /
 * Food / October 2026") and an optional Back link above it, then the content.
 */
export function DesktopPage({
  title,
  actions,
  trail,
  onBack,
  children,
  scroll = true,
}: {
  title: string;
  actions?: ReactNode;
  trail?: string;
  onBack?: () => void;
  children: ReactNode;
  scroll?: boolean;
}) {
  const { colors: c } = useDisplay();
  const body = (
    <View style={{ paddingHorizontal: 36, paddingTop: 32, paddingBottom: 48, gap: 24, width: '100%', maxWidth: 1440 }}>
      <View style={{ gap: 6 }}>
        {onBack && (
          <View style={{ alignItems: 'flex-start', marginLeft: -12 }}>
            <DButton label="Back" icon="arrow-back" kind="text" onPress={onBack} />
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }}>
          <Heading level={1} style={[DText.title, { flex: 1, color: c.ink }]}>{title}</Heading>
          {actions}
        </View>
        {trail && <Text style={[DText.small, { color: c.muted }]}>{trail}</Text>}
      </View>
      {children}
    </View>
  );
  if (!scroll) return <View style={{ flex: 1, backgroundColor: c.bg }}>{body}</View>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} keyboardShouldPersistTaps="handled">
      {body}
    </ScrollView>
  );
}

export type PanelTone = 'surface' | 'muted' | 'accent' | 'danger';

/** A rounded panel (card). [title] in 16 medium, with an optional [action] on the right. */
export function Panel({
  title,
  action,
  tone = 'surface',
  padding = 24,
  style,
  children,
}: {
  title?: string;
  action?: ReactNode;
  tone?: PanelTone;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  const { colors: c } = useDisplay();
  const bg = { surface: c.surface, muted: c.chip, accent: c.lime, danger: c.redBg }[tone];
  const border = tone === 'surface' ? c.line : bg;
  return (
    <View style={[{ backgroundColor: bg, borderColor: border, borderWidth: 1, borderRadius: 16, padding, gap: 12 }, style]}>
      {(title || action) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {title && <Heading style={[DText.panelTitle, { flex: 1, color: tone === 'accent' ? '#1A1A1A' : c.ink }]}>{title}</Heading>}
          {action}
        </View>
      )}
      {children}
    </View>
  );
}

/** Columns that share a row; each child takes an equal share unless given [flex]. */
export function Row({ children, gap = 24, align = 'flex-start', style }: { children: ReactNode; gap?: number; align?: ViewStyle['alignItems']; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', gap, alignItems: align }, style]}>{children}</View>;
}

export const Col = ({ children, flex = 1, gap = 24, style }: { children: ReactNode; flex?: number; gap?: number; style?: StyleProp<ViewStyle> }) => (
  <View style={[{ flex, gap, minWidth: 0 }, style]}>{children}</View>
);

export type ButtonKind = 'accent' | 'primary' | 'outline' | 'text';

/** Desktop buttons: lime "accent" (Add …), dark "primary", outlined, or plain text. */
export function DButton({
  label,
  icon,
  kind = 'outline',
  onPress,
  disabled,
  accessibilityLabel,
  align = 'start',
}: {
  label: string;
  /** Where it sits in its column (it never stretches). */
  align?: 'start' | 'end' | 'center';
  icon?: IconName;
  kind?: ButtonKind;
  onPress?: () => unknown;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const { colors: c } = useDisplay();
  const [focused, setFocused] = useState(false);
  const fg = kind === 'primary' ? '#FFFFFF' : kind === 'accent' ? '#1A1A1A' : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled || !onPress}
      onPress={onPress ? () => void onPress() : undefined}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.button,
        { alignSelf: align === 'end' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start' },
        kind === 'accent' && { backgroundColor: c.lime },
        kind === 'primary' && { backgroundColor: c.ink },
        kind === 'outline' && { borderWidth: 1, borderColor: c.outline, backgroundColor: hovered ? c.chip : 'transparent' },
        kind === 'text' && { paddingHorizontal: 12, backgroundColor: hovered ? c.chip : 'transparent' },
        (kind === 'accent' || kind === 'primary') && hovered && { opacity: 0.9 },
        disabled && { opacity: 0.45 },
        pressed && { transform: [{ scale: 0.98 }] },
        focused && focusRing(c.ink),
      ]}
    >
      {icon && <Icon name={icon} size={20} color={fg} />}
      <Text numberOfLines={1} style={{ color: fg, fontSize: 14, fontWeight: '500' }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** A rectangular filter / choice chip, with a check mark when [selected]. */
export function DChip({ label, selected, onPress, icon, role = 'button' }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; role?: 'button' | 'radio' | 'checkbox' | 'tab' }) {
  const { colors: c } = useDisplay();
  return (
    <Tap onPress={onPress} selected={role === 'button' || role === 'tab' ? selected : undefined} checked={role === 'radio' || role === 'checkbox' ? !!selected : undefined} role={role} label={label} style={{ minHeight: 40 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          height: 38,
          paddingHorizontal: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: c.outline,
          backgroundColor: selected ? c.chip : c.surface,
        }}
      >
        {selected && <Icon name="check" size={18} color={c.ink} />}
        {icon && !selected && <Icon name={icon} size={18} color={c.ink} />}
        <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>{label}</Text>
      </View>
    </Tap>
  );
}

/** A row of chips where one is chosen (Month / 3 months / Year). */
export function ChipGroup({ labels, selected, onChange, label }: { labels: string[]; selected: number; onChange: (i: number) => void; label: string }) {
  return (
    <KeyGroup role="radiogroup" label={label} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {labels.map((l, i) => (
        <DChip key={l} label={l} selected={i === selected} role="radio" onPress={() => onChange(i)} />
      ))}
    </KeyGroup>
  );
}

/** A small rounded label ("Posted", "Near limit · 80% used", "Rising"). */
export function Badge({ label, tone = 'muted', icon }: { label: string; tone?: 'muted' | 'accent' | 'danger' | 'dark'; icon?: IconName }) {
  const { colors: c } = useDisplay();
  const [bg, fg] = { muted: [c.chip, c.ink], accent: [c.lime, '#1A1A1A'], danger: [c.redBg, c.red], dark: [c.ink, '#FFFFFF'] }[tone];
  return (
    <View style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 4, backgroundColor: bg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
      {icon && <Icon name={icon} size={14} color={fg} />}
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: '500', color: fg }}>{label}</Text>
    </View>
  );
}

/** A labelled figure: "Cash" / "$9,368.60" / "2 accounts". */
export function Stat({ label, value, caption, tone }: { label: string; value: string; caption?: string; tone?: PanelTone }) {
  const { colors: c } = useDisplay();
  return (
    <Panel tone={tone} style={{ flex: 1, gap: 8 }}>
      <Text style={[DText.small, { color: c.muted }]}>{label}</Text>
      <Text style={[DText.big, { color: c.ink }]}>{value}</Text>
      {caption && <Text style={[DText.small, { color: c.muted }]}>{caption}</Text>}
    </Panel>
  );
}

/** A label / value line inside a panel ("Checking … $3,248.60"), with an optional icon and caption. */
export function InfoRow({
  icon,
  title,
  caption,
  value,
  valueTone,
  onPress,
  last,
}: {
  icon?: IconName;
  title: string;
  caption?: string;
  value?: string;
  valueTone?: 'danger' | 'success';
  onPress?: () => void;
  last?: boolean;
}) {
  const { colors: c } = useDisplay();
  const color = valueTone === 'danger' ? c.red : valueTone === 'success' ? c.olive : c.ink;
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }}>
      {icon && <Icon name={icon} size={22} color={c.ink} />}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>{title}</Text>
        {caption && <Text style={[DText.small, { color: valueTone === 'danger' ? c.red : c.muted }]}>{caption}</Text>}
      </View>
      {value !== undefined && <Text style={{ fontSize: 14, fontWeight: '500', color }}>{value}</Text>}
    </View>
  );
  return onPress ? (
    <Tap onPress={onPress} style={{ minHeight: 0 }}>
      {content}
    </Tap>
  ) : (
    content
  );
}

export interface TableColumn {
  label: string;
  /** Share of the width (default 1). */
  flex?: number;
  align?: 'left' | 'right';
}

export interface TableRow {
  key: string;
  /** One per column: text, or any element (but no buttons: those go in [actions]). */
  cells: ReactNode[];
  /**
   * Buttons for the last column (a ⋮ menu). A row that opens on click is itself a button, and
   * one control can't hold another, so these sit beside the row's button rather than inside it.
   */
  actions?: ReactNode;
  onPress?: () => void;
  /** What a screen reader says for the whole row (defaults to the cells with their column names). */
  label?: string;
  /** What cells that are elements, not text, say (by column), for the row's default [label]. */
  cellText?: (string | undefined)[];
  tone?: 'normal' | 'sub' | 'total';
  /** For rows that open and close (their details below them): whether open. */
  expanded?: boolean;
}

/**
 * A table with a shaded header row, inside a rounded border. Rows with [onPress] open on click / Enter.
 *
 * On desktop it is a table to screen readers (table, row, column header, row header and cell roles), so
 * each value is read with its column's name and table navigation works. A row that opens is a button
 * laid under the row's cells, inside its row header, so the table keeps only rows and cells. Phones
 * have no table role: each row there is one item read as "first cell, column: value, …".
 */
export function DTable({
  columns,
  rows,
  compact,
  empty,
  bare,
  label,
}: {
  columns: TableColumn[];
  rows: TableRow[];
  compact?: boolean;
  empty?: string;
  /** No border of its own (inside a panel). */
  bare?: boolean;
  /** The table's name for screen readers. */
  label?: string;
}) {
  const { colors: c } = useDisplay();
  const align = (col: TableColumn | undefined): TextStyle => ({ textAlign: col?.align === 'right' ? 'right' : 'left' });
  const box = (col: TableColumn | undefined): ViewStyle => ({ flex: col?.flex ?? 1, minWidth: 0, alignItems: col?.align === 'right' ? 'flex-end' : 'flex-start' });
  const content = (value: ReactNode, col: TableColumn | undefined, row: TableRow, i: number) =>
    typeof value === 'string' || typeof value === 'number' ? (
      <Text
        numberOfLines={2}
        style={[
          { fontSize: row.tone === 'total' ? 18 : i === 0 && row.tone !== 'sub' ? 14 : 16, color: row.tone === 'sub' && i === 0 ? c.muted : c.ink },
          i === 0 && row.tone !== 'sub' && { fontWeight: '500' },
          row.tone === 'total' && { fontWeight: '500' },
          row.tone === 'sub' && i === 0 && { paddingLeft: 56 },
          align(col),
        ]}
      >
        {value}
      </Text>
    ) : (
      value
    );
  const lineStyle = (row: TableRow): ViewStyle => ({
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: compact ? 44 : row.tone === 'total' ? 56 : 62,
    paddingVertical: compact ? 6 : 10,
    borderTopWidth: row.tone === 'total' ? 2 : 1,
    borderTopColor: row.tone === 'total' ? c.outline : c.line,
    backgroundColor: row.tone === 'total' ? c.chip : row.tone === 'sub' ? c.panel : 'transparent',
  });
  /** "Coffee Bean, Date: Oct 3, Amount: $4.50": each text cell after the first with its column's name. */
  const spokenRow = (row: TableRow) =>
    row.label ??
    row.cells
      .map((x, i) => (typeof x === 'string' || typeof x === 'number' ? String(x) : row.cellText?.[i]))
      .map((x, i) => (!x ? null : i === 0 || !columns[i]?.label ? x : `${columns[i].label}: ${x}`))
      .filter((x): x is string => !!x)
      .join(', ');
  const frame: ViewStyle = bare ? { backgroundColor: c.surface } : { borderWidth: 1, borderColor: c.line, borderRadius: 12, overflow: 'hidden', backgroundColor: c.surface };
  const headerStyle: ViewStyle = { flexDirection: 'row', gap: 16, backgroundColor: c.chip, paddingHorizontal: 20, height: 46, alignItems: 'center' };
  const headerText = (col: TableColumn): TextStyle[] => [{ flex: col.flex ?? 1, fontSize: 14, fontWeight: '500', color: c.ink }, align(col)];
  const emptyText = rows.length === 0 && empty ? <Text style={[DText.body, { color: c.muted, padding: 20 }]}>{empty}</Text> : null;

  if (Platform.OS === 'web') {
    return (
      <View style={frame}>
        <View role="table" aria-label={label}>
          <View role="rowgroup">
            <View role="row" style={headerStyle}>
              {columns.map((col, i) => (
                <Text key={i} role="columnheader" style={headerText(col)}>
                  {col.label}
                </Text>
              ))}
            </View>
          </View>
          <View role="rowgroup">
            {rows.map((row) => {
              // The row's button covers the whole row, under its cells (which let clicks through to it);
              // only the actions, on top, take clicks of their own.
              const button = row.onPress ? (
                <HoverRow onPress={row.onPress} label={spokenRow(row)} expanded={row.expanded} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
              ) : null;
              return (
                <View key={row.key} role="row" style={lineStyle(row)}>
                  {row.cells.map((value, i) => (
                    // The row header holds the button; 'static' lets the button size itself to the whole row.
                    // Cells let clicks through to the button under them (the row header passes them on to it).
                    <View
                      key={i}
                      role={i === 0 ? 'rowheader' : 'cell'}
                      pointerEvents={button ? (i === 0 ? 'box-none' : 'none') : 'auto'}
                      style={[box(columns[i]), i === 0 && button ? { position: 'static' } : null]}
                    >
                      {i === 0 && button}
                      <View pointerEvents={button ? 'none' : 'auto'} style={{ maxWidth: '100%' }}>
                        {content(value, columns[i], row, i)}
                      </View>
                    </View>
                  ))}
                  {row.actions !== undefined && (
                    <View role="cell" style={box(columns[row.cells.length])}>
                      {row.actions}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
        {emptyText}
      </View>
    );
  }

  const cell = (value: ReactNode, col: TableColumn | undefined, row: TableRow, i: number, hidden?: boolean) => (
    <View
      key={i}
      // Under a layered row: not read (the row's button says it all) and touches go through to the button.
      {...(hidden && { 'aria-hidden': true, importantForAccessibility: 'no-hide-descendants' as const, pointerEvents: 'none' as const })}
      style={box(col)}
    >
      {content(value, col, row, i)}
    </View>
  );
  return (
    <View style={frame}>
      {/* Column titles: a visual guide (each row reads out its cells with their column names). */}
      <View style={headerStyle}>
        {columns.map((col, i) => (
          <Text key={i} style={headerText(col)}>
            {col.label}
          </Text>
        ))}
      </View>
      {emptyText}
      <View role="list">
        {rows.map((row) => {
          // With actions, the row's button lies under its cells (spoken by the button's label, so not
          // read twice) and only the actions, on top, take touches of their own.
          const layered = !!row.onPress && row.actions !== undefined;
          const line = (
            <View pointerEvents={layered ? 'box-none' : undefined} style={lineStyle(row)}>
              {row.cells.map((value, i) => cell(value, columns[i], row, i, layered))}
              {row.actions !== undefined && cell(row.actions, columns[row.cells.length], row, row.cells.length)}
            </View>
          );
          const spoken = spokenRow(row);
          if (layered) {
            return (
              <View key={row.key} role="listitem">
                <HoverRow onPress={row.onPress!} label={spoken} expanded={row.expanded} style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} />
                {line}
              </View>
            );
          }
          return row.onPress ? (
            <View key={row.key} role="listitem">
              <HoverRow onPress={row.onPress} label={spoken} expanded={row.expanded}>
                {line}
              </HoverRow>
            </View>
          ) : (
            <View key={row.key} role="listitem" accessible accessibilityLabel={phoneLabel(spoken)}>
              {line}
            </View>
          );
        })}
      </View>
    </View>
  );
}

/**
 * A table row's button. With [children] (its cells) it is named by them on desktop; without (it
 * lies under them) it is named by [label].
 */
function HoverRow({ onPress, label, expanded, children, style }: { onPress: () => void; label: string; expanded?: boolean; children?: ReactNode; style?: ViewStyle }) {
  const { colors: c } = useDisplay();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={children ? phoneLabel(label) : label}
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      aria-expanded={expanded}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ hovered }: { hovered?: boolean }) => [style, hovered && { backgroundColor: c.panel }, focused && focusRing(c.ink)]}
    >
      {children}
    </Pressable>
  );
}

/** Rows separated by hairlines (lists inside a panel). */
export function Lines({ children }: { children: ReactNode }) {
  const { colors: c } = useDisplay();
  const items = Children.toArray(children);
  return (
    <View>
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <View style={{ height: 1, backgroundColor: c.line }} />}
          {item}
        </Fragment>
      ))}
    </View>
  );
}

/** A checkbox with its label. */
export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  const { colors: c } = useDisplay();
  return (
    <Tap onPress={() => onChange(!checked)} role="checkbox" checked={checked} label={label} style={{ minHeight: 40, alignItems: 'flex-start' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 3,
            borderWidth: 2,
            borderColor: c.ink,
            backgroundColor: checked ? c.ink : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {checked && <Icon name="check" size={18} color="#FFFFFF" />}
        </View>
        <Text style={[DText.body, { color: c.ink }]}>{label}</Text>
      </View>
    </Tap>
  );
}

/** One choice of a radio group. */
export function Radio({ label, caption, selected, onPress }: { label: string; caption?: string; selected: boolean; onPress: () => void }) {
  const { colors: c } = useDisplay();
  return (
    <Tap onPress={onPress} role="radio" checked={selected} label={caption ? phoneLabel(`${label}. ${caption}`) : label} style={{ minHeight: 40, alignItems: 'flex-start' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
          {selected && <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: c.ink }} />}
        </View>
        <View>
          <Text style={{ fontSize: 16, fontWeight: caption ? '500' : '400', color: c.ink }}>{label}</Text>
          {caption && <Text style={{ fontSize: 13, color: c.muted }}>{caption}</Text>}
        </View>
      </View>
    </Tap>
  );
}

/** A labelled on / off switch, the switch on the right. */
export function SwitchLine({ title, caption, value, onChange }: { title: string; caption?: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 }}>
      <View style={{ flex: 1 }}>
        <Text style={[DText.body, { color: c.ink }]}>{title}</Text>
        {caption && <Text style={[DText.small, { color: c.muted }]}>{caption}</Text>}
      </View>
      <DSwitch label={title} value={value} onChange={onChange} />
    </View>
  );
}

/** The design's on / off switch (larger than the browser default): dark when on. */
export function DSwitch({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors: c } = useDisplay();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      role="switch"
      aria-checked={value}
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      {...pressKeyProps('switch', () => onChange(!value))}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        { width: 52, height: 32, borderRadius: 16, padding: 4, justifyContent: 'center', backgroundColor: value ? c.ink : c.outline, alignItems: value ? 'flex-end' : 'flex-start' },
        focused && focusRing(c.ink),
      ]}
    >
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF' }} />
    </Pressable>
  );
}

/** Two or more joined options, one chosen (Comfortable | Compact). */
export function Segmented({ labels, selected, onChange, label }: { labels: string[]; selected: number; onChange: (i: number) => void; label: string }) {
  const { colors: c } = useDisplay();
  return (
    <KeyGroup role="radiogroup" label={label} style={{ flexDirection: 'row', borderWidth: 1, borderColor: c.outline, borderRadius: 24, height: 48 }}>
      {labels.map((l, i) => {
        const on = i === selected;
        return (
          <FocusPressable
            key={l}
            ringColor={c.ink}
            accessibilityRole="radio"
            accessibilityLabel={l}
            accessibilityState={{ checked: on }}
            aria-checked={on}
            onPress={() => onChange(i)}
            style={{
              flex: 1,
              flexDirection: 'row',
              gap: 6,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: on ? c.chip : c.surface,
              borderLeftWidth: i ? 1 : 0,
              borderLeftColor: c.outline,
              // Rounded ends without clipping the focus ring (no overflow: hidden on the group).
              ...(i === 0 && { borderTopLeftRadius: 24, borderBottomLeftRadius: 24 }),
              ...(i === labels.length - 1 && { borderTopRightRadius: 24, borderBottomRightRadius: 24 }),
            }}
          >
            {on && <Icon name="check" size={18} color={c.ink} />}
            <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>{l}</Text>
          </FocusPressable>
        );
      })}
    </KeyGroup>
  );
}

/** Tabs with an underline under the chosen one (Data | Visual). */
export function Tabs({ tabs, selected, onChange, label }: { tabs: { label: string; icon?: IconName }[]; selected: number; onChange: (i: number) => void; label: string }) {
  const { colors: c } = useDisplay();
  return (
    <KeyGroup role="tablist" label={label} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: c.line }}>
      {tabs.map((t, i) => {
        const on = i === selected;
        return (
          <FocusPressable
            key={t.label}
            ringColor={c.ink}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            aria-selected={on}
            accessibilityLabel={t.label}
            onPress={() => onChange(i)}
            style={{ flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', height: 56, borderBottomWidth: 4, borderBottomColor: on ? c.ink : 'transparent' }}
          >
            {t.icon && <Icon name={t.icon} size={18} color={c.ink} />}
            <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>{t.label}</Text>
          </FocusPressable>
        );
      })}
    </KeyGroup>
  );
}

/** A panel that slides over the right of the window (Customize), with a footer for its buttons. */
export function Drawer({ visible, title, onClose, children, footer }: { visible: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const { colors: c } = useDisplay();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} {...dialogName(title)}>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <View accessibilityViewIsModal aria-label={title} {...tabCycleProps} style={{ width: 400, zIndex: 1, backgroundColor: c.bg, borderLeftWidth: 1, borderLeftColor: c.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 28, paddingRight: 12, paddingTop: 20, paddingBottom: 8 }}>
            <Heading style={[DText.title, { flex: 1, fontSize: 24, color: c.ink }]}>{title}</Heading>
            <Tap onPress={onClose} label="Close">
              <Icon name="close" color={c.ink} />
            </Tap>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 24 }}>
            {children}
          </ScrollView>
          {footer && (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 16, paddingHorizontal: 28, paddingVertical: 20, borderTopWidth: 1, borderTopColor: c.line }}>
              {footer}
            </View>
          )}
        </View>
        {/*
          Clicking outside closes; from the keyboard it's Esc or the Close button. The backdrop comes
          after the panel so the dialog's focus starts inside the panel, and it is never a Tab stop.
        */}
        <Backdrop onPress={onClose} style={{ backgroundColor: 'rgba(26,26,26,0.32)' }} />
      </View>
    </Modal>
  );
}

/** A section heading inside a drawer or panel, with an optional action ("Select all"). */
export function SubHeading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 10 }}>
      <Heading style={{ flex: 1, fontSize: 16, fontWeight: '500', color: c.ink }}>{title}</Heading>
      {action && (
        <Tap onPress={onAction} style={{ minHeight: 32 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: c.olive }}>{action}</Text>
        </Tap>
      )}
    </View>
  );
}

/** A key cap: "Ctrl", "K", "Enter". */
export function Kbd({ label }: { label: string }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ borderWidth: 1, borderColor: c.outline, borderBottomWidth: 2, borderRadius: 6, paddingHorizontal: 6, minWidth: 24, minHeight: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: c.ink }}>{label}</Text>
    </View>
  );
}

/** A thin divider. */
export function Divider({ margin = 0 }: { margin?: number }) {
  const { colors: c } = useDisplay();
  return <View style={{ height: 1, backgroundColor: c.line, marginVertical: margin }} />;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
  },
});
