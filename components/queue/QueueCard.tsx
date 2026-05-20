"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export function QueueCard({ entryId, shopId, avgServiceMinutes }: { entryId: string, shopId: string, avgServiceMinutes: number }) {
  const [entry, setEntry] = useState<any>(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [isTurn, setIsTurn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchEntryAndStats = async () => {
      // 1. Fetch my entry
      const { data: myEntry } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('id', entryId)
        .single();
        
      if (myEntry) {
         setEntry(myEntry);
         setIsTurn(myEntry.status === 'serving');
         
         // 2. If waiting, find how many people are ahead of me 
         if (myEntry.status === 'waiting') {
             const { count } = await supabase
                .from('queue_entries')
                .select('*', { count: 'exact', head: true })
                .eq('shop_id', shopId)
                .in('status', ['waiting', 'serving'])
                .lt('queue_number', myEntry.queue_number);
                
             setPeopleAhead(count || 0);
         }
      } else {
         // Entry deleted or completed? Remove localstorage
         localStorage.removeItem(`tomezy_queue_${shopId}`);
      }
    };

    fetchEntryAndStats();

    // Subscribe to changes on my entry AND all queue size changes for this shop
    const channel = supabase
      .channel(`queue-card-${entryId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_entries', filter: `shop_id=eq.${shopId}` }, () => {
         fetchEntryAndStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entryId, shopId]);

  const handleLeave = async () => {
      if (confirm("هل أنت متأكد أنك تريد مغادرة الطابور؟ ستفقد دورك.")) {
          await supabase.from('queue_entries').update({ status: 'left' }).eq('id', entryId);
          localStorage.removeItem(`tomezy_queue_${shopId}`);
          window.location.reload();
      }
  };

  if (!entry) return <div className="glass-card p-8 text-center animate-pulse">جاري التحميل...</div>;

  if (entry.status === 'serving') {
      return (
          <div className="bg-success/20 border border-success rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(34,197,94,0.2)] animate-pulse">
              <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                 ✂️
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">دورك الآن!</h2>
              <p className="text-success text-lg">تفضل، الحلاق بانتظارك.</p>
              
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-8 border-success text-success hover:bg-success hover:text-white">
                  إنهاء والتحديث
              </Button>
          </div>
      )
  }

  if (entry.status !== 'waiting') {
      return (
          <div className="glass-card p-8 text-center">
              <p className="text-text-muted mb-4">انتهى دورك أو غادرت الطابور.</p>
              <Button onClick={() => { localStorage.removeItem(`tomezy_queue_${shopId}`); window.location.reload(); }}>
                  حجز دور جديد
              </Button>
          </div>
      )
  }

  const estWait = peopleAhead * (avgServiceMinutes || 15);
  // Simple fake progress based on arbitrary 10 people max for visual effect
  const progressPercent = Math.max(10, 100 - (peopleAhead * 10));

  return (
    <div className="glass-card-gold rounded-2xl p-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="text-center relative z-10">
            <h3 className="text-text-muted text-sm font-medium mb-4">رقمك في الطابور</h3>
            <div className="text-7xl font-bold text-white mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {entry.queue_number}
            </div>
            
            <div className="bg-black/30 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-text-muted">أمامك: <strong className="text-white text-lg">{peopleAhead}</strong> شخص</span>
                    <span className="text-text-muted">الوقت لتقريبي: <strong className="text-gold-primary text-lg">~{estWait} د</strong></span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-3 bg-bg-elevated rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-gold-primary to-gold-light transition-all duration-1000 ease-in-out" 
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
            
            <div className="text-sm text-text-muted mb-8">
                أهلاً <strong>{entry.customer_name}</strong>، سنبقيك على اطلاع بتقدمك.
            </div>
            
            <div className="flex gap-3">
                <Button 
                    variant="outline" 
                    className="flex-1 border-error/50 text-error hover:bg-error hover:text-white"
                    onClick={handleLeave}
                >
                    مغادرة
                </Button>
                <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.location.reload()}
                >
                    تحديث
                </Button>
            </div>
        </div>
    </div>
  );
}
