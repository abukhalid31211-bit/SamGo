import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FloatInput } from "@/components/sg/FloatInput";
import { GoldButton } from "@/components/sg/GoldButton";

export const Route = createFileRoute("/register")({
  component: Register,
  head: () => ({ meta: [{ title: "إنشاء حساب جديد — SAMGOLD" }] }),
});

type Data = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  org: string;
  role: string;
  agree1: boolean;
  agree2: boolean;
  agree3: boolean;
};

const roles = [
  { id: "geo", label: "جيوفيزيائي", desc: "مسح باطن الأرض", icon: "🌐" },
  { id: "eng", label: "مهندس مدني", desc: "دراسات الأساسات", icon: "🏗️" },
  { id: "arch", label: "آثار", desc: "المسح الأثري", icon: "🏛️" },
  { id: "min", label: "تعدين", desc: "استكشاف المعادن", icon: "⛏️" },
  { id: "other", label: "أخرى", desc: "استخدام عام", icon: "✳️" },
];

function passwordStrength(p: string): number {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p) && /[^\w]/.test(p)) s++;
  return Math.min(s, 4);
}

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [rolePickerOpen, setRolePickerOpen] = useState(false);
  const [d, setD] = useState<Data>({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "",
    org: "", role: "", agree1: false, agree2: false, agree3: false,
  });
  const upd = <K extends keyof Data>(k: K, v: Data[K]) => setD((s) => ({ ...s, [k]: v }));

  const strength = passwordStrength(d.password);
  const strLabels = ["", "ضعيفة", "مقبولة", "جيدة", "قوية جداً"];
  const strColors = ["", "oklch(0.65 0.24 25)", "oklch(0.75 0.16 55)", "oklch(0.8 0.15 100)", "oklch(0.72 0.17 155)"];

  const canNext1 = d.fullName.trim() && /\S+@\S+/.test(d.email);
  const canNext2 = d.password.length >= 6 && d.password === d.confirmPassword && d.role;
  const canSubmit = d.agree1 && d.agree2 && d.agree3;

  const go = (n: number) => { setDir(n > step ? "next" : "prev"); setStep(n); };

  const roleObj = roles.find(r => r.id === d.role);

  return (
    <div className="min-h-screen bg-background text-foreground pb-10">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => step === 1 ? navigate({ to: "/onboarding" }) : go(step - 1)}
            className="w-9 h-9 rounded-full grid place-items-center border border-border"
          >
            <span className="text-lg">›</span>
          </button>
          <h1 className="flex-1 text-center text-sm font-bold">إنشاء حساب جديد</h1>
          <div className="w-9" />
        </div>
        <div className="h-[3px] bg-border relative overflow-hidden">
          <div className="h-full bg-gold transition-all duration-500"
               style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </header>

      <div className="px-5 pt-6">
        {/* Stepper */}
        <div className="flex items-center justify-between max-w-xs mx-auto mb-6">
          {[1, 2, 3].map((n, idx) => (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div className={`w-9 h-9 rounded-full grid place-items-center text-xs font-bold border transition-colors ${
                step >= n ? "bg-gold text-primary-foreground border-transparent gold-glow" : "border-border text-muted-foreground"
              }`}>
                {step > n ? "✓" : n}
              </div>
              {idx < 2 && (
                <div className={`flex-1 h-px mx-2 ${step > n ? "bg-gold" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          key={step}
          className="rounded-3xl border border-border bg-card/70 backdrop-blur p-5"
          style={{ animation: `sg-rise 0.4s ease-out` }}
        >
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-gold text-primary-foreground grid place-items-center text-sm font-black">1</div>
                <div>
                  <h2 className="text-base font-bold">معلوماتك الأساسية</h2>
                  <p className="text-[11px] text-muted-foreground">تُستخدم لتعريف حسابك</p>
                </div>
              </div>
              <div className="space-y-3">
                <FloatInput label="الاسم الكامل" value={d.fullName} onChange={(e) => upd("fullName", e.target.value)} icon={<span>👤</span>} />
                <FloatInput label="البريد الإلكتروني" type="email" value={d.email} onChange={(e) => upd("email", e.target.value)} icon={<span>✉︎</span>} hint="سيُستخدم للدخول" />
                <FloatInput label="رقم الجوال (اختياري)" type="tel" inputMode="numeric" value={d.phone} onChange={(e) => upd("phone", e.target.value)} icon={<span>📱</span>} />
              </div>
              <div className="mt-6">
                <GoldButton disabled={!canNext1} onClick={() => go(2)}>التالي — بيانات الحساب</GoldButton>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-gold text-primary-foreground grid place-items-center text-sm font-black">2</div>
                <div>
                  <h2 className="text-base font-bold">بيانات الحساب</h2>
                  <p className="text-[11px] text-muted-foreground">اختر كلمة مرور قوية</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <FloatInput label="كلمة المرور" type="password" value={d.password} onChange={(e) => upd("password", e.target.value)} icon={<span>🔒</span>} />
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="h-1 flex-1 rounded-full bg-border overflow-hidden">
                        <div className="h-full transition-all"
                             style={{ width: strength >= n ? "100%" : "0%", background: strColors[strength] || "transparent" }} />
                      </div>
                    ))}
                  </div>
                  {d.password && (
                    <p className="mt-1 text-[11px]" style={{ color: strColors[strength] }}>
                      {strLabels[strength]}
                    </p>
                  )}
                </div>
                <FloatInput label="تأكيد كلمة المرور" type="password" value={d.confirmPassword} onChange={(e) => upd("confirmPassword", e.target.value)} icon={<span>🔒</span>}
                            error={d.confirmPassword && d.confirmPassword !== d.password ? "كلمتا المرور غير متطابقتين" : undefined} />
                <FloatInput label="الجهة أو المؤسسة (اختياري)" value={d.org} onChange={(e) => upd("org", e.target.value)} icon={<span>🏢</span>} />

                <button
                  type="button"
                  onClick={() => setRolePickerOpen(true)}
                  className={`w-full rounded-2xl border ${d.role ? "border-[oklch(0.82_0.14_85/0.5)]" : "border-border"} bg-card/60 px-4 py-4 flex items-center justify-between text-sm`}
                >
                  <span className={d.role ? "text-foreground" : "text-muted-foreground"}>
                    {roleObj ? `${roleObj.icon} ${roleObj.label}` : "التخصص المهني"}
                  </span>
                  <span className="text-muted-foreground">▾</span>
                </button>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => go(1)} className="rounded-2xl px-5 py-3.5 text-sm border border-border">السابق</button>
                <GoldButton disabled={!canNext2} onClick={() => go(3)}>التالي — الموافقة</GoldButton>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-gold text-primary-foreground grid place-items-center text-sm font-black">3</div>
                <div>
                  <h2 className="text-base font-bold">مراجعة وموافقة</h2>
                  <p className="text-[11px] text-muted-foreground">تحقق من معلوماتك</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-bg-2 p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full grid place-items-center text-lg font-black gold-glow"
                     style={{ backgroundImage: "linear-gradient(180deg, oklch(0.9 0.12 90), oklch(0.6 0.14 70))", color: "#fbf7ec" }}>
                  {d.fullName.trim()[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{d.fullName || "—"}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{d.email}</div>
                  <div className="text-[11px] text-gold">{roleObj?.label}</div>
                </div>
                <span className="text-[10px] rounded-full px-2 py-1 font-bold"
                      style={{ background: "oklch(0.72 0.17 155 / 0.15)", color: "oklch(0.72 0.17 155)" }}>
                  مجاني
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <Checkbox checked={d.agree1} onChange={(v) => upd("agree1", v)}>
                  أوافق على <span className="text-gold">شروط الاستخدام</span>
                </Checkbox>
                <Checkbox checked={d.agree2} onChange={(v) => upd("agree2", v)}>
                  أوافق على <span className="text-gold">سياسة الخصوصية</span>
                </Checkbox>
                <Checkbox checked={d.agree3} onChange={(v) => upd("agree3", v)}>
                  أقر بأن البيانات المدخلة صحيحة
                </Checkbox>
              </div>

              <div className="mt-4 rounded-2xl p-3 border"
                   style={{ background: "oklch(0.72 0.15 230 / 0.1)", borderColor: "oklch(0.72 0.15 230 / 0.3)" }}>
                <p className="text-[12px]" style={{ color: "oklch(0.85 0.1 230)" }}>
                  🎁 ستحصل على الخطة المجانية تلقائياً بعد إنشاء الحساب.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => go(2)} className="rounded-2xl px-5 py-3.5 text-sm border border-border">السابق</button>
                <GoldButton disabled={!canSubmit} onClick={() => navigate({ to: "/home" })}>
                  إنشاء الحساب 🎉
                </GoldButton>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          لديك حساب؟ <Link to="/login" className="text-gold">تسجيل الدخول</Link>
        </p>
      </div>

      {/* Role picker sheet */}
      {rolePickerOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setRolePickerOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 inset-x-0 rounded-t-3xl border-t border-border bg-card p-5"
            style={{ animation: "sg-rise 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-border mx-auto mb-4" />
            <h3 className="text-sm font-bold mb-3">اختر التخصص المهني</h3>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { upd("role", r.id); setRolePickerOpen(false); }}
                  className={`w-full text-right rounded-2xl border p-3 flex items-center gap-3 transition-colors ${
                    d.role === r.id ? "border-gold bg-gold/10" : "border-border bg-bg-2"
                  }`}
                >
                  <span className="text-xl">{r.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{r.label}</div>
                    <div className="text-[11px] text-muted-foreground">{r.desc}</div>
                  </div>
                  {d.role === r.id && <span className="text-gold">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <span
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-5 h-5 rounded-md border grid place-items-center transition-colors ${
          checked ? "bg-gold border-transparent" : "border-border bg-card"
        }`}
      >
        {checked && <span className="text-[11px] text-primary-foreground font-black">✓</span>}
      </span>
      <span className="text-xs leading-relaxed text-foreground">{children}</span>
    </label>
  );
}
