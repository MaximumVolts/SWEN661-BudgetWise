import { Tabs } from 'expo-router';
import { NavBar } from '../../../ui/NavBar';

/** The five main sections, with Pace's bottom navigation bar. */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={({ state, navigation }) => (
      <NavBar selected={state.index} onSelect={(i) => navigation.navigate(state.routes[i].name)} />
    )}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="spending" />
      <Tabs.Screen name="budgets" />
      <Tabs.Screen name="bills" />
    </Tabs>
  );
}
