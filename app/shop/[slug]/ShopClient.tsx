"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ShopClientProps {
  slug: string;
}

export default function ShopClient({ slug }: ShopClientProps) {
  const [customerName, setCustomerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopId, setShopId] = useState<string | null>(null);
  const [waitingCount, setWaitingCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingShop, setFetchingShop] = useState(true);

  const supabase = createClient();

  // جلب بيانات المحل والـ ID عند فتح الصفحة
  useEffect(() => {
    async function fetchShopData() {
      try {
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('id, name')
          .eq('slug', slug)
          .single();

        if (shopError || !shopData) {
          setErrorMsg('لم نتمكن من العثور على بيانات هذا الصالون');
          return;
        }

        setShopId(shopData.id);
        setShopName(shopData.name);

        // جلب عدد المنتظرين في الطابور لهذا المحل
        const { count, error: queueError } = await supabase
          .from('queue_entries')
          .select('*', { count: 'exact', head: true })
          .eq('shop_id', shopData.id);

        if (!queueError && count !== null) {
          setWaitingCount(count);
        }
      } catch (err) {
        setErrorMsg('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setFetchingShop(false);
      }
    }

    fetchShopData();
  }, [slug]);

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) {
      setErrorMsg('بيانات المحل غير مكتملة، لا يمكن الحجز الآن');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccess(false);

    try {
      // حساب الترتيب القادم بشكل تلقائي بناءً على الموجودين في الانتظار
      const nextPosition = waitingCount + 1;

      // إرسال الـ UUID الصحيح مع رقم الـ position لتفادي خطأ الـ not-null
      const { error } = await supabase
        .from('queue_entries')
        .insert({
          shop_id: shopId,
          customer_name: customerName,
          position: nextPosition
        });

      if (error) throw error;

      setSuccess(true);
      setCustomerName('');
      // تحديث عدد المنتظرين تلقائياً بعد الحجز الناجح
      setWaitingCount(prev => prev + 1);
    } catch (error: any) {
      setErrorMsg(error.message || 'حدث خطأ أثناء الانضمام للطابور');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingShop) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-amber-500 font-mono">
        جاري تحميل بيانات الصالون...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-amber-500 font-mono">
          {shopName || 'Tomezy'}
        </h1>

        <div className="grid grid-cols-2 gap-4 border border-zinc-800 p-4 rounded-xl bg-black/50 text-center">
          <div>
            <p className="text-xs text-zinc-400">ينتظرون</p>
            <p className="text-2xl font-bold text-white">{waitingCount}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400">الوقت المتوقع</p>
            <p className="text-2xl font-bold text-amber-500">~ {waitingCount * 15} د</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-950/50 border border-red-500 text-red-400 p-3 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/50 border border-emerald-500 text-emerald-400 p-3 rounded-lg text-sm text-center">
            تم حجز دورك بنجاح في الطابور!
          </div>
        )}

        <form onSubmit={handleJoinQueue} className="space-y-4">
          <div>
            <label className="block text-zinc-300 text-xs mb-1">اسمك الحقيقي (أو لقبك)</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="مثال: Mohammed"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 text-black font-medium p-3 rounded-lg text-sm transition-colors mt-2"
          >
            {loading ? 'جاري الحجز...' : 'احجز دوري'}
          </button>
        </form>
      </div>
    </div>
  );
}
