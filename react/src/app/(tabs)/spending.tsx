import { StyleSheet, Text, View } from 'react-native';

import { PacePage, paceColors, pageStyles } from '@/components/pace-page';
import { demoBudgets } from '@/data/demo-finance';
import { formatMoney } from '@/format/money';

export default function SpendingScreen() {
  return (
    <PacePage eyebrow="OCTOBER 2026" title="Spending">
      <View style={pageStyles.section}>
        <Text style={styles.total}>
          {formatMoney(demoBudgets.reduce((sum, budget) => sum + budget.spentCents, 0))}
        </Text>
        <Text style={pageStyles.rowSubtitle}>Across your tracked categories</Text>
      </View>
      <View style={pageStyles.section}>
        {demoBudgets.map((budget) => {
          const percent = Math.min(budget.spentCents / budget.limitCents, 1);
          return (
            <View key={budget.id} style={styles.category}>
              <View style={styles.categoryHeading}>
                <Text style={pageStyles.rowTitle}>{budget.category}</Text>
                <Text style={pageStyles.rowAmount}>{formatMoney(budget.spentCents)}</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${percent * 100}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
    </PacePage>
  );
}

const styles = StyleSheet.create({
  total: { color: paceColors.ink, fontFamily: 'Georgia', fontSize: 31 },
  category: { borderBottomColor: paceColors.line, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 16 },
  categoryHeading: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { backgroundColor: paceColors.paleGreen, borderRadius: 6, height: 7, marginTop: 12, overflow: 'hidden' },
  fill: { backgroundColor: paceColors.green, borderRadius: 6, height: '100%' },
});