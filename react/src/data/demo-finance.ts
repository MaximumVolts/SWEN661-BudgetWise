import type { Account, Bill, Budget, Transaction } from '@/models/finance';

export const demoAccounts: Account[] = [
  { id: 'checking', name: 'Everyday Checking', kind: 'Checking ·· 4821', balanceCents: 824056 },
  { id: 'savings', name: 'Rainy Day Savings', kind: 'Savings ·· 1906', balanceCents: 1018019 },
];

export const demoTransactions: Transaction[] = [
  { id: 'market', merchant: 'Whole Foods Market', category: 'Groceries', date: 'Today', amountCents: -6842 },
  { id: 'payroll', merchant: 'Northstar Payroll', category: 'Income', date: 'Oct 12', amountCents: 284000 },
  { id: 'coffee', merchant: 'Blue Bottle Coffee', category: 'Restaurants', date: 'Oct 12', amountCents: -780 },
  { id: 'electric', merchant: 'City Electric', category: 'Utilities', date: 'Oct 10', amountCents: -9416 },
];

export const demoBudgets: Budget[] = [
  { id: 'groceries', category: 'Groceries', spentCents: 38600, limitCents: 60000 },
  { id: 'dining', category: 'Restaurants', spentCents: 21400, limitCents: 30000 },
  { id: 'transport', category: 'Transport', spentCents: 9600, limitCents: 25000 },
];

export const demoBills: Bill[] = [
  { id: 'internet', name: 'Fiber internet', dueDate: 'Oct 16', amountCents: 7499 },
  { id: 'rent', name: 'Rent', dueDate: 'Nov 01', amountCents: 145000 },
  { id: 'music', name: 'Music subscription', dueDate: 'Nov 03', amountCents: 1099 },
];

export const demoMonthlySpendingCents = 184263;
export const demoMonthlyIncomeCents = 426000;