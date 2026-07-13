import React from 'react';
import { View, StyleSheet, Text, Modal, Dimensions, Pressable } from 'react-native';
import { Colors, HORIZONTAL_PADDING } from '@/constants/theme';
import { ScalePressable } from '@/components/ScalePressable';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { hapticMedium, hapticLight } from '@/utils/haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WelcomeModalProps {
  visible: boolean;
  userName: string;
  onStartProject: () => void;
  onBrowse: () => void;
}

export function WelcomeModal({ visible, userName, onStartProject, onBrowse }: WelcomeModalProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > SCREEN_HEIGHT * 0.5) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onBrowse)();
      } else {
        translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      }
    });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onBrowse}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.backdropPressable} onPress={onBrowse} />
        </Animated.View>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheet, animatedStyle]}>
            <View style={styles.handle} />
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>مرحباً {userName}!</Text>
            <Text style={styles.subtitle}>
              حسابك جاهز — ابدأ رحلتك الآن مع SAMGOLD
            </Text>
            <ScalePressable
              scale={0.96}
              haptic="medium"
              style={styles.startButton}
              onPress={onStartProject}
            >
              <LinearGradient
                colors={Colors.gold.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startGradient}
              >
                <Text style={styles.startText}>ابدأ مشروعاً</Text>
              </LinearGradient>
            </ScalePressable>
            <ScalePressable
              scale={0.96}
              style={styles.browseButton}
              onPress={onBrowse}
            >
              <Text style={styles.browseText}>تصفح أولاً</Text>
            </ScalePressable>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.background.overlay },
  backdropPressable: { flex: 1 },
  sheet: { backgroundColor: Colors.background.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, alignItems: 'center' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border.medium, marginBottom: 20 },
  emoji: { fontSize: 40, marginBottom: 12 },
  title: { color: Colors.text.primary, fontSize: 20, fontWeight: '700', fontFamily: 'Inter-Bold', marginBottom: 8 },
  subtitle: { color: Colors.text.tertiary, fontSize: 13, fontFamily: 'Inter-Regular', textAlign: 'center', marginBottom: 24 },
  startButton: { width: '100%', borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  startGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  startText: { color: '#0A0A0F', fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold' },
  browseButton: { width: '100%', paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: Colors.border.light },
  browseText: { color: Colors.text.tertiary, fontSize: 14, fontFamily: 'Inter-Regular' },
});
