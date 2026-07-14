import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { HomeHeader } from "@/components/sg/home/HomeHeader";
import { QuickAccess } from "@/components/sg/home/QuickAccess";
import { DetectorCard } from "@/components/sg/home/DetectorCard";
import { AIInsightsCard } from "@/components/sg/home/AIInsightsCard";
import { ProjectsSection } from "@/components/sg/home/ProjectsSection";
import { StatsSection } from "@/components/sg/home/StatsSection";
import { FAB } from "@/components/sg/home/FAB";
import { BottomTabBar } from "@/components/sg/home/BottomTabBar";
import { Drawer } from "@/components/sg/home/Drawer";
import { NotificationsPanel } from "@/components/sg/home/NotificationsPanel";
import { WelcomeModal } from "@/components/sg/home/WelcomeModal";
import { UpgradeModal } from "@/components/sg/home/UpgradeModal";
import { ProjectOptionsSheet } from "@/components/sg/home/ProjectOptionsSheet";
import { useLocalData } from "@/components/sg/home/useLocalData";

export const Route = createFileRoute("/home")({
  component: HomeScreen,
  head: () => ({
    meta: [
      { title: "الرئيسية — SAMGOLD" },
      { name: "description", content: "شاشة رئيسية SAMGOLD" },
    ],
  }),
});

function HomeScreen() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [projectSheet, setProjectSheet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [fabVisible, setFabVisible] = useState(true);

  const { data, toggleProjectPin, deleteProject, markNotifRead, markAllNotifsRead } = useLocalData();

  useEffect(() => {
    const seen = localStorage.getItem("samgold_home_seen");
    if (!seen) {
      setWelcomeOpen(true);
      localStorage.setItem("samgold_home_seen", "1");
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let lastY = 0;
    const onScroll = () => {
      const y = el.scrollTop;
      setFabVisible(y < lastY || y < 100);
      lastY = y;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") return;
    if (tab === "settings") {
      setDrawerOpen(true);
      setActiveTab("home");
    }
  };

  const unreadCount = useMemo(
    () => data.notifications.filter((n) => !n.read).length,
    [data.notifications],
  );

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in oklab, var(--gold) 12%, transparent), transparent 60%)",
        }}
      />

      <HomeHeader
        user={data.user}
        onMenu={() => setDrawerOpen(true)}
        onNotifications={() => setNotifOpen(true)}
        onProfile={() => setDrawerOpen(true)}
        unreadCount={unreadCount}
      />

      <div
        ref={scrollRef}
        className="relative z-10 h-[calc(100vh-64px)] overflow-y-auto pb-24"
      >
        <div className="mx-auto max-w-2xl px-4 space-y-6 pt-4">
          <QuickAccess onUpgrade={() => setUpgradeOpen(true)} />

          <DetectorCard plan={data.user.plan} />

          <AIInsightsCard insights={data.aiInsights} onDetails={() => navigate({ to: "/home" })} />

          <ProjectsSection
            projects={data.projects}
            onProjectLongPress={(id) => setProjectSheet(id)}
            onCreateProject={() => navigate({ to: "/home" })}
            onViewAll={() => navigate({ to: "/home" })}
          />

          <StatsSection stats={data.stats} />
        </div>
      </div>

      <FAB
        visible={fabVisible}
        onClick={() => navigate({ to: "/home" })}
      />

      <BottomTabBar active={activeTab} onChange={handleTabChange} />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={data.user}
        onUpgrade={() => {
          setDrawerOpen(false);
          setUpgradeOpen(true);
        }}
      />

      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={data.notifications}
        onMarkRead={markNotifRead}
        onMarkAllRead={markAllNotifsRead}
      />

      <WelcomeModal
        open={welcomeOpen}
        onClose={() => setWelcomeOpen(false)}
        user={data.user}
        onStartProject={() => navigate({ to: "/home" })}
      />

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      <ProjectOptionsSheet
        projectId={projectSheet}
        projects={data.projects}
        onClose={() => setProjectSheet(null)}
        onOpen={() => navigate({ to: "/home" })}
        onTogglePin={toggleProjectPin}
        onDelete={deleteProject}
      />
    </div>
  );
}
