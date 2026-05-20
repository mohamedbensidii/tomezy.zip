"use client";

import { useEffect, useState } from "react";
import { useShop } from "@/hooks/useShop";
import { useQueue } from "@/hooks/useQueue";
import { ShopHeader } from "@/components/queue/ShopHeader";
import { JoinForm } from "@/components/queue/JoinForm";
import { QueueCard } from "@/components/queue/QueueCard";
import Confetti from "react-confetti";

export default function ShopClient({ slug }: { slug: string }) {
  const { shop, loading: shopLoading, error } = useShop(slug, true);
  const { waitingEntries, loading: queueLoading } = useQueue(shop?.id || "");
  const [myEntryId, setMyEntryId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Check if user is already in queue from local storage
    if (shop?.id) {
       const savedId = localStorage.getItem(`tomezy_queue_${shop.id}`);
       if (savedId) setMyEntryId(savedId);
    }
  }, [shop?.id]);

  if (shopLoading) {
      return <div className="min-h-screen flex items-center justify-center text-text-muted">جاري تحميل بيانات المحل...</div>;
  }

  if (error || !shop) {
    return <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl text-error font-bold mb-2">عذراً!</h1>
        <p className="text-text-muted">{error || "لم يتم العثور على الصفحة المطلوبة."}</p>
    </div>;
  }

  const isClosed = shop.status === 'closed';

  return (
    <div className="min-h-screen bg-bg-primary p-4 sm:p-6 md:p-8 max-w-lg mx-auto pb-24">
       {showConfetti && <Confetti recycle={false} numberOfPieces={500} colors={['#d4a843', '#f0c060', '#ffffff', '#22c55e']} />}
       
       <ShopHeader shop={shop} waitingCount={waitingEntries.length} />

       {!myEntryId ? (
          <>
            {isClosed ? (
                <div className="glass-card p-6 text-center text-error border-error/20">
                    <h2 className="text-xl font-bold mb-2">المحل مغلق حالياً</h2>
                    <p className="text-sm">لا يمكن الحجز في الوقت الحالي. يرجى العودة لاحقاً.</p>
                </div>
            ) : (
                <JoinForm shopId={shop.id} onJoined={(entry) => setMyEntryId(entry.id)} />
            )}
          </>
       ) : (
          <QueueCard 
            entryId={myEntryId} 
            shopId={shop.id} 
            avgServiceMinutes={shop.avg_service_minutes} 
          />
       )}
    </div>
  );
}
