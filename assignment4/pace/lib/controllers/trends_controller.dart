import '../models/trend.dart' show TrendItem, TrendsData;
import '../services/app_navigator.dart' show AppNavigator;
import '../services/trend_service.dart' show TrendService;
import 'base_controller.dart' show ScreenController;

class TrendsController extends ScreenController {
  final TrendService _service;
  TrendsController({required TrendService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  TrendsData? data;

  @override
  Future<void> fetch() async => data = await _service.getTrends();

  void openTrend(TrendItem t) => navigator.openTrendDetail(t.id);
}
