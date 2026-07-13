import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, HORIZONTAL_PADDING } from '@/constants/theme';
import { ScalePressable } from '@/components/ScalePressable';
import { Radar, Zap } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing } from 'react-native-reanimated';

interface DetectorCardProps {
  onButtonPress: () => void;
}

export function DetectorCard({ onButtonPress }: DetectorCardProps) {
  const { data } = useData();
  const isPro = data.user?.isPro ?? false;
  const lastScan = data.scans.length > 0 ? data.scans[data.scans.length - 1] : null;
  const hasScan = !!lastScan;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  React.useEffect(() => {
    opacity.value = withDelay(200, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(200, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
  }, []);

  return (
    <Animated.View style={cardAnimStyle}>
      <ScalePressable scale={0.98} style={styles.card} onPress={() => {}}>
        <View style={styles.header}>
          <View style={styles.headerRight}>
            <Radar size={20} color={Colors.gold.main} strokeWidth={2} />
            <Text style={styles.headerTitle}>الكاشف الذكي</Text>
          </View>
          <View style={[styles.badge, isPro ? styles.badgePro : styles.badgeFree]}>
            <Text style={[styles.badgeText, isPro ? styles.badgeTextPro : styles.badgeTextFree]}>
              {isPro ? 'PRO' : 'مجاني'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {hasScan && lastScan ? (
          <View style={styles.scanContent}>
            <View style={styles.heatmap}>
              <View style={styles.heatmapGradient} />
              <View
                style={[
                  styles.targetDot,
                  {
                    left: `${lastScan.targetPosition.x}%`,
                    top: `${lastScan.targetPosition.y}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>العمق</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>{lastScan.depth.toFixed(1)}</Text>
                  <Text style={styles.statUnit}>م</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>الاحتمالية</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statValue}>{lastScan.probability}</Text>
                  <Text style={styles.statUnit}>%</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>النوع</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statValueSmall}>{lastScan.targetType}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContent}>
            <Radar size={48} color={Colors.text.dark} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>لم تُجرِ أي فحص بعد</Text>
            <Text style={styles.emptySubtitle}>ابدأ فحصك الأول الآن</Text>
          </View>
        )}

        <View style={styles.divider} />

        <ScalePressable
          scale={0.96}
          haptic="medium"
          style={styles.actionButton}
          onPress={onButtonPress}
        >
          <Text style={styles.actionButtonText}>
            {hasScan ? 'عرض النتائج ←' : 'ابدأ الآن ←'}
          </Text>
        </ScalePressable>
      </ScalePressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: Colors.background.cardLight,
    borderWidth: 1,
    borderColor: Colors.gold.border,
    padding: 16,
    marginHorizontal: HORIZONTAL_PADDING,
    shadowColor: Colors.gold.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePro: {
    backgroundColor: Colors.purple.soft,
  },
  badgeFree: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  badgeTextPro: {
    color: Colors.purple.main,
  },
  badgeTextFree: {
    color: Colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.subtle,
    marginVertical: 12,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Regular',
  },
  emptySubtitle: {
    color: Colors.text.tertiary,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  scanContent: {
    gap: 12,
  },
  heatmap: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    backgroundColor: '#0D0D14',
    overflow: 'hidden',
    position: 'relative',
  },
  heatmapGradient: {
    flex: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  targetDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.gold.bright,
    shadowColor: Colors.gold.bright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ translateX: -6 }, { translateY: -6 }],
  },
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    color: Colors.text.tertiary,
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
  statValueRow: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    gap: 2,
  },
  statValue: {
    color: Colors.gold.main,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  statValueSmall: {
    color: Colors.gold.main,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  statUnit: {
    color: Colors.text.tertiary,
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
  actionButton: {
    backgroundColor: Colors.gold.main,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#0A0A0F',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
});
