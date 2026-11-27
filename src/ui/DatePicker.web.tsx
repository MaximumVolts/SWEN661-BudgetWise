import { useEffect, useRef } from 'react';
import { useDisplay } from '../state/PreferencesContext';
import { isoDate, parseIsoDate } from '../utils/calendar';
import type { DatePickerProps } from './DatePicker';

export type { DatePickerProps } from './DatePicker';

/** A change this soon after a key press in the field came from typing (or ↑ ↓), not the calendar. */
const TYPED_MS = 150;

/**
 * Desktop (Electron/web): the browser's own date input, focused at once so it works by keyboard as
 * well as mouse; clicked open, its calendar pop-up opens too.
 *   • A day picked in the calendar pop-up sets the date at once.
 *   • Typing a date, or ↑ ↓ on a part of it, only edits it (each key would otherwise set a date
 *     and close the field before the rest is typed). Enter, or leaving the field after editing,
 *     sets it.
 *   • Esc, or leaving the field without editing, cancels.
 */
export function DatePicker({ value, minimumDate, onDone, showCalendar = true }: DatePickerProps) {
  const { colors: c } = useDisplay();
  const input = useRef<HTMLInputElement>(null);
  const typedAt = useRef(0);
  const edited = useRef(false);
  const finished = useRef(false);

  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.focus();
    // Opened from the keyboard, no pop-up: it would take the keys, so typing a date would do
    // nothing. The focused field takes digits and ↑ ↓ instead.
    if (!showCalendar) return;
    try {
      el.showPicker();
    } catch {
      // Not allowed without a user gesture in some browsers; the focused field still works.
    }
  }, [showCalendar]);

  const finish = (date: Date | undefined) => {
    if (finished.current) return;
    finished.current = true;
    onDone(date);
  };
  const shown = () => parseIsoDate(input.current?.value ?? '');

  return (
    <input
      ref={input}
      type="date"
      aria-label="Choose a date"
      defaultValue={isoDate(value)}
      min={minimumDate ? isoDate(minimumDate) : undefined}
      onKeyDown={(e) => {
        typedAt.current = Date.now();
        if (e.key === 'Escape') {
          e.preventDefault();
          finish(undefined);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          finish(shown());
        }
      }}
      onChange={(e) => {
        if (Date.now() - typedAt.current < TYPED_MS) {
          edited.current = true;
          return;
        }
        const date = parseIsoDate(e.currentTarget.value);
        if (date) finish(date);
      }}
      onBlur={() => finish(edited.current ? shown() : undefined)}
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
