import 'package:flutter/widgets.dart' show BuildContext, InheritedWidget;

/// The user's display preferences, for widgets below the app root (set by PaceApp).
class PaceDisplay extends InheritedWidget {
  /// Colorblind mode: status is also shown with shapes and patterns (and the palette is
  /// colorblind-safe, see Palette.colorblindSafe), so nothing depends on telling colors apart.
  final bool colorblind;
  final bool showChartValues;
  const PaceDisplay({super.key, required this.colorblind, required this.showChartValues, required super.child});

  /// Whether colorblind mode is on (off when no PaceDisplay is above [context]).
  static bool colorblindOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<PaceDisplay>()?.colorblind ?? false;

  @override
  bool updateShouldNotify(PaceDisplay old) => old.colorblind != colorblind || old.showChartValues != showChartValues;
}
