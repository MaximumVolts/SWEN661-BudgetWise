import '../models/recurring.dart' show RecurringFormOptions, RecurringFrequency, RecurringKind;
import '../models/transaction.dart' show CategoryInfo;
import '../services/bill_service.dart' show BillService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show FormController;

/// Add a recurring expense ([editingId] null) or edit one the user added. UI state only: what's
/// valid lives in [BillService]. Field errors: 'name', 'amount', 'frequency', 'firstDue',
/// 'category', 'kind'.
class BillFormController extends FormController {
  final BillService _service;
  final String? editingId;
  BillFormController({required BillService service, required AppNavigator navigator, this.editingId})
      : _service = service,
        super(navigator);

  bool get isEditing => editingId != null;

  RecurringFormOptions? options;
  RecurringKind? kind;
  RecurringFrequency? frequency;
  DateTime? firstDue;
  String? categoryId;

  List<CategoryInfo> get categories => options?.categories ?? const [];
  String get initialName => options?.editing?.name ?? '';
  String get initialAmount {
    final a = options?.editing?.amount;
    if (a == null) return '';
    return a == a.roundToDouble() ? a.toStringAsFixed(0) : a.toStringAsFixed(2);
  }

  @override
  Future<void> fetch() async {
    final o = options = await _service.formOptions(editingId: editingId);
    final e = o.editing;
    kind = e?.kind ?? kind;
    frequency = e?.frequency ?? frequency ?? RecurringFrequency.monthly;
    firstDue = e?.firstDue ?? firstDue;
    categoryId = e?.categoryId ?? categoryId;
  }

  void _set(String field, void Function() change) {
    change();
    fieldErrors = {...fieldErrors}..remove(field);
    notifyListeners();
  }

  void selectKind(RecurringKind k) => _set('kind', () => kind = k);
  void selectFrequency(RecurringFrequency f) => _set('frequency', () => frequency = f);
  void selectFirstDue(DateTime d) => _set('firstDue', () => firstDue = d);
  void selectCategory(CategoryInfo c) => _set('category', () => categoryId = c.id);

  /// Saves and goes back on success; shows field errors otherwise.
  Future<void> save({required String name, required String amount}) async {
    final saved = await submit(() => _service.saveRecurring(
          editingId: editingId,
          name: name,
          amount: amount,
          frequency: frequency,
          firstDue: firstDue,
          categoryId: categoryId,
          kind: kind,
        ));
    if (saved) navigator.back();
  }
}
