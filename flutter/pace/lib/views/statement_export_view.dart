import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/statement_export_controller.dart' show StatementExportController;
import 'screens/statement_export_screen.dart' show StatementExportScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class StatementExportView extends StatelessWidget {
  final StatementExportController controller;
  const StatementExportView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<StatementExportController>(
        controller: controller,
        builder: (context, c) => StatementExportScreen(
          accounts: c.options.accounts,
          months: c.options.months,
          selectedAccount: c.selectedAccount,
          selectedMonth: c.selectedMonth,
          format: c.format,
          preview: c.preview,
          isDownloading: c.isDownloading,
          onAccountSelected: c.selectAccount,
          onMonthSelected: c.selectMonth,
          onFormatSelected: c.selectFormat,
          onDownload: c.download,
          onBack: c.back,
        ),
      );
}
