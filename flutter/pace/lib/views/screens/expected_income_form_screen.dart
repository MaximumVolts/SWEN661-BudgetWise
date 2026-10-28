import 'package:flutter/material.dart'
    show BuildContext, Column, CrossAxisAlignment, EdgeInsets, Expanded, FontWeight, Icon, Icons, ListView, MainAxisSize,
        Padding, Row, SafeArea, Scaffold, SizedBox, State, StatefulWidget, Text, TextCapitalization, TextEditingController,
        TextField, TextInputAction, TextInputType, TextStyle, ValueChanged, Widget, showDatePicker;
import '../format.dart' show Fmt;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show PaceCard, PaceTopBar, PillButton, Tap, paceInputDecoration;

/// Cash flow → Add expected income: what it is, how much, and when it's expected.
class ExpectedIncomeFormScreen extends StatefulWidget {
  final DateTime? date;
  final String? Function(String field) errorFor;
  final bool isSaving;
  final ValueChanged<DateTime>? onDateSelected;
  final void Function(String name, String amount)? onSave;
  final void Function()? onBack;

  const ExpectedIncomeFormScreen({
    super.key,
    required this.errorFor,
    this.date,
    this.isSaving = false,
    this.onDateSelected,
    this.onSave,
    this.onBack,
  });

  @override
  State<ExpectedIncomeFormScreen> createState() => _ExpectedIncomeFormScreenState();
}

class _ExpectedIncomeFormScreenState extends State<ExpectedIncomeFormScreen> {
  final _name = TextEditingController();
  final _amount = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _amount.dispose();
    super.dispose();
  }

  void _save() => widget.onSave?.call(_name.text, _amount.text);

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final picked = await showDatePicker(
      context: context,
      initialDate: widget.date ?? today,
      firstDate: today,
      lastDate: DateTime(now.year + 1, now.month, now.day),
      helpText: 'Expected on',
    );
    if (picked != null) widget.onDateSelected?.call(picked);
  }

  @override
  Widget build(BuildContext context) {
    final w = widget;
    final dateError = w.errorFor('date');
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar('Add expected income', back: true, onBack: w.onBack),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  const SizedBox(height: 8),
                  Text('One-off money you expect, like a tax refund or a freelance payment. It’s added to your '
                      'cash flow projection on that date.', style: T.body),
                  const SizedBox(height: 18),
                  TextField(
                    controller: _name,
                    textCapitalization: TextCapitalization.sentences,
                    textInputAction: TextInputAction.next,
                    style: const TextStyle(fontSize: 18),
                    decoration: paceInputDecoration(label: 'What is it?', hint: 'e.g. Tax refund', error: w.errorFor('name')),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _amount,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    textInputAction: TextInputAction.done,
                    style: const TextStyle(fontSize: 18),
                    decoration: paceInputDecoration(label: 'Amount', prefixText: '\$ ', error: w.errorFor('amount')),
                  ),
                  const SizedBox(height: 22),
                  const Text('Expected on', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 10),
                  Row(children: [
                    Tap(
                      onTap: w.isSaving ? null : _pickDate,
                      semanticLabel: w.date == null ? 'Choose when you expect it' : 'Expected on ${Fmt.date(w.date!)}, change',
                      child: PaceCard(
                        radius: 10,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(Icons.event_outlined, size: 48, color: C.ink),
                          const SizedBox(width: 10),
                          Text(w.date == null ? 'Choose a date' : Fmt.date(w.date!),
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                        ]),
                      ),
                    ),
                  ]),
                  if (dateError != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(dateError, style: TextStyle(fontSize: 13, color: C.red)),
                      ]),
                    ),
                  const SizedBox(height: 28),
                  PillButton(w.isSaving ? 'Saving…' : 'Add income', onPressed: w.isSaving ? null : _save),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
