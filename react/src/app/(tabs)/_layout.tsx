import { Tabs } from 'expo-router';

const colors = {
  active: '#35634A',
  inactive: '#77796F',
  background: '#FBFAF6',
  border: '#E5E4DB',
};

export default function PaceTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          paddingBottom: 7,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
      <Tabs.Screen name="spending" options={{ title: 'Spending' }} />
      <Tabs.Screen name="budgets" options={{ title: 'Budgets' }} />
      <Tabs.Screen name="bills" options={{ title: 'Bills' }} />
    </Tabs>
  );
}