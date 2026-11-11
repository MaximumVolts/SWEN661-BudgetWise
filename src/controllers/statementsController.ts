import { useState } from 'react';
import type { StatementFormat } from '../models/statement';
import { useAppNavigator } from '../navigation/appNavigator';
import { useNotice } from '../state/NoticeContext';
import { useServices } from '../state/ServicesContext';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/**
 * Statement export: pick an account, a month and a format, see what the statement will contain,
 * and download it. What a statement includes is StatementService's.
 */
export function useStatementsController() {
  const { statements } = useServices();
  const nav = useAppNavigator();
  const notify = useNotice();
  const perform = useAction();
  const options = useAsyncData(() => statements.options(), [statements]);
  /** '' = all accounts. */
  const [accountId, setAccountId] = useState('');
  const [monthId, setMonthId] = useState<string>();
  const [format, setFormat] = useState<StatementFormat>('pdf');
  const [downloading, setDownloading] = useState(false);
  // The latest month until the user picks one.
  const month = monthId ?? options.state.data?.months[0]?.id;
  const preview = useAsyncData(async () => (month ? statements.statement(accountId, month) : undefined), [statements, accountId, month]);

  const download = async () => {
    if (!month || downloading) return;
    setDownloading(true);
    let saved: string | undefined;
    await perform(async () => (saved = await statements.download(accountId, month, format)));
    setDownloading(false);
    if (saved) notify(`Statement saved as ${saved}`);
  };

  return {
    options,
    preview,
    accountId,
    setAccountId,
    month,
    setMonth: setMonthId,
    format,
    setFormat,
    downloading,
    download,
    back: nav.back,
  };
}

export type StatementsController = ReturnType<typeof useStatementsController>;
