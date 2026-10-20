// Native modules Jest can't load are replaced with simple fakes here. Anything a test needs to
// inspect (notifications, saved statements, Plaid) is injected as an in-memory implementation instead.
jest.setTimeout(30000);
jest.mock('expo-crypto', () => ({
  getRandomBytes: (n: number) => new Uint8Array(require('crypto').randomBytes(n)),
}));

jest.mock('expo-secure-store', () => {
  const values = new Map<string, string>();
  return {
    getItemAsync: async (k: string) => values.get(k) ?? null,
    setItemAsync: async (k: string, v: string) => void values.set(k, v),
    deleteItemAsync: async (k: string) => void values.delete(k),
  };
});

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn() }));
jest.mock('expo-print', () => ({ printToFileAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => true), shareAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: { cache: {} } }));

// The system date picker: a text field taking 'YYYY-MM-DD' stands in for it, so tests can pick dates.
jest.mock('@react-native-community/datetimepicker', () => {
  const { TextInput } = require('react-native');
  const { parseIsoDate } = require('@/utils/calendar');
  return {
    __esModule: true,
    default: ({ onValueChange }: { onValueChange: (e: { type: string }, d?: Date) => void }) => (
      <TextInput testID="date-picker" onChangeText={(text: string) => onValueChange({ type: 'set' }, parseIsoDate(text))} />
    ),
  };
});
