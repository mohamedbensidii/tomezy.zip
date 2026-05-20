"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl text-gold-primary">Tomezy</CardTitle>
          <p className="text-text-muted">تسجيل دخول الحلاقين</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                required
                className="w-full bg-bg-elevated border border-bg-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">كلمة المرور</label>
              <input
                type="password"
                required
                className="w-full bg-bg-elevated border border-bg-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-error text-sm text-center">{error}</p>}

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "جاري تسجيل الدخول..." : "دخول"}
            </Button>
            
            <p className="text-center text-sm text-text-muted mt-6">
                ليس لديك حساب؟ <Link href="/register" className="text-gold-primary hover:underline">إنشاء حساب جديد</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
