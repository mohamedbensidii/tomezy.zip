"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useQueue(shopId: string) {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!shopId) return;

    // Initial fetch
    const fetchQueue = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('shop_id', shopId)
        .in('status', ['waiting', 'serving'])
        .order('queue_number', { ascending: true });

      if (data) setQueue(data);
      setLoading(false);
    };

    fetchQueue();

    // Setup realtime subscription
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
        (payload) => {
          // Re-fetch everything to ensure ordering is correct is easiest approach for MVP
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId]);

  const waitingEntries = queue.filter(q => q.status === 'waiting');
  const servingEntry = queue.find(q => q.status === 'serving');

  return { queue, waitingEntries, servingEntry, loading };
}
