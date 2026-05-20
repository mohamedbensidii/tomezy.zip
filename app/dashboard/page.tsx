"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useShop } from "@/hooks/useShop";
import { useQueue } from "@/hooks/useQueue";
import { StatusControls } from "@/components/dashboard/StatusControls";
import { CurrentCustomer } from "@/components/dashboard/CurrentCustomer";
import { QueueList } from "@/components/dashboard/QueueList";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [shopId, setShopId] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUserId(session.user.id);
            
            // Get user's shop
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

    const { shop, loading: shopLoading } = useShop(shopId || "", false);
    const { waitingEntries, servingEntry, loading: queueLoading } = useQueue(shopId || "");

    const handleCallNext = async (entryId: string) => {
        // If there's currently someone serving, mark them done first?
        // Or simpler, just set the next guy to serving.
        // We'll trust the user to finish the first one via the UI.
        await supabase.from('queue_entries').update({ status: 'serving', served_at: new Date().toISOString() }).eq('id', entryId);
        
        // Push notification logic could happen here via a backend route, but for MVP we skip actual push API setup 
        // to simplify, as it requires VAPID keys and SW configuration that's complex for this environment.
    };

    const handleFinishCurrent = async (entryId: string, action: 'done' | 'skipped') => {
        await supabase.from('queue_entries').update({ status: action }).eq('id', entryId);
    };

    if (!shopId && !shopLoading) {
        return <div className="p-8 text-center text-text-muted">لم يتم العثور على محل خاص بك. يرجى الاتصال بالدعم.</div>
    }

    if (shopLoading || queueLoading || !shop) {
        return <div className="p-8 text-center animate-pulse text-gold-primary">جاري تحميل البيانات...</div>
    }

    return (
        <div className="max-w-4xl mx-auto pb-24 md:pb-8">
            <header className="mb-8 hidden md:block">
                <h1 className="text-3xl font-bold text-white mb-2">{shop.name}</h1>
                <p className="text-text-muted">نظام إدارة الطابور</p>
            </header>

            <StatusControls shop={shop} />

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <CurrentCustomer entry={servingEntry} onFinish={handleFinishCurrent} />
                    
                    {/* Quick Stats */}
                    <div className="glass-card p-4 rounded-xl space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-muted">المنتظرون</span>
                            <span className="font-bold text-white">{waitingEntries.length} شخص</span>
                        </div>
                        <div className="w-full h-px bg-bg-border" />
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-text-muted">وقت الخدمة المقدر</span>
                            <span className="font-bold text-white">{shop.avg_service_minutes} دقائق/زبون</span>
                        </div>
                    </div>
                </div>
                
                <div className="lg:col-span-2">
                    <QueueList entries={waitingEntries} onCallNext={handleCallNext} />
                </div>
            </div>
        </div>
    )
}
