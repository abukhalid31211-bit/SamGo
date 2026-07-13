import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { FloatInput } from "@/components/sg/FloatInput";
import { GoldButton } from "@/components/sg/GoldButton";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
  head: () => ({ meta: [{ title: "استعادة كلمة المرور — SAMGOLD" }] }),
});

type Stage = 1 | 2 | 3 | 4;

function ForgotPassword() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState(false);
  const [timer, setTimer] = useState(120);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (stage !== 2) return;
    setTimer(120);
    const id = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [stage]);

  const codeStr = code.join("");

  const setCharAt = (i: number, ch: string) => {
    setCodeError(false);
    const c = [...code];
    c[i] = ch;
    setCode(c);
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  };

  const verify = () => {
    if (codeStr.length !== 6) return;
    // demo logic: any 6 digits => success
    if (/^\d{6}$/.test(codeStr)) setStage(3);
    else { setCodeError(true); setCode(["", "", "", "", "", ""]); inputs.current[0]?.focus(); }
  };

  const mm = String(Math.floor(timer / 60));
  const ss = String(timer % 60).padStart(2, "0");

  if (stage === 4) return <Success onGo={() => navigate({ to: "/login" })} />;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 bg-background/90 backdrop-blur border-b border-border">
        <div className="flex items-center px-4 h-14">
          <Link to="/login" className="w-9 h-9 rounded-full grid place-items-center border border-border">
            <span className="text-lg">›</span>
          </Link>
          <h1 className="flex-1 text-center text-sm font-bold">استعادة كلمة المرور</h1>
          <div className="w-9" />
        </div>
        <div className="h-[3px] bg-border overflow-hidden">
          <div className="h-full bg-gold transition-all duration-500" style={{ width: `${(stage / 3) * 100}%` }} />
        </div>
      </header>

      <div className="flex-1 px-6 pt-8 pb-10">
        {stage === 1 && (
          <div style={{ animation: "sg-rise 0.4s ease-out" }}>
            <CenterIcon>✉︎</CenterIcon>
            <h2 className="text-xl font-black text-center">أدخل بريدك الإلكتروني</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              سنرسل رمز تحقق من ٦ أرقام إلى بريدك.
            </p>
            <div className="mt-6 space-y-4">
              <FloatInput label="البريد الإلكتروني" type="email" value={email}
                          autoFocus onChange={(e) => setEmail(e.target.value)} icon={<span>✉︎</span>} />
              <GoldButton disabled={!/\S+@\S+/.test(email)} onClick={() => setStage(2)}>
                إرسال رمز التحقق
              </GoldButton>
            </div>
            <div className="mt-6 text-center">
              <Link to="/login" className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <span>›</span> العودة لتسجيل الدخول
              </Link>
            </div>
          </div>
        )}

        {stage === 2 && (
          <div style={{ animation: "sg-rise 0.4s ease-out" }}>
            <CenterIcon>🔒</CenterIcon>
            <h2 className="text-xl font-black text-center">رمز التحقق</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              أرسلنا الرمز إلى <span className="text-gold">{email}</span>
            </p>

            <div
              className={`mt-6 flex justify-center gap-2 ${codeError ? "" : ""}`}
              style={codeError ? { animation: "sg-shake 0.4s ease" } : undefined}
              dir="ltr"
            >
              {code.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  value={v}
                  onChange={(e) => setCharAt(i, e.target.value.replace(/\D/g, "").slice(-1))}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !v && i > 0) inputs.current[i - 1]?.focus();
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  className={`w-11 h-14 rounded-xl border text-center text-lg font-black bg-card outline-none transition-colors ${
                    codeError ? "border-destructive text-destructive"
                              : v ? "border-gold text-gold" : "border-border text-foreground focus:border-gold"
                  }`}
                />
              ))}
            </div>

            <div className="mt-4 text-center text-xs">
              {timer > 0 ? (
                <span className="text-muted-foreground">إعادة الإرسال بعد {mm}:{ss}</span>
              ) : (
                <button
                  onClick={() => setTimer(120)}
                  className="font-bold" style={{ color: "oklch(0.75 0.15 230)" }}
                >
                  إعادة إرسال الرمز
                </button>
              )}
            </div>

            <div className="mt-4 rounded-2xl p-3 border"
                 style={{ background: "oklch(0.72 0.15 230 / 0.1)", borderColor: "oklch(0.72 0.15 230 / 0.3)" }}>
              <p className="text-[12px]" style={{ color: "oklch(0.85 0.1 230)" }}>
                ℹ️ إن لم تجد الرسالة، تحقق من مجلد السبام.
              </p>
            </div>

            <div className="mt-6">
              <GoldButton disabled={codeStr.length !== 6} onClick={verify}>تحقق ومتابعة</GoldButton>
            </div>
          </div>
        )}

        {stage === 3 && (
          <div style={{ animation: "sg-rise 0.4s ease-out" }}>
            <CenterIcon>🔑</CenterIcon>
            <h2 className="text-xl font-black text-center">كلمة مرور جديدة</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              اختر كلمة مرور قوية لتأمين حسابك.
            </p>
            <div className="mt-6 space-y-3">
              <FloatInput label="كلمة مرور جديدة" type="password" value={pw} onChange={(e) => setPw(e.target.value)} icon={<span>🔒</span>} />
              <StrengthBar value={pw} />
              <FloatInput label="تأكيد كلمة المرور" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} icon={<span>🔒</span>}
                          error={pw2 && pw2 !== pw ? "غير متطابقتين" : undefined} />

              <div className="rounded-2xl border border-border bg-bg-2 p-3 space-y-2">
                <Requirement ok={pw.length >= 8}>٨ أحرف على الأقل</Requirement>
                <Requirement ok={/[A-Z]/.test(pw) && /[a-z]/.test(pw)}>حرف كبير وحرف صغير</Requirement>
                <Requirement ok={/\d/.test(pw)}>رقم واحد على الأقل</Requirement>
              </div>

              <GoldButton disabled={!(pw.length >= 8 && pw === pw2)} onClick={() => setStage(4)}>
                حفظ كلمة المرور
              </GoldButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CenterIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mb-5 w-20 h-20 rounded-3xl border border-[oklch(0.82_0.14_85/0.35)] bg-bg-2 grid place-items-center text-3xl gold-glow">
      <span className="text-gold">{children}</span>
    </div>
  );
}

function StrengthBar({ value }: { value: string }) {
  let s = 0;
  if (value.length >= 6) s++;
  if (value.length >= 10) s++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
  if (/\d/.test(value) && /[^\w]/.test(value)) s++;
  const colors = ["", "oklch(0.65 0.24 25)", "oklch(0.75 0.16 55)", "oklch(0.8 0.15 100)", "oklch(0.72 0.17 155)"];
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="h-1 flex-1 rounded-full bg-border overflow-hidden">
          <div className="h-full" style={{ width: s >= n ? "100%" : "0%", background: colors[s] }} />
        </div>
      ))}
    </div>
  );
}

function Requirement({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-2 h-2 rounded-full ${ok ? "bg-gold gold-glow" : "bg-border"}`} />
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>{children}</span>
    </div>
  );
}

function Success({ onGo }: { onGo: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-8 text-center">
      <div className="relative">
        <span className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: "oklch(0.72 0.17 155)", animation: "sg-expand 1.2s ease-out forwards" }} />
        <div className="w-28 h-28 rounded-full grid place-items-center text-5xl text-white"
             style={{ backgroundImage: "linear-gradient(180deg, oklch(0.8 0.17 155), oklch(0.55 0.15 155))",
                      boxShadow: "0 20px 40px -10px oklch(0.72 0.17 155 / 0.5)" }}>
          ✓
        </div>
      </div>
      <h2 className="mt-8 text-2xl font-black">تمّت العملية بنجاح! 🎉</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
      </p>
      <div className="mt-10 w-full max-w-xs">
        <GoldButton onClick={onGo}>تسجيل الدخول</GoldButton>
      </div>
    </div>
  );
}