import 'package:flutter/material.dart' show Color, ColorScheme, FontWeight, TextStyle, ThemeData, Typography;

/// One set of colors for the whole app.
class Palette {
  final Color bg, ink, muted, lime, olive, navPill, navBar, red, redBg, chip, line, outline;
  /// The "previous period" line in charts.
  final Color previous;
  /// Subtle panel fill (e.g. the cash flow breakdown).
  final Color panel;
  const Palette({
    required this.bg,
    required this.ink,
    required this.muted,
    required this.lime,
    required this.olive,
    required this.navPill,
    required this.navBar,
    required this.red,
    required this.redBg,
    required this.chip,
    required this.line,
    required this.outline,
    required this.previous,
    required this.panel,
  });

  /// Pace design tokens, sampled from the design file.
  static const standard = Palette(
    bg: Color(0xFFFBFAF6),
    ink: Color(0xFF1A1A1A),
    muted: Color(0xFF5B5A55),
    lime: Color(0xFFE8F26B),
    olive: Color(0xFF4A5400),
    navPill: Color(0xFF22260A),
    navBar: Color(0xFFF1F0EA),
    red: Color(0xFFC0281E),
    redBg: Color(0xFFFADCD8),
    chip: Color(0xFFEBEAE4),
    line: Color(0xFFD3D1C9),
    outline: Color(0xFF8C8A84),
    previous: Color(0xFFC9C7BF),
    panel: Color(0xFFF3F2EC),
  );

  /// High contrast: pure black text on white, darker secondary text, status colors and
  /// outlines, and dividers / chart lines dark enough to see (all at least 4.5:1 on white,
  /// outlines and dividers at least 3:1).
  static const highContrast = Palette(
    bg: Color(0xFFFFFFFF),
    ink: Color(0xFF000000),
    muted: Color(0xFF2E2D2A),
    lime: Color(0xFFE8F26B),
    olive: Color(0xFF2C3300),
    navPill: Color(0xFF000000),
    navBar: Color(0xFFE6E5DE),
    red: Color(0xFF9A1810),
    redBg: Color(0xFFFADCD8),
    chip: Color(0xFFE2E0D8),
    line: Color(0xFF5E5C57),
    outline: Color(0xFF2E2D2A),
    previous: Color(0xFF6B6963),
    panel: Color(0xFFF1F0EA),
  );

  /// Colorblind mode: the status pair olive (good / near) vs red (over) is hard to tell apart
  /// with red-green color blindness (the most common kinds), so it becomes blue vs orange
  /// (Okabe-Ito hues, distinguishable with every common type), darkened to keep text contrast.
  Palette colorblindSafe() {
    final hc = identical(this, highContrast);
    return Palette(
      bg: bg,
      ink: ink,
      muted: muted,
      lime: lime,
      olive: hc ? const Color(0xFF003F7D) : const Color(0xFF0B5FA5),
      navPill: navPill,
      navBar: navBar,
      red: hc ? const Color(0xFF8A3300) : const Color(0xFFB34700),
      redBg: const Color(0xFFFBE3D0),
      chip: chip,
      line: line,
      outline: outline,
      previous: previous,
      panel: panel,
    );
  }
}

/// The current palette's colors. [use] switches palettes; the app root then rebuilds every
/// screen (see PaceApp), so widgets just read `C.ink` etc. when they build.
class C {
  static Palette _p = Palette.standard;
  static bool _highContrast = false, _colorblind = false;
  static bool get highContrast => _highContrast;
  static bool get colorblind => _colorblind;

  /// Selects the palette for the user's display preferences.
  static void use({required bool highContrast, required bool colorblind}) {
    _highContrast = highContrast;
    _colorblind = colorblind;
    final base = highContrast ? Palette.highContrast : Palette.standard;
    _p = colorblind ? base.colorblindSafe() : base;
  }

  /// The palette in use (painters compare it to know when to repaint).
  static Palette get palette => _p;

  static Color get bg => _p.bg;
  static Color get ink => _p.ink;
  static Color get muted => _p.muted;
  static Color get lime => _p.lime;
  static Color get olive => _p.olive;
  static Color get navPill => _p.navPill;
  static Color get navBar => _p.navBar;
  static Color get red => _p.red;
  static Color get redBg => _p.redBg;
  static Color get chip => _p.chip;
  static Color get line => _p.line;
  static Color get outline => _p.outline;
  static Color get previous => _p.previous;
  static Color get panel => _p.panel;
}

ThemeData paceTheme() {
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: C.bg,
    colorScheme: ColorScheme.fromSeed(
      seedColor: C.lime,
      surface: C.bg,
      primary: C.ink,
      outline: C.outline,
    ),
    fontFamily: 'Roboto',
    textTheme: Typography.blackMountainView.apply(
      bodyColor: C.ink,
      displayColor: C.ink,
    ),
    dividerColor: C.line,
  );
}

/// Text styles in the current palette.
class T {
  static TextStyle get display => TextStyle(fontSize: 34, fontWeight: FontWeight.w700, height: 1.2, color: C.ink);
  static TextStyle get h1 => TextStyle(fontSize: 28, fontWeight: FontWeight.w600, height: 1.2, color: C.ink);
  static TextStyle get title => TextStyle(fontSize: 22, fontWeight: FontWeight.w500, color: C.ink);
  static TextStyle get appBar => TextStyle(fontSize: 20, fontWeight: FontWeight.w500, color: C.ink);
  static TextStyle get body => TextStyle(fontSize: 16, height: 1.4, color: C.muted);
  static TextStyle get row => TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: C.ink);
  static TextStyle get sub => TextStyle(fontSize: 13, color: C.muted);
  static TextStyle get amount => TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: C.ink);
  static TextStyle get label => TextStyle(fontSize: 13, fontWeight: FontWeight.w700, letterSpacing: 0.4, color: C.ink);
  static TextStyle get link => TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: C.olive);
  static TextStyle get big => TextStyle(fontSize: 44, fontWeight: FontWeight.w300, height: 1.1, color: C.ink);
}
