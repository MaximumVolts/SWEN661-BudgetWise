import { Fragment } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { NotificationsController } from '../../controllers/notificationsController';
import type { NotificationItem, NotificationKind } from '../../models/notification';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Chip, HairLine, Heading, IconBadge, Screen, Tap } from '../../ui/components';
import { Icon, type IconName } from '../../ui/icons';

/** 14 - Notifications: alerts the services raise (overdue / due bills, budgets over or near their limit). */
export function NotificationsScreen({ controller }: { controller: NotificationsController }) {
  const { state, reload, filter, filterLabels, setFilter, markAllRead, runPrimary, open, close } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <Screen>
      <View style={{ flex: 1, backgroundColor: c.chip }}>
        <View style={{ flex: 1, marginTop: 40, backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
          <View style={{ alignSelf: 'center', marginTop: 12, width: 32, height: 4, borderRadius: 2, backgroundColor: c.line }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 24, paddingRight: 8, paddingVertical: 8 }}>
            <Heading style={{ flex: 1, fontSize: 22, fontWeight: '500', color: c.ink }}>Notifications</Heading>
            <Tap onPress={markAllRead} style={{ padding: 12 }}>
              <Text style={t.link}>Mark all read</Text>
            </Tap>
            <Tap onPress={close} label="Close notifications">
              <Icon name="cancel" size={26} color={c.ink} />
            </Tap>
          </View>
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 14 }}>
              {filterLabels.map((label, i) => (
                <Chip key={i} label={label} selected={i === filter} showCheck selectedBg={c.ink} selectedFg="#FFFFFF" onPress={() => setFilter(i)} />
              ))}
            </ScrollView>
          </View>
          <HairLine />
          <AsyncView state={state} onRetry={reload}>
            {(data) =>
              data.items.length === 0 ? (
                <Text style={[t.body, { textAlign: 'center', marginTop: 48 }]}>You’re all caught up.</Text>
              ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                  {data.items.map((n) => (
                    <Fragment key={n.id}>
                      <Item n={n} onOpen={() => open(n)} onPrimary={() => runPrimary(n)} />
                      <HairLine />
                    </Fragment>
                  ))}
                </ScrollView>
              )
            }
          </AsyncView>
        </View>
      </View>
    </Screen>
  );
}

function Item({ n, onOpen, onPrimary }: { n: NotificationItem; onOpen: () => void; onPrimary: () => void }) {
  const { colors: c } = useDisplay();
  const looks: Record<NotificationKind, [IconName, string, string, boolean]> = {
    overdue: ['error-outline', c.redBg, c.red, false],
    overBudget: ['error-outline', c.redBg, c.red, true],
    nearLimit: ['warning-amber', c.lime, '#1A1A1A', true],
    reminder: ['notifications-none', c.chip, c.ink, false],
  };
  const [icon, bg, fg, underline] = looks[n.kind];
  const button = (label: string, filled: boolean, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        borderRadius: 24,
        paddingHorizontal: 22,
        paddingVertical: 12,
        backgroundColor: filled ? c.ink : 'transparent',
        borderWidth: filled ? 0 : 1,
        borderColor: c.outline,
      }}
    >
      <Text style={{ fontWeight: '600', color: filled ? '#FFFFFF' : c.ink }}>{label}</Text>
    </Pressable>
  );
  return (
    <Tap onPress={onOpen}>
      <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 20, paddingVertical: 14 }}>
        <IconBadge icon={icon} bg={bg} fg={fg} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {n.isNew && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.ink }} />}
            <Text style={{ fontSize: 12, color: c.muted }}>{`${n.isNew ? 'New · ' : ''}${n.metaLabel}`}</Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              marginTop: 4,
              color: c.ink,
              fontWeight: n.isNew ? '700' : '400',
              textDecorationLine: underline ? 'underline' : 'none',
            }}
          >
            {n.title}
          </Text>
          <Text style={{ fontSize: 14, color: c.muted, marginTop: 2 }}>{n.body}</Text>
          {(n.primaryActionLabel || n.secondaryActionLabel) && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              {n.primaryActionLabel && button(n.primaryActionLabel, true, onPrimary)}
              {n.secondaryActionLabel && button(n.secondaryActionLabel, false, onOpen)}
            </View>
          )}
        </View>
      </View>
    </Tap>
  );
}
