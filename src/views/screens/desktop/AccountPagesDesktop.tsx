import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { NotificationsController } from '../../../controllers/notificationsController';
import type { SettingsController } from '../../../controllers/settingsController';
import type { NotificationItem, NotificationKind } from '../../../models/notification';
import type { SettingsData } from '../../../models/settings';
import { useDisplay } from '../../../state/PreferencesContext';
import { AsyncView, Tap } from '../../../ui/components';
import { ChipGroup, Col, DButton, DesktopPage, DText, Panel, Row, SwitchLine } from '../../../ui/desktop';
import { Icon, type IconName } from '../../../ui/icons';

/** 14 - Notifications on desktop: the alerts with their actions, and a way to tune them. */
export function NotificationsDesktop({ controller }: { controller: NotificationsController }) {
  const { state, reload, filter, filterLabels, setFilter, markAllRead, runPrimary, open, openSettings } = controller;
  const { colors: c } = useDisplay();
  return (
    <DesktopPage title="Notifications" actions={<DButton label="Mark all read" onPress={markAllRead} />}>
      <ChipGroup label="Show" labels={filterLabels} selected={filter} onChange={setFilter} />
      <Row>
        <Col flex={2.4} gap={16}>
          <AsyncView state={state} onRetry={reload}>
            {(data) =>
              data.items.length === 0 ? (
                <Panel>
                  <Text style={[DText.body, { color: c.muted }]}>You&apos;re all caught up.</Text>
                </Panel>
              ) : (
                <View style={{ gap: 16 }}>
                  {data.items.map((n) => (
                    <NotificationCard key={n.id} n={n} onOpen={() => open(n)} onPrimary={() => runPrimary(n)} />
                  ))}
                </View>
              )
            }
          </AsyncView>
        </Col>
        <Col>
          <Panel tone="muted" title="Stay in the loop">
            <Text style={[DText.body, { color: c.ink }]}>Bill reminders, budget alerts and goal updates, all in one place.</Text>
            <DButton label="Notification settings" onPress={openSettings} />
          </Panel>
        </Col>
      </Row>
    </DesktopPage>
  );
}

function NotificationCard({ n, onOpen, onPrimary }: { n: NotificationItem; onOpen: () => void; onPrimary: () => void }) {
  const { colors: c } = useDisplay();
  const looks: Record<NotificationKind, [IconName, string]> = {
    overdue: ['error-outline', c.red],
    overBudget: ['error-outline', c.red],
    nearLimit: ['warning-amber', c.olive],
    reminder: ['notifications-none', c.olive],
  };
  const [icon, tint] = looks[n.kind];
  return (
    <Tap onPress={onOpen} style={{ alignItems: 'stretch' }} label={`${n.isNew ? 'New. ' : ''}${n.metaLabel}. ${n.title}. ${n.body}`}>
      <Panel>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Icon name={icon} color={tint} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[DText.small, { color: c.muted }]}>{`${n.isNew ? 'New · ' : ''}${n.metaLabel}`}</Text>
            <Text style={{ fontSize: 16, fontWeight: n.isNew ? '600' : '500', color: c.ink }}>{n.title}</Text>
            <Text style={[DText.body, { color: c.muted }]}>{n.body}</Text>
            {(n.primaryActionLabel || n.secondaryActionLabel) && (
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                {n.primaryActionLabel && <DButton label={n.primaryActionLabel} kind="primary" onPress={onPrimary} />}
                {n.secondaryActionLabel && <DButton label={n.secondaryActionLabel} onPress={onOpen} />}
              </View>
            )}
          </View>
        </View>
      </Panel>
    </Tap>
  );
}

/** 15 - Settings on desktop: profile, then account & data and display / notifications side by side. */
export function SettingsDesktop({ controller }: { controller: SettingsController }) {
  return (
    <DesktopPage title="Settings">
      <AsyncView state={controller.state} onRetry={controller.reload}>
        {(loaded) => <SettingsBody data={controller.data ?? loaded} controller={controller} />}
      </AsyncView>
    </DesktopPage>
  );
}

function SettingsBody({ data, controller: ctl }: { data: SettingsData; controller: SettingsController }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ gap: 24 }}>
      <Panel>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>{data.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: c.ink }}>{data.name}</Text>
            <Text style={[DText.body, { color: c.muted }]}>{data.username}</Text>
          </View>
          <DButton label="Edit profile" onPress={ctl.openProfile} />
        </View>
      </Panel>
      <Row>
        <Col>
          <Panel title="Accounts & data">
            <View>
              <LinkRow icon="person-outline" title="Connected accounts" value={`${data.connectedAccountCount}`} onPress={ctl.openAccounts} />
              <LinkRow icon="tune" title="Budget categories" onPress={ctl.openBudgetCategories} />
              <LinkRow icon="file-download" title="Statement export" caption="PDF or CSV" onPress={ctl.openStatements} last />
            </View>
          </Panel>
          <Panel title="Account">
            <View>
              <LinkRow icon="logout" title="Sign out" onPress={ctl.signOut} last />
            </View>
            <Tap onPress={ctl.deleteAccount} style={{ alignItems: 'flex-start' }}>
              <Text style={[DText.body, { color: c.red }]}>Delete account</Text>
            </Tap>
          </Panel>
        </Col>
        <Col>
          <Panel title="Accessibility & display">
            <View>
              <LinkRow icon="contrast" title="Theme" value={data.themeLabel} onPress={ctl.pickTheme} />
              <SwitchLine title="High contrast" value={data.highContrast} onChange={(v) => ctl.toggle('highContrast', v)} />
              <SwitchLine
                title="Chart patterns and icons"
                caption="Show status without relying on color"
                value={data.colorblindMode}
                onChange={(v) => ctl.toggle('colorblindMode', v)}
              />
              <SwitchLine title="Show values on charts" value={data.showChartValues} onChange={(v) => ctl.toggle('showChartValues', v)} />
            </View>
          </Panel>
          <Panel title="Notifications">
            <View>
              <LinkRow icon="notifications-none" title="Bill reminders" value={data.billReminder.label} onPress={ctl.pickReminder} />
              <LinkRow icon="notifications-active" title="Send a test reminder" caption="Shows a bill reminder notification now" onPress={ctl.sendTestReminder} />
              <SwitchLine title="Budget alerts" value={data.budgetAlerts} onChange={(v) => ctl.toggle('budgetAlerts', v)} />
            </View>
          </Panel>
        </Col>
      </Row>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: c.lime, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="speed" color="#1A1A1A" />
        </View>
        <Text style={{ fontSize: 26, fontWeight: '600', color: c.ink }}>Pace</Text>
        {data.footerLabel.length > 0 && <Text style={{ fontSize: 12, letterSpacing: 1, color: c.muted }}>{data.footerLabel}</Text>}
      </View>
    </View>
  );
}

function LinkRow({ icon, title, caption, value, onPress, last }: { icon: IconName; title: string; caption?: string; value?: string; onPress: () => unknown; last?: boolean }): ReactNode {
  const { colors: c } = useDisplay();
  return (
    <Tap onPress={onPress} style={{ alignItems: 'stretch' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.line }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20} color={c.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: c.ink }}>{title}</Text>
          {caption && <Text style={[DText.small, { color: c.muted }]}>{caption}</Text>}
        </View>
        {value !== undefined && <Text style={[DText.body, { color: c.ink }]}>{value}</Text>}
      </View>
    </Tap>
  );
}
