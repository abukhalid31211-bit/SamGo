import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FloatInput } from "@/components/sg/FloatInput";
import { GoldButton } from "@/components/sg/GoldButton";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "تسجيل الدخول — SAMGOLD" }] }),
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/\S+@\S+/.test(email) || password.length < 6) {
      setError("تحقق من البريد الإلكتروني وكلمة المرور.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => navigate({ to: "/home" }), 500);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground px-6 py-10 flex flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-25"
        style={{ background: "var(--gold)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-15"
        style={{ background: "oklch(0.72 0.15 230)" }}
      />

      <div className="relative flex flex-col items-center pt-8">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-black gold-glow"
             style={{ backgroundImage: "linear-gradient(180deg, oklch(0.9 0.12 90), oklch(0.6 0.14 70))", color: "#fbf7ec" }}>
          SG
        </div>
        <h1 className="mt-4 text-2xl font-black text-gold tracking-widest">SAMGOLD</h1>
        <p className="text-xs text-muted-foreground mt-1">مرحباً بعودتك</p>
      </div>

      <form
        className="relative mt-8 space-y-4"
        style={shake ? { animation: "sg-shake 0.4s ease" } : undefined}
        onSubmit={submit}
      >
        <FloatInput
          label="البريد الإلكتروني"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<span>✉︎</span>}
          error={error || undefined}
        />
        <div className="relative">
          <FloatInput
            label="كلمة المرور"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<span>🔒</span>}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
          >
            {show ? "إخفاء" : "إظهار"}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span
              onClick={() => setRemember((r) => !r)}
              className={`w-4 h-4 rounded grid place-items-center border transition-colors ${
                remember ? "bg-gold border-transparent" : "border-border bg-card"
              }`}
            >
              {remember && <span className="text-[9px] text-primary-foreground font-black">✓</span>}
            </span>
            <span className="text-xs text-muted-foreground">تذكّرني</span>
          </label>
          <Link to="/forgot-password" className="text-xs text-gold">نسيت كلمة المرور؟</Link>
        </div>
        <GoldButton type="submit" disabled={loading}>
          {loading ? (
            <span className="inline-block w-4 h-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
          ) : (
            "تسجيل الدخول"
          )}
        </GoldButton>

        <div className="flex items-center gap-3 py-1">
          <span className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">أو</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        <button
          type="button"
          onClick={() => navigate({ to: "/home" })}
          className="w-full rounded-2xl border border-border py-3.5 text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <span className="w-5 h-5 rounded-full bg-gold/15 grid place-items-center text-gold text-[11px] font-black">G</span>
          <span>الدخول بحساب Google</span>
        </button>
      </form>

      <p className="mt-auto text-center text-xs text-muted-foreground pt-6">
        ليس لديك حساب؟{" "}
        <Link to="/register" className="text-gold">إنشاء حساب جديد</Link>
      </p>
    </div>
  );
}
