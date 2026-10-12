import 'package:flutter/gestures.dart' show Offset, PointerDeviceKind;
import 'package:flutter/material.dart'
    show AnimatedContainer, AnimatedScale, BoxDecoration, Center, MaterialApp, Scaffold, Text;
import 'package:flutter_test/flutter_test.dart' show WidgetTester, closeTo, expect, find, lessThan, testWidgets;
import 'package:pace_app/views/widgets/widgets.dart' show PressFeedback, Tap;

void main() {
  double overlayAlpha(WidgetTester tester) {
    final box = tester.widget<AnimatedContainer>(find.descendant(of: find.byType(PressFeedback), matching: find.byType(AnimatedContainer)));
    return ((box.foregroundDecoration as BoxDecoration?)?.color?.a ?? 0);
  }

  double scale(WidgetTester tester) => tester.widget<AnimatedScale>(find.byType(AnimatedScale)).scale;

  testWidgets('Tap shows hover overlay, press overlay + shrink, and fires onTap', (tester) async {
    var taps = 0;
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(body: Center(child: Tap(onTap: () => taps++, child: const Text('Go')))),
    ));
    expect(overlayAlpha(tester), 0);

    final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
    await mouse.addPointer(location: Offset.zero);
    await mouse.moveTo(tester.getCenter(find.text('Go')));
    await tester.pumpAndSettle();
    expect(overlayAlpha(tester), closeTo(0.06, 0.01));

    await mouse.down(tester.getCenter(find.text('Go')));
    await tester.pump();
    expect(overlayAlpha(tester), closeTo(0.12, 0.01));
    expect(scale(tester), lessThan(1));

    await mouse.up();
    await tester.pumpAndSettle();
    expect(scale(tester), 1);
    expect(taps, 1);
  });

  testWidgets('disabled Tap shows no feedback', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: Center(child: Tap(child: Text('Off'))))));
    final g = await tester.startGesture(tester.getCenter(find.text('Off')));
    await tester.pump();
    expect(overlayAlpha(tester), 0);
    expect(scale(tester), 1);
    await g.up();
  });
}
