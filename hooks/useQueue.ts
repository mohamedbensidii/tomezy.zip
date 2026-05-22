"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useQueue(shopId: string) {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!shopId) return;

    // جلب البيانات الحية من الجدول الصحيح وبتنسيق الترتيب الصحيح
    const fetchQueue = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('shop_id', shopId)
        .order('position', { ascending: true }); // استخدام position بدلاً من queue_number

      if (data) setQueue(data);
      setLoading(false);
    };

    fetchQueue();

    // الاشتراك في البث المباشر الفوري للجدول الصحيح
    const channel = supabase
      .channel(`queue-${shopId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `shop_id=eq.${shopId}`
        },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId]);

  // تصفية المنتظرين لتشمل الحالات الفارغة والجديدة تلقائياً لتظهر فوراً
  const waitingEntries = queue.filter(q => q.status === 'waiting' || !q.status || q.status === '');
  const servingEntry = queue.find(q => q.status === 'serving');

  return { queue, waitingEntries, servingEntry, loading };
}
