"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const generateSlug = (name: string) => {
      // Basic arabic/english to slug conversion, avoiding complicated regex for MVP
      return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-آ-ي]/g, '') + '-' + Math.floor(Math.random() * 1000);
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Create User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
        // 2. Create Shop record for user
        const slug = generateSlug(shopName);
        
        const { error: shopError } = await supabase.from('shops').insert({
            name: shopName,
            slug: slug,
            owner_id: authData.user.id,
            status: 'open'
        });

        if (shopError) {
             setError("تم إنشاء الحساب لكن فشل إنشاء المحل. يرجى الاتصال بالدعم.");
             setLoading(false);
             return;
        }

        router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl text-gold-primary">Tomezy</CardTitle>
          <p className="text-text-muted">إنشاء حساب حلاق جديد</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-text-muted mb-2">اسم المحل (الصالون)</label>
              <input
                type="text"
                required
                className="w-full bg-bg-elevated border border-bg-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-primary"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
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
              {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
            </Button>
            
            <p className="text-center text-sm text-text-muted mt-6">
                لديك حساب بالفعل؟ <Link href="/login" className="text-gold-primary hover:underline">تسجيل الدخول</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
