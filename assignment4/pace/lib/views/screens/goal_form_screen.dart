import 'package:flutter/material.dart'
    show BuildContext, Colors, Column, CrossAxisAlignment, EdgeInsets, Expanded, FontWeight, Icon, Icons, ListView,
        MainAxisSize, Padding, Row, SafeArea, Scaffold, SizedBox, State, StatefulWidget, Text, TextCapitalization,
        TextEditingController, TextField, TextInputAction, TextInputType, TextStyle, ValueChanged, Widget, Wrap,
        showDatePicker;
import '../../models/goal.dart' show GoalIcon;
import '../format.dart' show Fmt;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show AppIcons, PaceCard, PaceChip, PaceTopBar, PillButton, Tap, paceInputDecoration;

/// Savings goals → +: name, target, how much is already saved, an optional target date and an icon.
class GoalFormScreen extends StatefulWidget {
  final List<GoalIcon> icons;
  final String? iconKey;
  final DateTime? targetDate;
  final String? Function(String field) errorFor;
  final bool isSaving;
  final ValueChanged<GoalIcon>? onIconSelected;
  /// null clears the date.
  final ValueChanged<DateTime?>? onTargetDateSelected;
  final void Function(String name, String target, String saved)? onSave;
  final void Function()? onBack;

  const GoalFormScreen({
    super.key,
    required this.icons,
    required this.errorFor,
    this.iconKey,
    this.targetDate,
    this.isSaving = false,
    this.onIconSelected,
    this.onTargetDateSelected,
    this.onSave,
    this.onBack,
  });

  @override
  State<GoalFormScreen> createState() => _GoalFormScreenState();
}

class _GoalFormScreenState extends State<GoalFormScreen> {
  final _name = TextEditingController();
  final _target = TextEditingController();
  final _saved = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _target.dispose();
    _saved.dispose();
    super.dispose();
  }

  void _save() => widget.onSave?.call(_name.text, _target.text, _saved.text);

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final picked = await showDatePicker(
      context: context,
      initialDate: widget.targetDate ?? DateTime(now.year + 1, now.month, now.day),
      firstDate: today,
      lastDate: DateTime(now.year + 50),
      helpText: 'Reach it by',
    );
    if (picked != null) widget.onTargetDateSelected?.call(picked);
  }

  @override
  Widget build(BuildContext context) {
    final w = widget;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar('New savings goal', back: true, onBack: w.onBack),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  const SizedBox(height: 8),
                  TextField(
                    controller: _name,
                    textCapitalization: TextCapitalization.sentences,
                    textInputAction: TextInputAction.next,
                    style: const TextStyle(fontSize: 18),
                    decoration: paceInputDecoration(label: 'Name', hint: 'e.g. Emergency fund', error: w.errorFor('name')),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _target,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    textInputAction: TextInputAction.next,
                    style: const TextStyle(fontSize: 18),
                    decoration: paceInputDecoration(label: 'Target', prefixText: '\$ ', error: w.errorFor('target')),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _saved,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    textInputAction: TextInputAction.done,
                    style: const TextStyle(fontSize: 18),
                    decoration: paceInputDecoration(
                      label: 'Saved so far (optional)',
                      prefixText: '\$ ',
                      helper: 'Leave empty if you’re starting from zero',
                      error: w.errorFor('saved'),
                    ),
                  ),
                  _section('Target date (optional)', w.errorFor('targetDate'), [
                    Tap(
                      onTap: w.isSaving ? null : _pickDate,
                      semanticLabel: w.targetDate == null ? 'Choose a target date' : 'Target date ${Fmt.date(w.targetDate!)}, change',
                      child: PaceCard(
                        radius: 10,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(Icons.event_outlined, color: C.ink),
                          const SizedBox(width: 10),
                          Text(w.targetDate == null ? 'Choose a date' : Fmt.date(w.targetDate!),
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                        ]),
                      ),
                    ),
                    if (w.targetDate != null)
                      Tap(
                        onTap: w.isSaving ? null : () => w.onTargetDateSelected?.call(null),
                        semanticLabel: 'Remove the target date',
                        child: const Padding(padding: EdgeInsets.all(12), child: Icon(Icons.close)),
                      ),
                  ]),
                  if (w.targetDate != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text('Pace will suggest how much to save each month.', style: T.sub),
                    ),
                  _section('Icon', w.errorFor('icon'), [
                    for (final i in w.icons)
                      Tap(
                        onTap: w.isSaving ? null : () => w.onIconSelected?.call(i),
                        selected: i.key == w.iconKey,
                        child: PaceChip(i.label, icon: AppIcons.of(i.key), selected: i.key == w.iconKey, selectedBg: C.ink, selectedFg: Colors.white),
                      ),
                  ]),
                  const SizedBox(height: 28),
                  PillButton(w.isSaving ? 'Saving…' : 'Add goal', onPressed: w.isSaving ? null : _save),
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
}
