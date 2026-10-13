import 'package:file_picker/file_picker.dart' show FilePicker;
import '../models/statement.dart' show StatementFile;

/// Where downloaded statements go. No business rules: it just writes the bytes.
abstract class StatementSaver {
  /// Saves [file]. Returns false if the user cancelled.
  Future<bool> save(StatementFile file);
}

/// [StatementSaver] using the system "Save as" dialog (Android's Storage Access Framework, the
/// iOS document picker…): the user picks the folder, e.g. Downloads. Needs no storage permission.
class FilePickerStatementSaver implements StatementSaver {
  const FilePickerStatementSaver();

  @override
  Future<bool> save(StatementFile file) async {
    final saved = await FilePicker.saveFile(
      dialogTitle: 'Save statement',
      fileName: file.fileName,
      bytes: file.bytes,
      mimeType: file.mimeType,
    );
    return saved != null;
  }
}

/// Keeps saved statements in memory (tests).
class InMemoryStatementSaver implements StatementSaver {
  final saved = <StatementFile>[];
  /// Set to simulate the user cancelling the save dialog.
  bool cancel = false;

  @override
  Future<bool> save(StatementFile file) async {
    if (cancel) return false;
    saved.add(file);
    return true;
  }
}
