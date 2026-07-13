import React, { useRef } from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { hapticLight, hapticMedium, hapticSoft } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ScalePressableProps extends Omit<PressableProps, 'onPressIn' | 'onPressOut'> {
  scale?: number;
  haptic?: 'light' | 'medium' | 'soft';
  style?: ViewStyle | any;
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function ScalePressable({
  scale = 0.92,
  haptic = 'light',
  style,
  children,
  onPress,
  onLongPress,
  ...rest
}: ScalePressableProps) {
  const scaleVal = useSharedValue(1);
  const isLongPressRef = useRef(false);

  const triggerHaptic = () => {
    if (haptic === 'medium') hapticMedium();
    else if (haptic === 'soft') hapticSoft();
    else hapticLight();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleVal.value }],
  }));

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={() => {
        'worklet';
        scaleVal.value = withTiming(scale, {
          duration: 80,
          easing: Easing.out(Easing.quad),
        });
        runOnJS(triggerHaptic)();
      }}
      onPressOut={() => {
        'worklet';
        scaleVal.value = withSpring(1, {
          damping: 12,
          stiffness: 300,
        });
      }}
      onPress={() => {
        if (!isLongPressRef.current) onPress?.();
      }}
      onLongPress={() => {
        isLongPressRef.current = true;
        onLongPress?.();
        setTimeout(() => { isLongPressRef.current = false; }, 500);
      }}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
