import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, HORIZONTAL_PADDING } from '@/constants/theme';
import { ScalePressable } from '@/components/ScalePressable';
import { Bot } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing } from 'react-native-reanimated';

interface AIInsightsCardProps {
  onDetailsPress: () => void;
}

export function AIInsightsCard({ onDetailsPress }: AIInsightsCardProps) {
  const { data } = useData();
  const hasInsight = !!data.aiInsight;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  React.useEffect(() => {
    opacity.value = withDelay(300, withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(300, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
  }, []);

  return (
    <Animated.View style={animStyle}>
      <ScalePressable
        scale={0.98}
        style={styles.card}
        onPress={() => {
          if (hasInsight) onDetailsPress();
        }}
      >
        <View style={styles.borderAccent} />
        <View style={styles.header}>
          <Bot
            size={18}
            color={hasInsight ? Colors.cyan.main : Colors.text.dark}
            strokeWidth={2}
          />
          <Text style={[styles.title, hasInsight && styles.titleActive]}>
            رؤى الذكاء الاصطناعي
          </Text>
        </View>
        <Text style={styles.bodyText}>
          {hasInsight
            ? data.aiInsight!.text
            : 'أجرِ مسحاً لتظهر هنا تحليلات الذكاء الاصطناعي'}
        </Text>
        {hasInsight && (
          <ScalePressable
            scale={0.96}
            style={styles.detailsLink}
            onPress={onDetailsPress}
          >
            <Text style={styles.detailsText}>تفاصيل ←</Text>
          </ScalePressable>
        )}
      </ScalePressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    backgroundColor: Colors.cyan.transparent,
    borderLeftWidth: 3,
    borderLeftColor: Colors.cyan.main,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    padding: 12,
    marginHorizontal: HORIZONTAL_PADDING,
    position: 'relative',
  },
  borderAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.cyan.main,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  title: {
    color: Colors.text.tertiary,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter-Bold',
  },
  titleActive: {
    color: Colors.text.primary,
  },
  bodyText: {
    color: Colors.text.tertiary,
    fontSize: 12,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
  },
  detailsLink: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  detailsText: {
    color: Colors.cyan.main,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-Regular',
  },
});
