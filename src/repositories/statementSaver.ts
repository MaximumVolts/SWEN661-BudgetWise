import { File, Paths } from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import type { StatementFile } from '../models/statement';

/** Where downloaded statements go. No business rules: it just writes the file. */
export interface StatementSaver {
  /** Saves [file]. Returns false if the user cancelled or saving isn't possible. */
  save(file: StatementFile): Promise<boolean>;
}

/**
 * [StatementSaver] that writes the file (a PDF is printed from its HTML) and opens the system
 * share sheet, where the user picks where it goes (Files / Drive / Downloads, an email…).
 */
export class ShareSheetStatementSaver implements StatementSaver {
  async save(file: StatementFile): Promise<boolean> {
    if (!(await isAvailableAsync())) return false;
    let uri: string;
    if (file.format === 'pdf') {
      const printed = await printToFileAsync({ html: file.content });
      const named = new File(Paths.cache, file.fileName);
      if (named.exists) named.delete();
      const pdf = new File(printed.uri);
      await pdf.move(named); // works whether this version's move is sync or async
      uri = pdf.uri;
    } else {
      const out = new File(Paths.cache, file.fileName);
      if (out.exists) out.delete();
      out.create();
      out.write(file.content);
      uri = out.uri;
    }
    await shareAsync(uri, { mimeType: file.mimeType, dialogTitle: 'Save statement', UTI: file.format === 'pdf' ? 'com.adobe.pdf' : 'public.comma-separated-values-text' });
    return true;
  }
}

/** Keeps saved statements in memory (tests). */
export class InMemoryStatementSaver implements StatementSaver {
  readonly saved: StatementFile[] = [];
  /** True: the user cancels the save. */
  cancel = false;
  async save(file: StatementFile) {
    if (this.cancel) return false;
    this.saved.push(file);
    return true;
  }
}
