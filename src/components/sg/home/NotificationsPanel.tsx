import { useState } from "react";

type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
};

type Props = {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

const typeColors: Record<string, string> = {
  info: "oklch(0.72 0.15 230)",
  success: "oklch(0.72 0.17 155)",
  warning: "oklch(0.75 0.16 55)",
};

const typeIcons: Record<string, string> = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
};

const filters = ["الكل", "غير مقروء", "مقروء"];

export function NotificationsPanel({ open, onClose, notifications, onMarkRead, onMarkAllRead }: Props) {
  const [filter, setFilter] = useState("الكل");

  const filtered = notifications.filter((n) => {
    if (filter === "غير مقروء") return !n.read;
    if (filter === "مقروء") return n.read;
    return true;
  });

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-card border-r border-border transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-bold">الإشعارات</h2>
          <button
            onClick={onMarkAllRead}
            className="text-xs text-gold"
          >
            تعليم الكل كمقروء
          </button>
        </div>

        <div className="flex gap-2 p-3 border-b border-border">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-gold text-primary-foreground"
                  : "bg-bg-2 text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto h-[calc(100%-120px)] p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <span className="text-4xl mb-3">🔔</span>
              <p className="text-sm">لا توجد إشعارات</p>
            </div>
          ) : (
            filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`w-full text-right rounded-2xl border p-3 transition-all active:scale-95 ${
                  n.read ? "border-border bg-bg-2/40" : "border-[oklch(0.82_0.14_85/0.2)] bg-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
                    style={{ background: `color-mix(in oklab, ${typeColors[n.type]} 15%, transparent)` }}
                  >
                    {typeIcons[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold truncate">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-gold shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
