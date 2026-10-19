/// Flow decisions & deep links (decided by services, executed by controllers).
library;

/// Where the user should go next in the sign-in / onboarding journey.
enum FlowStep { onboarding, connectBank, home }

class LinkOutcome {
  final bool linked; // false if the user cancelled
  final FlowStep? next;
  const LinkOutcome({required this.linked, this.next});
}

enum TargetKind { bill, budgetCategory, goal, account, transaction, trend, budgets, bills }

/// What a notification (or push payload) points at. `id` is null for list-level targets.
class DeepLinkTarget {
  final TargetKind kind;
  final String? id;
  const DeepLinkTarget(this.kind, [this.id]);
}
