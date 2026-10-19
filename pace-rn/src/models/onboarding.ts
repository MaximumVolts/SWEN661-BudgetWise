export interface PriorityOption {
  id: string;
  label: string;
}

export interface IncomeOption {
  id: string;
  title: string;
  subtitle: string;
}

export interface OnboardingOptions {
  priorities: PriorityOption[];
  incomeOptions: IncomeOption[];
}
