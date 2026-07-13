import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, FlatList, Dimensions } from 'react-native';
import { Colors, HORIZONTAL_PADDING, NOTIFICATION_TYPES, formatTimeAgo } from '@/constants/theme';
import { ScalePressable } from '@/components/ScalePressable';
import { ChevronRight, Bell } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import { generateId } from '@/utils/storage';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticLight } from '@/utils/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'project', label: 'مشاريع' },
  { id: 'scan', label: 'فحوصات' },
  { id: 'system', label: 'نظام' },
];

interface NotificationsScreenProps {
  onBack: () => void;
}

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const { data, updateData } = useData();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('all');
  const translateX = useSharedValue(SCREEN_WIDTH);

  React.useEffect(() => {
    translateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
  }, []);

  const closeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const filtered = filter === 'all'
    ? data.notifications
    : data.notifications.filter((n) => n.type === filter);

  const markAllRead = useCallback(() => {
    updateData((d) => ({
      ...d,
      notifications: d.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, [updateData]);

  const markRead = useCallback((id: string) => {
    updateData((d) => ({
      ...d,
      notifications: d.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  }, [updateData]);

  const deleteNotification = useCallback((id: string) => {
    updateData((d) => ({
      ...d,
      notifications: d.notifications.filter((n) => n.id !== id),
    }));
  }, [updateData]);

  const handleBack = () => {
    translateX.value = withTiming(SCREEN_WIDTH, { duration: 250 });
    setTimeout(onBack, 250);
  };

  return (
    <Animated.View style={[styles.container, closeAnimStyle]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <ScalePressable scale={0.9} style={styles.backButton} onPress={handleBack}>
          <ChevronRight size={24} color={Colors.text.primary} strokeWidth={2} />
        </ScalePressable>
        <Text style={styles.headerTitle}>الإشعارات</Text>
        {data.notifications.some((n) => !n.read) && (
          <ScalePressable scale={0.96} onPress={markAllRead}>
            <Text style={styles.markAllText}>تحديد الكل مقروء</Text>
          </ScalePressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
        style={styles.filtersScroll}
      >
        {FILTERS.map((f) => (
          <ScalePressable key={f.id} scale={0.94} onPress={() => setFilter(f.id)}>
            <View style={[styles.filterChip, filter === f.id && styles.filterChipActive]}>
              <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </View>
          </ScalePressable>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Bell size={48} color={Colors.text.dark} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
          <Text style={styles.emptySubtitle}>ستظهر هنا إشعاراتك الجديدة</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }}>
          {filtered.map((notif) => {
            const config = NOTIFICATION_TYPES[notif.type];
            const Icon = (LucideIcons as any)[config.icon] || LucideIcons.Bell;
            return (
              <ScalePressable
                key={notif.id}
                scale={0.98}
                style={styles.notifItem}
                onPress={() => markRead(notif.id)}
              >
                <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
                  <Icon size={20} color={config.color} strokeWidth={2} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifHeader}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    {!notif.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifDesc}>{notif.description}</Text>
                  <Text style={styles.notifTime}>{formatTimeAgo(new Date(notif.createdAt))}</Text>
                </View>
                <ScalePressable
                  scale={0.9}
                  style={styles.deleteButton}
                  onPress={() => deleteNotification(notif.id)}
                >
                  <Text style={styles.deleteText}>حذف</Text>
                </ScalePressable>
              </ScalePressable>
            );
          })}
        </ScrollView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.main, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: HORIZONTAL_PADDING, paddingBottom: 12 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: Colors.text.primary, fontSize: 16, fontWeight: '700', fontFamily: 'Inter-Bold' },
  markAllText: { color: Colors.gold.main, fontSize: 12, fontFamily: 'Inter-Regular' },
  filtersScroll: { maxHeight: 50, marginHorizontal: -HORIZONTAL_PADDING, marginBottom: 8 },
  filtersContent: { paddingHorizontal: HORIZONTAL_PADDING, gap: 8, alignItems: 'center' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background.card, borderWidth: 1, borderColor: Colors.border.subtle },
  filterChipActive: { backgroundColor: Colors.gold.main, borderColor: Colors.gold.main },
  filterText: { color: Colors.text.tertiary, fontSize: 12, fontFamily: 'Inter-Regular' },
  filterTextActive: { color: '#0A0A0F', fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { color: Colors.text.primary, fontSize: 14, fontWeight: '500', fontFamily: 'Inter-Regular', marginTop: 12 },
  emptySubtitle: { color: Colors.text.tertiary, fontSize: 12, fontFamily: 'Inter-Regular' },
  list: { flex: 1, paddingHorizontal: HORIZONTAL_PADDING },
  notifItem: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle },
  notifIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1, gap: 4 },
  notifHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  notifTitle: { color: Colors.text.primary, fontSize: 13, fontWeight: '600', fontFamily: 'Inter-Bold' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gold.main },
  notifDesc: { color: Colors.text.tertiary, fontSize: 12, fontFamily: 'Inter-Regular' },
  notifTime: { color: Colors.text.dark, fontSize: 10, fontFamily: 'Inter-Regular' },
  deleteButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.red.soft },
  deleteText: { color: Colors.red.main, fontSize: 11, fontFamily: 'Inter-Regular' },
});
