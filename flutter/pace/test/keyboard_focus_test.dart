import 'package:flutter/material.dart' show Column, Container, MaterialApp, Scaffold, Text;
import 'package:flutter/services.dart' show LogicalKeyboardKey;
import 'package:flutter/widgets.dart' show FocusManager;
import 'package:flutter_test/flutter_test.dart';
import 'package:pace_app/views/widgets/widgets.dart' show Tap;

/// Keyboard access (WCAG 2.1.1, 2.4.7): Tab reaches every Tap, Enter and Space press it,
/// and the focused Tap draws a visible outline.
void main() {
  testWidgets('Tab moves between buttons, Enter and Space press them, focus is outlined', (tester) async {
    final pressed = <String>[];
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Column(children: [
          Tap(onTap: () => pressed.add('first'), child: const Text('First')),
          Tap(onTap: () => pressed.add('second'), semanticLabel: 'Second', child: const Text('Second')),
        ]),
      ),
    ));

    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pumpAndSettle();
    expect(FocusManager.instance.primaryFocus?.context, isNotNull);
    await tester.sendKeyEvent(LogicalKeyboardKey.enter);
    expect(pressed, ['first']);

    // The focused button shows an outline.
    final outlined = tester.widgetList<Container>(find.byType(Container)).where((c) => c.foregroundDecoration != null);
    expect(outlined, isNotEmpty);

    await tester.sendKeyEvent(LogicalKeyboardKey.tab);
    await tester.pumpAndSettle();
    await tester.sendKeyEvent(LogicalKeyboardKey.space);
    expect(pressed, ['first', 'second']);
  });
}
