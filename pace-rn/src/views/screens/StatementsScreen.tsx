import { Text, View } from 'react-native';
import type { StatementsController } from '../../controllers/statementsController';
import { STATEMENT_FORMAT_INFO, STATEMENT_FORMATS, type StatementFormat, statementNet } from '../../models/statement';
import { useDisplay } from '../../state/PreferencesContext';
import { ChoiceChips } from '../../ui/ChoiceChips';
import { AsyncView, Card, Gap, PillButton, Screen, Scroll, TopBar } from '../../ui/components';
import { Fmt } from '../../ui/format';

const FORMAT_LABEL: Record<StatementFormat, string> = { pdf: 'PDF (to read or print)', csv: 'CSV (for spreadsheets)' };

/** Statement export: pick an account, a month and a format, preview, and download. */
export function StatementsScreen({ controller }: { controller: StatementsController }) {
  const { options, preview, accountId, setAccountId, month, setMonth, format, setFormat, downloading, download, back } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <Screen>
      <TopBar title="Statement export" onBack={back} />
      <AsyncView state={options.state} onRetry={options.reload}>
        {(o) =>
          o.accounts.length === 0 ? (
            <Text style={[t.body, { padding: 20 }]}>Link a bank to download statements of its transactions.</Text>
          ) : (
            <Scroll>
              <Text style={t.body}>Download a month of posted transactions as a file you can keep or share.</Text>
              <ChoiceChips title="Account" options={o.accounts.map((a) => ({ value: a.id, label: a.label }))} selected={accountId} onSelect={setAccountId} />
              <ChoiceChips title="Month" options={o.months.map((m) => ({ value: m.id, label: m.label }))} selected={month} onSelect={setMonth} />
              <ChoiceChips title="Format" options={STATEMENT_FORMATS.map((f) => ({ value: f, label: FORMAT_LABEL[f] }))} selected={format} onSelect={setFormat} />
              <Gap h={22} />
              <AsyncView state={preview.state} onRetry={preview.reload}>
                {(s) =>
                  s && (
                    <Card>
                      <Text style={t.row}>{`${s.accountLabel} · ${s.periodLabel}`}</Text>
                      <Text style={[t.sub, { marginTop: 4 }]}>
                        {s.lines.length === 0
                          ? 'No posted transactions this month.'
                          : `${s.lines.length} posted transaction${s.lines.length === 1 ? '' : 's'}`}
                      </Text>
                      {s.lines.length > 0 && (
                        <View style={{ flexDirection: 'row', marginTop: 14 }}>
                          <Total label="Money in" value={Fmt.money(s.moneyIn)} />
                          <Total label="Money out" value={Fmt.money(s.moneyOut)} />
                          <Total label="Net" value={Fmt.signed(statementNet(s))} />
                        </View>
                      )}
                    </Card>
                  )
                }
              </AsyncView>
              <Gap h={20} />
              <PillButton
                label={downloading ? 'Preparing statement…' : `Download ${STATEMENT_FORMAT_INFO[format].label} statement`}
                icon="download"
                onPress={download}
                disabled={downloading}
              />
            </Scroll>
          )
        }
      </AsyncView>
    </Screen>
  );

  function Total({ label, value }: { label: string; value: string }) {
    return (
      <View style={{ flex: 1 }}>
        <Text style={t.label}>{label.toUpperCase()}</Text>
        <Text style={[t.amount, { marginTop: 2, color: c.ink }]}>{value}</Text>
      </View>
    );
  }
}
