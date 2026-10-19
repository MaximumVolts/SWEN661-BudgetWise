// Turns coverage/lcov.info (from `flutter test --coverage`) into docs/coverage.md: total line
// coverage, coverage per layer, and per file.
//
//   flutter test --coverage
//   dart run tool/coverage_report.dart
import 'dart:io';

void main() {
  final lcov = File('coverage/lcov.info');
  if (!lcov.existsSync()) {
    stderr.writeln('coverage/lcov.info not found: run `flutter test --coverage` first.');
    exit(1);
  }

  final found = <String, int>{}, hit = <String, int>{};
  String? file;
  for (final line in lcov.readAsLinesSync()) {
    if (line.startsWith('SF:')) {
      file = line.substring(3).replaceAll(r'\', '/');
    } else if (line.startsWith('LF:')) {
      found[file!] = int.parse(line.substring(3));
    } else if (line.startsWith('LH:')) {
      hit[file!] = int.parse(line.substring(3));
    }
  }

  String pct(int h, int f) => f == 0 ? '–' : '${(100 * h / f).toStringAsFixed(1)}%';
  String layerOf(String f) {
    final parts = f.split('/');
    final i = parts.indexOf('lib');
    return i >= 0 && i + 2 < parts.length ? parts[i + 1] : '(root)';
  }

  final files = found.keys.toList()..sort();
  final layers = <String, List<int>>{};
  var totalHit = 0, totalFound = 0;
  for (final f in files) {
    final h = hit[f] ?? 0, n = found[f]!;
    totalHit += h;
    totalFound += n;
    final l = layers.putIfAbsent(layerOf(f), () => [0, 0]);
    l[0] += h;
    l[1] += n;
  }

  final now = DateTime.now();
  final date = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
  final out = StringBuffer()
    ..writeln('# Test coverage report')
    ..writeln()
    ..writeln('Generated $date from `flutter test --coverage` (regenerate: `dart run tool/coverage_report.dart`).')
    ..writeln()
    ..writeln('**Total line coverage: ${pct(totalHit, totalFound)}** ($totalHit of $totalFound lines)')
    ..writeln()
    ..writeln('## By layer')
    ..writeln()
    ..writeln('| Layer | Coverage | Lines hit / found |')
    ..writeln('|---|---:|---:|');
  for (final e in (layers.entries.toList()..sort((a, b) => a.key.compareTo(b.key)))) {
    out.writeln('| ${e.key} | ${pct(e.value[0], e.value[1])} | ${e.value[0]} / ${e.value[1]} |');
  }
  out
    ..writeln()
    ..writeln('## By file')
    ..writeln()
    ..writeln('| File | Coverage | Lines hit / found |')
    ..writeln('|---|---:|---:|');
  for (final f in files) {
    final i = f.indexOf('lib/');
    out.writeln('| `${i >= 0 ? f.substring(i) : f}` | ${pct(hit[f] ?? 0, found[f]!)} | ${hit[f] ?? 0} / ${found[f]} |');
  }

  final report = File('docs/coverage.md')..createSync(recursive: true);
  report.writeAsStringSync(out.toString());
  stdout.writeln('Wrote ${report.path}: ${pct(totalHit, totalFound)} line coverage.');
}
