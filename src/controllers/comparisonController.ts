import { useEffect, useState } from 'react';
import { type ComparisonOptions, DEFAULT_COMPARISON_OPTIONS, HIGHLIGHT_CHOICES, highlightLabel } from '../models/comparison';
import type { StatementFormat } from '../models/statement';
import { useDialogs } from '../state/DialogContext';
import { useNotice } from '../state/NoticeContext';
import { useServices } from '../state/ServicesContext';
import { usePageShortcut } from '../state/ShortcutsContext';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

export type CustomizeTab = 'data' | 'visual';

/**
 * Monthly Comparison: spending by category in two months. Months are picked, then compared; the
 * Customize panel edits a copy of the options that applies (and is kept for the user) only on
 * "Apply changes".
 */
export function useComparisonController() {
  const { comparison, bankLink } = useServices();
  const { choose } = useDialogs();
  const notify = useNotice();
  const perform = useAction();

  const months = useAsyncData(() => comparison.months(), [comparison]);
  const [periods, setPeriods] = useState(() => comparison.defaultPeriods());
  const [picked, setPicked] = useState(periods);
  const data = useAsyncData(() => comparison.compare(periods.a, periods.b), [comparison, periods.a, periods.b], [bankLink.dataUpdates]);

  /** What's on screen: the user's saved choices once loaded (the defaults until then). */
  const [options, setOptions] = useState<ComparisonOptions>(DEFAULT_COMPARISON_OPTIONS);
  /** The Customize panel's edits; undefined while it's closed. */
  const [draft, setDraft] = useState<ComparisonOptions>();
  const [tab, setTab] = useState<CustomizeTab>('data');
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    let live = true;
    comparison.options().then(
      (saved) => live && setOptions(saved),
      () => undefined, // keep the defaults
    );
    return () => {
      live = false;
    };
  }, [comparison]);

  const monthLabel = (id: string) => months.state.data?.find((m) => m.id === id)?.label ?? id;

  const pickPeriod = async (which: 'a' | 'b') => {
    const list = months.state.data ?? [];
    const id = await choose({
      title: which === 'a' ? 'Period A' : 'Period B',
      options: list.map((m) => ({ id: m.id, label: m.label })),
      selectedId: picked[which],
    });
    if (id) setPicked((p) => ({ ...p, [which]: id }));
  };

  const allCategoryIds = () => data.state.data?.rows.map((r) => r.categoryId) ?? [];

  /** Shows and keeps [next]; resolves true if they were kept. */
  const keep = (next: ComparisonOptions) =>
    perform(async () => {
      setOptions(await comparison.saveOptions(next));
    });

  /** Saves the comparison as shown: CSV, or a printable PDF. */
  const download = (format: StatementFormat) =>
    perform(async () => {
      const shown = data.state.data;
      if (!shown) return;
      const name = await comparison.download(shown, options, format);
      if (name) notify(`Saved ${name}`);
    });
  usePageShortcut('print', () => download('pdf')); // Ctrl/⌘ + P

  return {
    data,
    months,
    /** The months picked (compared once [compare] runs). */
    picked,
    pickedLabels: { a: monthLabel(picked.a), b: monthLabel(picked.b) },
    /** Picked months differ from those on screen. */
    canCompare: picked.a !== periods.a || picked.b !== periods.b,
    pickPeriod,
    swap: () => setPicked((p) => ({ a: p.b, b: p.a })),
    compare: () => {
      if (picked.a === picked.b) return notify('Choose two different months to compare.');
      setPeriods(picked);
    },

    options,
    /** What the Categories field says. */
    categoriesLabel: comparison.categoriesLabel(data.state.data, options),
    expanded,
    toggleRow: (categoryId: string) =>
      setExpanded((s) => {
        const next = new Set(s);
        if (next.has(categoryId)) next.delete(categoryId);
        else next.add(categoryId);
        return next;
      }),
    toggleDensity: () => keep({ ...options, density: options.density === 'compact' ? 'comfortable' : 'compact' }),

    // Customize panel
    draft,
    /** Why the draft can't be applied, if it can't (Apply is then disabled). */
    draftProblem: draft && comparison.problemWith(draft),
    tab,
    setTab,
    openCustomize: (start: CustomizeTab = 'data') => {
      setTab(start);
      setDraft(options);
    },
    updateDraft: (patch: Partial<ComparisonOptions>) => setDraft((d) => d && { ...d, ...patch }),
    toggleDraftCategory: (id: string) => setDraft((d) => d && comparison.toggleCategory(d, id, allCategoryIds())),
    selectAllCategories: () => setDraft((d) => d && comparison.selectAllCategories(d)),
    resetDraft: () => setDraft((d) => d && comparison.defaultOptions()),
    pickHighlight: async () => {
      if (!draft) return;
      const id = await choose({
        title: 'Highlight changes over',
        options: HIGHLIGHT_CHOICES.map((p) => ({ id: String(p), label: highlightLabel(p) })),
        selectedId: String(draft.highlightPercent),
      });
      if (id !== undefined) setDraft((d) => d && { ...d, highlightPercent: Number(id) });
    },
    applyCustomize: async () => {
      if (!draft) return;
      if (await keep(draft)) {
        setDraft(undefined);
        notify('Customization applied');
      }
    },
    cancelCustomize: () => setDraft(undefined),

    download,
  };
}

export type ComparisonController = ReturnType<typeof useComparisonController>;
