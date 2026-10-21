/// Onboarding options.
library;

class PriorityOption {
  final String id;
  final String label;
  const PriorityOption({required this.id, required this.label});
}

class IncomeOption {
  final String id;
  final String title;
  final String subtitle;
  const IncomeOption({required this.id, required this.title, required this.subtitle});
}

class OnboardingOptions {
  final List<PriorityOption> priorities;
  final List<IncomeOption> incomeOptions;
  const OnboardingOptions({required this.priorities, required this.incomeOptions});
}
