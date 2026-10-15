export interface Account {
  id: string;
  name: string;
  kind: string;
  balanceCents: number;
}

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  date: string;
  amountCents: number;
}

export interface Budget {
  id: string;
  category: string;
  spentCents: number;
  limitCents: number;
}

export interface Bill {
  id: string;
  name: string;
  dueDate: string;
  amountCents: number;
}