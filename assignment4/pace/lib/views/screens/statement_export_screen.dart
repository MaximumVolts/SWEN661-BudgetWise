import 'package:flutter/material.dart'
    show
        BuildContext,
        Colors,
        Column,
        CrossAxisAlignment,
        EdgeInsets,
        Expanded,
        FontWeight,
        Icons,
        ListView,
        Padding,
        Row,
        SafeArea,
        Scaffold,
        SizedBox,
        StatelessWidget,
        Text,
        TextStyle,
        ValueChanged,
        VoidCallback,
        Widget,
        Wrap;
import '../../models/statement.dart' show Statement, StatementChoice, StatementFormat;
import '../format.dart' show Fmt;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show PaceCard, PaceChip, PaceTopBar, PillButton, Tap;

/// Statement export: account, month and format choices, a summary of what the statement holds,
/// and the download button.
class StatementExportScreen extends StatelessWidget {
  final List<StatementChoice> accounts;
  final List<StatementChoice> months;
  final int selectedAccount;
  final int selectedMonth;
  final StatementFormat format;
  final Statement? preview;
  final bool isDownloading;
  final ValueChanged<int>? onAccountSelected;
  final ValueChanged<int>? onMonthSelected;
  final ValueChanged<StatementFormat>? onFormatSelected;
  final VoidCallback? onDownload;
  final VoidCallback? onBack;

  const StatementExportScreen({
    super.key,
    required this.accounts,
    required this.months,
    required this.selectedAccount,
    required this.selectedMonth,
    required this.format,
    this.preview,
    this.isDownloading = false,
    this.onAccountSelected,
    this.onMonthSelected,
    this.onFormatSelected,
    this.onDownload,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar('Statement export', back: true, onBack: onBack),
            Expanded(
              child: accounts.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.all(20),
                      child: Text('Link a bank to download statements of its transactions.', style: T.body),
                    )
                  : ListView(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      children: [
                        Text('Download a month of posted transactions as a file you can keep or share.', style: T.body),
                        _section('Account', [
                          for (var i = 0; i < accounts.length; i++)
                            _choice(accounts[i].label, i == selectedAccount, () => onAccountSelected?.call(i)),
                        ]),
                        _section('Month', [
                          for (var i = 0; i < months.length; i++)
                            _choice(months[i].label, i == selectedMonth, () => onMonthSelected?.call(i)),
                        ]),
                        _section('Format', [
                          for (final f in StatementFormat.values)
                            _choice(f == StatementFormat.pdf ? 'PDF (to read or print)' : 'CSV (for spreadsheets)', f == format,
                                () => onFormatSelected?.call(f)),
                        ]),
                        const SizedBox(height: 22),
                        if (preview != null) _Summary(preview!),
                        const SizedBox(height: 20),
                        PillButton(
                          isDownloading ? 'Preparing statement…' : 'Download ${format.label} statement',
                          icon: Icons.file_download_outlined,
                          onPressed: isDownloading ? null : onDownload,
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

  Widget _section(String title, List<Widget> chips) => Padding(
        padding: const EdgeInsets.only(top: 22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 10),
            Wrap(spacing: 10, runSpacing: 10, children: chips),
          ],
        ),
      );

  Widget _choice(String label, bool selected, VoidCallback onTap) => Tap(
        onTap: onTap,
        selected: selected,
        child: PaceChip(label, selected: selected, selectedBg: C.ink, selectedFg: Colors.white, showCheck: true),
      );
}

/// What the statement will contain: how many transactions and the month's totals.
class _Summary extends StatelessWidget {
  final Statement s;
  const _Summary(this.s);

  @override
  Widget build(BuildContext context) {
    final count = s.lines.length;
    return PaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('${s.accountLabel} · ${s.periodLabel}', style: T.row),
          const SizedBox(height: 4),
          Text(count == 0 ? 'No posted transactions this month.' : '$count posted transaction${count == 1 ? '' : 's'}',
              style: T.sub),
          if (count > 0) ...[
            const SizedBox(height: 14),
            Row(children: [
              _total('Money in', Fmt.money(s.moneyIn)),
              _total('Money out', Fmt.money(s.moneyOut)),
              _total('Net', Fmt.signed(s.net)),
            ]),
          ],
        ],
      ),
    );
  }

  Widget _total(String label, String value) => Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label.toUpperCase(), style: T.label),
            const SizedBox(height: 2),
            Text(value, style: T.amount),
          ],
        ),
      );
}
