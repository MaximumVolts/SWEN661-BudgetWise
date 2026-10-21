import type { BillReminder } from './userPreferences';

export interface SettingsData {
  name: string;
  username: string;
  initials: string;
  connectedAccountCount: number;
  themeLabel: string;
  billReminder: BillReminder;
  highContrast: boolean;
  colorblindMode: boolean;
  showChartValues: boolean;
  budgetAlerts: boolean;
  footerLabel: string;
}
