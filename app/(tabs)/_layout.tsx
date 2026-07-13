import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Folder, Box, Settings, Radar } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ScalePressable } from '@/components/ScalePressable';
import { hapticLight, hapticMedium } from '@/utils/haptics';
import { useData } from '@/context/DataContext';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(ScalePressable);

function TabIcon({ Icon, color, size, focused }: { Icon: any; color: string; size: number; focused: boolean }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[focused ? styles.focusedIconBg : null, animatedStyle]}>
      <Icon size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
    </Animated.View>
  );
}

function DetectorTabButton({ onPress, isPro }: { onPress: () => void; isPro: boolean }) {
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (isPro) {
      pulse.value = withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.sin) }, () => {
        pulse.value = withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) });
      });
      const interval = setInterval(() => {
        pulse.value = withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.sin) }, () => {
          pulse.value = withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) });
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPro]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: isPro ? pulse.value * 0.5 : 0.3,
    transform: [{ scale: pulse.value * 1.3 }],
  }));

  return (
    <ScalePressable
      scale={0.9}
      haptic={isPro ? 'medium' : 'light'}
      style={styles.detectorButton}
      onPress={onPress}
    >
      <Animated.View style={[styles.detectorGlow, glowStyle]} />
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={Colors.gold.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.detectorGradient}
        >
          <Radar size={28} color="#FFFFFF" strokeWidth={2.5} />
        </LinearGradient>
      </Animated.View>
    </ScalePressable>
  );
}

export default function TabLayout() {
  const { data } = useData();
  const isPro = data.user?.isPro ?? false;
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: Colors.background.tab,
          borderTopColor: Colors.border.subtle,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          ...Platform.select({
            web: { backdropFilter: 'blur(20px)' } as any,
            default: {},
          }),
        },
        tabBarActiveTintColor: Colors.gold.main,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Inter-Regular',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon Icon={Home} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'المشاريع',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon Icon={Folder} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="detector"
        options={{
          title: 'الكاشف',
          tabBarButton: (props: any) => (
            <DetectorTabButton
              onPress={props.onPress}
              isPro={isPro}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="3d"
        options={{
          title: '3D',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon Icon={Box} color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon Icon={Settings} color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  focusedIconBg: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.gold.transparent,
  },
  detectorButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: -10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gold.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  detectorGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectorGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.gold.glow,
  },
});
