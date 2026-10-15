import { Text, View } from 'react-native';

import { PacePage, pageStyles } from '@/components/pace-page';
import { demoTransactions } from '@/data/demo-finance';
import { formatMoney } from '@/format/money';

export default function TransactionsScreen() {
  return (
    <PacePage eyebrow="YOUR ACTIVITY" title="Transactions">
      <View style={pageStyles.section}>
        {demoTransactions.map((transaction) => (
          <View key={transaction.id} style={pageStyles.row}>
            <View>
              <Text style={pageStyles.rowTitle}>{transaction.merchant}</Text>
              <Text style={pageStyles.rowSubtitle}>{transaction.category} · {transaction.date}</Text>
            </View>
            <Text style={pageStyles.rowAmount}>
              {transaction.amountCents > 0 ? '+' : ''}{formatMoney(transaction.amountCents)}
            </Text>
          </View>
        ))}
      </View>
    </PacePage>
  );
}