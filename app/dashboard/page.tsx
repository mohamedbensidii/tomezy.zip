"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useShop } from "@/hooks/useShop";
import { StatusControls } from "@/components/dashboard/StatusControls";
import { CurrentCustomer } from "@/components/dashboard/CurrentCustomer";
import { QueueList } from "@/components/dashboard/QueueList";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

  // 1. التحقق من المستخدم وجلب الـ shopId
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);

      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', session.user.id)
        .single();

      if (shop) {
        setShopId(shop.id);
      }
    };

    checkUser();
  }, [router, supabase]);

  // 2. دالة جلب بيانات الطابور الحقيقية من جدول queue_entries
  const fetchQueueEntries = async (id: string) => {
    const { data, error } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('shop_id', id);
    
    if (!error && data) {
      setEntries(data);
    }
    setQueueLoading(false);
  };

  // 3. تفعيل الـ Realtime للتحديث التلقائي الفوري بين الهاتفين
  useEffect(() => {
    if (!shopId) return;

    fetchQueueEntries(shopId);

    // الاشتراك في التغييرات الحية لجدول queue_entries
    const channel = supabase
      .channel('realtime-queue')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_entries', filter: `shop_id=eq.${shopId}` },
        () => {
          fetchQueueEntries(shopId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, supabase]);

  const { shop, loading: shopLoading } = useShop(shopId || "", false);

  // تصفية الزبائن المنتظرين والمرتبين حسب الـ position
  const waitingEntries = entries
    .filter(e => e.status === 'waiting' || !e.status)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  // تحديد الزبون الجاري خدمته حالياً
  const servingEntry = entries.find(e => e.status === 'serving');

  // استدعاء الزبون التالي وتحويل حالته إلى جاري الخدمة
  const handleCallNext = async (entryId: string) => {
    await supabase
      .from('queue_entries')
      .update({ status: 'serving' })
      .eq('id', entryId);
    
    if (shopId) fetchQueueEntries(shopId);
  };

  // إنهاء خدمة الزبون الحالي
  const handleFinishCurrent = async (entryId: string, action: 'done' | 'skipped') => {
    const dbStatus = action === 'done' ? 'completed' : 'cancelled';
    
    await supabase
      .from('queue_entries')
      .update({ status: dbStatus })
      .eq('id', entryId);
    
    if (shopId) fetchQueueEntries(shopId);
  };

  if (!shopId && !shopLoading) {
    return <div className="p-8 text-center text-text-muted">لم يتم العثور على محل خاص بك. يرجى الاتصال بالدعم.</div>;
  }

  if (shopLoading || queueLoading || !shop) {
    return <div className="p-8 text-center animate-pulse text-gold-primary">جاري تحميل البيانات الحية...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8">
      <header className="mb-8 hidden md:block">
        <h1 className="text-3xl font-bold text-white mb-2">{shop.name}</h1>
        <p className="text-text-muted">نظام إدارة الطابور المتزامن</p>
      </header>

      <StatusControls shop={shop} />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <CurrentCustomer entry={servingEntry} onFinish={handleFinishCurrent} />

          {/* الإحصائيات السريعة */}
          <div className="glass-card p-4 rounded-xl space-y-4 bg-zinc-900 border border-zinc-800">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">المنتظرون الآن</span>
              <span className="font-bold text-white text-lg">{waitingEntries.length} شخص</span>
            </div>
            <div className="w-full h-px bg-zinc-800" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">وقت الخدمة المقدر</span>
              <span className="font-bold text-amber-500">{shop.avg_service_minutes} دقائق / زبون</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <QueueList entries={waitingEntries} onCallNext={handleCallNext} />
        </div>
      </div>
    </div>
  );
}
