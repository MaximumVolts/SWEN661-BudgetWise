import { Text, View } from 'react-native';

import { PacePage, pageStyles } from '@/components/pace-page';
import { demoBills } from '@/data/demo-finance';
import { formatMoney } from '@/format/money';

export default function BillsScreen() {
  return (
    <PacePage eyebrow="UP NEXT" title="Bills & subscriptions">
      <View style={pageStyles.section}>
        {demoBills.map((bill) => (
          <View key={bill.id} style={pageStyles.row}>
            <View>
              <Text style={pageStyles.rowTitle}>{bill.name}</Text>
              <Text style={pageStyles.rowSubtitle}>Due {bill.dueDate}</Text>
            </View>
            <Text style={pageStyles.rowAmount}>{formatMoney(bill.amountCents)}</Text>
          </View>
        ))}
      </View>
    </PacePage>
  );
}