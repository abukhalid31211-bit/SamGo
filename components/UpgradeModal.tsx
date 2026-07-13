import React from 'react';
import { View, StyleSheet, Text, Modal, Dimensions, Pressable } from 'react-native';
import { Colors, HORIZONTAL_PADDING } from '@/constants/theme';
import { ScalePressable } from '@/components/ScalePressable';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { hapticMedium, hapticLight } from '@/utils/haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function UpgradeModal({ visible, onClose }: UpgradeModalProps) {
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
      if (e.translationY > SCREEN_HEIGHT * 0.4) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      }
    });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sheet, animatedStyle]}>
            <View style={styles.handle} />
            <Text style={styles.title}>الترقية إلى PRO</Text>
            <Text style={styles.subtitle}>
              افتح القدرات الكاملة للكاشف الذكي والعرض ثلاثي الأبعاد
            </Text>
            <View style={styles.features}>
              <View style={styles.featureRow}>
                <Text style={styles.featureText}>✓ كاشف ذكي غير محدود</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureText}>✓ عرض ثلاثي الأبعاد كامل</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureText}>✓ تقارير متقدمة</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureText}>✓ رؤى ذكاء اصطناعي</Text>
              </View>
            </View>
            <ScalePressable
              scale={0.96}
              haptic="medium"
              style={styles.upgradeButton}
              onPress={onClose}
            >
              <LinearGradient
                colors={Colors.gold.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.upgradeGradient}
              >
                <Text style={styles.upgradeText}>اشترك الآن</Text>
              </LinearGradient>
            </ScalePressable>
            <ScalePressable
              scale={0.96}
              style={styles.laterButton}
              onPress={onClose}
            >
              <Text style={styles.laterText}>لاحقاً</Text>
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
  sheet: { backgroundColor: Colors.background.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border.medium, alignSelf: 'center', marginBottom: 20 },
  title: { color: Colors.text.primary, fontSize: 20, fontWeight: '700', fontFamily: 'Inter-Bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: Colors.text.tertiary, fontSize: 13, fontFamily: 'Inter-Regular', textAlign: 'center', marginBottom: 20 },
  features: { gap: 12, marginBottom: 24 },
  featureRow: {},
  featureText: { color: Colors.text.secondary, fontSize: 14, fontFamily: 'Inter-Regular', textAlign: 'right' },
  upgradeButton: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  upgradeGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  upgradeText: { color: '#0A0A0F', fontSize: 15, fontWeight: '700', fontFamily: 'Inter-Bold' },
  laterButton: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1, borderColor: Colors.border.light },
  laterText: { color: Colors.text.tertiary, fontSize: 14, fontFamily: 'Inter-Regular' },
});
