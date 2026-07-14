type Insight = {
  id: string;
  title: string;
  desc: string;
  icon: string;
};

type Props = {
  insights: Insight[];
  onDetails?: () => void;
};

export function AIInsightsCard({ insights, onDetails }: Props) {
  const hasInsights = insights.length > 0;

  if (!hasInsights) {
    return (
      <section
        className="rounded-2xl border-r-[3px] border-[oklch(0.72_0.15_230)] bg-[oklch(0.72_0.15_230/0.06)] p-3"
        style={{ animation: "sg-rise 0.5s ease-out 0.15s both" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base opacity-70">🤖</span>
          <h3 className="text-sm font-bold text-muted-foreground">رؤى الذكاء الاصطناعي</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed text-center py-2">
          أجرِ مسحاً لتظهر هنا تحليلات الذكاء الاصطناعي
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-3xl border border-border bg-card p-5 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ animation: "sg-rise 0.5s ease-out 0.15s both" }}
      onClick={onDetails}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[oklch(0.72_0.15_230/0.15)] grid place-items-center">
            <span className="text-base">🤖</span>
          </div>
          <div>
            <h3 className="text-sm font-bold">رؤى الذكاء الاصطناعي</h3>
            <p className="text-[10px] text-muted-foreground">تحليلات تلقائية لمسوحاتك</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDetails?.(); }}
          className="text-xs text-gold shrink-0 active:scale-95 transition-transform"
        >
          تفاصيل ←
        </button>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={insight.id}
            className="flex gap-3 rounded-2xl bg-bg-2/60 p-3 border-r-2"
            style={{
              borderColor: "oklch(0.72 0.15 230)",
              animation: `sg-rise 0.4s ease-out ${0.2 + i * 0.08}s both`,
            }}
          >
            <span className="text-xl shrink-0">{insight.icon}</span>
            <div>
              <p className="text-sm font-bold mb-1">{insight.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
