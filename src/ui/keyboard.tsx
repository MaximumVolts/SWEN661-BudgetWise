import { type ReactNode, type Ref, type RefObject, useEffect, useRef, useState } from 'react';
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

/**
 * Remembers where keyboard focus is now (say, the button that opens a dialog). The function it
 * returns puts focus back there if focus has since been lost: to the page body, or to an element
 * that's gone (a closed dialog's text field). If that element is gone too, focus goes to the page.
 * Checked again once a fading dialog has gone. Nothing on phones.
 */
export function rememberFocus(): () => void {
  if (!web || typeof document === 'undefined') return () => {};
  const from = document.activeElement as HTMLElement | null;
  const lost = () => {
    const now = document.activeElement;
    return !now || now === document.body || !now.isConnected;
  };
  const restore = () => {
    if (!lost()) return;
    if (from && from !== document.body && from.isConnected) from.focus();
    else focusById(MAIN_CONTENT_ID);
  };
  return () => {
    setTimeout(restore, 0);
    setTimeout(restore, 400);
  };
}

/**
 * Moves focus to the page (main content) if it has been lost (to the body: the control that had
 * it went away, as on signing in or out). Focus that is somewhere is left there.
 */
export function focusPageIfLost() {
  if (!web || typeof document === 'undefined') return;
  setTimeout(() => {
    const now = document.activeElement;
    if (!now || now === document.body || !now.isConnected) focusById(MAIN_CONTENT_ID);
  }, 50);
}

/** Moves focus to the page (main content) once a navigation has rendered, so Tab carries on there. */
export function focusPageSoon() {
  if (web) setTimeout(() => focusById(MAIN_CONTENT_ID), 50);
}

/**
 * When [error] appears on a form field (through [ref]) that is the page's first invalid one, scroll
 * it into view and focus it, so a rejected form shows what to fix even when the field is scrolled
 * out of sight. Fields mark themselves with aria-invalid. Nothing on phones.
 */
export function useRevealFirstError(ref: RefObject<unknown>, error: string | undefined) {
  useEffect(() => {
    if (!web || !error || typeof document === 'undefined') return undefined;
    // Once every field has rendered its error, so the first one in the page wins.
    const t = setTimeout(() => {
      const el = ref.current as HTMLElement | null;
      if (!el || document.querySelector('[aria-invalid="true"]') !== el) return;
      el.scrollIntoView?.({ block: 'center' });
      el.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [ref, error]);
}

/**
 * The spoken label of a control whose visible text already names it (a table row, a card, a
 * picker showing its label and value). Phones read [label] instead of the parts. On desktop there
 * is none: the control is named by its visible text, in order, so what speech-input users say and
 * screen readers read is what is on screen (WCAG 2.5.3 Label in Name).
 */
export const phoneLabel = (label: string | undefined): string | undefined => (web ? undefined : label);

/** Props for a Modal that name its dialog (react-native-web gives the dialog element its aria-label). */
export const dialogName = (title: string): object => ({ 'aria-label': title });

/**
 * The dimmed area behind a dialog or panel; a click on it closes. Put it after the dialog's content
 * (so focus starts inside the dialog). On desktop it is hidden from screen readers and is never a
 * Tab stop (they close with Esc or the Close button); on phones it's a "Close" button.
 */
export function Backdrop({ onPress, style }: { onPress: () => void; style?: StyleProp<ViewStyle> }) {
  const fill: StyleProp<ViewStyle> = [{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }, style];
  if (web) {
    // A plain view, which can't take focus at all. (A Pressable, even with tabIndex -1, can be
    // focused by script, and the dialog's focus trap does that when Shift+Tab wraps past the
    // first control: focus would land on the invisible backdrop.)
    return <View aria-hidden {...({ onClick: onPress } as object)} style={fill} />;
  }
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Close" style={fill} />;
}

/** The Tab stops inside [root], in order: what Tab visits (not what is merely focusable by script). */
export function tabStopsIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,[tabindex]')).filter(
    (el) => el.tabIndex >= 0 && !(el as HTMLButtonElement).disabled && el.getClientRects().length > 0 && !el.closest('[aria-hidden="true"]'),
  );
}

/**
 * Spread on a dialog's panel (desktop): Tab and Shift+Tab go round the panel's Tab stops, wrapping
 * at either end, so focus never leaves it. react-native-web's Modal also keeps focus in, but by
 * moving it to anything that takes focus by script when it wraps: a scroll area, which Shift+Tab
 * then can't leave. Caught on the way down, as text fields keep their key events to themselves.
 */
export const tabCycleProps: object = web
  ? {
      onKeyDownCapture: (e: { key: string; shiftKey: boolean; currentTarget: unknown; preventDefault(): void }) => {
        if (e.key !== 'Tab') return;
        const stops = tabStopsIn(e.currentTarget as HTMLElement);
        if (stops.length === 0) return;
        e.preventDefault();
        const n = stops.length;
        const active = document.activeElement as HTMLElement | null;
        let at = active ? stops.indexOf(active) : -1;
        if (at < 0) {
          // Focus is on something that isn't a Tab stop (a scroll area): go on from where it is.
          const before = active ? stops.filter((s) => s.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING).length : 0;
          at = e.shiftKey ? before : before - 1;
        }
        stops[(((e.shiftKey ? at - 1 : at + 1) % n) + n) % n].focus();
      },
    }
  : {};

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
 * [singleKey]: whether single-key shortcuts (?) work (default true).
 */
export function useShortcutListener(onCommand: (command: ShortcutCommand) => void, { singleKey = true }: { singleKey?: boolean } = {}) {
  const latest = useRef(onCommand);
  const singleKeyOn = useRef(singleKey);
  useEffect(() => {
    latest.current = onCommand;
    singleKeyOn.current = singleKey;
  });
  useEffect(() => {
    if (!web || typeof window === 'undefined') return undefined;
    const mac = isMac();
    const seen = new WeakSet<Event>();
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || seen.has(e)) return;
      const command = matchShortcut(e, { mac, typing: typingIn(document.activeElement), singleKey: singleKeyOn.current });
      if (!command) return;
      seen.add(e);
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
    // react-native-web's text fields stop their key events from bubbling, so a shortcut pressed
    // while typing (Ctrl/⌘ + S in a form) would never get here: catch those on the way down.
    const onKeyInField = (e: KeyboardEvent) => {
      if (typingIn(e.target as Element | null)) onKey(e);
    };
    window.addEventListener('keydown', onKeyInField, true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('mouseup', onMouse);
    const stopMenu = desktopShell()?.onCommand?.((id) => {
      const command = commandFromId(id);
      if (command && !modalOpen()) latest.current(command);
    });
    return () => {
      window.removeEventListener('keydown', onKeyInField, true);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mouseup', onMouse);
      stopMenu?.();
    };
  }, []);
}

/** Whether the last thing the user did was press a key (rather than click, tap or touch). */
let lastInputWasKey = false;
if (web && typeof document !== 'undefined') {
  document.addEventListener('keydown', () => (lastInputWasKey = true), true);
  document.addEventListener('pointerdown', () => (lastInputWasKey = false), true);
}

/**
 * Whether the user is working from the keyboard: their last input was a key press (Enter or Space
 * on the control being pressed, say), not a click or tap. False on phones.
 */
export const usingKeyboard = (): boolean => web && lastInputWasKey;

// ── Enter and Space ───────────────────────────────────────────────────────────

/** Roles a browser toggles with Space (react-native-web only does buttons). */
const SPACE_ROLES = new Set(['checkbox', 'radio', 'switch', 'tab', 'option']);

/**
 * Props that make the keys a browser presses a control with work on a Pressable with [role]:
 *   • Space on a checkbox, radio, switch, tab or option (Enter already works), and
 *   • Enter on a link. react-native-web leaves Enter on role="link" to the browser, as if it were
 *     an <a href>; on our <div role="link"> the browser does nothing, so Enter would be lost.
 * Spread onto a Pressable; nothing on phones.
 */
export function pressKeyProps(role: string | undefined, onPress: ((event: never) => unknown) | undefined): object {
  if (!web || !onPress || !role) return {};
  const keys = SPACE_ROLES.has(role) ? [' ', 'Spacebar'] : role === 'link' ? ['Enter'] : [];
  if (keys.length === 0) return {};
  return {
    onKeyDown: (e: { key: string; repeat?: boolean; preventDefault(): void }) => {
      if (!keys.includes(e.key)) return;
      e.preventDefault(); // not a page scroll
      if (!e.repeat) void onPress(e as never);
    },
  };
}

/**
 * For a text input drawn inside a bordered box: no browser outline on the bare input (it would
 * ring only the text, not the box). The box shows focus instead, on its border.
 */
export const bareInput: object = web ? { outlineStyle: 'none' } : {};

/**
 * The focus ring's rule for everything that doesn't draw its own (a plain Pressable, a scrolling
 * list), in place of the browser's thin default. Left out: text fields (their box's border shows
 * focus) and elements only focused by script (tabindex -1, like the page area after navigating).
 */
export const focusRingRule = (color: string) =>
  `:focus-visible:not(input):not(textarea):not(select):not([tabindex="-1"]) { outline: 3px solid ${color}; outline-offset: 2px; }`;

/**
 * Windows High Contrast (forced colours) removes background fills, and with them the filled pill
 * that marks the current page in the sidebar and the fill of a chosen chip or tab. Those get the
 * system's selection colours instead, so what is current or chosen still shows.
 */
export const FORCED_COLORS_RULE = `@media (forced-colors: active) {
  [aria-current="page"], [role="tab"][aria-selected="true"], [role="radio"][aria-checked="true"] {
    forced-color-adjust: none; background-color: Highlight !important; border-color: Highlight !important;
  }
  [aria-current="page"], [aria-current="page"] *, [role="tab"][aria-selected="true"], [role="tab"][aria-selected="true"] *,
  [role="radio"][aria-checked="true"], [role="radio"][aria-checked="true"] * {
    color: HighlightText !important; border-color: HighlightText;
  }
}`;

/** Desktop: adds focusRingRule in [color] and FORCED_COLORS_RULE to the page (and keeps them in step with the theme). */
export function FocusRingStyle({ color }: { color: string }) {
  useEffect(() => {
    if (!web || typeof document === 'undefined') return undefined;
    const style = document.createElement('style');
    style.textContent = `${focusRingRule(color)}\n${FORCED_COLORS_RULE}`;
    document.head.appendChild(style);
    return () => style.remove();
  }, [color]);
  return null;
}

/** Clear keyboard focus outline (WCAG 2.4.7). An outline does not shift the layout. */
export function focusRing(color: string): ViewStyle {
  return { outlineColor: color, outlineWidth: 3, outlineStyle: 'solid', outlineOffset: 2, borderRadius: 8 };
}

/**
 * A Pressable that shows the focus ring (in [ringColor]) while focused, and that Space presses
 * when its role is one a browser toggles with Space.
 */
export function FocusPressable({ ringColor, style, onFocus, onBlur, ...props }: PressableProps & { ringColor: string; ref?: Ref<View> }) {
  const [focused, setFocused] = useState(false);
  const role = (props.role as string | undefined) ?? props.accessibilityRole;
  return (
    <Pressable
      {...props}
      {...pressKeyProps(role, props.disabled ? undefined : (props.onPress ?? undefined))}
      // react-native-web drops accessibilityState.checked; a radio or checkbox needs aria-checked.
      {...(typeof props.accessibilityState?.checked === 'boolean' && { 'aria-checked': props.accessibilityState.checked })}
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
