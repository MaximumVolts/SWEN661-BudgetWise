import 'dart:convert' show utf8;
import 'dart:typed_data' show Uint8List;
import 'package:pdf/pdf.dart' show PdfColor, PdfColors, PdfPageFormat;
import 'package:pdf/widgets.dart' as pw;
import '../models/money.dart' show Money;
import '../models/statement.dart' show Statement, StatementFormat;
import 'date_labels.dart' show DateLabels;

/// Turns a [Statement] into the bytes of one file format. Each format is its own encoder, so the
/// statement service picks one by [format] without knowing how files are laid out.
abstract class StatementEncoder {
  StatementFormat get format;
  Future<Uint8List> encode(Statement statement);

  /// The encoders for every [StatementFormat].
  static final all = <StatementFormat, StatementEncoder>{
    for (final e in <StatementEncoder>[CsvStatementEncoder(), PdfStatementEncoder()]) e.format: e,
  };

  /// 2026-10-09
  static String isoDate(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}

/// Spreadsheet-friendly CSV: one header row, then one row per transaction (oldest first), amounts
/// as plain numbers (negative = money out). UTF-8 with a byte-order mark so Excel reads it right.
class CsvStatementEncoder extends StatementEncoder {
  static const header = ['Date', 'Description', 'Category', 'Account', 'Amount', 'Note'];

  @override
  StatementFormat get format => StatementFormat.csv;

  @override
  Future<Uint8List> encode(Statement s) async {
    final rows = [
      header,
      for (final l in s.lines)
        [StatementEncoder.isoDate(l.date), l.description, l.category, l.account, l.amount.toStringAsFixed(2), l.note],
    ];
    final text = rows.map((r) => r.map(_cell).join(',')).join('\r\n');
    return Uint8List.fromList([0xEF, 0xBB, 0xBF, ...utf8.encode('$text\r\n')]);
  }

  /// Quotes a cell when it contains a comma, quote or line break (RFC 4180).
  static String _cell(String v) =>
      RegExp(r'[",\r\n]').hasMatch(v) ? '"${v.replaceAll('"', '""')}"' : v;
}

/// A printable PDF: the account, month and totals, then a table of the transactions.
class PdfStatementEncoder extends StatementEncoder {
  static const _ink = PdfColor.fromInt(0xFF1A1A1A);
  static const _muted = PdfColor.fromInt(0xFF5B5A55);

  @override
  StatementFormat get format => StatementFormat.pdf;

  @override
  Future<Uint8List> encode(Statement s) async {
    final doc = pw.Document(title: 'Pace statement · ${_text(s.accountLabel)} · ${s.periodLabel}', author: 'Pace');
    doc.addPage(pw.MultiPage(
      pageFormat: PdfPageFormat.letter,
      margin: const pw.EdgeInsets.all(40),
      header: (context) => pw.Row(children: [
        pw.Text('Pace', style: const pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold, color: _ink)),
        pw.Spacer(),
        pw.Text('Statement · ${s.periodLabel}', style: const pw.TextStyle(fontSize: 11, color: _muted)),
      ]),
      footer: (context) => pw.Row(children: [
        pw.Text('Plaid sandbox test data · generated ${DateLabels.long(s.generatedOn)}',
            style: const pw.TextStyle(fontSize: 8, color: _muted)),
        pw.Spacer(),
        pw.Text('Page ${context.pageNumber} of ${context.pagesCount}', style: const pw.TextStyle(fontSize: 8, color: _muted)),
      ]),
      build: (context) => [
        pw.SizedBox(height: 16),
        pw.Text(_text(s.accountLabel), style: const pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold, color: _ink)),
        pw.Text(s.periodLabel, style: const pw.TextStyle(fontSize: 12, color: _muted)),
        pw.SizedBox(height: 14),
        pw.Row(children: [
          _total('Money in', s.moneyIn),
          _total('Money out', -s.moneyOut),
          _total('Net', s.net),
        ]),
        pw.SizedBox(height: 18),
        if (s.lines.isEmpty)
          pw.Text('No posted transactions this month.', style: const pw.TextStyle(fontSize: 11, color: _muted))
        else
          pw.TableHelper.fromTextArray(
            headers: const ['Date', 'Description', 'Category', 'Amount'],
            data: [
              for (final l in s.lines)
                [
                  StatementEncoder.isoDate(l.date),
                  _text(l.note.isEmpty ? l.description : '${l.description} (${l.note})'),
                  _text(l.category),
                  _money(l.amount),
                ],
            ],
            headerStyle: const pw.TextStyle(fontSize: 9, fontWeight: pw.FontWeight.bold, color: _ink),
            cellStyle: const pw.TextStyle(fontSize: 9, color: _ink),
            headerDecoration: const pw.BoxDecoration(color: PdfColors.grey200),
            headerAlignments: {0: pw.Alignment.centerLeft, 1: pw.Alignment.centerLeft, 2: pw.Alignment.centerLeft, 3: pw.Alignment.centerRight},
            cellAlignments: {3: pw.Alignment.centerRight},
            columnWidths: {
              0: const pw.FixedColumnWidth(70),
              1: const pw.FlexColumnWidth(3),
              2: const pw.FlexColumnWidth(2),
              3: const pw.FixedColumnWidth(80),
            },
            border: null,
            rowDecoration: const pw.BoxDecoration(
              border: pw.Border(bottom: pw.BorderSide(color: PdfColors.grey300, width: 0.5)),
            ),
          ),
      ],
    ));
    return doc.save();
  }

  pw.Widget _total(String label, double amount) => pw.Expanded(
        child: pw.Column(crossAxisAlignment: pw.CrossAxisAlignment.start, children: [
          pw.Text(label.toUpperCase(), style: const pw.TextStyle(fontSize: 8, color: _muted)),
          pw.Text(_money(amount), style: const pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold, color: _ink)),
        ]),
      );

  /// Money with a plain "-" (the PDF's built-in font has no "−").
  static String _money(double v) => _text(Money.signed(v));

  /// The built-in PDF font (Helvetica) only covers Latin-1: swap what it can't draw.
  static String _text(String v) {
    final swapped = v
        .replaceAll('−', '-')
        .replaceAll('•', '*')
        .replaceAll('…', '...')
        .replaceAll(RegExp('[‘’]'), "'")
        .replaceAll(RegExp('[“”]'), '"')
        .replaceAll(RegExp('[–—]'), '-');
    return String.fromCharCodes(swapped.runes.map((r) => r <= 0xFF ? r : 0x3F)); // anything else -> ?
  }
}
