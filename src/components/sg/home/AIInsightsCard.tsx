type Insight = {
  id: string;
  title: string;
  desc: string;
  icon: string;
};

type Props = {
  insights: Insight[];
};

export function AIInsightsCard({ insights }: Props) {
  return (
    <section
      className="rounded-3xl border border-border bg-card p-5"
      style={{ animation: "sg-rise 0.5s ease-out 0.15s both" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-[oklch(0.72_0.15_230/0.15)] grid place-items-center">
          <span className="text-base">🤖</span>
        </div>
        <div>
          <h3 className="text-sm font-bold">رؤى الذكاء الاصطناعي</h3>
          <p className="text-[10px] text-muted-foreground">تحليلات تلقائية لمسوحاتك</p>
        </div>
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
