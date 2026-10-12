import '../models/trend.dart' show TrendsData;

abstract class TrendService {
  Future<TrendsData> getTrends();
}
