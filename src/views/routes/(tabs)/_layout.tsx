import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { NavBar } from '../../../ui/NavBar';
import { useDesktop } from '../../../ui/responsive';

/**
 * On web (react-native-screens isn't used there) a tab you've left stays rendered underneath the
 * current one, so its buttons would still be reached with Tab and by screen readers: take it out.
 */
const hideWhenLeft = Platform.OS === 'web';

/** The five main sections, with Pace's bottom navigation bar (desktop uses the sidebar instead). */
export default function TabsLayout() {
  const desktop = useDesktop();
  return (
    <Tabs
      // Desktop: Back (Alt+←, the mouse's Back button) returns to the page you came from, as in a
      // browser. Phones keep the platform's own behaviour (Back goes to Home).
      backBehavior={hideWhenLeft ? 'history' : 'firstRoute'}
      screenOptions={({ navigation }) => ({
        headerShown: false,
        animation: 'none',
        ...(hideWhenLeft && !navigation.isFocused() ? { sceneStyle: { display: 'none' } } : {}),
      })}
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
