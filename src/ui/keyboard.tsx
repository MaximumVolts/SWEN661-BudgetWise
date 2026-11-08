import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, type PressableProps, type StyleProp, View, type ViewProps, type ViewStyle } from 'react-native';
import { commandFromId, matchShortcut, type ShortcutCommand } from '../models/shortcuts';

/**
 * Keyboard support for the desktop (web) build: the global shortcut listener, arrow keys inside
 * tab lists / radio groups / pickers, and Space on checkboxes, switches and tabs. Everything here
 * does nothing on phones.
 */

const web = Platform.OS === 'web';

/** The page area the "Skip to main content" link jumps to. */
export const MAIN_CONTENT_ID = 'pace-main';
/** The top bar's search box (Ctrl/⌘ + K). */
export const SEARCH_INPUT_ID = 'pace-search';

type DesktopCommands = { platform?: string; onCommand?: (listener: (id: string) => void) => () => void };
const desktopShell = () => (globalThis as { paceDesktop?: DesktopCommands }).paceDesktop;

/** Whether this is a Mac (⌘ shortcuts, ⌘ in the hints). */
export function isMac(): boolean {
  if (!web) return Platform.OS === 'ios';
  const platform = desktopShell()?.platform;
  if (platform) return platform === 'darwin';
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}

/** Moves keyboard focus to the element with [id], if it's on screen. True if it did. */
export function focusById(id: string): boolean {
  if (!web || typeof document === 'undefined') return false;
  const el = document.getElementById(id);
  if (!el || el.getClientRects().length === 0) return false;
  el.focus();
  return document.activeElement === el;
}

/** Moves focus to the page (main content) once a navigation has rendered, so Tab carries on there. */
export function focusPageSoon() {
  if (web) setTimeout(() => focusById(MAIN_CONTENT_ID), 50);
}

/** A dialog, panel or picker is open (keyboard shortcuts leave it alone). */
const modalOpen = () => typeof document !== 'undefined' && document.querySelector('[aria-modal="true"]') !== null;

/** Focus is somewhere text is typed. */
function typingIn(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && !['checkbox', 'radio', 'button', 'submit'].includes((el as HTMLInputElement).type)) || (el as HTMLElement).isContentEditable;
}

/**
 * Calls [onCommand] for the app's keyboard shortcuts, the mouse's Back / Forward buttons and the
 * Electron menu's commands. While a dialog is open only the dialog gets keys (Ctrl/⌘ + S and P
 * are still kept from the browser, which would otherwise offer to save or print the page).
 */
export function useShortcutListener(onCommand: (command: ShortcutCommand) => void) {
  const latest = useRef(onCommand);
  useEffect(() => {
    latest.current = onCommand;
  });
  useEffect(() => {
    if (!web || typeof window === 'undefined') return undefined;
    const mac = isMac();
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const command = matchShortcut(e, { mac, typing: typingIn(document.activeElement) });
      if (!command) return;
      if (modalOpen()) {
        if (command.kind === 'save' || command.kind === 'print') e.preventDefault();
        return;
      }
      e.preventDefault();
      if (!e.repeat) latest.current(command);
    };
    const onMouse = (e: MouseEvent) => {
      if ((e.button !== 3 && e.button !== 4) || modalOpen()) return;
      e.preventDefault();
      latest.current({ kind: e.button === 3 ? 'back' : 'forward' });
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mouseup', onMouse);
    const stopMenu = desktopShell()?.onCommand?.((id) => {
      const command = commandFromId(id);
      if (command && !modalOpen()) latest.current(command);
    });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mouseup', onMouse);
      stopMenu?.();
    };
  }, []);
}

// ── Space ─────────────────────────────────────────────────────────────────────

/** Roles a browser toggles with Space (react-native-web only does buttons). */
const SPACE_ROLES = new Set(['checkbox', 'radio', 'switch', 'tab', 'option']);

/**
 * Props that make Space press a control with [role] (Enter already does), as on a native
 * checkbox or switch. Spread onto a Pressable; nothing on phones.
 */
export function spaceKeyProps(role: string | undefined, onPress: ((event: never) => unknown) | undefined): object {
  if (!web || !onPress || !role || !SPACE_ROLES.has(role)) return {};
  return {
    onKeyDown: (e: { key: string; preventDefault(): void }) => {
      if (e.key !== ' ' && e.key !== 'Spacebar') return;
      e.preventDefault(); // not a page scroll
      void onPress(e as never);
    },
  };
}

/** Clear keyboard focus outline (WCAG 2.4.7). An outline does not shift the layout. */
export function focusRing(color: string): ViewStyle {
  return { outlineColor: color, outlineWidth: 3, outlineStyle: 'solid', outlineOffset: 2, borderRadius: 8 };
}

/**
 * A Pressable that shows the focus ring (in [ringColor]) while focused, and that Space presses
 * when its role is one a browser toggles with Space.
 */
export function FocusPressable({ ringColor, style, onFocus, onBlur, ...props }: PressableProps & { ringColor: string }) {
  const [focused, setFocused] = useState(false);
  const role = (props.role as string | undefined) ?? props.accessibilityRole;
  return (
    <Pressable
      {...props}
      {...spaceKeyProps(role, props.disabled ? undefined : (props.onPress ?? undefined))}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={(state) => [typeof style === 'function' ? style(state) : style, focused && focusRing(ringColor)]}
    />
  );
}

// ── Arrow keys in groups ──────────────────────────────────────────────────────

const ITEMS = '[role="tab"],[role="radio"],[role="option"]';

const itemsIn = (group: HTMLElement) =>
  Array.from(group.querySelectorAll<HTMLElement>(ITEMS)).filter((el) => el.getAttribute('aria-disabled') !== 'true');

const isChosen = (el: HTMLElement) => el.getAttribute('aria-selected') === 'true' || el.getAttribute('aria-checked') === 'true';

/**
 * A tab list, radio group or list box that is one Tab stop: Tab lands on the chosen item, and
 * ← → ↑ ↓ / Home / End move between items. In tab lists and radio groups moving also chooses
 * (as browsers do for radio buttons); in a list box Enter chooses.
 */
export function KeyGroup({
  role,
  label,
  style,
  children,
  focusChosen,
}: {
  role: 'tablist' | 'radiogroup' | 'listbox';
  label?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  /** Move focus to the chosen item when the group appears (pickers in a dialog). */
  focusChosen?: boolean;
}) {
  const ref = useRef<View>(null);
  const element = () => (web ? (ref.current as unknown as HTMLElement | null) : null);

  // Roving tab stop: only the chosen item (or the first) is in the Tab order.
  useEffect(() => {
    const group = element();
    if (!group?.querySelectorAll) return;
    const items = itemsIn(group);
    const chosen = Math.max(0, items.findIndex(isChosen));
    items.forEach((el, i) => (el.tabIndex = i === chosen ? 0 : -1));
  });

  /** The user has moved within the group (so focus is theirs, not ours, to place). */
  const moved = useRef(false);

  useEffect(() => {
    if (!focusChosen) return undefined;
    const focus = () => {
      const group = element();
      if (moved.current || !group?.querySelectorAll) return;
      const items = itemsIn(group);
      (items.find(isChosen) ?? items[0])?.focus();
    };
    // Once the dialog's own focus handling has run, and again once it has faded in: a dialog's
    // focus trap only takes over then, and one opened over another panel may move focus first.
    const timers = [setTimeout(focus, 0), setTimeout(focus, 450)];
    return () => timers.forEach(clearTimeout);
  }, [focusChosen]);

  const onKeyDown = (e: { key: string; preventDefault(): void; target: unknown }) => {
    const group = element();
    if (!group?.querySelectorAll) return;
    const items = itemsIn(group);
    const at = items.indexOf(e.target as HTMLElement);
    if (at < 0) return;
    const horizontal = role === 'tablist';
    const step: Record<string, number | 'first' | 'last'> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ...(horizontal ? {} : { ArrowDown: 1, ArrowUp: -1 }),
      ...(role === 'radiogroup' ? { ArrowDown: 1, ArrowUp: -1 } : {}),
      Home: 'first',
      End: 'last',
    };
    const move = step[e.key];
    if (move === undefined) return;
    e.preventDefault();
    moved.current = true;
    const next = move === 'first' ? 0 : move === 'last' ? items.length - 1 : (at + move + items.length) % items.length;
    const target = items[next];
    target.focus();
    if (role !== 'listbox') target.click();
  };

  return (
    // React Native's Role type lacks 'listbox'; react-native-web passes it through.
    <View ref={ref} role={role as ViewProps['role']} accessibilityLabel={label} style={style} {...(web ? { onKeyDown } : {})}>
      {children}
    </View>
  );
}
