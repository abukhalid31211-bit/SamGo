import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { Colors, HORIZONTAL_PADDING, formatStatNumber } from '@/constants/theme';
import { ScalePressable } from '@/components/ScalePressable';
import { Radar, FileText, Folder } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, runOnJS } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - 16) / 3;

interface StatCardProps {
  icon: 'folder' | 'radar' | 'report';
  value: number;
  label: string;
  onPress: () => void;
  delay: number;
}

const iconConfig = {
  folder: { Icon: Folder, color: Colors.gold.main, bg: Colors.gold.transparent },
  radar: { Icon: Radar, color: Colors.cyan.main, bg: Colors.cyan.transparent },
  report: { Icon: FileText, color: Colors.green.main, bg: Colors.green.transparent },
};

function StatCard({ icon, value, label, onPress, delay }: StatCardProps) {
  const { Icon, color, bg } = iconConfig[icon];
  const count = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  React.useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));

    if (value > 0) {
      count.value = withDelay(
        delay,
        withTiming(value, { duration: 800, easing: Easing.inOut(Easing.quad) })
      );
    }
  }, [value, delay]);

  return (
    <Animated.View style={textStyle}>
      <ScalePressable scale={0.96} style={styles.card} onPress={onPress}>
        <View style={[styles.iconCircle, { backgroundColor: bg }]}>
          <Icon size={20} color={color} strokeWidth={2} />
        </View>
        <AnimatedNumber value={value} delay={delay} />
        <Text style={styles.label}>{label}</Text>
      </ScalePressable>
    </Animated.View>
  );
}

function AnimatedNumber({ value, delay }: { value: number; delay: number }) {
  const display = useSharedValue(0);
  const [shown, setShown] = React.useState('0');

  React.useEffect(() => {
    if (value === 0) {
      setShown('0');
      return;
    }
    display.value = 0;
    display.value = withDelay(
      delay,
      withTiming(value, { duration: 800, easing: Easing.inOut(Easing.quad) }, () => {
        runOnJS(setShown)(formatStatNumber(value));
      })
    );
    const interval = setInterval(() => {
      const n = Math.round(display.value);
      setShown(formatStatNumber(n));
      if (n >= value) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [value, delay]);

  return <Text style={styles.value}>{shown}</Text>;
}

interface StatsSectionProps {
  onProjectsPress: () => void;
  onScansPress: () => void;
  onReportsPress: () => void;
}

export function StatsSection({ onProjectsPress, onScansPress, onReportsPress }: StatsSectionProps) {
  const { data } = useData();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إحصاءاتك</Text>
      <View style={styles.row}>
        <StatCard
          icon="folder"
          value={data.projects.length}
          label="المشاريع"
          onPress={onProjectsPress}
          delay={500}
        />
        <StatCard
          icon="radar"
          value={data.scans.length}
          label="الفحوصات"
          onPress={onScansPress}
          delay={550}
        />
        <StatCard
          icon="report"
          value={data.reports.length}
          label="التقارير"
          onPress={onReportsPress}
          delay={600}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  card: {
    flex: 1,
    height: 86,
    borderRadius: 12,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 12,
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gold.main,
    fontFamily: 'Inter-Bold',
  },
  label: {
    fontSize: 10,
    color: Colors.text.tertiary,
    fontFamily: 'Inter-Regular',
  },
});
