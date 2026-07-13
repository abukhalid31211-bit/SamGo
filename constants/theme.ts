import { Dimensions, Platform } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

export const isSmallScreen = SCREEN_WIDTH < 375;
export const isLargeScreen = SCREEN_WIDTH > 428;

export const HORIZONTAL_PADDING = isSmallScreen ? 12 : isLargeScreen ? 20 : 16;
export const SECTION_SPACING = 24;
export const SCROLL_BOTTOM_PADDING = 100;

export const Colors = {
  primary: {
    50: '#FBF6E9',
    100: '#F5EAC8',
    200: '#E8D49B',
    300: '#D4B66B',
    400: '#C19A47',
    500: '#A87D2E',
    600: '#8B6428',
    700: '#6E4F22',
    800: '#523D1B',
    900: '#3A2C14',
  },
  gold: {
    bright: '#FFD700',
    main: '#D4AF37',
    soft: '#C19A47',
    dark: '#8B6428',
    glow: 'rgba(212, 175, 55, 0.25)',
    transparent: 'rgba(212, 175, 55, 0.08)',
    border: 'rgba(212, 175, 55, 0.3)',
    borderStrong: 'rgba(212, 175, 55, 0.5)',
    gradient: ['#FFD700', '#B8860B'] as [string, string, ...string[]],
  },
  cyan: {
    main: '#22D3EE',
    soft: 'rgba(34, 211, 238, 0.15)',
    border: 'rgba(34, 211, 238, 0.3)',
    transparent: 'rgba(34, 211, 238, 0.08)',
  },
  green: {
    main: '#4ADE80',
    soft: 'rgba(74, 222, 128, 0.15)',
    transparent: 'rgba(74, 222, 128, 0.08)',
  },
  red: {
    main: '#EF4444',
    soft: 'rgba(239, 68, 68, 0.15)',
    badge: '#FF3B30',
  },
  purple: {
    main: '#A855F7',
    soft: 'rgba(168, 85, 247, 0.2)',
  },
  background: {
    main: '#0A0A0F',
    card: '#14141C',
    cardLight: '#1C1C28',
    input: '#1A1A24',
    tab: 'rgba(10, 10, 15, 0.92)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    drawer: '#111118',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    muted: 'rgba(255, 255, 255, 0.35)',
    dark: 'rgba(255, 255, 255, 0.25)',
  },
};

export const Typography = {
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.primary,
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gold.main,
  },
};

export const Shadows = {
  fab: {
    shadowColor: Colors.gold.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  goldGlow: {
    shadowColor: Colors.gold.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 2,
  },
  tabButton: {
    shadowColor: Colors.gold.main,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const QUICK_ACCESS_ITEMS = [
  { id: 'map', label: 'خريطة', icon: 'Map', color: Colors.gold.main },
  { id: 'gpr', label: 'GPR', icon: 'Waves', color: Colors.gold.main },
  { id: 'detector', label: 'كاشف', icon: 'Radar', color: Colors.gold.bright, highlighted: true },
  { id: '3d', label: '3D', icon: 'Box', color: Colors.gold.main },
  { id: 'reports', label: 'تقارير', icon: 'FileText', color: Colors.gold.main },
];

export const PROJECT_TYPES = {
  gpr: { label: 'GPR', icon: 'Waves' },
  ert: { label: 'ERT', icon: 'Thermometer' },
  topo: { label: 'طبوغرافيا', icon: 'Map' },
  mixed: { label: 'مدمج', icon: 'Layers' },
};

export const NOTIFICATION_TYPES = {
  project: { icon: 'Folder', color: Colors.gold.main, bg: Colors.gold.transparent },
  scan: { icon: 'Radar', color: Colors.cyan.main, bg: Colors.cyan.transparent },
  report: { icon: 'FileText', color: Colors.green.main, bg: Colors.green.transparent },
  system: { icon: 'Info', color: Colors.text.tertiary, bg: 'rgba(255,255,255,0.05)' },
};

export const DRAWER_ITEMS = [
  { id: 'home', label: 'الصفحة الرئيسية', icon: 'Home', color: Colors.gold.main },
  { id: 'projects', label: 'مشاريعي', icon: 'Folder', color: Colors.text.tertiary },
  { id: 'detector', label: 'الكاشف الذكي', icon: 'Radar', color: Colors.gold.main, dot: true },
  { id: '3d', label: 'العرض ثلاثي الأبعاد', icon: 'Box', color: Colors.text.tertiary },
  { id: 'separator1', separator: true },
  { id: 'reports', label: 'تقاريري', icon: 'FileText', color: Colors.text.tertiary },
  { id: 'subscriptions', label: 'الاشتراكات', icon: 'Star', color: Colors.gold.main, badge: 'PRO' },
  { id: 'separator2', separator: true },
  { id: 'settings', label: 'الإعدادات', icon: 'Settings', color: Colors.text.tertiary },
  { id: 'help', label: 'المساعدة', icon: 'HelpCircle', color: Colors.text.tertiary },
];

export function formatStatNumber(n: number): string {
  if (n > 999) {
    return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  }
  return String(n);
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'صباح الخير';
  if (hour >= 12 && hour < 17) return 'مساء الخير';
  return 'مساء النور';
}

export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'الآن';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `منذ ${weeks} أسبوع`;
  const months = Math.floor(days / 30);
  return `منذ ${months} شهر`;
}
