import '../models/navigation.dart' show FlowStep;
import '../models/onboarding.dart' show OnboardingOptions;

/// BUSINESS RULES: which options are offered, how priorities/income type feed default budgets
/// and alerts, and what the next step is once preferences are saved.
abstract class OnboardingService {
  Future<OnboardingOptions> loadOptions();
  /// Persists preferences and returns the next step in the journey.
  Future<FlowStep> savePreferences({required Set<String> priorityIds, required String? incomeId});
}
