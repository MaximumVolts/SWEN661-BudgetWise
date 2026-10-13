import 'package:flutter/material.dart'
    show Align, Alignment, Border, BorderRadius, BoxDecoration, BuildContext, Canvas, Center, Clip, Color, Colors, Column,
        Container, CrossAxisAlignment, CustomPaint, CustomPainter, EdgeInsets, ExcludeSemantics, Expanded,
        FractionallySizedBox, MainAxisAlignment, Offset, Padding, Paint, PaintingStyle, Path, Radius, Row, Semantics,
        Size, SizedBox, StatelessWidget, StrokeJoin, Text, TextDirection, TextPainter, TextSpan, TextStyle,
        ValueChanged, Widget;
import '../format.dart' show Fmt;
import '../../models/cash_flow.dart' show CashFlowChartData;
import '../../models/dashboard.dart' show SpendChartData;
import '../../models/spending.dart' show BarDatum;
import '../theme.dart' show C, Palette;
import 'display_options.dart' show PaceDisplay;
import 'widgets.dart' show PressFeedback;

/// Area + line chart for "spend so far" with dashed projection and optional previous-period line.
/// Empty data draws nothing.
class SpendAreaChart extends StatelessWidget {
  final SpendChartData data;
  final double height;
  /// Screen-reader description. Defaults to a summary generated from [data].
  final String? semanticLabel;
  const SpendAreaChart({super.key, required this.data, this.height = 150, this.semanticLabel});

  String get _summary {
    final b = StringBuffer('Spending trend chart.');
    if (data.actual.isNotEmpty) b.write(' Spent so far ${Fmt.money(data.actual.last, decimals: 0)}.');
    if (data.projected.isNotEmpty) b.write(' Projected to reach ${Fmt.money(data.projected.last, decimals: 0)}.');
    if (data.previous.isNotEmpty) b.write(' Previous period ended at ${Fmt.money(data.previous.last, decimals: 0)}.');
    return b.toString();
  }

  @override
  Widget build(BuildContext context) => Semantics(
        label: semanticLabel ?? _summary,
        image: true,
        excludeSemantics: true,
        child: SizedBox(
          height: height,
          width: double.infinity,
          child: CustomPaint(painter: _SpendAreaPainter(data, colorblind: PaceDisplay.colorblindOf(context))),
        ),
      );
}

class _SpendAreaPainter extends CustomPainter {
  final SpendChartData d;
  /// Colorblind mode: the previous-period line is dotted, not just a lighter color.
  final bool colorblind;
  final Palette palette = C.palette;
  _SpendAreaPainter(this.d, {required this.colorblind});

  @override
  void paint(Canvas canvas, Size s) {
    final all = [...d.actual, ...d.projected, ...d.previous];
    if (all.isEmpty || d.actual.isEmpty) return;
    final maxY = all.reduce((a, b) => a > b ? a : b);
    if (maxY <= 0) return;
    final slots = [d.previous.length, d.actual.length + d.projected.length].reduce((a, b) => a > b ? a : b);
    if (slots < 2) return;
    const pad = 6.0;
    Offset pt(int i, double v) => Offset(
          i / (slots - 1) * s.width,
          pad + (s.height - 2 * pad) * (1 - v / maxY),
        );

    // previous period (light; dotted in colorblind mode)
    if (d.previous.length > 1) {
      final paint = Paint()..color = C.previous..style = PaintingStyle.stroke..strokeWidth = 2;
      if (colorblind) {
        for (var i = 1; i < d.previous.length; i++) {
          _dashed(canvas, pt(i - 1, d.previous[i - 1]), pt(i, d.previous[i]), paint, dash: 2, gap: 3);
        }
      } else {
        final p = Path();
        for (var i = 0; i < d.previous.length; i++) {
          final o = pt(i, d.previous[i]);
          i == 0 ? p.moveTo(o.dx, o.dy) : p.lineTo(o.dx, o.dy);
        }
        canvas.drawPath(p, paint);
      }
    }

    // actual area + line
    final pts = [for (var i = 0; i < d.actual.length; i++) pt(i, d.actual[i])];
    final area = Path()..moveTo(pts.first.dx, s.height);
    for (final p in pts) {
      area.lineTo(p.dx, p.dy);
    }
    area.lineTo(pts.last.dx, s.height);
    area.close();
    canvas.drawPath(area, Paint()..color = C.lime);
    final line = Path()..moveTo(pts.first.dx, pts.first.dy);
    for (final p in pts.skip(1)) {
      line.lineTo(p.dx, p.dy);
    }
    canvas.drawPath(line, Paint()..color = C.ink..style = PaintingStyle.stroke..strokeWidth = 2..strokeJoin = StrokeJoin.round);
    canvas.drawCircle(pts.last, 5, Paint()..color = C.ink);

    // projection (dashed)
    if (d.projected.isNotEmpty) {
      var prev = pts.last;
      final dp = Paint()..color = C.muted..style = PaintingStyle.stroke..strokeWidth = 2;
      for (var i = 0; i < d.projected.length; i++) {
        final next = pt(d.actual.length + i, d.projected[i]);
        _dashed(canvas, prev, next, dp);
        prev = next;
      }
    }
  }

  void _dashed(Canvas c, Offset a, Offset b, Paint p, {double dash = 6, double gap = 4}) {
    final delta = b - a;
    final len = delta.distance;
    if (len == 0) return;
    final dir = delta / len;
    double t = 0;
    while (t < len) {
      final end = (t + dash) > len ? len : t + dash;
      c.drawLine(a + dir * t, a + dir * end, p);
      t += dash + gap;
    }
  }

  @override
  bool shouldRepaint(covariant _SpendAreaPainter old) => old.d != d || old.colorblind != colorblind || old.palette != palette;
}

/// Simple bar chart. Bar heights scale to the max value. Tap a bar via [onBarTap].
/// Each bar is a separate accessible element ("25: $120.00", selected when highlighted).
class PaceBarChart extends StatelessWidget {
  final List<BarDatum> bars;
  final int? highlighted;
  final ValueChanged<int>? onBarTap;
  final double height;
  /// Prefix for the spoken label of each bar when it has no x-axis label, e.g. "Day".
  final String barNoun;
  const PaceBarChart({
    super.key,
    required this.bars,
    this.highlighted,
    this.onBarTap,
    this.height = 120,
    this.barNoun = 'Bar',
  });

  @override
  Widget build(BuildContext context) {
    if (bars.isEmpty) return SizedBox(height: height);
    final colorblind = PaceDisplay.colorblindOf(context);
    final maxV = bars.map((b) => b.value).reduce((a, b) => a > b ? a : b);
    return Column(
      children: [
        SizedBox(
          height: height,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              for (var i = 0; i < bars.length; i++)
                Expanded(
                  child: Semantics(
                    button: onBarTap != null,
                    selected: i == highlighted,
                    label: '${bars[i].semanticLabel ?? (bars[i].label.isEmpty ? '$barNoun ${i + 1}' : bars[i].label)}: ${Fmt.money(bars[i].value)}',
                    excludeSemantics: true,
                    onTap: onBarTap == null ? null : () => onBarTap!(i),
                    child: PressFeedback(
                      onTap: onBarTap == null ? null : () => onBarTap!(i),
                      showOverlay: false,
                      child: Align(
                        alignment: Alignment.bottomCenter,
                        child: FractionallySizedBox(
                          widthFactor: 0.7,
                          child: Container(
                            height: maxV <= 0 ? 2 : (height * bars[i].value / maxV).clamp(2.0, height).toDouble(),
                            clipBehavior: Clip.antiAlias,
                            decoration: BoxDecoration(
                              color: i == highlighted ? C.lime : C.chip,
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
                              border: Border.all(color: i == highlighted ? C.olive : C.outline, width: i == highlighted ? 1.5 : 1),
                            ),
                            // Colorblind mode: the selected bar is hatched, not only a different color.
                            child: i == highlighted && colorblind ? CustomPaint(painter: _HatchPainter(C.olive)) : null,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        ExcludeSemantics(
          child: Row(
            children: [
              for (final b in bars)
                Expanded(child: Center(child: Text(b.label, style: TextStyle(fontSize: 12, color: C.muted)))),
            ],
          ),
        ),
      ],
    );
  }
}

/// Diagonal hatching, to mark something without relying on color.
class _HatchPainter extends CustomPainter {
  final Color color;
  _HatchPainter(this.color);

  @override
  void paint(Canvas canvas, Size s) {
    final p = Paint()
      ..color = color
      ..strokeWidth = 1.5;
    for (double x = -s.height; x < s.width; x += 6) {
      canvas.drawLine(Offset(x, s.height), Offset(x + s.height, 0), p);
    }
  }

  @override
  bool shouldRepaint(covariant _HatchPainter old) => old.color != color;
}

/// Line chart for projected cash with dashed gridlines, optional low-point + end-point annotations.
class CashFlowChart extends StatelessWidget {
  final CashFlowChartData data;
  final double height;
  /// Screen-reader description. Defaults to a summary generated from [data].
  final String? semanticLabel;
  const CashFlowChart({super.key, required this.data, this.height = 170, this.semanticLabel});

  String get _summary {
    final v = data.values;
    if (v.isEmpty) return 'Projected cash chart with no data.';
    final lowest = v.reduce((a, b) => a < b ? a : b);
    return 'Projected cash chart. Starts at ${Fmt.money(v.first)}, lowest ${Fmt.money(lowest)}, ends at ${Fmt.money(v.last)}.';
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: semanticLabel ?? _summary,
      image: true,
      excludeSemantics: true,
      child: Column(
        children: [
          SizedBox(height: height, width: double.infinity, child: CustomPaint(painter: _CashPainter(data))),
          if (data.xLabels.isNotEmpty) ...[
            const SizedBox(height: 6),
            Padding(
              padding: const EdgeInsets.only(left: _CashPainter.leftGutter),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [for (final l in data.xLabels) Text(l, style: TextStyle(fontSize: 11, color: C.muted))],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _CashPainter extends CustomPainter {
  static const leftGutter = 34.0;
  final CashFlowChartData d;
  final Palette palette = C.palette;
  _CashPainter(this.d);

  @override
  void paint(Canvas canvas, Size s) {
    if (d.values.length < 2) return;
    final all = [...d.values, ...d.gridValues];
    var minY = all.reduce((a, b) => a < b ? a : b);
    var maxY = all.reduce((a, b) => a > b ? a : b);
    if (maxY == minY) maxY = minY + 1;
    final span = maxY - minY;
    minY -= span * 0.1;
    maxY += span * 0.1;
    final w = s.width - leftGutter;
    double y(double v) => s.height * (1 - (v - minY) / (maxY - minY));
    Offset pt(int i) => Offset(leftGutter + w * i / (d.values.length - 1), y(d.values[i]));

    final grid = Paint()..color = C.line..strokeWidth = 1;
    for (final v in d.gridValues) {
      double x = leftGutter;
      while (x < s.width) {
        canvas.drawLine(Offset(x, y(v)), Offset((x + 5).clamp(0.0, s.width).toDouble(), y(v)), grid);
        x += 9;
      }
      final tp = TextPainter(
        text: TextSpan(text: Fmt.compact(v), style: TextStyle(fontSize: 11, color: C.muted)),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, Offset(0, y(v) - tp.height / 2));
    }

    final pts = [for (var i = 0; i < d.values.length; i++) pt(i)];
    final path = Path()..moveTo(pts.first.dx, pts.first.dy);
    for (final p in pts.skip(1)) {
      path.lineTo(p.dx, p.dy);
    }
    canvas.drawPath(path, Paint()..color = C.ink..style = PaintingStyle.stroke..strokeWidth = 2..strokeJoin = StrokeJoin.round);

    final li = d.lowIndex;
    if (li != null && li >= 0 && li < pts.length) {
      canvas.drawCircle(pts[li], 5, Paint()..color = Colors.white);
      canvas.drawCircle(pts[li], 5, Paint()..color = C.ink..style = PaintingStyle.stroke..strokeWidth = 2);
      if (d.lowLabel != null) _label(canvas, d.lowLabel!, pts[li] + const Offset(-6, 10));
    }
    canvas.drawCircle(pts.last, 5, Paint()..color = C.ink);
    if (d.endLabel != null) {
      final tp = _tp(d.endLabel!);
      tp.paint(canvas, Offset(pts.last.dx - tp.width - 10, pts.last.dy - 18));
    }
  }

  TextPainter _tp(String t) =>
      TextPainter(text: TextSpan(text: t, style: TextStyle(fontSize: 11, color: C.ink)), textDirection: TextDirection.ltr)..layout();
  void _label(Canvas c, String t, Offset o) => _tp(t).paint(c, o);

  @override
  bool shouldRepaint(covariant _CashPainter old) => old.d != d || old.palette != palette;
}
