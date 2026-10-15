import { StyleSheet, Text, View } from 'react-native';

import { PacePage, paceColors, pageStyles } from '@/components/pace-page';
import { demoBudgets } from '@/data/demo-finance';
import { formatMoney } from '@/format/money';

export default function BudgetsScreen() {
  return (
    <PacePage eyebrow="OCTOBER 2026" title="Budgets">
      <View style={pageStyles.section}>
        {demoBudgets.map((budget) => {
          const percent = Math.min(budget.spentCents / budget.limitCents, 1);
          return (
            <View key={budget.id} style={styles.budget}>
              <View style={styles.heading}>
                <View>
                  <Text style={pageStyles.rowTitle}>{budget.category}</Text>
                  <Text style={pageStyles.rowSubtitle}>
                    {formatMoney(budget.spentCents)} spent of {formatMoney(budget.limitCents)}
                  </Text>
                </View>
                <Text style={styles.percent}>{Math.round(percent * 100)}%</Text>
              </View>
              <View
                accessibilityRole="progressbar"
                accessibilityLabel={`${budget.category} budget used`}
                accessibilityValue={{ min: 0, max: 100, now: Math.round(percent * 100) }}
                style={styles.track}>
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
  budget: { borderBottomColor: paceColors.line, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 18 },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  percent: { color: paceColors.green, fontSize: 13, fontWeight: '700' },
  track: { backgroundColor: paceColors.paleGreen, borderRadius: 6, height: 7, marginTop: 13, overflow: 'hidden' },
  fill: { backgroundColor: paceColors.green, borderRadius: 6, height: '100%' },
});