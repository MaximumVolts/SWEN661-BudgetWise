import { useEffect, useRef } from 'react';
import { useDisplay } from '../state/PreferencesContext';
import { isoDate, parseIsoDate } from '../utils/calendar';
import type { DatePickerProps } from './DatePicker';

export type { DatePickerProps } from './DatePicker';

/**
 * Desktop (Electron/web): the browser's own date input, opened at once and focused so it works by
 * keyboard as well as mouse. Choosing a date or leaving the field closes it.
 */
export function DatePicker({ value, minimumDate, onDone }: DatePickerProps) {
  const { colors: c } = useDisplay();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.focus();
    try {
      el.showPicker();
    } catch {
      // Not allowed without a user gesture in some browsers; the focused field still works.
    }
  }, []);

  return (
    <input
      ref={input}
      type="date"
      aria-label="Choose a date"
      defaultValue={isoDate(value)}
      min={minimumDate ? isoDate(minimumDate) : undefined}
      onChange={(e) => {
        const date = parseIsoDate(e.currentTarget.value);
        if (date) onDone(date);
      }}
      onBlur={() => onDone(undefined)}
      onKeyDown={(e) => e.key === 'Escape' && onDone(undefined)}
      style={{
        marginTop: 8,
        minHeight: 48,
        padding: '8px 12px',
        fontSize: 18,
        borderRadius: 12,
        border: `2px solid ${c.ink}`,
        color: c.ink,
        backgroundColor: c.surface,
        colorScheme: 'light',
      }}
    />
  );
}
