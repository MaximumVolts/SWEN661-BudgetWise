import '../models/bank_data.dart' show RecurringStream;
import 'bank_data_service.dart' show AnnotatedBankDataService;
import '../models/bill.dart' show BillItem, BillSection, BillsUpcomingData, RecurringData, RecurringItem, SubscriptionStatus;
import '../models/app_exception.dart' show AppException;
import 'bank_categories.dart' show BankCategories;
import 'calendar.dart' show Calendar;
import 'bill_service.dart' show BillService;
import 'date_labels.dart' show DateLabels;
import '../models/money.dart' show Money;

/// [BillService] built from the recurring payments Plaid (sandbox) detects in the linked banks.
/// BUSINESS RULES: a bill is an active recurring outflow; "upcoming" = next due within 30 days
/// (or overdue); monthly cost normalises each payment's frequency; paid / paused are Pace's
/// annotations (the bank itself isn't changed).
class PlaidBillService extends AnnotatedBankDataService implements BillService {
  static const _windowDays = 30;

  PlaidBillService(super.bankData, super.annotations, {super.now});

  /// Active recurring payments (money out), soonest first.
  Future<List<RecurringStream>> _bills() async {
    final snap = await bankData.load();
    final bills = [for (final s in snap.recurring) if (!s.isInflow && s.isActive) s];
    bills.sort((a, b) => (a.nextDate ?? DateTime(9999)).compareTo(b.nextDate ?? DateTime(9999)));
    return bills;
  }

  @override
  Future<List<({BillItem bill, DateTime due})>> upcomingWithDates() async {
    final today = currentDate();
    final paid = await annotations.paidBills();
    final paused = await annotations.pausedSubscriptions();
    return [
      for (final s in await _bills())
        if (s.nextDate != null &&
            !paused.contains(s.streamId) &&
            paid[s.streamId] != s.nextDate &&
            s.nextDate!.isBefore(Calendar.addDays(today, _windowDays)))
          (
            due: s.nextDate!,
            bill: BillItem(
              id: s.streamId,
              title: s.displayName,
              subtitle: s.nextDate!.isBefore(today)
                  ? 'Overdue · was due ${DateLabels.short(s.nextDate!)}'
                  : 'Due ${DateLabels.short(s.nextDate!)}',
              amount: s.lastAmount,
              iconKey: BankCategories.forPlaid(s.categoryPrimary).iconKey,
              isOverdue: s.nextDate!.isBefore(today),
            ),
          ),
    ];
  }

  Future<List<BillItem>> upcomingBills() async => [for (final u in await upcomingWithDates()) u.bill];

  @override
  Future<BillsUpcomingData> getUpcoming() async {
    final upcoming = await upcomingWithDates();
    final bills = [for (final u in upcoming) u.bill];
    final weekEnd = Calendar.addDays(currentDate(), 7);
    final soon = <BillItem>[], later = <BillItem>[];
    for (final u in upcoming) {
      (u.due.isBefore(weekEnd) ? soon : later).add(u.bill);
    }
    return BillsUpcomingData(
      summaryLabel: 'Due in the next 30 days',
      summaryAmount: bills.fold(0.0, (sum, b) => sum + b.amount),
      summaryDetail: bills.isEmpty ? 'No bills found in your linked bank' : '${bills.length} bill${bills.length == 1 ? '' : 's'} scheduled',
      sections: [
        if (soon.isNotEmpty) BillSection(title: 'This week', items: soon),
        if (later.isNotEmpty) BillSection(title: 'Later', items: later),
      ],
    );
  }

  @override
  Future<RecurringData> getRecurring() async {
    final bills = await _bills();
    final paused = await annotations.pausedSubscriptions();
    var monthly = 0.0;
    final items = <RecurringItem>[];
    for (final s in bills) {
      final isPaused = paused.contains(s.streamId);
      final perMonth = monthlyCost(s);
      if (!isPaused) monthly += perMonth;
      items.add(RecurringItem(
        id: s.streamId,
        name: s.displayName,
        iconKey: BankCategories.forPlaid(s.categoryPrimary).iconKey,
        detailLine: [
          '${Money.format(s.averageAmount)} ${_frequencyLabel(s.frequency)}',
          if (isPaused) 'paused' else if (s.nextDate != null) 'next ${DateLabels.short(s.nextDate!)}',
        ].join(' · '),
        yearlyLine: isPaused ? '\$0 a year while paused' : '${Money.format(perMonth * 12)} a year',
        status: isPaused ? SubscriptionStatus.paused : SubscriptionStatus.active,
      ));
    }
    final biggest = bills.isEmpty ? null : (bills.toList()..sort((a, b) => monthlyCost(b).compareTo(monthlyCost(a)))).first;
    return RecurringData(
      monthlyTotal: monthly,
      yearlyTotal: monthly * 12,
      items: items,
      insight: biggest == null
          ? 'No recurring payments found in your linked bank yet.'
          : 'Your biggest recurring payment is ${biggest.displayName} at about ${Money.format(monthlyCost(biggest))} a month.',
    );
  }

  @override
  Future<void> markPaid(String billId) async {
    final bill = (await _bills()).where((s) => s.streamId == billId).firstOrNull;
    if (bill?.nextDate == null) throw const AppException('That bill is no longer in your linked bank.');
    await annotations.markBillPaid(billId, bill!.nextDate!);
  }

  @override
  Future<void> setSubscriptionPaused({required String id, required bool paused}) =>
      annotations.setSubscriptionPaused(id, paused);

  /// What a stream costs per month, whatever its frequency.
  static double monthlyCost(RecurringStream s) => s.averageAmount * switch (s.frequency) {
        'WEEKLY' => 52 / 12,
        'BIWEEKLY' => 26 / 12,
        'SEMI_MONTHLY' => 2,
        'ANNUALLY' => 1 / 12,
        _ => 1, // MONTHLY / UNKNOWN
      };

  static String _frequencyLabel(String f) => switch (f) {
        'WEEKLY' => 'weekly',
        'BIWEEKLY' => 'every 2 weeks',
        'SEMI_MONTHLY' => 'twice a month',
        'ANNUALLY' => 'yearly',
        'MONTHLY' => 'monthly',
        _ => 'recurring',
      };

  /// How many days between payments, for projecting future ones.
  static int periodDays(String frequency) => switch (frequency) {
        'WEEKLY' => 7,
        'BIWEEKLY' => 14,
        'SEMI_MONTHLY' => 15,
        'ANNUALLY' => 365,
        _ => 30,
      };
}
