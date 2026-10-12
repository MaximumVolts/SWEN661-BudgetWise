import '../models/navigation.dart' show FlowStep, LinkOutcome;
import '../services/app_navigator.dart' show AppNavigator;
import '../services/bank_link_service.dart' show BankLinkService;
import 'base_controller.dart' show ScreenController;

class ConnectBankController extends ScreenController {
  final BankLinkService _link;
  ConnectBankController({required BankLinkService link, required AppNavigator navigator})
      : _link = link,
        super(navigator);

  bool isConnecting = false;

  Future<void> connect() async {
    isConnecting = true;
    notifyListeners();
    LinkOutcome? outcome;
    final ok = await perform(() async => outcome = await _link.startLink());
    isConnecting = false;
    notifyListeners();
    final next = outcome?.next;
    if (ok && (outcome?.linked ?? false) && next != null) navigator.openFlowStep(next);
  }

  Future<void> notNow() async {
    FlowStep? next;
    final ok = await perform(() async => next = await _link.skipLinking());
    final step = next;
    if (ok && step != null) navigator.openFlowStep(step);
  }
}
