import { type ReactNode, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { ShellController } from '../../../controllers/shellController';
import type { AppSection } from '../../../models/navigation';
import { useDisplay } from '../../../state/PreferencesContext';
import { focusRing, Tap } from '../../../ui/components';
import { Kbd } from '../../../ui/desktop';
import { Icon, type IconName } from '../../../ui/icons';
import { focusById, focusPageSoon, isMac, MAIN_CONTENT_ID, SEARCH_INPUT_ID } from '../../../ui/keyboard';

const MAIN: [AppSection, string, IconName][] = [
  ['home', 'Home', 'home'],
  ['transactions', 'Transactions', 'receipt-long'],
  ['spending', 'Spending', 'data-usage'],
  ['budgets', 'Budgets', 'account-balance-wallet'],
  ['bills', 'Bills', 'calendar-today'],
];

const TOOLS: [AppSection, string, IconName][] = [
  ['comparison', 'Monthly Comparison', 'compare-arrows'],
  ['goals', 'Savings goals', 'savings'],
  ['cashFlow', 'Cash flow', 'trending-up'],
  ['trends', 'Trends', 'insights'],
];

/** Tools that are new get a "New" badge. */
const NEW_TOOLS = new Set<AppSection>(['comparison']);

/** Width of the sidebar and height of the top bar: the page sits in the rest of the window. */
export const SHELL_INSET = { left: 320, top: 80 };

/**
 * The desktop frame around every signed-in page: a sidebar with the sections, tools,
 * notifications, settings and who's signed in; a top bar with the breadcrumb, search and bell.
 * The page itself is laid out beside it by AppFrame (the "main" landmark).
 *
 * Keyboard: the first Tab stop is "Skip to main content"; then the sidebar, the top bar and the page.
 */
export function DesktopShellScreen({ controller: ctl }: { controller: ShellController }) {
  return (
    <>
      <SkipLink />
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: SHELL_INSET.left, zIndex: 1 }}>
        <Sidebar controller={ctl} />
      </View>
      {/* Above the page, so the search results can hang over it. */}
      <View style={{ position: 'absolute', left: SHELL_INSET.left, right: 0, top: 0, height: SHELL_INSET.top, zIndex: 2 }}>
        <TopBar controller={ctl} />
      </View>
    </>
  );
}

/** Hidden until it has keyboard focus: jumps past the sidebar and top bar to the page. */
function SkipLink() {
  const { colors: c } = useDisplay();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      role="link"
      accessibilityLabel="Skip to main content"
      onPress={() => focusById(MAIN_CONTENT_ID)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        { position: 'absolute', zIndex: 10, left: 16, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, backgroundColor: c.ink },
        focused ? [{ top: 16 }, focusRing(c.lime)] : { top: -200 },
      ]}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Skip to main content</Text>
    </Pressable>
  );
}

function Sidebar({ controller: ctl }: { controller: ShellController }) {
  const { colors: c } = useDisplay();
  const item = ([id, label, icon]: [AppSection, string, IconName], badge?: ReactNode) => (
    <NavItem key={id} label={label} icon={icon} active={ctl.section === id} onPress={() => ctl.open(id)} badge={badge} shortcut={shortcutFor(id)} />
  );
  const unread = ctl.unreadCount;
  return (
    <View
      role="complementary"
      accessibilityLabel="Sidebar"
      style={{ flex: 1, backgroundColor: c.panel, borderRightWidth: 1, borderRightColor: c.line, paddingTop: 24, paddingHorizontal: 14, paddingBottom: 14 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 13, marginBottom: 26 }}>
        <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: c.lime, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="speed" color="#1A1A1A" />
        </View>
        <Text style={{ fontSize: 26, fontWeight: '600', color: c.ink }}>Pace</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 2 }}>
        <View role="navigation" accessibilityLabel="Primary" style={{ gap: 2 }}>
          {MAIN.map((entry) => item(entry))}
        </View>
        <View role="navigation" accessibilityLabel="Tools" style={{ gap: 2 }}>
          <Text style={{ fontSize: 12, letterSpacing: 0.6, color: c.muted, marginTop: 28, marginBottom: 6, paddingHorizontal: 17 }}>TOOLS</Text>
          {TOOLS.map((entry) =>
            item(
              entry,
              NEW_TOOLS.has(entry[0]) ? (
                <View style={{ backgroundColor: c.lime, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#1A1A1A' }}>New</Text>
                </View>
              ) : undefined,
            ),
          )}
        </View>
      </ScrollView>
      <View role="navigation" accessibilityLabel="Account">
        <View style={{ gap: 2, paddingTop: 8 }}>
          <NavItem
            label="Notifications"
            accessibilityLabel={unread ? `Notifications, ${unread} new` : 'Notifications'}
            icon="notifications-none"
            active={ctl.section === 'notifications'}
            onPress={() => ctl.open('notifications')}
            badge={
              unread > 0 ? (
                <View style={{ minWidth: 24, height: 24, borderRadius: 12, backgroundColor: c.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>{unread > 99 ? '99+' : unread}</Text>
                </View>
              ) : undefined
            }
          />
          <NavItem label="Settings" icon="settings" active={ctl.section === 'settings'} onPress={() => ctl.open('settings')} shortcut={`${modLabel()}+,`} />
        </View>
        <View style={{ height: 1, backgroundColor: c.line, marginVertical: 14 }} />
        {ctl.profile && (
          <Tap onPress={ctl.openProfile} label={`Profile: ${ctl.profile.name}, ${ctl.profile.username}`} style={{ alignItems: 'stretch' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.navPill, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: c.lime }}>{ctl.profile.initials}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>
                  {ctl.profile.name}
                </Text>
                <Text numberOfLines={1} style={{ fontSize: 12, color: c.muted }}>
                  {ctl.profile.username}
                </Text>
              </View>
            </View>
          </Tap>
        )}
      </View>
    </View>
  );
}

const SIDEBAR_ORDER: AppSection[] = [...MAIN, ...TOOLS].map(([id]) => id);
const modLabel = () => (isMac() ? '⌘' : 'Ctrl');
/** "Ctrl+3" for the third section (as aria-keyshortcuts, and the tooltip). */
const shortcutFor = (id: AppSection) => {
  const i = SIDEBAR_ORDER.indexOf(id);
  return i >= 0 && i < 9 ? `${modLabel()}+${i + 1}` : undefined;
};

function NavItem({
  label,
  icon,
  active,
  onPress,
  badge,
  accessibilityLabel,
  shortcut,
}: {
  label: string;
  icon: IconName;
  active: boolean;
  onPress: () => void;
  badge?: ReactNode;
  accessibilityLabel?: string;
  /** Its keyboard shortcut ("Ctrl+3"): announced by screen readers and shown on hover. */
  shortcut?: string;
}) {
  const { colors: c } = useDisplay();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: active }}
      aria-current={active ? 'page' : undefined}
      {...(shortcut && { 'aria-keyshortcuts': shortcut.replace('⌘', 'Meta'), title: `${label} (${shortcut})` })}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ hovered }: { hovered?: boolean }) => [
        { flexDirection: 'row', alignItems: 'center', gap: 18, height: 52, paddingHorizontal: 20, borderRadius: 26 },
        active ? { backgroundColor: c.navPill } : hovered && { backgroundColor: c.chip },
        focused && focusRing(c.ink),
      ]}
    >
      <Icon name={icon} color={active ? c.lime : c.ink} />
      <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, fontWeight: '500', color: active ? '#FFFFFF' : c.ink }}>
        {label}
      </Text>
      {badge}
    </Pressable>
  );
}

function TopBar({ controller: ctl }: { controller: ShellController }) {
  const { colors: c } = useDisplay();
  return (
    <View role="banner" style={{ flexDirection: 'row', alignItems: 'center', gap: 16, height: 80, paddingHorizontal: 36, borderBottomWidth: 1, borderBottomColor: c.line, backgroundColor: c.bg }}>
      <View accessibilityRole="header" accessibilityLabel={`${ctl.crumbs.group}, ${ctl.crumbs.title}`} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 }}>
        {ctl.crumbs.group === 'Overview' && ctl.section !== 'home' ? (
          <Tap onPress={ctl.openHome} role="link" style={{ minHeight: 40 }}>
            <Text style={{ fontSize: 16, color: c.muted }}>Overview</Text>
          </Tap>
        ) : (
          <Text style={{ fontSize: 16, color: c.muted }}>{ctl.crumbs.group}</Text>
        )}
        <Icon name="chevron-right" color={c.ink} />
        <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '500', color: c.ink, flexShrink: 1 }}>
          {ctl.crumbs.title}
        </Text>
      </View>
      <SearchBox controller={ctl} />
      <Tap onPress={ctl.openShortcuts} label="Keyboard shortcuts" hint="Or press question mark">
        <Icon name="keyboard" size={26} color={c.ink} />
      </Tap>
      <Tap onPress={ctl.openNotifications} label={ctl.unreadCount ? `Notifications, ${ctl.unreadCount} new` : 'Notifications'}>
        <View>
          <Icon name="notifications-none" size={28} color={c.ink} />
          {ctl.unreadCount > 0 && <View style={{ position: 'absolute', right: 2, top: 1, width: 9, height: 9, borderRadius: 5, backgroundColor: c.red }} />}
        </View>
      </Tap>
    </View>
  );
}

type SearchResult = { key: string; label: string; icon: IconName; run: () => void };

/**
 * Search (Ctrl/⌘ + K): type to search transactions, or pick a page. A combobox: ↑ ↓ choose a
 * result, Enter opens it (the first is "Search transactions for …"), Esc clears and leaves.
 */
function SearchBox({ controller: ctl }: { controller: ShellController }) {
  const { colors: c } = useDisplay();
  const input = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const query = text.trim();
  const results: SearchResult[] = [
    ...(query ? [{ key: 'search', label: `Search transactions for “${query}”`, icon: 'search' as IconName, run: () => ctl.search(query) }] : []),
    ...ctl.destinations(text).map((d) => ({ key: d.id, label: `Go to ${d.label}`, icon: 'arrow-forward' as IconName, run: () => ctl.openDestination(d.id) })),
  ];
  const shown = open && results.length > 0;
  const current = Math.min(active, results.length - 1);

  const finish = (result?: SearchResult) => {
    result?.run();
    setText('');
    setActive(0);
    setOpen(false);
    input.current?.blur();
    if (result) focusPageSoon();
  };

  const onKey = (e: { nativeEvent: { key: string }; preventDefault(): void }) => {
    switch (e.nativeEvent.key) {
      case 'ArrowDown':
        e.preventDefault();
        setOpen(true);
        setActive((current + 1) % results.length);
        return;
      case 'ArrowUp':
        e.preventDefault();
        setActive((current - 1 + results.length) % results.length);
        return;
      case 'Enter':
        e.preventDefault();
        if (shown) finish(results[current]);
        return;
      case 'Escape':
        e.preventDefault();
        finish();
        return;
    }
  };

  const listId = 'pace-search-results';
  const optionId = (i: number) => `pace-search-result-${i}`;
  return (
    <View style={{ width: 380 }}>
      <View
        style={[
          { flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, borderRadius: 24, backgroundColor: c.chip, paddingLeft: 16, paddingRight: 8 },
          open && focusRing(c.ink),
          open && { borderRadius: 24 },
        ]}
      >
        <Icon name="search" color={c.ink} />
        <TextInput
          ref={input}
          nativeID={SEARCH_INPUT_ID}
          role="combobox"
          accessibilityLabel="Search transactions or go to a page"
          aria-expanded={shown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={shown ? optionId(current) : undefined}
          aria-keyshortcuts={isMac() ? 'Meta+K' : 'Control+K'}
          placeholder="Search transactions, bills, budgets"
          placeholderTextColor={c.muted}
          value={text}
          onChangeText={(t) => {
            setText(t);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => {
            clearTimeout(blurTimer.current);
            setOpen(true);
          }}
          // Later, so a click on a result lands before the list goes away.
          onBlur={() => {
            blurTimer.current = setTimeout(() => setOpen(false), 150);
          }}
          onKeyPress={onKey as never}
          returnKeyType="search"
          style={{ flex: 1, fontSize: 14, color: c.ink, height: 44, outlineStyle: 'none' } as object}
        />
        {text.length > 0 ? (
          <Tap onPress={() => setText('')} label="Clear search" style={{ minWidth: 36, minHeight: 36 }}>
            <Icon name="close" size={20} color={c.ink} />
          </Tap>
        ) : (
          !open && (
            <View aria-hidden style={{ flexDirection: 'row', gap: 4, paddingHorizontal: 8 }}>
              <Kbd label={modLabel()} />
              <Kbd label="K" />
            </View>
          )
        )}
      </View>
      {shown && (
        <View
          nativeID={listId}
          role={'listbox' as never}
          accessibilityLabel="Search results"
          style={{
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: 16,
            paddingVertical: 8,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          {!query && <Text style={{ fontSize: 12, color: c.muted, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 6 }}>Quick destinations</Text>}
          {results.map((r, i) => (
            <Pressable
              key={r.key}
              nativeID={optionId(i)}
              role="option"
              aria-selected={i === current}
              // Results are reached with ↑ ↓ from the box, not Tab.
              focusable={false}
              onPress={() => finish(r)}
              onHoverIn={() => setActive(i)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, minHeight: 44, backgroundColor: i === current ? c.chip : 'transparent' }}
            >
              <Icon name={r.icon} size={20} color={c.ink} />
              <Text numberOfLines={1} style={{ flex: 1, fontSize: 14, color: c.ink, fontWeight: i === current ? '600' : '400' }}>
                {r.label}
              </Text>
              {i === current && <Kbd label="Enter" />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

