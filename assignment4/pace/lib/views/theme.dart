import 'package:flutter/material.dart' show Color, ColorScheme, FontWeight, TextStyle, ThemeData, Typography;

/// Pace design tokens, sampled from the design file.
class C {
  static const bg = Color(0xFFFBFAF6);
  static const ink = Color(0xFF1A1A1A);
  static const muted = Color(0xFF5B5A55);
  static const lime = Color(0xFFE8F26B);
  static const olive = Color(0xFF4A5400);
  static const navPill = Color(0xFF22260A);
  static const navBar = Color(0xFFF1F0EA);
  static const red = Color(0xFFC0281E);
  static const redBg = Color(0xFFFADCD8);
  static const chip = Color(0xFFEBEAE4);
  static const line = Color(0xFFD3D1C9);
  static const outline = Color(0xFF8C8A84);
}

ThemeData paceTheme() {
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: C.bg,
    colorScheme: ColorScheme.fromSeed(
      seedColor: C.lime,
      surface: C.bg,
      primary: C.ink,
    ),
    fontFamily: 'Roboto',
    textTheme: Typography.blackMountainView.apply(
      bodyColor: C.ink,
      displayColor: C.ink,
    ),
    dividerColor: C.line,
  );
}

class T {
  static const display = TextStyle(fontSize: 34, fontWeight: FontWeight.w700, height: 1.2, color: C.ink);
  static const h1 = TextStyle(fontSize: 28, fontWeight: FontWeight.w600, height: 1.2, color: C.ink);
  static const title = TextStyle(fontSize: 22, fontWeight: FontWeight.w500, color: C.ink);
  static const appBar = TextStyle(fontSize: 20, fontWeight: FontWeight.w500, color: C.ink);
  static const body = TextStyle(fontSize: 16, height: 1.4, color: C.muted);
  static const row = TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: C.ink);
  static const sub = TextStyle(fontSize: 13, color: C.muted);
  static const amount = TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: C.ink);
  static const label = TextStyle(fontSize: 13, fontWeight: FontWeight.w700, letterSpacing: 0.4, color: C.ink);
  static const link = TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: C.olive);
  static const big = TextStyle(fontSize: 44, fontWeight: FontWeight.w300, height: 1.1, color: C.ink);
}
