import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PacePageProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
}>;

export function PacePage({ children, eyebrow = 'PACE', title }: PacePageProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export const paceColors = {
  ink: '#202D26',
  muted: '#74796F',
  paper: '#FBFAF6',
  line: '#E5E4DB',
  green: '#35634A',
  paleGreen: '#E8EFE5',
  coral: '#B75D49',
};

export const pageStyles = StyleSheet.create({
  section: { marginTop: 28 },
  sectionHeading: {
    color: paceColors.ink,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: paceColors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingVertical: 10,
  },
  rowTitle: { color: paceColors.ink, fontSize: 15, fontWeight: '600' },
  rowSubtitle: { color: paceColors.muted, fontSize: 12, marginTop: 4 },
  rowAmount: { color: paceColors.ink, fontSize: 14, fontWeight: '600' },
});

const styles = StyleSheet.create({
  safeArea: { backgroundColor: paceColors.paper, flex: 1 },
  content: { paddingBottom: 24, paddingHorizontal: 22 },
  heading: { paddingBottom: 4, paddingTop: 16 },
  eyebrow: { color: paceColors.green, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: paceColors.ink, fontFamily: 'Georgia', fontSize: 30, marginTop: 5 },
});