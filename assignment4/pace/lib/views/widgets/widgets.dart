import 'package:flutter/gestures.dart' show kTouchSlop;
import 'package:flutter/material.dart'
    show Align, Alignment, AnimatedContainer, AnimatedScale, Border, BorderRadius, BorderSide, BoxConstraints,
        BoxDecoration, BoxShape, BuildContext, Canvas, Clip, Color, Colors, Column, ConstrainedBox, Container,
        CrossAxisAlignment, Curves, CustomPaint, CustomPainter, Divider, EdgeInsets, EdgeInsetsGeometry, ElevatedButton,
        ExcludeSemantics, Expanded, FontWeight, GestureDetector, HitTestBehavior, Icon, IconData, Icons, Listener,
        MainAxisAlignment, MainAxisSize, MediaQuery, MergeSemantics, MouseCursor, MouseRegion, Offset, OutlinedButton,
        Padding, Paint, RRect, Radius, Rect, Row, SafeArea, Semantics, Size, SizedBox, Spacer, StadiumBorder, State,
        StatefulWidget, StatelessWidget, SystemMouseCursors, Text, TextStyle, ValueChanged, VoidCallback, Widget;
import '../theme.dart' show C, T;

/// White rounded card with a hairline border.
class PaceCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color color;
  final Color? borderColor;
  final double radius;
  /// Clip children to the rounded corners (use when children paint their own background).
  final bool clip;
  const PaceCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.color = Colors.white,
    this.borderColor,
    this.radius = 16,
    this.clip = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      clipBehavior: clip ? Clip.antiAlias : Clip.none,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: borderColor ?? C.line),
      ),
      child: child,
    );
  }
}

/// Circular (or rounded-square) icon badge.
class IconBadge extends StatelessWidget {
  final IconData icon;
  final Color bg;
  final Color fg;
  final double size;
  final bool square;
  const IconBadge(
    this.icon, {
    super.key,
    this.bg = C.chip,
    this.fg = C.ink,
    this.size = 44,
    this.square = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: bg,
        shape: square ? BoxShape.rectangle : BoxShape.circle,
        borderRadius: square ? BorderRadius.circular(8) : null,
      ),
      child: Icon(icon, size: size * 0.48, color: fg),
    );
  }
}

/// Large pill button (filled dark or outlined).
class PillButton extends StatelessWidget {
  final String label;
  final IconData? icon;
  final bool filled;
  final double height;
  final Color? background;
  final Color? foreground;
  final VoidCallback? onPressed;
  const PillButton(
    this.label, {
    super.key,
    this.icon,
    this.filled = true,
    this.height = 54,
    this.background,
    this.foreground,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final fg = foreground ?? (filled ? Colors.white : C.ink);
    final child = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        if (icon != null) ...[Icon(icon, size: 20, color: fg), const SizedBox(width: 8)],
        Text(label, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: fg)),
      ],
    );
    const shape = StadiumBorder();
    // The Material button draws the hover / press overlay; PressFeedback adds the press shrink.
    return PressFeedback(
      enabled: true,
      showOverlay: false,
      child: SizedBox(
        width: double.infinity,
        height: height,
        child: filled
            ? ElevatedButton(
                onPressed: onPressed ?? () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: background ?? C.ink,
                  elevation: 0,
                  shape: shape,
                  overlayColor: fg,
                ),
                child: child,
              )
            : OutlinedButton(
                onPressed: onPressed ?? () {},
                style: OutlinedButton.styleFrom(
                  backgroundColor: background,
                  side: const BorderSide(color: C.outline),
                  shape: shape,
                  overlayColor: fg,
                ),
                child: child,
              ),
      ),
    );
  }
}

/// Small outlined / filled rounded filter chip used across screens.
class PaceChip extends StatelessWidget {
  final String label;
  final IconData? icon;
  final bool selected;
  final Color selectedBg;
  final Color selectedFg;
  final bool showCheck;
  final EdgeInsetsGeometry padding;
  const PaceChip(
    this.label, {
    super.key,
    this.icon,
    this.selected = false,
    this.selectedBg = C.chip,
    this.selectedFg = C.ink,
    this.showCheck = false,
    this.padding = const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
  });

  @override
  Widget build(BuildContext context) {
    final fg = selected ? selectedFg : C.ink;
    return Semantics(
      selected: selected,
      child: Container(
      padding: padding,
      decoration: BoxDecoration(
        color: selected ? selectedBg : Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: selected ? selectedBg : C.outline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showCheck && selected) ...[Icon(Icons.check, size: 18, color: fg), const SizedBox(width: 8)],
          if (icon != null) ...[Icon(icon, size: 18, color: fg), const SizedBox(width: 8)],
          Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: fg)),
        ],
      ),
    ));
  }
}

/// Top bar: optional back arrow, title, trailing widget.
class PaceTopBar extends StatelessWidget {
  final String title;
  final bool back;
  final Widget? trailing;
  final bool centered;
  final VoidCallback? onBack;
  const PaceTopBar(this.title, {super.key, this.back = false, this.trailing, this.centered = false, this.onBack});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
      child: Row(
        children: [
          if (back) ...[
            Tap(onTap: onBack, semanticLabel: 'Back', child: const Icon(Icons.arrow_back, size: 26)),
            const SizedBox(width: 16),
          ],
          if (centered) const Spacer(),
          Heading(title, style: T.appBar.copyWith(fontSize: back ? 20 : 24)),
          const Spacer(),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

/// Uppercase small section header, optional olive action on the right.
class SectionHeader extends StatelessWidget {
  final String title;
  final String? action;
  final bool big;
  final VoidCallback? onAction;
  const SectionHeader(this.title, {super.key, this.action, this.big = false, this.onAction});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
      child: Row(
        children: [
          Heading(
            title,
            style: big
                ? const TextStyle(fontSize: 18, fontWeight: FontWeight.w500, letterSpacing: 0.3)
                : T.label,
          ),
          const Spacer(),
          if (action != null) Tap(onTap: onAction, child: Text(action!, style: T.link)),
        ],
      ),
    );
  }
}

/// Two/three segment toggle (e.g. Upcoming | Recurring).
class SegTabs extends StatefulWidget {
  final List<String> labels;
  final int initial;
  final ValueChanged<int>? onChanged;
  const SegTabs(this.labels, {super.key, this.initial = 0, this.onChanged});

  @override
  State<SegTabs> createState() => _SegTabsState();
}

class _SegTabsState extends State<SegTabs> {
  late int _i = widget.initial;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 42,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(21),
        border: Border.all(color: C.outline),
        color: Colors.white,
      ),
      clipBehavior: Clip.antiAlias,
      child: Row(
        children: [
          for (var k = 0; k < widget.labels.length; k++)
            Expanded(
              child: Semantics(
                button: true,
                selected: _i == k,
                label: widget.labels[k],
                excludeSemantics: true,
                onTap: () {
                  setState(() => _i = k);
                  widget.onChanged?.call(k);
                },
                child: PressFeedback(
                onTap: () {
                  setState(() => _i = k);
                  widget.onChanged?.call(k);
                },
                borderRadius: BorderRadius.zero,
                pressedScale: 1,
                child: Container(
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: _i == k ? C.chip : Colors.white,
                    border: k == 0 ? null : const Border(left: BorderSide(color: C.outline)),
                  ),
                  child: Text(widget.labels[k],
                      style: TextStyle(fontSize: 15, fontWeight: _i == k ? FontWeight.w700 : FontWeight.w500)),
                ),
              ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Progress bar: solid, or diagonal-striped (used for near-limit / over-budget).
class StripedBar extends StatelessWidget {
  final double value;
  final Color color;
  final Color track;
  final bool striped;
  final double height;
  /// Describes what the bar measures (e.g. "Food budget used"). If null the bar is treated as
  /// decorative because neighbouring text already states the numbers.
  final String? semanticLabel;
  const StripedBar({
    super.key,
    required this.value,
    this.color = C.ink,
    this.track = C.chip,
    this.striped = false,
    this.height = 8,
    this.semanticLabel,
  });

  @override
  Widget build(BuildContext context) {
    final bar = SizedBox(
      height: height,
      width: double.infinity,
      child: CustomPaint(painter: _BarPainter(value, color, track, striped)),
    );
    if (semanticLabel == null) return ExcludeSemantics(child: bar);
    return Semantics(label: semanticLabel, value: '${(value.clamp(0, 1) * 100).round()} percent', child: bar);
  }
}

class _BarPainter extends CustomPainter {
  final double v;
  final Color color, track;
  final bool striped;
  _BarPainter(this.v, this.color, this.track, this.striped);

  @override
  void paint(Canvas canvas, Size s) {
    final r = RRect.fromRectAndRadius(Offset.zero & s, Radius.circular(s.height / 2));
    canvas.save();
    canvas.clipRRect(r);
    canvas.drawRect(Offset.zero & s, Paint()..color = track);
    final w = s.width * v.clamp(0, 1);
    if (!striped) {
      canvas.drawRect(Rect.fromLTWH(0, 0, w, s.height), Paint()..color = color);
    } else {
      // light stripes on the remaining track
      final lp = Paint()
        ..color = color.withValues(alpha: 0.25)
        ..strokeWidth = 3;
      for (double x = -s.height; x < s.width; x += 7) {
        canvas.drawLine(Offset(x, s.height), Offset(x + s.height, 0), lp);
      }
      canvas.save();
      canvas.clipRect(Rect.fromLTWH(0, 0, w, s.height));
      canvas.drawRect(Rect.fromLTWH(0, 0, w, s.height), Paint()..color = color.withValues(alpha: 0.55));
      final dp = Paint()
        ..color = color
        ..strokeWidth = 3;
      for (double x = -s.height; x < w; x += 7) {
        canvas.drawLine(Offset(x, s.height), Offset(x + s.height, 0), dp);
      }
      canvas.restore();
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _BarPainter o) =>
      o.v != v || o.color != color || o.track != track || o.striped != striped;
}

/// Bottom navigation bar. [selected]: 0 Home, 1 Transactions, 2 Spending, 3 Budgets, 4 Bills.
class PaceNavBar extends StatelessWidget {
  final int selected;
  final ValueChanged<int>? onTap;
  const PaceNavBar({super.key, required this.selected, this.onTap});

  static const _items = <(IconData, String)>[
    (Icons.home_outlined, 'Home'),
    (Icons.receipt_long_outlined, 'Transactions'),
    (Icons.data_usage_rounded, 'Spending'),
    (Icons.account_balance_wallet_outlined, 'Budgets'),
    (Icons.calendar_today_outlined, 'Bills'),
  ];

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: 'Main navigation',
      child: Container(
        decoration: const BoxDecoration(
          color: C.navBar,
          border: Border(top: BorderSide(color: C.line)),
        ),
        padding: const EdgeInsets.fromLTRB(8, 12, 8, 12),
        child: SafeArea(
          top: false,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              for (var i = 0; i < _items.length; i++)
                Semantics(
                  button: true,
                  selected: i == selected,
                  label: _items[i].$2,
                  hint: 'Tab ${i + 1} of ${_items.length}',
                  excludeSemantics: true,
                  onTap: onTap == null ? null : () => onTap!(i),
                  child: PressFeedback(
                    onTap: onTap == null ? null : () => onTap!(i),
                    borderRadius: BorderRadius.circular(12),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 60,
                          height: 34,
                          decoration: BoxDecoration(
                            color: i == selected ? C.navPill : Colors.transparent,
                            borderRadius: BorderRadius.circular(17),
                          ),
                          child: Icon(_items[i].$1, size: 24, color: i == selected ? C.lime : C.ink),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _items[i].$2,
                          style: TextStyle(fontSize: 11.5, fontWeight: i == selected ? FontWeight.w700 : FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Thin horizontal divider used inside grouped cards.
class HairLine extends StatelessWidget {
  final double indent;
  const HairLine({super.key, this.indent = 0});
  @override
  Widget build(BuildContext context) =>
      Padding(padding: EdgeInsets.only(left: indent), child: const Divider(height: 1, thickness: 1, color: C.line));
}

/// Generic list row: leading badge, title + subtitle, trailing text/widget.
class ListRow extends StatelessWidget {
  final Widget? leading;
  final String title;
  final Widget? subtitle;
  final Widget? trailing;
  final EdgeInsetsGeometry padding;
  final TextStyle? titleStyle;
  const ListRow({
    super.key,
    this.leading,
    required this.title,
    this.subtitle,
    this.trailing,
    this.padding = const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
    this.titleStyle,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Row(
        children: [
          if (leading != null) ...[leading!, const SizedBox(width: 16)],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: titleStyle ?? const TextStyle(fontSize: 16.5, color: C.ink)),
                if (subtitle != null) ...[const SizedBox(height: 2), subtitle!],
              ],
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

/// Hover and press feedback shared by every tappable widget: click cursor, a translucent
/// overlay while hovered / pressed, and a slight shrink on press (skipped when the platform
/// asks to reduce motion).
///
/// Draws its own overlay instead of using InkWell, because ink is painted on the nearest
/// Material and is hidden by any coloured Container in between (e.g. PaceCard).
/// Pass [onTap] to handle the tap here; omit it and set [enabled] when [child] handles the
/// tap itself (e.g. a Material button), so only the visuals are added.
class PressFeedback extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final bool enabled;
  final BorderRadius borderRadius;
  final Color overlayColor;
  final bool showOverlay;
  final double pressedScale;
  const PressFeedback({
    super.key,
    required this.child,
    this.onTap,
    bool? enabled,
    this.borderRadius = const BorderRadius.all(Radius.circular(8)),
    this.overlayColor = C.ink,
    this.showOverlay = true,
    this.pressedScale = 0.97,
  }) : enabled = enabled ?? onTap != null;

  @override
  State<PressFeedback> createState() => _PressFeedbackState();
}

class _PressFeedbackState extends State<PressFeedback> {
  static const _duration = Duration(milliseconds: 120);
  bool _hovered = false;
  bool _pressed = false;
  Offset? _downAt;

  void _setPressed(bool v) {
    if (_pressed != v) setState(() => _pressed = v);
  }

  @override
  void didUpdateWidget(covariant PressFeedback old) {
    super.didUpdateWidget(old);
    if (!widget.enabled) {
      _hovered = false;
      _pressed = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final enabled = widget.enabled;
    final reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
    final alpha = !enabled ? 0.0 : (_pressed ? 0.12 : (_hovered ? 0.06 : 0.0));

    Widget content = widget.child;
    if (widget.showOverlay) {
      content = AnimatedContainer(
        duration: _duration,
        foregroundDecoration: BoxDecoration(
          color: widget.overlayColor.withValues(alpha: alpha),
          borderRadius: widget.borderRadius,
        ),
        child: content,
      );
    }
    if (!reduceMotion) {
      content = AnimatedScale(
        scale: enabled && _pressed ? widget.pressedScale : 1,
        duration: _duration,
        curve: Curves.easeOut,
        child: content,
      );
    }
    if (widget.onTap != null) {
      content = GestureDetector(behavior: HitTestBehavior.opaque, onTap: widget.onTap, child: content);
    }
    return MouseRegion(
      cursor: enabled ? SystemMouseCursors.click : MouseCursor.defer,
      onEnter: enabled ? (_) => setState(() => _hovered = true) : null,
      onExit: (_) => setState(() => _hovered = false),
      child: Listener(
        onPointerDown: enabled
            ? (e) {
                _downAt = e.position;
                _setPressed(true);
              }
            : null,
        // Dragging (e.g. scrolling a list) cancels the pressed look.
        onPointerMove: (e) {
          if (_downAt != null && (e.position - _downAt!).distance > kTouchSlop) _setPressed(false);
        },
        onPointerUp: (_) => _setPressed(false),
        onPointerCancel: (_) => _setPressed(false),
        child: content,
      ),
    );
  }
}

/// Opaque tap target that is a no-op when [onTap] is null.
///
/// Accessibility: exposes a button (or plain tappable if [isButton] is false).
/// - Icon-only targets MUST pass [semanticLabel]; they also get a 48x48 minimum hit area.
/// - Targets containing text merge their children's text into the node, so the visible text is the label.
class Tap extends StatelessWidget {
  final VoidCallback? onTap;
  final Widget child;
  final String? semanticLabel;
  final String? hint;
  final bool? selected;
  final bool isButton;
  const Tap({
    super.key,
    this.onTap,
    required this.child,
    this.semanticLabel,
    this.hint,
    this.selected,
    this.isButton = true,
  });

  @override
  Widget build(BuildContext context) {
    if (semanticLabel != null) {
      return Semantics(
        button: isButton,
        enabled: onTap != null,
        selected: selected,
        label: semanticLabel,
        hint: hint,
        onTap: onTap,
        excludeSemantics: true,
        child: PressFeedback(
          onTap: onTap,
          borderRadius: BorderRadius.circular(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
            child: Align(widthFactor: 1, heightFactor: 1, child: child),
          ),
        ),
      );
    }
    return MergeSemantics(
      child: Semantics(
        button: isButton,
        enabled: onTap != null,
        selected: selected,
        hint: hint,
        onTap: onTap,
        child: PressFeedback(onTap: onTap, child: child),
      ),
    );
  }
}

/// Text marked as a heading for screen readers.
class Heading extends StatelessWidget {
  final String text;
  final TextStyle? style;
  const Heading(this.text, {super.key, this.style});
  @override
  Widget build(BuildContext context) => Semantics(header: true, child: Text(text, style: style));
}

/// Resolves the string `iconKey` carried by models into a Material icon.
/// Models stay UI-free; services/backends only need to send one of these keys
/// (or add your own keys / swap in an icon font here).
class AppIcons {
  static const Map<String, IconData> _map = {
    // accounts
    'bank': Icons.account_balance_outlined,
    'savings': Icons.savings_outlined,
    'person': Icons.person_outline,
    'card': Icons.credit_card,
    'wallet': Icons.account_balance_wallet_outlined,
    // categories / merchants
    'food': Icons.restaurant,
    'groceries': Icons.shopping_basket_outlined,
    'shopping_bag': Icons.shopping_bag_outlined,
    'store': Icons.storefront_outlined,
    'coffee': Icons.coffee_outlined,
    'car': Icons.directions_car_outlined,
    'transit': Icons.directions_bus_outlined,
    'work': Icons.work_outline,
    'bills': Icons.receipt_long_outlined,
    'subscriptions': Icons.sync,
    'utilities': Icons.hexagon_outlined,
    'streaming': Icons.close,
    'payroll': Icons.credit_card,
    // bills
    'home': Icons.home_outlined,
    'water': Icons.water_drop_outlined,
    'internet': Icons.wifi,
    'cloud': Icons.cloud_outlined,
    'play': Icons.play_circle_outline,
    'fitness': Icons.fitness_center,
    // goals / tools
    'shield': Icons.shield_outlined,
    'laptop': Icons.laptop_mac,
    'chart': Icons.bar_chart,
    'add': Icons.add,
  };

  static IconData of(String key) => _map[key] ?? Icons.category_outlined;
}
