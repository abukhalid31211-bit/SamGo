import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Colors, HORIZONTAL_PADDING, isSmallScreen, isLargeScreen } from '@/constants/theme';
import { ScalePressable } from '@/components/ScalePressable';
import * as LucideIcons from 'lucide-react-native';

const CIRCLE_SIZE = isSmallScreen ? 50 : isLargeScreen ? 64 : 56;
const ITEM_SPACING = 12;

const items = [
  { id: 'map', label: 'خريطة', icon: 'Map' },
  { id: 'gpr', label: 'GPR', icon: 'Waves' },
  { id: 'detector', label: 'كاشف', icon: 'Radar', highlighted: true },
  { id: '3d', label: '3D', icon: 'Box' },
  { id: 'reports', label: 'تقارير', icon: 'FileText' },
];

interface QuickAccessProps {
  onPress: (id: string) => void;
}

export function QuickAccess({ onPress }: QuickAccessProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>وصول سريع</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {items.map((item) => {
          const Icon = (LucideIcons as any)[item.icon] || LucideIcons.Circle;
          return (
            <ScalePressable
              key={item.id}
              scale={0.92}
              style={styles.itemContainer}
              onPress={() => onPress(item.id)}
            >
              <View
                style={[
                  styles.circle,
                  item.highlighted && styles.circleHighlighted,
                ]}
              >
                <Icon
                  size={24}
                  color={item.highlighted ? Colors.gold.bright : Colors.text.tertiary}
                  strokeWidth={2}
                />
              </View>
              <Text style={[styles.label, item.highlighted && styles.labelHighlighted]}>
                {item.label}
              </Text>
            </ScalePressable>
          );
        })}
      </ScrollView>
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
    paddingHorizontal: HORIZONTAL_PADDING,
    textAlign: 'right',
  },
  scrollView: {
    marginHorizontal: -HORIZONTAL_PADDING,
    marginVertical: -8,
    paddingVertical: 8,
    overflow: 'visible',
    maxHeight: CIRCLE_SIZE + 30,
    height: CIRCLE_SIZE + 30,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    minHeight: 0,
  } as any,
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    alignItems: 'center',
    gap: ITEM_SPACING,
  },
  itemContainer: {
    alignItems: 'center',
    width: CIRCLE_SIZE + 4,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleHighlighted: {
    borderWidth: 1.5,
    borderColor: Colors.gold.borderStrong,
    backgroundColor: Colors.gold.transparent,
    shadowColor: Colors.gold.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    color: Colors.text.tertiary,
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },
  labelHighlighted: {
    color: Colors.gold.main,
  },
});
