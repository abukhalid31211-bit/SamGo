import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUri: string | null;
  isPro: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  type: 'gpr' | 'ert' | 'topo' | 'mixed';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScanResult {
  id: string;
  projectId: string | null;
  depth: number;
  probability: number;
  targetType: string;
  heatmapData: number[];
  targetPosition: { x: number; y: number };
  createdAt: string;
}

export interface Report {
  id: string;
  projectId: string | null;
  title: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'project' | 'scan' | 'report' | 'system';
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  linkTarget?: string;
}

export interface AIInsight {
  text: string;
  scanId: string;
  createdAt: string;
}

export interface AppData {
  user: UserProfile | null;
  projects: Project[];
  scans: ScanResult[];
  reports: Report[];
  notifications: Notification[];
  aiInsight: AIInsight | null;
  hasSeenWelcome: boolean;
}

const STORAGE_KEY = '@samgold_data';
const USER_KEY = '@samgold_current_user';

export const defaultData: AppData = {
  user: null,
  projects: [],
  scans: [],
  reports: [],
  notifications: [],
  aiInsight: null,
  hasSeenWelcome: false,
};

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultData, ...parsed };
    }
    return { ...defaultData };
  } catch {
    return { ...defaultData };
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
}

export async function saveCurrentUser(user: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user', e);
  }
}

export async function loadCurrentUser(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function updateData(
  updater: (data: AppData) => AppData | Promise<AppData>
): Promise<AppData> {
  const current = await loadData();
  const updated = await updater(current);
  await saveData(updated);
  return updated;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
