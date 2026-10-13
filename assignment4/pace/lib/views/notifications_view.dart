import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/notifications_controller.dart' show NotificationsController;
import 'screens/notifications_screen.dart' show NotificationsScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class NotificationsView extends StatelessWidget {
  final NotificationsController controller;
  const NotificationsView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<NotificationsController>(
        controller: controller,
        builder: (context, c) => NotificationsScreen(
          data: c.data!,
          onClose: c.close,
          onMarkAllRead: c.markAllRead,
          onFilterChanged: c.selectFilter,
          onItemTap: c.openTarget,
          onPrimaryAction: c.runPrimaryAction,
          onSecondaryAction: c.openTarget,
        ),
      );
}
