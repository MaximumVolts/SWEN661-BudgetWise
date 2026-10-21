import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

/**
 * Resolves the string `iconKey` carried by models into a Material icon. Models stay UI-free;
 * services only send one of these keys.
 */
const ICONS: Record<string, IconName> = {
  // accounts
  bank: 'account-balance',
  savings: 'savings',
  person: 'person-outline',
  card: 'credit-card',
  wallet: 'account-balance-wallet',
  // categories / merchants
  food: 'restaurant',
  groceries: 'shopping-basket',
  shopping_bag: 'shopping-bag',
  store: 'storefront',
  coffee: 'coffee',
  car: 'directions-car',
  transit: 'directions-bus',
  work: 'work-outline',
  bills: 'receipt-long',
  subscriptions: 'sync',
  utilities: 'hexagon',
  payroll: 'credit-card',
  // bills
  home: 'home',
  water: 'water-drop',
  internet: 'wifi',
  cloud: 'cloud-queue',
  play: 'play-circle-outline',
  fitness: 'fitness-center',
  // goals / tools
  shield: 'shield',
  laptop: 'laptop-mac',
  chart: 'bar-chart',
  add: 'add',
};

export const iconFor = (key: string): IconName => ICONS[key] ?? 'category';

export const ALL_ICON_NAMES = Object.values(ICONS);

/** A Material icon, decorative unless given an accessibility label. */
export function Icon({ name, size = 24, color, label }: { name: IconName; size?: number; color: string; label?: string }) {
  return (
    <MaterialIcons
      name={name}
      size={size}
      color={color}
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    />
  );
}
