import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, RefreshControl, Dimensions, Platform, Image } from 'react-native';
import { Colors, HORIZONTAL_PADDING, SECTION_SPACING, SCROLL_BOTTOM_PADDING, getGreeting, formatStatNumber } from '@/constants/theme';
import { ScalePressable } from '@/components/ScalePressable';
import { QuickAccess } from '@/components/QuickAccess';
import { DetectorCard } from '@/components/DetectorCard';
import { AIInsightsCard } from '@/components/AIInsightsCard';
import { ProjectsSection } from '@/components/ProjectsSection';
import { StatsSection } from '@/components/StatsSection';
import { FAB } from '@/components/FAB';
import { Drawer } from '@/components/Drawer';
import { WelcomeModal } from '@/components/WelcomeModal';
import { UpgradeModal } from '@/components/UpgradeModal';
import { NotificationsScreen } from '@/components/NotificationsScreen';
import { ProjectOptionsSheet } from '@/components/ProjectOptionsSheet';
import { Menu, Bell } from 'lucide-react-native';
import { useData } from '@/context/DataContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring, Easing, useAnimatedScrollHandler, runOnJS } from 'react-native-reanimated';
import { hapticLight, hapticMedium } from '@/utils/haptics';
import { generateId } from '@/utils/storage';
import { useRouter } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen() {
  const { data, updateData } = useData();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [projectOptionsVisible, setProjectOptionsVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const scrollY = useSharedValue(0);
  const screenScale = useSharedValue(0);
  const screenOpacity = useSharedValue(0);

  const unreadCount = data.notifications.filter((n) => !n.read).length;
  const user = data.user;
  const isPro = user?.isPro ?? false;

  React.useEffect(() => {
    screenScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });
    screenOpacity.value = withTiming(1, { duration: 400 });

    if (!data.hasSeenWelcome && user) {
      const timer = setTimeout(() => {
        setWelcomeVisible(true);
        updateData((d) => ({ ...d, hasSeenWelcome: true }));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const screenAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: screenScale.value }],
    opacity: screenOpacity.value,
  }));

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  const handleQuickAccess = (id: string) => {
    switch (id) {
      case 'detector':
        if (isPro) router.push('/(tabs)/detector');
        else setUpgradeVisible(true);
        break;
      case '3d':
        if (isPro) router.push('/(tabs)/3d');
        else setUpgradeVisible(true);
        break;
    }
  };

  const handleDetectorButton = () => {
    if (isPro) router.push('/(tabs)/detector');
    else setUpgradeVisible(true);
  };

  const handleAddProject = () => {
    const newProject = {
      id: generateId(),
      name: 'مشروع جديد',
      type: 'gpr' as const,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateData((d) => ({ ...d, projects: [...d.projects, newProject] }));
  };

  const handleProjectPress = (project: any) => {};

  const handleProjectLongPress = (project: any) => {
    setSelectedProject(project);
    setProjectOptionsVisible(true);
  };

  const handleDrawerItem = (id: string) => {
    setDrawerVisible(false);
    switch (id) {
      case 'projects':
        router.push('/(tabs)/projects');
        break;
      case 'detector':
        if (isPro) router.push('/(tabs)/detector');
        else setUpgradeVisible(true);
        break;
      case '3d':
        if (isPro) router.push('/(tabs)/3d');
        else setUpgradeVisible(true);
        break;
    }
  };

  const greeting = getGreeting();
  const userName = user?.name || 'مستخدم';

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.screenContainer, screenAnimStyle]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <ScalePressable scale={0.9} style={styles.menuButton} onPress={() => setDrawerVisible(true)}>
            <Menu size={24} color={Colors.text.tertiary} strokeWidth={2} />
          </ScalePressable>

          <View style={styles.headerCenter}>
            <Text style={styles.brandTitle}>SAMGOLD</Text>
            <Text style={styles.greeting}>{greeting}، {userName}</Text>
          </View>

          <View style={styles.headerLeft}>
            <ScalePressable scale={0.9} style={styles.bellButton} onPress={() => setNotificationsVisible(true)}>
              <Bell size={22} color={Colors.text.tertiary} strokeWidth={2} />
              {unreadCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{unreadCount >= 10 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </ScalePressable>

            <ScalePressable scale={0.9} style={styles.avatarButton} onPress={() => {}}>
              <View style={styles.avatar}>
                {user?.avatarUri ? (
                  <Image source={{ uri: user.avatarUri }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
                )}
              </View>
            </ScalePressable>
          </View>
        </View>

        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.gold.main}
              colors={[Colors.gold.main]}
            />
          }
        >
          <View style={styles.sectionsContainer}>
            <QuickAccess onPress={handleQuickAccess} />
            <View style={styles.section}>
              <DetectorCard onButtonPress={handleDetectorButton} />
            </View>
            <View style={styles.section}>
              <AIInsightsCard onDetailsPress={() => {}} />
            </View>
            <View style={styles.section}>
              <ProjectsSection
                onViewAll={() => router.push('/(tabs)/projects')}
                onProjectPress={handleProjectPress}
                onProjectLongPress={handleProjectLongPress}
                onAddProject={handleAddProject}
              />
            </View>
            <View style={styles.section}>
              <StatsSection
                onProjectsPress={() => router.push('/(tabs)/projects')}
                onScansPress={() => {}}
                onReportsPress={() => {}}
              />
            </View>
          </View>
        </Animated.ScrollView>

        <FAB onPress={handleAddProject} scrollY={scrollY} />
      </Animated.View>

      <Drawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} onItemPress={handleDrawerItem} />

      {notificationsVisible && (
        <NotificationsScreen onBack={() => setNotificationsVisible(false)} />
      )}

      <WelcomeModal
        visible={welcomeVisible}
        userName={userName}
        onStartProject={() => { setWelcomeVisible(false); handleAddProject(); }}
        onBrowse={() => setWelcomeVisible(false)}
      />

      <UpgradeModal visible={upgradeVisible} onClose={() => setUpgradeVisible(false)} />

      <ProjectOptionsSheet
        visible={projectOptionsVisible}
        onClose={() => setProjectOptionsVisible(false)}
        onOpen={() => handleProjectPress(selectedProject)}
        onEdit={() => {}}
        onShare={() => {}}
        onArchive={() => {
          if (selectedProject) {
            updateData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== selectedProject.id) }));
          }
        }}
        onDelete={() => {
          if (selectedProject) {
            updateData((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== selectedProject.id) }));
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background.main },
  screenContainer: { flex: 1 },
  header: { height: 60, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: HORIZONTAL_PADDING, paddingBottom: 8, backgroundColor: Colors.background.main, borderBottomWidth: 1, borderBottomColor: Colors.border.subtle, zIndex: 10 },
  menuButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  brandTitle: { color: Colors.gold.main, fontSize: 16, fontWeight: '700', fontFamily: 'Inter-Bold', letterSpacing: 2 },
  greeting: { color: Colors.text.tertiary, fontSize: 11, fontFamily: 'Inter-Regular', marginTop: 2 },
  headerLeft: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  bellButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  badgeContainer: { position: 'absolute', top: 6, left: 6, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: Colors.red.badge, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700', fontFamily: 'Inter-Bold' },
  avatarButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.gold.main, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gold.transparent },
  avatarImg: { width: 32, height: 32, borderRadius: 16 },
  avatarText: { color: Colors.gold.main, fontSize: 14, fontWeight: '700', fontFamily: 'Inter-Bold' },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: SECTION_SPACING, paddingBottom: SCROLL_BOTTOM_PADDING },
  sectionsContainer: { gap: SECTION_SPACING },
  section: {},
});
