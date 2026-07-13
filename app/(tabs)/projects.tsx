import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, HORIZONTAL_PADDING } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <Text style={styles.title}>المشاريع</Text>
      <Text style={styles.subtitle}>قائمة المشاريع</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  title: {
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    color: Colors.text.tertiary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
});
