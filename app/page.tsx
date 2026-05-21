"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [shopName, setShopName] = useState('');
  const [slug, setSlug] = useState(''); // حقل الرابط الفريد (خدعتك الذكية)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  // دالة ذكية لتنظيف الرابط تلقائياً ومنع الرموز، المسافات، والعربية أثناء الكتابة!
  const handleSlugChange = (val: string) => {
    const cleaned = val
      .toLowerCase()               // تحويل الحروف الإنجليزية لصغيرة دائماً
      .replace(/\s+/g, '-')        // تحويل أي مسافة إلى شرطة تلقائياً
      .replace(/[^a-z0-9_-]/g, ''); // حذف أي حرف ليس إنجليزياً أو رقماً (يمنع العربي تماماً)
    setSlug(cleaned);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // التحقق من طول الرابط قبل إرساله لقاعدة البيانات
    if (!slug || slug.length < 3) {
      setErrorMsg('الرابط الفريد يجب أن يكون 3 أحرف إنجليزية على الأقل وبدون مسافات');
      setLoading(false);
      return;
    }

    try {
      // 1. إنشاء حساب المستخدم في Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. إدخال بيانات الصالون مع الرابط الفريد (slug) في جدول shops المحدث
        const { error: shopError } = await supabase
          .from('shops')
          .insert({
            owner_id: authData.user.id,
            name: shopName,
            slug: slug
          });

        if (shopError) {
          // إذا كان الاسم مأخوذاً، ستقوم قاعدة البيانات برفضه وإطلاق هذا الخطأ الفريد
          if (shopError.message.includes('unique') || shopError.code === '23505') {
            throw new Error('هذا الاسم الفريد مأخوذ من قبل! اختر اسماً آخر.');
          }
          throw shopError;
        }

        // النجاح والدخول التلقائي للوحة التحكم
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ ما أثناء عملية التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-amber-500 font-mono">Tomezy</h1>
        <p className="text-center text-zinc-400 text-sm">إنشاء حساب صالون جديد وتفعيل الـ QR</p>

        {errorMsg && (
          <div className="bg-red-950/50 border border-red-500 text-red-400 p-3 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-zinc-300 text-xs mb-1">اسم المحل (الصالون)</label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="مثال: صالون البركة (يقبل أي لغة)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 text-xs mb-1">رابط الـ QR الفريد (إنجليزية وأرقام فقط)</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="مثال: mohammed-barber"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-amber-400 font-mono text-sm focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-zinc-500 mt-1">رابط صالونك سيكون: `tomezy.vercel.app/shop/{slug || '...'}`</p>
          </div>

          <div>
            <label className="block text-zinc-300 text-xs mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 text-xs mb-1">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 text-black font-medium p-3 rounded-lg text-sm transition-colors mt-2"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء حساب ومحل جديد'}
          </button>
        </form>
      </div>
    </div>
  );
}
