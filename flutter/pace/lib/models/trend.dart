/// Spending / income trends.
library;

enum TrendDirection { rising, steady, falling }

class TrendItem {
  final String id;
  final TrendDirection direction;
  final String title;
  final String body;
  final String actionLabel;
  const TrendItem({
    required this.id,
    required this.direction,
    required this.title,
    required this.body,
    required this.actionLabel,
  });
  String get directionLabel => switch (direction) {
        TrendDirection.rising => 'Rising',
        TrendDirection.steady => 'Steady',
        TrendDirection.falling => 'Falling',
      };
}

class TrendsData {
  final String headline;
  final List<TrendItem> trends;
  final String? aboutText;
  const TrendsData({required this.headline, required this.trends, this.aboutText});
}
