import { Tabs } from 'expo-router';
import { NavBar } from '../../../ui/NavBar';
import { useDesktop } from '../../../ui/responsive';

/** The five main sections, with Pace's bottom navigation bar (desktop uses the sidebar instead). */
export default function TabsLayout() {
  const desktop = useDesktop();
  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: 'none' }}
      tabBar={({ state, navigation }) =>
        desktop ? null : <NavBar selected={state.index} onSelect={(i) => navigation.navigate(state.routes[i].name)} />
      }
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="spending" />
      <Tabs.Screen name="budgets" />
      <Tabs.Screen name="bills" />
    </Tabs>
  );
}
