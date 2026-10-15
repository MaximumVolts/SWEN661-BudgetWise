import { StyleSheet, Text, View } from 'react-native';

import { PacePage, paceColors, pageStyles } from '@/components/pace-page';
import {
  demoAccounts,
  demoBudgets,
  demoMonthlyIncomeCents,
  demoMonthlySpendingCents,
  demoTransactions,
} from '@/data/demo-finance';
import { formatMoney } from '@/format/money';

export default function HomeScreen() {
  const totalBalanceCents = demoAccounts.reduce((sum, account) => sum + account.balanceCents, 0);
  const mainBudget = demoBudgets[0];
  const budgetPercent = Math.min(mainBudget.spentCents / mainBudget.limitCents, 1);
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date()).toUpperCase();

  return (
    <PacePage eyebrow={`DEMO DATA · ${dateLabel}`} title="Your money, in rhythm.">
      <View style={styles.balancePanel}>
        <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
        <Text style={styles.balanceValue}>{formatMoney(totalBalanceCents)}</Text>
        <View style={styles.balanceFooter}>
          <Text style={styles.balanceFootLabel}>Across {demoAccounts.length} accounts</Text>
          <Text style={styles.balanceFootValue}>↑ 2.4% this month</Text>
        </View>
      </View>

      <View style={styles.monthlyFlow}>
        <View style={styles.flowColumn}>
          <Text style={styles.metricLabel}>INCOME THIS MONTH</Text>
          <Text style={styles.metricValue}>{formatMoney(demoMonthlyIncomeCents)}</Text>
        </View>
        <View style={styles.flowDivider} />
        <View style={styles.flowColumn}>
          <Text style={styles.metricLabel}>SPENT SO FAR</Text>
          <Text style={styles.metricValue}>{formatMoney(demoMonthlySpendingCents)}</Text>
        </View>
      </View>

      <View style={pageStyles.section}>
        <Text style={pageStyles.sectionHeading}>Accounts</Text>
        {demoAccounts.map((account) => (
          <View key={account.id} style={pageStyles.row}>
            <View>
              <Text style={pageStyles.rowTitle}>{account.name}</Text>
              <Text style={pageStyles.rowSubtitle}>{account.kind}</Text>
            </View>
            <Text style={pageStyles.rowAmount}>{formatMoney(account.balanceCents)}</Text>
          </View>
        ))}
      </View>

      <View style={pageStyles.section}>
        <Text style={pageStyles.sectionHeading}>Monthly budget</Text>
        <View style={styles.budgetLine}>
          <View>
            <Text style={pageStyles.rowTitle}>{mainBudget.category}</Text>
            <Text style={pageStyles.rowSubtitle}>
              {formatMoney(mainBudget.spentCents)} of {formatMoney(mainBudget.limitCents)}
            </Text>
          </View>
          <Text style={styles.budgetPercent}>{Math.round(budgetPercent * 100)}%</Text>
        </View>
        <View
          accessibilityRole="progressbar"
          accessibilityLabel={`${mainBudget.category} budget used`}
          accessibilityValue={{ min: 0, max: 100, now: Math.round(budgetPercent * 100) }}
          style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${budgetPercent * 100}%` }]} />
        </View>
      </View>

      <View style={pageStyles.section}>
        <Text style={pageStyles.sectionHeading}>Recent activity</Text>
        {demoTransactions.slice(0, 3).map((transaction) => (
          <View key={transaction.id} style={pageStyles.row}>
            <View>
              <Text style={pageStyles.rowTitle}>{transaction.merchant}</Text>
              <Text style={pageStyles.rowSubtitle}>
                {transaction.category} · {transaction.date}
              </Text>
            </View>
            <Text
              style={[
                pageStyles.rowAmount,
                transaction.amountCents > 0 && styles.incomeAmount,
              ]}>
              {transaction.amountCents > 0 ? '+' : ''}{formatMoney(transaction.amountCents)}
            </Text>
          </View>
        ))}
      </View>
    </PacePage>
  );
}

const styles = StyleSheet.create({
  balancePanel: {
    backgroundColor: paceColors.green,
    borderRadius: 12,
    marginTop: 20,
    padding: 20,
  },
  balanceLabel: { color: '#D4E1D4', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  balanceValue: { color: '#FFFFFF', fontFamily: 'Georgia', fontSize: 34, marginTop: 9 },
  balanceFooter: {
    borderTopColor: 'rgba(255,255,255,0.22)',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 12,
  },
  balanceFootLabel: { color: '#D4E1D4', fontSize: 12 },
  balanceFootValue: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  monthlyFlow: { alignItems: 'center', flexDirection: 'row', marginTop: 22 },
  flowColumn: { flex: 1 },
  flowDivider: { backgroundColor: paceColors.line, height: 36, marginHorizontal: 12, width: 1 },
  metricLabel: { color: paceColors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  metricValue: { color: paceColors.ink, fontSize: 17, fontWeight: '700', marginTop: 6 },
  budgetLine: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  budgetPercent: { color: paceColors.green, fontSize: 13, fontWeight: '700' },
  progressTrack: { backgroundColor: paceColors.paleGreen, borderRadius: 8, height: 8, marginTop: 12, overflow: 'hidden' },
  progressFill: { backgroundColor: paceColors.green, borderRadius: 8, height: '100%' },
  incomeAmount: { color: paceColors.green },
});