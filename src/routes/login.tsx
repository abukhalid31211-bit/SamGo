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

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-10 flex flex-col">
      <div className="flex flex-col items-center pt-8">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-black gold-glow"
             style={{ backgroundImage: "linear-gradient(180deg, oklch(0.9 0.12 90), oklch(0.6 0.14 70))", color: "#fbf7ec" }}>
          SG
        </div>
        <h1 className="mt-4 text-2xl font-black text-gold tracking-widest">SAMGOLD</h1>
        <p className="text-xs text-muted-foreground mt-1">مرحباً بعودتك</p>
      </div>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => { e.preventDefault(); navigate({ to: "/" }); }}
      >
        <FloatInput
          label="البريد الإلكتروني"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<span>✉︎</span>}
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
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-gold">نسيت كلمة المرور؟</Link>
        </div>
        <GoldButton type="submit">تسجيل الدخول</GoldButton>
      </form>

      <p className="mt-auto text-center text-xs text-muted-foreground pt-6">
        ليس لديك حساب؟{" "}
        <Link to="/register" className="text-gold">إنشاء حساب جديد</Link>
      </p>
    </div>
  );
}