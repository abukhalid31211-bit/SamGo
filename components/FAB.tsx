import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { ScalePressable } from '@/components/ScalePressable';
import { Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, withSpring, Easing, interpolate, SharedValue } from 'react-native-reanimated';
import { hapticMedium } from '@/utils/haptics';

interface FABProps {
  onPress: () => void;
  scrollY: SharedValue<number>;
}

export function FAB({ onPress, scrollY }: FABProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(600, withSpring(1, { damping: 10, stiffness: 200 }));
    opacity.value = withDelay(600, withTiming(1, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const scrollOpacity = interpolate(scrollY.value, [0, 100], [1, 0], 'clamp');
    const scrollScale = interpolate(scrollY.value, [0, 100], [1, 0.3], 'clamp');
    return {
      opacity: opacity.value * scrollOpacity,
      transform: [{ scale: scale.value * scrollScale }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="auto">
      <ScalePressable
        scale={0.92}
        haptic="medium"
        style={styles.button}
        onPress={onPress}
      >
        <LinearGradient
          colors={Colors.gold.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
        </LinearGradient>
      </ScalePressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 100,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: Colors.gold.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
