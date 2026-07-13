import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Modal, Dimensions, Pressable, Image } from 'react-native';
import { Colors, HORIZONTAL_PADDING, DRAWER_ITEMS } from '@/constants/theme';
import { ScalePressable } from '@/components/ScalePressable';
import { X } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  onItemPress: (id: string) => void;
}

export function Drawer({ visible, onClose, onItemPress }: DrawerProps) {
  const { data } = useData();
  const user = data.user;
  const translateX = useSharedValue(DRAWER_WIDTH);

  React.useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
    } else {
      translateX.value = withTiming(DRAWER_WIDTH, { duration: 250, easing: Easing.inOut(Easing.quad) });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.drawer, animatedStyle]}>
          <LinearGradient
            colors={['#1C1C28', '#0A0A0F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.drawerHeader}
          >
            <View style={styles.logo}>
              <LinearGradient
                colors={Colors.gold.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoBox}
              >
                <Text style={styles.logoText}>SG</Text>
              </LinearGradient>
            </View>
            <Text style={styles.brandTitle}>SAMGOLD</Text>
            <Text style={styles.brandSubtitle}>المسح الشامل والكشف الذكي</Text>
            <View style={styles.headerDivider} />
            <ScalePressable
              scale={0.98}
              style={styles.userRow}
              onPress={() => onItemPress('profile')}
            >
              <View style={styles.userAvatar}>
                {user?.avatarUri ? (
                  <Image source={{ uri: user.avatarUri }} style={styles.userAvatarImg} />
                ) : (
                  <Text style={styles.userAvatarText}>
                    {user?.name?.charAt(0) || 'U'}
                  </Text>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'مستخدم'}</Text>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>
              </View>
            </ScalePressable>
          </LinearGradient>

          <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
            {DRAWER_ITEMS.map((item, index) => {
              if (item.separator) {
                return <View key={`sep-${index}`} style={styles.separator} />;
              }
              const Icon = (LucideIcons as any)[item.icon || 'Circle'] || LucideIcons.Circle;
              return (
                <ScalePressable
                  key={item.id}
                  scale={0.98}
                  style={styles.menuItem}
                  onPress={() => onItemPress(item.id!)}
                >
                  <View style={styles.menuItemRight}>
                    <View style={[styles.menuIconCircle, { backgroundColor: item.color + '15' }]}>
                      <Icon size={20} color={item.color} strokeWidth={2} />
                    </View>
                    <Text style={styles.menuItemText}>{item.label}</Text>
                    {item.dot && <View style={styles.menuDot} />}
                    {item.badge && (
                      <View style={styles.menuBadge}>
                        <Text style={styles.menuBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <LucideIcons.ChevronLeft size={16} color={Colors.text.dark} strokeWidth={2} />
                </ScalePressable>
              );
            })}
          </ScrollView>

          <View style={styles.drawerFooter}>
            <View style={styles.footerDivider} />
            <Text style={styles.versionText}>الإصدار 1.0.0</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row-reverse' },
  backdrop: { flex: 1, backgroundColor: Colors.background.overlay },
  drawer: { width: DRAWER_WIDTH, backgroundColor: Colors.background.drawer, paddingTop: 50 },
  drawerHeader: { padding: 16, paddingBottom: 16 },
  logo: { marginBottom: 12 },
  logoBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#0A0A0F', fontSize: 18, fontWeight: '800', fontFamily: 'Inter-Bold' },
  brandTitle: { color: Colors.gold.main, fontSize: 22, fontWeight: '700', fontFamily: 'Inter-Bold', letterSpacing: 2 },
  brandSubtitle: { color: Colors.text.tertiary, fontSize: 11, fontFamily: 'Inter-Regular', marginTop: 4 },
  headerDivider: { height: 1, backgroundColor: Colors.border.subtle, marginVertical: 12 },
  userRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.gold.main, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gold.transparent },
  userAvatarImg: { width: 40, height: 40, borderRadius: 20 },
  userAvatarText: { color: Colors.gold.main, fontSize: 16, fontWeight: '700', fontFamily: 'Inter-Bold' },
  userInfo: { flex: 1, alignItems: 'flex-start' },
  userName: { color: Colors.text.primary, fontSize: 14, fontWeight: '700', fontFamily: 'Inter-Bold' },
  userEmail: { color: Colors.text.tertiary, fontSize: 11, fontFamily: 'Inter-Regular', marginTop: 2 },
  menuContainer: { flex: 1, paddingVertical: 8 },
  separator: { height: 1, backgroundColor: Colors.border.subtle, marginVertical: 8, marginHorizontal: 16 },
  menuItem: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', height: 52, paddingHorizontal: 16 },
  menuItemRight: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  menuIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  menuItemText: { color: Colors.text.primary, fontSize: 14, fontWeight: '500', fontFamily: 'Inter-Regular' },
  menuDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gold.bright, shadowColor: Colors.gold.bright, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 2 },
  menuBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: Colors.purple.soft },
  menuBadgeText: { color: Colors.purple.main, fontSize: 9, fontWeight: '700', fontFamily: 'Inter-Bold' },
  drawerFooter: { paddingBottom: 20, paddingTop: 8 },
  footerDivider: { height: 1, backgroundColor: Colors.border.subtle, marginHorizontal: 16, marginBottom: 12 },
  versionText: { color: Colors.text.dark, fontSize: 10, fontFamily: 'Inter-Regular', textAlign: 'center' },
});
