import 'package:flutter/material.dart'
    show
        BuildContext,
        Colors,
        Column,
        CrossAxisAlignment,
        EdgeInsets,
        Expanded,
        FontWeight,
        Icon,
        IconData,
        Icons,
        ListView,
        MainAxisSize,
        Padding,
        Row,
        SafeArea,
        Scaffold,
        SizedBox,
        State,
        StatefulWidget,
        Text,
        TextEditingController,
        TextField,
        TextInputAction,
        TextInputType,
        TextStyle,
        ValueChanged,
        Widget,
        Wrap,
        showDatePicker;
import '../../models/recurring.dart' show RecurringFrequency, RecurringKind;
import '../../models/transaction.dart' show CategoryInfo;
import '../format.dart' show Fmt;
import '../theme.dart' show C;
import '../widgets/widgets.dart' show AppIcons, PaceCard, PaceChip, PaceTopBar, PillButton, Tap, paceInputDecoration;

/// Add or edit a recurring expense: name, amount, bill or subscription, how often, the next
/// payment date and a category.
class BillFormScreen extends StatefulWidget {
  final bool isEditing;
  final String initialName;
  final String initialAmount;
  final List<RecurringKind> kinds;
  final List<RecurringFrequency> frequencies;
  final List<CategoryInfo> categories;
  final RecurringKind? kind;
  final RecurringFrequency? frequency;
  final DateTime? firstDue;
  final String? categoryId;
  final String? Function(String field) errorFor;
  final bool isSaving;
  final ValueChanged<RecurringKind>? onKindSelected;
  final ValueChanged<RecurringFrequency>? onFrequencySelected;
  final ValueChanged<DateTime>? onFirstDueSelected;
  final ValueChanged<CategoryInfo>? onCategorySelected;
  final void Function(String name, String amount)? onSave;
  final void Function()? onBack;

  const BillFormScreen({
    super.key,
    required this.isEditing,
    required this.initialName,
    required this.initialAmount,
    required this.kinds,
    required this.frequencies,
    required this.categories,
    required this.errorFor,
    this.kind,
    this.frequency,
    this.firstDue,
    this.categoryId,
    this.isSaving = false,
    this.onKindSelected,
    this.onFrequencySelected,
    this.onFirstDueSelected,
    this.onCategorySelected,
    this.onSave,
    this.onBack,
  });

  @override
  State<BillFormScreen> createState() => _BillFormScreenState();
}

class _BillFormScreenState extends State<BillFormScreen> {
  late final _name = TextEditingController(text: widget.initialName);
  late final _amount = TextEditingController(text: widget.initialAmount);

  @override
  void dispose() {
    _name.dispose();
    _amount.dispose();
    super.dispose();
  }

  void _save() => widget.onSave?.call(_name.text, _amount.text);

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: widget.firstDue ?? now,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 2),
      helpText: 'Next payment',
    );
    if (picked != null) widget.onFirstDueSelected?.call(picked);
  }

  @override
  Widget build(BuildContext context) {
    final w = widget;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar(w.isEditing ? 'Edit recurring expense' : 'New recurring expense', back: true, onBack: w.onBack),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  const SizedBox(height: 8),
                  TextField(
                    controller: _name,
                    textInputAction: TextInputAction.next,
                    style: const TextStyle(fontSize: 18),
                    decoration: paceInputDecoration(label: 'Name', hint: 'e.g. Netflix or Rent', error: w.errorFor('name')),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _amount,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    textInputAction: TextInputAction.done,
                    style: const TextStyle(fontSize: 18),
                    decoration: paceInputDecoration(label: 'Amount each time', prefixText: '\$ ', error: w.errorFor('amount')),
                  ),
                  _section('Type', w.errorFor('kind'), [
                    for (final k in w.kinds) _choice(k.label, k == w.kind, () => w.onKindSelected?.call(k)),
                  ]),
                  _section('How often', w.errorFor('frequency'), [
                    for (final f in w.frequencies) _choice(f.label, f == w.frequency, () => w.onFrequencySelected?.call(f)),
                  ]),
                  _section('Next payment', w.errorFor('firstDue'), [
                    Tap(
                      onTap: w.isSaving ? null : _pickDate,
                      semanticLabel: w.firstDue == null ? 'Choose the next payment date' : 'Next payment ${Fmt.date(w.firstDue!)}, change',
                      child: PaceCard(
                        radius: 10,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(Icons.event_outlined, color: C.ink),
                          const SizedBox(width: 10),
                          Text(w.firstDue == null ? 'Choose a date' : Fmt.date(w.firstDue!),
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                        ]),
                      ),
                    ),
                  ]),
                  _section('Category', w.errorFor('category'), [
                    for (final c in w.categories)
                      _choice(c.name, c.id == w.categoryId, () => w.onCategorySelected?.call(c), icon: AppIcons.of(c.iconKey)),
                  ]),
                  const SizedBox(height: 28),
                  PillButton(
                    w.isSaving ? 'Saving…' : (w.isEditing ? 'Save changes' : 'Start tracking'),
                    onPressed: w.isSaving ? null : _save,
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _section(String title, String? error, List<Widget> children) => Padding(
        padding: const EdgeInsets.only(top: 22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 10),
            Wrap(spacing: 10, runSpacing: 10, children: children),
            if (error != null) ...[
              const SizedBox(height: 8),
              Text(error, style: TextStyle(fontSize: 13, color: C.red)),
            ],
          ],
        ),
      );

  Widget _choice(String label, bool selected, void Function() onTap, {IconData? icon}) => Tap(
        onTap: widget.isSaving ? null : onTap,
        selected: selected,
        child: PaceChip(label, icon: icon, selected: selected, selectedBg: C.ink, selectedFg: Colors.white),
      );
}
