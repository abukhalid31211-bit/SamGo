import { useEffect, useState } from "react";

export type User = {
  name: string;
  email: string;
  plan: "free" | "pro";
};

export type Project = {
  id: string;
  name: string;
  type: string;
  progress: number;
  date: string;
  pinned: boolean;
  color: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
};

export type AIInsight = {
  id: string;
  title: string;
  desc: string;
  icon: string;
};

export type Stats = {
  scans: number;
  projects: number;
  accuracy: number;
};

export type AppData = {
  user: User;
  projects: Project[];
  notifications: Notification[];
  aiInsights: AIInsight[];
  stats: Stats;
};

const STORAGE_KEY = "samgold_data";

const defaultData: AppData = {
  user: {
    name: "مستخدم SAMGOLD",
    email: "user@samgold.com",
    plan: "free",
  },
  projects: [
    { id: "p1", name: "مسح منطقة الشمال", type: "جيوفيزيائي", progress: 72, date: "2025-07-10", pinned: true, color: "oklch(0.82 0.14 85)" },
    { id: "p2", name: "استكشاف موقع أثري", type: "آثار", progress: 45, date: "2025-07-08", pinned: false, color: "oklch(0.72 0.15 230)" },
    { id: "p3", name: "دراسة أساسات", type: "مدني", progress: 90, date: "2025-07-12", pinned: false, color: "oklch(0.72 0.17 155)" },
  ],
  notifications: [
    { id: "n1", title: "اكتمل المسح", body: "اكتمل مسح منطقة الشمال بنجاح", time: "قبل ساعة", read: false, type: "success" },
    { id: "n2", title: "تنبيه دقة", body: "انخفاض دقة الكشف في المنطقة الشرقية", time: "قبل 3 ساعات", read: false, type: "warning" },
    { id: "n3", title: "مشروع جديد", body: "تمت إضافة مشروع دراسة أساسات", time: "أمس", read: true, type: "info" },
  ],
  aiInsights: [
    { id: "ai1", title: "نمط كشف موصى به", desc: "تم اكتشاف 3 أنماط متشابهة في المنطقة الشمالية يوصى بإعادة المسح للتأكد", icon: "📊" },
    { id: "ai2", title: "تحسين الدقة", desc: "يمكن تحسين دقة الكشف بنسبة 15% بضبط حساسية الجهاز", icon: "⚡" },
  ],
  stats: { scans: 128, projects: 14, accuracy: 94 },
};

export function useLocalData() {
  const [data, setData] = useState<AppData>(defaultData);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData({ ...defaultData, ...parsed });
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      }
    } catch {
      // use defaults
    }
  }, []);

  const persist = (updater: (d: AppData) => AppData) => {
    setData((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleProjectPin = (id: string) =>
    persist((d) => ({
      ...d,
      projects: d.projects.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)),
    }));

  const deleteProject = (id: string) =>
    persist((d) => ({
      ...d,
      projects: d.projects.filter((p) => p.id !== id),
    }));

  const markNotifRead = (id: string) =>
    persist((d) => ({
      ...d,
      notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));

  const markAllNotifsRead = () =>
    persist((d) => ({
      ...d,
      notifications: d.notifications.map((n) => ({ ...n, read: true })),
    }));

  return { data, toggleProjectPin, deleteProject, markNotifRead, markAllNotifsRead };
}
