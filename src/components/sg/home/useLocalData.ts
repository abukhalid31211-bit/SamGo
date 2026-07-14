import { useEffect, useState } from "react";

export type User = {
  name: string;
  email: string;
  plan: "free" | "pro";
};

export type ProjectStatus = "active" | "completed" | "archived";

export type ProjectFile = {
  id: string;
  name: string;
  kind: "gpr" | "csv" | "dxf" | "other";
  size: number;
  uploadedAt: string;
  status: "ready" | "processing";
};

export type TeamMember = {
  id: string;
  email: string;
  role: "viewer" | "editor" | "owner";
};

export type ActivityItem = {
  id: string;
  type: "create" | "upload" | "analyze" | "report" | "edit" | "member";
  title: string;
  desc: string;
  time: string;
};

export type Project = {
  id: string;
  name: string;
  type: string;
  progress: number;
  date: string;
  pinned: boolean;
  color: string;
  status: ProjectStatus;
  createdAt: string;
  description?: string;
  location?: string;
  unit: "metric" | "imperial";
  coordSystem: string;
  accuracy: number;
  files: ProjectFile[];
  team: TeamMember[];
  activity: ActivityItem[];
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
    {
      id: "p1", name: "مسح منطقة الشمال", type: "رادار أرضي GPR", progress: 72, date: "2025-07-10",
      pinned: true, color: "oklch(0.72 0.15 230)", status: "active", createdAt: "2025-06-20",
      description: "مسح جيوفيزيائي شامل لمنطقة الشمال باستخدام الرادار الأرضي.",
      location: "الرياض، السعودية", unit: "metric", coordSystem: "WGS84", accuracy: 0.3,
      files: [
        { id: "f1", name: "north_scan_01.dzt", kind: "gpr", size: 5_400_000, uploadedAt: "2025-07-09", status: "ready" },
        { id: "f2", name: "readings.csv", kind: "csv", size: 82_000, uploadedAt: "2025-07-10", status: "ready" },
      ],
      team: [{ id: "t1", email: "sara@samgold.com", role: "editor" }],
      activity: [
        { id: "a1", type: "create", title: "تم إنشاء المشروع", desc: "أُنشئ مشروع مسح منطقة الشمال", time: "2025-06-20" },
        { id: "a2", type: "upload", title: "رفع ملف", desc: "تم رفع north_scan_01.dzt", time: "2025-07-09" },
      ],
    },
    {
      id: "p2", name: "استكشاف موقع أثري", type: "مسح طبوغرافي", progress: 45, date: "2025-07-08",
      pinned: false, color: "oklch(0.72 0.17 155)", status: "active", createdAt: "2025-06-25",
      description: "استكشاف موقع أثري محتمل قرب الحدود الشرقية.",
      location: "", unit: "metric", coordSystem: "UTM", accuracy: 0.5,
      files: [], team: [],
      activity: [{ id: "a3", type: "create", title: "تم إنشاء المشروع", desc: "أُنشئ مشروع استكشاف موقع أثري", time: "2025-06-25" }],
    },
    {
      id: "p3", name: "دراسة أساسات", type: "مقاومة كهربائية ERT", progress: 100, date: "2025-07-12",
      pinned: false, color: "oklch(0.82 0.14 85)", status: "completed", createdAt: "2025-06-01",
      description: "دراسة مقاومة التربة لأساسات مبنى سكني.",
      location: "جدة، السعودية", unit: "imperial", coordSystem: "محلي مخصص", accuracy: 0.1,
      files: [{ id: "f3", name: "resistivity.csv", kind: "csv", size: 120_000, uploadedAt: "2025-07-11", status: "ready" }],
      team: [{ id: "t2", email: "omar@samgold.com", role: "viewer" }],
      activity: [
        { id: "a4", type: "create", title: "تم إنشاء المشروع", desc: "أُنشئ مشروع دراسة أساسات", time: "2025-06-01" },
        { id: "a5", type: "report", title: "إنشاء تقرير", desc: "تم إنشاء التقرير النهائي", time: "2025-07-12" },
      ],
    },
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

  const restoreProject = (project: Project) =>
    persist((d) => ({ ...d, projects: [project, ...d.projects] }));

  const addActivity = (d: AppData, projectId: string, item: Omit<ActivityItem, "id" | "time">): AppData => ({
    ...d,
    projects: d.projects.map((p) =>
      p.id === projectId
        ? { ...p, activity: [{ ...item, id: `act_${Date.now()}`, time: "الآن" }, ...p.activity] }
        : p,
    ),
  });

  const addProject = (input: {
    name: string;
    description?: string;
    type: string;
    color: string;
    location?: string;
    unit: "metric" | "imperial";
    coordSystem: string;
    accuracy: number;
  }) => {
    const id = `p_${Date.now()}`;
    persist((d) => {
      const project: Project = {
        id,
        name: input.name,
        type: input.type,
        progress: 0,
        date: new Date().toISOString().slice(0, 10),
        pinned: false,
        color: input.color,
        status: "active",
        createdAt: new Date().toISOString().slice(0, 10),
        description: input.description,
        location: input.location,
        unit: input.unit,
        coordSystem: input.coordSystem,
        accuracy: input.accuracy,
        files: [],
        team: [],
        activity: [
          { id: `act_${Date.now()}`, type: "create", title: "تم إنشاء المشروع", desc: `أُنشئ مشروع ${input.name}`, time: "الآن" },
        ],
      };
      return { ...d, projects: [project, ...d.projects] };
    });
    return id;
  };

  const updateProject = (
    id: string,
    patch: Partial<Pick<Project, "name" | "description" | "location">>,
  ) =>
    persist((d) => {
      const next = {
        ...d,
        projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      };
      return addActivity(next, id, { type: "edit", title: "تعديل المشروع", desc: "تم تعديل معلومات المشروع" });
    });

  const setProjectStatus = (id: string, status: ProjectStatus) =>
    persist((d) => {
      const next = {
        ...d,
        projects: d.projects.map((p) => (p.id === id ? { ...p, status } : p)),
      };
      const label = status === "archived" ? "أرشفة المشروع" : status === "completed" ? "إكمال المشروع" : "تنشيط المشروع";
      return addActivity(next, id, { type: "edit", title: label, desc: label });
    });

  const addFileToProject = (projectId: string, file: Omit<ProjectFile, "id" | "uploadedAt" | "status">) =>
    persist((d) => {
      const newFile: ProjectFile = {
        ...file,
        id: `f_${Date.now()}`,
        uploadedAt: new Date().toISOString().slice(0, 10),
        status: "ready",
      };
      const next = {
        ...d,
        projects: d.projects.map((p) => (p.id === projectId ? { ...p, files: [newFile, ...p.files] } : p)),
      };
      return addActivity(next, projectId, { type: "upload", title: "رفع ملف", desc: `تم رفع ${file.name}` });
    });

  const removeFileFromProject = (projectId: string, fileId: string) =>
    persist((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === projectId ? { ...p, files: p.files.filter((f) => f.id !== fileId) } : p,
      ),
    }));

  const addTeamMember = (projectId: string, email: string, role: TeamMember["role"] = "viewer") =>
    persist((d) => {
      const member: TeamMember = { id: `t_${Date.now()}`, email, role };
      const next = {
        ...d,
        projects: d.projects.map((p) => (p.id === projectId ? { ...p, team: [...p.team, member] } : p)),
      };
      return addActivity(next, projectId, { type: "member", title: "إضافة عضو", desc: `تمت إضافة ${email} للفريق` });
    });

  const updateTeamMemberRole = (projectId: string, memberId: string, role: TeamMember["role"]) =>
    persist((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === projectId
          ? { ...p, team: p.team.map((m) => (m.id === memberId ? { ...m, role } : m)) }
          : p,
      ),
    }));

  const removeTeamMember = (projectId: string, memberId: string) =>
    persist((d) => ({
      ...d,
      projects: d.projects.map((p) =>
        p.id === projectId ? { ...p, team: p.team.filter((m) => m.id !== memberId) } : p,
      ),
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

  return {
    data,
    toggleProjectPin,
    deleteProject,
    restoreProject,
    addProject,
    updateProject,
    setProjectStatus,
    addFileToProject,
    removeFileFromProject,
    addTeamMember,
    updateTeamMemberRole,
    removeTeamMember,
    markNotifRead,
    markAllNotifsRead,
  };
}
