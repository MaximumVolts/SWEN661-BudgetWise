import { Children, Fragment, type ReactNode } from 'react';
import { Switch, Text, View } from 'react-native';
import type { SettingsController } from '../../controllers/settingsController';
import type { BudgetStatus } from '../../models/budget';
import { BUDGET_STATUS_LABEL } from '../../models/budget';
import type { SettingsData } from '../../models/settings';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Gap, HairLine, Heading, IconBadge, ProgressBar, Screen, Scroll, StatusMark, statusColor, Tap } from '../../ui/components';
import { Icon, type IconName } from '../../ui/icons';

/** 15 - Settings: profile, accounts & data, display, notifications (bill reminders), sign out. */
export function SettingsScreen({ controller }: { controller: SettingsController }) {
  const { colors: c } = useDisplay();
  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 68, paddingRight: 8, paddingTop: 6 }}>
        <Heading style={{ flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '500', color: c.ink }}>Settings</Heading>
        <Tap onPress={controller.close} label="Close settings">
          <Icon name="cancel" size={48} color={c.ink} />
        </Tap>
      </View>
      <AsyncView state={controller.state} onRetry={controller.reload}>
        {(loaded) => <SettingsBody data={controller.data ?? loaded} controller={controller} />}
      </AsyncView>
    </Screen>
  );
}

function SettingsBody({ data, controller: ctl }: { data: SettingsData; controller: SettingsController }) {
  const { colors: c } = useDisplay();
  const { toggle } = ctl;

  return (
    <Scroll>
      <Gap h={16} />
      <Tap onPress={ctl.openProfile}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14 }} padding={14}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{data.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 15, color: c.ink }}>{data.name}</Text>
            <Text style={{ fontSize: 13, color: c.muted }}>{data.username}</Text>
          </View>
          <Icon name="chevron-right" color={c.ink} />
        </Card>
      </Tap>
      <Group title="Accounts & data">
        <Row icon="person-outline" title="Connected accounts" value={`${data.connectedAccountCount}`} onPress={ctl.openAccounts} />
        <Row icon="category" title="Budget categories" onPress={ctl.openBudgetCategories} />
        <Row icon="download" title="Statement export" sub="PDF or CSV" onPress={ctl.openStatements} />
      </Group>
      <Group title="Accessibility & display">
        <Row icon="contrast" title="Theme" value={data.themeLabel} onPress={ctl.pickTheme} />
        <Row icon="wb-sunny" title="High contrast" toggle={data.highContrast} onToggle={(v) => toggle('highContrast', v)} />
        <View>
          <Row
            icon="visibility"
            title="Colorblind mode"
            sub="Colorblind-safe colors, with shapes and patterns for status"
            toggle={data.colorblindMode}
            onToggle={(v) => toggle('colorblindMode', v)}
          />
          <ColorblindPreview />
        </View>
        <Row icon="bar-chart" title="Show values on charts" toggle={data.showChartValues} onToggle={(v) => toggle('showChartValues', v)} />
      </Group>
      <Group title="Notifications">
        <Row icon="notifications-none" title="Bill reminders" value={data.billReminder.label} onPress={ctl.pickReminder} />
        <Row icon="notifications-active" title="Send a test reminder" sub="Shows a bill reminder notification now" onPress={ctl.sendTestReminder} />
        <Row icon="alarm" title="Budget alerts" toggle={data.budgetAlerts} onToggle={(v) => toggle('budgetAlerts', v)} />
      </Group>
      <Group title="Account">
        <Row icon="logout" title="Sign out" red onPress={ctl.signOut} />
      </Group>
      <Gap h={18} />
      <View style={{ alignItems: 'center' }}>
        <Tap onPress={ctl.deleteAccount} style={{ padding: 10 }}>
          <Text style={{ color: c.red, fontSize: 21, textDecorationLine: 'underline' }}>Delete account</Text>
        </Tap>
      </View>
      <Gap h={14} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: c.lime, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bolt" size={20} color="#1A1A1A" />
        </View>
        <Text style={{ fontSize: 20, fontWeight: '700', color: c.ink }}>Pace</Text>
      </View>
      {data.footerLabel.length > 0 && (
        <Text style={{ textAlign: 'center', fontSize: 11, letterSpacing: 1, color: c.muted, marginTop: 4 }}>{data.footerLabel}</Text>
      )}
    </Scroll>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  const { colors: c } = useDisplay();
  return (
    <View>
      <Text style={{ fontSize: 13, fontWeight: '500', color: c.muted, marginTop: 18, marginBottom: 8 }}>{title}</Text>
      <Card padding={0} style={{ borderRadius: 14 }}>
        {Children.toArray(children).map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <HairLine />}
            {row}
          </Fragment>
        ))}
      </Card>
    </View>
  );
}

function Row({
  icon,
  title,
  sub,
  value,
  red,
  toggle,
  onToggle,
  onPress,
}: {
  icon: IconName;
  title: string;
  sub?: string;
  value?: string;
  red?: boolean;
  toggle?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => unknown;
}) {
  const { colors: c } = useDisplay();
  const row = (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, minHeight: 60 }}>
      <IconBadge icon={icon} bg={red ? c.redBg : c.chip} fg={red ? c.red : c.ink} size={38} square />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={{ fontSize: 16, color: red ? c.red : c.ink, fontWeight: red ? '500' : '400' }}>{title}</Text>
        {sub && <Text style={{ fontSize: 12, color: c.muted }}>{sub}</Text>}
      </View>
      {value !== undefined && value.length > 0 && <Text style={{ fontSize: 14, color: c.muted, marginRight: 6 }}>{value}</Text>}
      {onPress && <Icon name="chevron-right" color={c.ink} />}
      {toggle !== undefined && (
        <Switch
          accessibilityLabel={title}
          value={toggle}
          onValueChange={onToggle}
          trackColor={{ true: c.ink, false: c.outline }}
          thumbColor="#FFFFFF"
        />
      )}
    </View>
  );
  return onPress ? <Tap onPress={onPress}>{row}</Tap> : row;
}

/**
 * A live sample of how budget statuses look right now, under the Colorblind mode switch, so
 * flipping it visibly changes something on the spot.
 */
function ColorblindPreview() {
  const { colors: c, colorblind } = useDisplay();
  const sample = (status: BudgetStatus, value: number) => (
    <View key={status} style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <StatusMark status={status} />
        <Text style={{ fontSize: 12, fontWeight: '600', color: statusColor(status, c) }}>{BUDGET_STATUS_LABEL[status]}</Text>
      </View>
      <View style={{ marginTop: 6 }}>
        <ProgressBar value={value} color={statusColor(status, c)} height={6} striped={colorblind && status !== 'onTrack'} />
      </View>
    </View>
  );
  return (
    <View
      accessible
      accessibilityLabel={
        colorblind
          ? 'Preview: colorblind mode is on. Statuses use shapes, stripes, blue and orange.'
          : 'Preview: colorblind mode is off. Statuses use colored dots.'
      }
      style={{ paddingLeft: 66, paddingRight: 14, paddingBottom: 14 }}
    >
      <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 0.4, color: c.muted, marginBottom: 8 }}>
        {colorblind ? 'PREVIEW · COLORBLIND MODE ON' : 'PREVIEW · COLORBLIND MODE OFF'}
      </Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {sample('onTrack', 0.45)}
        {sample('nearLimit', 0.85)}
        {sample('over', 1)}
      </View>
    </View>
  );
}
