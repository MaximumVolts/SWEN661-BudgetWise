import { Fragment } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { KeyboardController } from '../../../controllers/keyboardController';
import { keyLabels, keysFor, SHORTCUT_GROUPS } from '../../../models/shortcuts';
import { useDisplay } from '../../../state/PreferencesContext';
import { Heading, Tap } from '../../../ui/components';
import { DButton, DText, Kbd } from '../../../ui/desktop';
import { Icon } from '../../../ui/icons';
import { isMac } from '../../../ui/keyboard';

/** The keyboard shortcuts list (?, Ctrl/⌘ + /, or the top bar's keyboard button). Esc closes it. */
export function ShortcutsHelpScreen({ controller: ctl }: { controller: KeyboardController }) {
  const { colors: c } = useDisplay();
  const mac = isMac();
  return (
    <Modal visible={ctl.helpOpen} transparent animationType="fade" onRequestClose={ctl.closeHelp}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <View
          accessibilityViewIsModal
          aria-label="Keyboard shortcuts"
          style={{ width: 860, maxWidth: '100%', maxHeight: '90%', zIndex: 1, backgroundColor: c.bg, borderRadius: 24, borderWidth: 1, borderColor: c.line }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 32, paddingRight: 16, paddingTop: 20, paddingBottom: 8 }}>
            <Heading style={[DText.title, { flex: 1, fontSize: 24, color: c.ink }]}>Keyboard shortcuts</Heading>
            <Tap onPress={ctl.closeHelp} label="Close keyboard shortcuts">
              <Icon name="close" color={c.ink} />
            </Tap>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 8 }}>
            <Text style={[DText.small, { color: c.muted, marginBottom: 8 }]}>
              {mac ? '⌘ shortcuts also work with Ctrl.' : 'Ctrl shortcuts work even while you are typing in a field.'} Tab moves through everything else.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 40 }}>
              {SHORTCUT_GROUPS.map((g) => (
                <View key={g.title} style={{ flexBasis: 360, flexGrow: 1, marginTop: 16 }}>
                  <Heading style={{ fontSize: 16, fontWeight: '600', color: c.ink, marginBottom: 6 }}>{g.title}</Heading>
                  <View role="list">
                    {g.items.map((item) => {
                      const combos = keysFor(item, mac).map((k) => keyLabels(k, mac));
                      return (
                        <View
                          key={item.action}
                          role="listitem"
                          accessible
                          accessibilityLabel={`${item.action}: ${combos.map((k) => k.join(' plus ')).join(', or ')}`}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 40, borderBottomWidth: 1, borderBottomColor: c.line }}
                        >
                          <Text style={[DText.body, { flex: 1, fontSize: 14, color: c.ink }]}>{item.action}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            {combos.map((keys, i) => (
                              <Fragment key={i}>
                                {i > 0 && <Text style={{ fontSize: 12, color: c.muted, marginHorizontal: 2 }}>or</Text>}
                                {keys.map((k, j) => (
                                  <Fragment key={j}>
                                    {j > 0 && <Text style={{ fontSize: 12, color: c.muted }}>+</Text>}
                                    <Kbd label={k} />
                                  </Fragment>
                                ))}
                              </Fragment>
                            ))}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 32, paddingVertical: 16, borderTopWidth: 1, borderTopColor: c.line }}>
            <DButton label="Done" kind="primary" onPress={ctl.closeHelp} />
          </View>
        </View>
        {/* After the dialog, so focus starts inside it; a click outside closes, Esc does from the keyboard. */}
        <Pressable accessibilityLabel="Close" focusable={false} onPress={ctl.closeHelp} style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(26,26,26,0.32)' }]} />
      </View>
    </Modal>
  );
}
