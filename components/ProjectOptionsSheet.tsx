import React from 'react';
import { View, StyleSheet, Text, Modal, Pressable, Dimensions } from 'react-native';
import { Colors, HORIZONTAL_PADDING } from '@/constants/theme';
import { ScalePressable } from '@/components/ScalePressable';
import { FolderOpen, Pencil, Share, Archive, Trash2 } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProjectOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  onOpen: () => void;
  onEdit: () => void;
  onShare: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

const options = [
  { id: 'open', label: 'فتح المشروع', icon: FolderOpen, color: Colors.text.primary },
  { id: 'edit', label: 'تعديل المشروع', icon: Pencil, color: Colors.text.primary },
  { id: 'share', label: 'مشاركة المشروع', icon: Share, color: Colors.text.primary },
  { id: 'archive', label: 'أرشفة المشروع', icon: Archive, color: Colors.text.primary },
  { id: 'delete', label: 'حذف المشروع', icon: Trash2, color: Colors.red.main },
];

export function ProjectOptionsSheet({
  visible, onClose, onOpen, onEdit, onShare, onArchive, onDelete,
}: ProjectOptionsSheetProps) {
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

  const handlers: Record<string, () => void> = {
    open: onOpen, edit: onEdit, share: onShare, archive: onArchive, delete: onDelete,
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[styles.sheet, animatedStyle]}>
          <View style={styles.handle} />
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <ScalePressable
                key={opt.id}
                scale={0.98}
                style={styles.optionItem}
                onPress={() => {
                  handlers[opt.id]?.();
                  onClose();
                }}
              >
                <View style={styles.optionRight}>
                  <Icon size={20} color={opt.color} strokeWidth={2} />
                  <Text style={[styles.optionText, opt.id === 'delete' && styles.deleteText]}>
                    {opt.label}
                  </Text>
                </View>
              </ScalePressable>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.background.overlay },
  backdropPressable: { flex: 1 },
  sheet: { backgroundColor: Colors.background.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border.medium, alignSelf: 'center', marginBottom: 16 },
  optionItem: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8 },
  optionRight: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  optionText: { color: Colors.text.primary, fontSize: 14, fontFamily: 'Inter-Regular' },
  deleteText: { color: Colors.red.main },
});
