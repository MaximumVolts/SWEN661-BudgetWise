import 'package:flutter/material.dart' show MaterialApp;
import 'package:flutter_test/flutter_test.dart'
    show expect, find, findsNothing, findsOneWidget, group, setUp, test, testWidgets;
import 'package:pace_app/controllers/transaction_detail_controller.dart' show TransactionDetailController;
import 'package:pace_app/models/transaction.dart'
    show
        CategoryInfo,
        FilterChoice,
        FilterKind,
        TransactionDetailBundle,
        TransactionDetailData,
        TransactionGroup,
        TransactionQuery;
import 'package:pace_app/services/transaction_service.dart' show TransactionService;
import 'package:pace_app/views/navigation/app_modals.dart' show DefaultAppModals;
import 'package:pace_app/views/navigation/app_router_delegate.dart' show AppRouterDelegate;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/router_app_navigator.dart' show RouterAppNavigator;
import 'package:pace_app/views/screens/transaction_detail_screen.dart' show TransactionDetailScreen;

const food = CategoryInfo(id: 'food', name: 'Food & drink', iconKey: 'food');
const travel = CategoryInfo(id: 'travel', name: 'Travel', iconKey: 'car');
const shopping = CategoryInfo(id: 'shopping', name: 'Shopping', iconKey: 'shopping_bag');

TransactionDetailData detail(List<String> ids) => TransactionDetailData(
      id: 't1',
      title: 'Tectra Inc',
      iconKey: 'food',
      amount: -500,
      dateLabel: 'October 1, 2026',
      accountLabel: 'Plaid Checking ••0000',
      statusLabel: 'Posted Oct 1',
      merchantLabel: 'TECTRA INC',
      selectedCategoryIds: ids,
    );

/// Records what the controller saves.
class FakeTransactions implements TransactionService {
  List<String> saved = const ['food'];
  bool fail = false;
  @override
  Future<TransactionDetailBundle> getDetail(String id) async =>
      TransactionDetailBundle(transaction: detail(saved), categories: const [food, travel, shopping]);
  @override
  Future<void> setCategories({required String transactionId, required List<String> categoryIds}) async {
    if (fail) throw Exception('offline');
    saved = categoryIds;
  }
  @override
  Future<List<TransactionGroup>> getGroups(TransactionQuery query) async => const [];
  @override
  Future<List<FilterChoice>> getFilterChoices(FilterKind kind) async => const [];
  @override
  Future<List<CategoryInfo>> getCategories() async => const [food, travel, shopping];
  @override
  Future<void> setNote({required String transactionId, required String note}) async {}
}

void main() {
  group('TransactionDetailController.toggleCategory', () {
    late FakeTransactions service;
    late TransactionDetailController c;
    setUp(() async {
      service = FakeTransactions();
      c = TransactionDetailController(
        transactionId: 't1',
        service: service,
        navigator: RouterAppNavigator(AppRouterDelegate(initialStack: const [AppRoute.home]), const DefaultAppModals()),
      );
      await c.load();
    });

    test('adds categories after the primary, and removes them again', () async {
      await c.toggleCategory(travel);
      await c.toggleCategory(shopping);
      expect(c.selectedCategoryIds, ['food', 'travel', 'shopping']);
      expect(service.saved, ['food', 'travel', 'shopping']);
      await c.toggleCategory(travel);
      expect(service.saved, ['food', 'shopping']);
    });

    test('removing the primary promotes the next one; the last one can’t be removed', () async {
      await c.toggleCategory(travel);
      await c.toggleCategory(food);
      expect(service.saved, ['travel']);
      await c.toggleCategory(travel);
      expect(c.selectedCategoryIds, ['travel']);
      expect(service.saved, ['travel']);
    });

    test('reverts if saving fails', () async {
      service.fail = true;
      await c.toggleCategory(travel);
      expect(c.selectedCategoryIds, ['food']);
    });
  });

  testWidgets('detail screen: several chips selected, the first marked Primary', (tester) async {
    final tapped = <String>[];
    Future<void> show(List<String> ids) => tester.pumpWidget(MaterialApp(
          home: TransactionDetailScreen(
            transaction: detail(ids),
            categories: const [food, travel, shopping],
            onCategoryToggled: (c) => tapped.add(c.id),
          ),
        ));

    await show(['food']);
    expect(find.text('Primary'), findsNothing); // only marked when there's more than one
    expect(find.text('Category'), findsOneWidget);

    await show(['travel', 'food']);
    expect(find.text('Categories'), findsOneWidget);
    expect(find.text('Primary'), findsOneWidget);
    await tester.tap(find.text('Shopping'));
    expect(tapped, ['shopping']);
  });
}
