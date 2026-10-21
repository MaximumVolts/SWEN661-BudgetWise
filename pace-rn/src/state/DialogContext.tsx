import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon, type IconName } from '../ui/icons';
import { useDisplay } from './PreferencesContext';

export interface ChoiceOption {
  id: string;
  label: string;
  icon?: IconName;
  destructive?: boolean;
}

interface Dialogs {
  /** A yes / no question with a destructive [action] button. True if confirmed. */
  confirm(opts: { title: string; message: string; action: string }): Promise<boolean>;
  /** A bottom sheet of choices: the chosen id, or undefined if dismissed. */
  choose(opts: { title: string; subtitle?: string; options: ChoiceOption[]; selectedId?: string }): Promise<string | undefined>;
  /** Asks for a line of text: what was entered, or undefined if cancelled. */
  promptText(opts: { title: string; label: string; initial?: string; action: string }): Promise<string | undefined>;
}

type Open =
  | { kind: 'confirm'; title: string; message: string; action: string; done: (v: boolean) => void }
  | { kind: 'choose'; title: string; subtitle?: string; options: ChoiceOption[]; selectedId?: string; done: (v?: string) => void }
  | { kind: 'prompt'; title: string; label: string; initial?: string; action: string; done: (v?: string) => void };

const DialogContext = createContext<Dialogs | null>(null);

/** Dialogs and bottom sheets that aren't pages: confirmations, pickers and short text prompts. */
export function DialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Open>();
  const [text, setText] = useState('');
  const { colors: c, type: t } = useDisplay();

  const confirm = useCallback<Dialogs['confirm']>(
    (o) => new Promise((resolve) => setOpen({ kind: 'confirm', ...o, done: resolve })),
    [],
  );
  const choose = useCallback<Dialogs['choose']>((o) => new Promise((resolve) => setOpen({ kind: 'choose', ...o, done: resolve })), []);
  const promptText = useCallback<Dialogs['promptText']>(
    (o) =>
      new Promise((resolve) => {
        setText(o.initial ?? '');
        setOpen({ kind: 'prompt', ...o, done: resolve });
      }),
    [],
  );
  const value = useMemo(() => ({ confirm, choose, promptText }), [confirm, choose, promptText]);

  const close = (result?: unknown) => {
    const current = open;
    setOpen(undefined);
    if (!current) return;
    if (current.kind === 'confirm') current.done(result === true);
    else current.done(result as string | undefined);
  };

  const button = (label: string, onPress: () => void, color: string) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.textButton} hitSlop={8}>
      <Text style={{ color, fontSize: 15, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
      <Modal visible={open !== undefined} transparent animationType="fade" onRequestClose={() => close()}>
        {open?.kind === 'choose' ? (
          <View style={styles.sheetBackdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} accessibilityLabel="Close" />
            <View style={[styles.sheet, { backgroundColor: c.bg }]}>
              <View style={[styles.handle, { backgroundColor: c.line }]} />
              <Text accessibilityRole="header" style={[t.title, styles.sheetTitle]}>
                {open.title}
              </Text>
              {open.subtitle && <Text style={[t.sub, styles.sheetSubtitle]}>{open.subtitle}</Text>}
              <ScrollView>
                {open.options.map((o) => {
                  const selected = o.id === open.selectedId;
                  const color = o.destructive ? c.red : c.ink;
                  return (
                    <Pressable
                      key={o.id}
                      accessibilityRole="button"
                      accessibilityLabel={o.label}
                      accessibilityState={{ selected }}
                      onPress={() => close(o.id)}
                      style={({ pressed }) => [styles.option, pressed && { backgroundColor: c.chip }]}
                    >
                      {o.icon && <Icon name={o.icon} color={color} />}
                      <Text style={[styles.optionText, { color, fontWeight: selected ? '700' : '400' }]}>{o.label}</Text>
                      {selected && <Icon name="check" color={c.ink} />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        ) : open ? (
          <View style={styles.dialogBackdrop}>
            <View style={[styles.dialog, { backgroundColor: c.bg }]} accessibilityViewIsModal>
              <Text accessibilityRole="header" style={t.title}>
                {open.title}
              </Text>
              {open.kind === 'confirm' ? (
                <Text style={[t.body, { marginTop: 12 }]}>{open.message}</Text>
              ) : (
                <TextInput
                  accessibilityLabel={open.label}
                  placeholder={open.label}
                  placeholderTextColor={c.muted}
                  value={text}
                  onChangeText={setText}
                  autoFocus
                  style={[styles.input, { borderColor: c.outline, color: c.ink }]}
                />
              )}
              <View style={styles.actions}>
                {button('Cancel', () => close(), c.ink)}
                {open.kind === 'confirm'
                  ? button(open.action, () => close(true), c.red)
                  : button(open.action, () => close(text), c.olive)}
              </View>
            </View>
          </View>
        ) : null}
      </Modal>
    </DialogContext.Provider>
  );
}

export function useDialogs(): Dialogs {
  const dialogs = useContext(DialogContext);
  if (!dialogs) throw new Error('useDialogs must be used inside <DialogProvider>');
  return dialogs;
}

const styles = StyleSheet.create({
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 24, maxHeight: '80%' },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginVertical: 12 },
  sheetTitle: { paddingHorizontal: 24, paddingBottom: 8 },
  sheetSubtitle: { paddingHorizontal: 24, paddingBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, minHeight: 52 },
  optionText: { flex: 1, fontSize: 16 },
  dialogBackdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.35)' },
  dialog: { borderRadius: 24, padding: 24 },
  input: { borderWidth: 1, borderRadius: 6, padding: 14, fontSize: 16, marginTop: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 20 },
  textButton: { paddingHorizontal: 12, paddingVertical: 10, minHeight: 44, justifyContent: 'center' },
});
