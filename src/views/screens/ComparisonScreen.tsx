import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { ComparisonController } from '../../controllers/comparisonController';
import {
  type Change,
  CHANGE_LABEL,
  changeBetween,
  type ComparisonData,
  type ComparisonOptions,
  comparisonMoney,
  formatChangeAmount,
  formatChangePercent,
  highlightLabel,
  isHighlighted,
  totalsOf,
  visibleRows,
} from '../../models/comparison';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Heading, Screen, Tap, TopBar } from '../../ui/components';
import {
  Checkbox,
  DButton,
  DChip,
  Drawer,
  DTable,
  DText,
  Panel,
  Radio,
  Segmented,
  SubHeading,
  type TableColumn,
  type TableRow,
  Tabs,
} from '../../ui/desktop';
import { Icon, iconFor } from '../../ui/icons';
import { KeyGroup } from '../../ui/keyboard';
import { useDesktop } from '../../ui/responsive';

/**
 * Monthly Comparison: spending by category in two months, with the change in dollars and
 * percent. Changes always carry a sign and (by default) an arrow and "Up" / "Down", so they read
 * without color. The Customize panel chooses what's shown and how.
 */
export function ComparisonScreen({ controller: ctl }: { controller: ComparisonController }) {
  const desktop = useDesktop();
  const { colors: c } = useDisplay();
  const o = ctl.options;
  const body = (
    <View style={{ gap: 20, paddingHorizontal: desktop ? 36 : 20, paddingTop: desktop ? 32 : 8, paddingBottom: 48 }}>
      {desktop && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
          <View style={{ flex: 1 }}>
            {o.showTitle && <Heading style={{ fontSize: 32, lineHeight: 40, fontWeight: '600', color: c.ink }}>Monthly Comparison</Heading>}
            <Text style={[DText.body, { color: c.muted }]}>Compare your spending across different months.</Text>
          </View>
          <DButton label="Customize" icon="tune" kind="primary" onPress={() => ctl.openCustomize('data')} />
        </View>
      )}
      <Controls controller={ctl} />
      <AsyncView state={ctl.data.state} onRetry={ctl.data.reload}>
        {(data) => <Results data={data} controller={ctl} />}
      </AsyncView>
    </View>
  );
  return (
    <>
      {desktop ? (
        <ScrollView style={{ flex: 1, backgroundColor: c.bg }}>{body}</ScrollView>
      ) : (
        <Screen>
          <TopBar title="Monthly Comparison" trailing={<DButton label="Customize" icon="tune" kind="text" onPress={() => ctl.openCustomize('data')} />} />
          <ScrollView>{body}</ScrollView>
        </Screen>
      )}
      <CustomizeDrawer controller={ctl} />
    </>
  );
}

/** A labelled picker that looks like a field (Period A / Period B / Categories). */
function PickerField({ label, value, icon, onPress, width }: { label: string; value: string; icon: 'event' | 'expand-more'; onPress: () => void; width?: number }) {
  const { colors: c } = useDisplay();
  return (
    <Tap onPress={onPress} label={`${label}: ${value}`} style={{ alignItems: 'stretch', flexGrow: width ? 0 : 1, width }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 60, borderWidth: 1, borderColor: c.outline, borderRadius: 6, paddingHorizontal: 16, backgroundColor: c.surface }}>
        <View style={{ flex: 1 }}>
          <Text style={[DText.small, { color: c.muted }]}>{label}</Text>
          <Text numberOfLines={1} style={{ fontSize: 16, color: c.ink }}>
            {value}
          </Text>
        </View>
        <Icon name={icon} color={c.ink} />
      </View>
    </Tap>
  );
}

function Controls({ controller: ctl }: { controller: ComparisonController }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
      <PickerField label="Period A" value={ctl.pickedLabels.a} icon="event" width={232} onPress={() => ctl.pickPeriod('a')} />
      <Tap onPress={ctl.swap} label="Swap periods">
        <Icon name="swap-horiz" color={c.ink} />
      </Tap>
      <PickerField label="Period B" value={ctl.pickedLabels.b} icon="event" width={232} onPress={() => ctl.pickPeriod('b')} />
      <PickerField label="Categories" value={ctl.categoriesLabel} icon="expand-more" width={264} onPress={() => ctl.openCustomize('data')} />
      <DButton label="Compare" icon="compare-arrows" kind="accent" onPress={ctl.compare} disabled={!ctl.canCompare} />
    </View>
  );
}

/** "September 2026" → "September". */
const monthOnly = (label: string) => label.split(' ')[0];

function Results({ data, controller: ctl }: { data: ComparisonData; controller: ComparisonController }) {
  const { colors: c } = useDisplay();
  const desktop = useDesktop();
  const o = ctl.options;
  const rows = visibleRows(data, o);
  const total = totalsOf(rows);
  const change = changeBetween(total.a, total.b);
  const compact = o.density === 'compact';

  const columns: TableColumn[] = [
    { label: 'SPENDING CATEGORY', flex: 2.4 },
    { label: `${data.periodA.shortLabel.toUpperCase()} (A)`, align: 'right' },
    { label: `${data.periodB.shortLabel.toUpperCase()} (B)`, align: 'right' },
  ];
  if (o.showDollarChange) columns.push({ label: '$ CHANGE', align: 'right' });
  if (o.showPercentChange) columns.push({ label: '% CHANGE', flex: 1.2, align: 'right' });

  const changeCells = (a: number, b: number) => {
    const ch = changeBetween(a, b);
    const cells: ReactNode[] = [];
    if (o.showDollarChange) cells.push(formatChangeAmount(ch.amount, o));
    if (o.showPercentChange) cells.push(<ChangeBadge change={ch} options={o} />);
    return cells;
  };

  const tableRows: TableRow[] = [];
  for (const r of rows) {
    const canExpand = o.expandableRows && r.merchants.length > 0;
    const open = canExpand && ctl.expanded.has(r.categoryId);
    const ch = changeBetween(r.a, r.b);
    tableRows.push({
      key: r.categoryId,
      onPress: canExpand ? () => ctl.toggleRow(r.categoryId) : undefined,
      expanded: canExpand ? open : undefined,
      label: `${r.name}${canExpand ? (open ? ', expanded' : ', collapsed') : ''}. ${data.periodA.label} ${comparisonMoney(r.a, o)}, ${data.periodB.label} ${comparisonMoney(r.b, o)}, ${CHANGE_LABEL[ch.direction]} ${formatChangeAmount(ch.amount, o)} ${formatChangePercent(ch, o)}`,
      cells: [
        <View key="name" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 24 }}>{canExpand && <Icon name={open ? 'expand-more' : 'chevron-right'} color={c.ink} />}</View>
          <Icon name={iconFor(r.iconKey)} size={22} color={c.ink} />
          <Text style={{ fontSize: 16, fontWeight: '500', color: c.ink }}>{r.name}</Text>
        </View>,
        comparisonMoney(r.a, o),
        comparisonMoney(r.b, o),
        ...changeCells(r.a, r.b),
      ],
    });
    if (open) {
      for (const m of r.merchants) {
        tableRows.push({
          key: `${r.categoryId}/${m.name}`,
          tone: 'sub',
          cells: [m.name, comparisonMoney(m.a, o), comparisonMoney(m.b, o), ...changeCells(m.a, m.b)],
        });
      }
    }
  }
  tableRows.push({ key: 'total', tone: 'total', cells: ['Total spending', comparisonMoney(total.a, o), comparisonMoney(total.b, o), ...changeCells(total.a, total.b)] });

  const later = monthOnly(data.periodB.label);
  const table = (
    <DTable
      bare
      compact={compact}
      columns={columns}
      rows={tableRows}
      empty="No spending in these months. Choose other months or categories."
    />
  );
  return (
    <View style={{ gap: 20 }}>
      {o.showSummary && (
        <View style={{ flexDirection: desktop ? 'row' : 'column', gap: 24 }}>
          <Summary label={`Total spending · ${data.periodA.shortLabel}`} value={comparisonMoney(total.a, o)} />
          <Summary label={`Total spending · ${data.periodB.shortLabel}`} value={comparisonMoney(total.b, o)} />
          <Summary label="Change" value={formatChangeAmount(change.amount, o)} change={change} options={o} />
        </View>
      )}
      <Panel padding={0} style={{ overflow: 'hidden', gap: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <DButton label={compact ? 'Compact' : 'Comfortable'} icon="density-medium" kind="text" onPress={ctl.toggleDensity} accessibilityLabel={`Table density: ${o.density}. Switch`} />
          </View>
          <View style={{ flex: 2, alignItems: 'center' }}>
            {o.showTitle && <Heading style={{ fontSize: 20, fontWeight: '600', color: c.ink }}>Spending by Category</Heading>}
            {o.showPeriod && (
              <Text style={[DText.small, { color: c.muted }]}>
                {data.periodA.label} vs {data.periodB.label}
              </Text>
            )}
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Tap onPress={() => ctl.download('pdf')} label="Print (save as PDF)">
              <Icon name="print" color={c.ink} />
            </Tap>
            <Tap onPress={() => ctl.download('csv')} label="Download CSV">
              <Icon name="file-download" color={c.ink} />
            </Tap>
          </View>
        </View>
        {desktop ? (
          table
        ) : (
          <ScrollView horizontal>
            <View style={{ minWidth: 760 }}>{table}</View>
          </ScrollView>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 20, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: c.line }}>
          <Text style={[DText.small, { color: c.muted }]}>↑ Up = spent more in {later}</Text>
          <Text style={[DText.small, { color: c.muted }]}>↓ Down = spent less</Text>
          <Text style={[DText.small, { color: c.muted }]}>— No change</Text>
          {o.expandableRows && <Text style={[DText.small, { color: c.muted, marginLeft: 'auto' }]}>Expand a category to see the transactions behind it</Text>}
        </View>
      </Panel>
    </View>
  );
}

function Summary({ label, value, change, options }: { label: string; value: string; change?: Change; options?: ComparisonOptions }) {
  const { colors: c } = useDisplay();
  const tinted = change && options?.showStatusColors && change.direction !== 'none';
  const up = change?.direction === 'up';
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: change && options?.summaryPatterns ? 'dashed' : 'solid',
        borderColor: tinted ? (up ? c.red : c.olive) : c.line,
        backgroundColor: tinted ? (up ? `${c.redBg}66` : `${c.lime}33`) : c.surface,
        paddingHorizontal: 20,
        paddingVertical: 18,
        gap: 4,
      }}
    >
      <Text style={[DText.small, { color: c.muted }]}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={[DText.big, { color: c.ink }]}>{value}</Text>
        {change && options && <ChangeBadge change={change} options={options} plain />}
      </View>
    </View>
  );
}

/** A change as arrow + "Up +28.9%" (each part per the options), highlighted when it's big enough. */
function ChangeBadge({ change, options: o, plain }: { change: Change; options: ComparisonOptions; plain?: boolean }) {
  const { colors: c } = useDisplay();
  if (change.direction === 'none') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {o.showArrows && <Icon name="remove" size={18} color={c.ink} />}
        <View style={{ backgroundColor: c.chip, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ fontSize: 12, fontWeight: '500', color: c.ink }}>{CHANGE_LABEL.none}</Text>
        </View>
      </View>
    );
  }
  const up = change.direction === 'up';
  const tone = o.showStatusColors ? (up ? c.red : c.olive) : c.ink;
  const percent = formatChangePercent(change, o);
  const text = o.showTextLabels ? `${CHANGE_LABEL[change.direction]} ${percent}` : percent;
  const highlighted = !plain && isHighlighted(change, o);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {o.showArrows && <Icon name={up ? 'arrow-upward' : 'arrow-downward'} size={18} color={tone} />}
      <View
        style={
          highlighted
            ? { backgroundColor: o.showStatusColors ? (up ? c.redBg : c.lime) : c.chip, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }
            : undefined
        }
      >
        <Text style={{ fontSize: 12, fontWeight: '600', color: o.showStatusColors && highlighted && !up ? '#1A1A1A' : tone }}>{text}</Text>
      </View>
    </View>
  );
}

function CustomizeDrawer({ controller: ctl }: { controller: ComparisonController }) {
  const { colors: c } = useDisplay();
  const d = ctl.draft;
  const set = ctl.updateDraft;
  const rows = ctl.data.state.data?.rows ?? [];
  // The categories worth offering: those with spending, plus any already chosen.
  const offered = rows.filter((r) => r.a > 0 || r.b > 0 || d?.categoryIds?.includes(r.categoryId));
  return (
    <Drawer
      visible={!!d}
      title="Customize"
      onClose={ctl.cancelCustomize}
      footer={
        <>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <DButton label="Reset" kind="text" onPress={ctl.resetDraft} accessibilityLabel="Reset to defaults" />
          </View>
          <DButton label="Cancel" kind="text" onPress={ctl.cancelCustomize} />
          <DButton label="Apply changes" kind="primary" onPress={ctl.applyCustomize} disabled={!!ctl.draftProblem} />
        </>
      }
    >
      {d && (
        <>
          <Tabs
            tabs={[
              { label: 'Data', icon: 'table-chart' },
              { label: 'Visual', icon: 'palette' },
            ]}
            selected={ctl.tab === 'data' ? 0 : 1}
            onChange={(i) => ctl.setTab(i === 0 ? 'data' : 'visual')}
          />
          {ctl.tab === 'data' ? (
            <>
              <SubHeading title="Categories" action="Select all" onAction={ctl.selectAllCategories} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {offered.length === 0 && <Text style={[DText.body, { color: c.muted }]}>No spending in these months yet.</Text>}
                {offered.map((r) => {
                  const on = !d.categoryIds || d.categoryIds.includes(r.categoryId);
                  return <DChip key={r.categoryId} label={r.name} selected={on} icon="add" role="checkbox" onPress={() => ctl.toggleDraftCategory(r.categoryId)} />;
                })}
              </View>
              {ctl.draftProblem && (
                <Text role="alert" style={[DText.small, { color: c.red, marginTop: 8 }]}>
                  {ctl.draftProblem}
                </Text>
              )}
              <Divider />
              <SubHeading title="Show categories" />
              <KeyGroup role="radiogroup" label="Show categories" style={{ gap: 4 }}>
                <Radio label="All categories" selected={d.showEmpty} onPress={() => set({ showEmpty: true })} />
                <Radio label="Only categories with spending" selected={!d.showEmpty} onPress={() => set({ showEmpty: false })} />
              </KeyGroup>
              <Divider />
              <SubHeading title="Columns" />
              <Checkbox label="$ Change" checked={d.showDollarChange} onChange={(v) => set({ showDollarChange: v })} />
              <Checkbox label="% Change" checked={d.showPercentChange} onChange={(v) => set({ showPercentChange: v })} />
              <Checkbox label="Transactions in expanded rows" checked={d.expandableRows} onChange={(v) => set({ expandableRows: v })} />
              <Divider />
              <SubHeading title="Number format" />
              <Text style={[DText.small, { color: c.muted, marginBottom: 8 }]}>Decimal places</Text>
              <Segmented label="Decimal places" labels={['$1,500', '$1,500.00']} selected={d.decimals === 0 ? 0 : 1} onChange={(i) => set({ decimals: i === 0 ? 0 : 2 })} />
              <View style={{ height: 8 }} />
              <Checkbox label="Show negative changes in parentheses" checked={d.negativeInParentheses} onChange={(v) => set({ negativeInParentheses: v })} />
            </>
          ) : (
            <>
              <SubHeading title="Header" />
              <Checkbox label="Report title" checked={d.showTitle} onChange={(v) => set({ showTitle: v })} />
              <Checkbox label="Reporting period" checked={d.showPeriod} onChange={(v) => set({ showPeriod: v })} />
              <Checkbox label="Summary cards" checked={d.showSummary} onChange={(v) => set({ showSummary: v })} />
              <Divider />
              <SubHeading title="Table density" />
              <Segmented label="Table density" labels={['Comfortable', 'Compact']} selected={d.density === 'compact' ? 1 : 0} onChange={(i) => set({ density: i ? 'compact' : 'comfortable' })} />
              <Divider />
              <SubHeading title="Change indicators" />
              <Text style={[DText.small, { color: c.muted, marginBottom: 8 }]}>Changes always show a sign and a label, so they work without color.</Text>
              <Checkbox label="Arrow icons" checked={d.showArrows} onChange={(v) => set({ showArrows: v })} />
              <Checkbox label="Text labels (Up / Down)" checked={d.showTextLabels} onChange={(v) => set({ showTextLabels: v })} />
              <Checkbox label="Status colors" checked={d.showStatusColors} onChange={(v) => set({ showStatusColors: v })} />
              <Checkbox label="Patterns in summary cards" checked={d.summaryPatterns} onChange={(v) => set({ summaryPatterns: v })} />
              <Divider />
              <SubHeading title="Highlight changes over" />
              <SelectField label="Highlight changes over" value={highlightLabel(d.highlightPercent)} onPress={ctl.pickHighlight} />
            </>
          )}
        </>
      )}
    </Drawer>
  );
}

/** A drop-down field (opens a list to choose from). */
function SelectField({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const { colors: c } = useDisplay();
  return (
    <Tap onPress={onPress} label={`${label}: ${value}`} style={{ alignItems: 'stretch' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 48, borderWidth: 1, borderColor: c.outline, borderRadius: 6, paddingHorizontal: 14, backgroundColor: c.surface }}>
        <Text style={{ flex: 1, fontSize: 16, color: c.ink }}>{value}</Text>
        <Icon name="expand-more" color={c.ink} />
      </View>
    </Tap>
  );
}

function Divider() {
  const { colors: c } = useDisplay();
  return <View style={{ height: 1, backgroundColor: c.line, marginTop: 20 }} />;
}
