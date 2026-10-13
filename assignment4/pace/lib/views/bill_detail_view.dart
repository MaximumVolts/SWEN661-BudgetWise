import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/bill_detail_controller.dart' show BillDetailController;
import 'screens/bill_detail_screen.dart' show BillDetailScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class BillDetailView extends StatelessWidget {
  final BillDetailController controller;
  const BillDetailView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<BillDetailController>(
        controller: controller,
        builder: (context, c) => BillDetailScreen(
          data: c.data!,
          onMarkPaid: c.markPaid,
          onTogglePaused: c.togglePaused,
          onEdit: c.edit,
          onDelete: c.delete,
          onPaymentTap: c.openPayment,
          onBack: c.back,
        ),
      );
}
