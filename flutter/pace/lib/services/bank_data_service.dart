import 'package:flutter/foundation.dart' show protected;
import '../repositories/bank_data_repository.dart' show BankDataRepository;
import '../repositories/transaction_annotation_repository.dart' show TransactionAnnotationRepository;
import 'calendar.dart' show Calendar;

/// Base for services whose answers are computed from the linked banks' data (via
/// [BankDataRepository]), with an injectable clock so "today" can be fixed in tests.
abstract class BankDataService {
  @protected
  final BankDataRepository bankData;
  final DateTime Function() _clock;

  BankDataService(this.bankData, {DateTime Function()? now}) : _clock = now ?? DateTime.now;

  /// The current time (the injected clock).
  @protected
  DateTime currentTime() => _clock();

  /// Today's date, at midnight.
  @protected
  DateTime currentDate() => Calendar.dateOnly(_clock());
}

/// A [BankDataService] that also applies the user's own edits to bank transactions (chosen
/// categories, notes, paid bills, paused subscriptions) from [TransactionAnnotationRepository].
abstract class AnnotatedBankDataService extends BankDataService {
  @protected
  final TransactionAnnotationRepository annotations;

  AnnotatedBankDataService(super.bankData, this.annotations, {super.now});
}
