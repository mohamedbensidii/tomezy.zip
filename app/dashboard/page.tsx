"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
// ✨ تم التعديل للمسار الصحيح والدقيق الذي كشفه كلود
import { QueueList } from "@/components/dashboard/QueueList";

export default function DashboardPage() {
  const supabase = createClient();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopStatus, setShopStatus] = useState("open"); 

  const fetchQueueEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("queue_entries")
        .select("*")
        .in("status", ["waiting", "serving", "", null])
        .order("created_at", { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching queue entries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueEntries();

    const channel = supabase
      .channel("queue_realtime_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_entries" },
        () => {
          fetchQueueEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = (status: string) => {
    setShopStatus(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-sm font-mono">
        جاري تحميل لوحة التحكم الفورية...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-2xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-amber-500 font-mono tracking-wider">Tomezy Dashboard</h1>
        <span className="text-xs text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">لوحة التحكم السحابية</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          onClick={() => handleStatusChange("open")}
          className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            shopStatus === "open"
              ? "bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          مفتوح
        </button>
        
        <button
          onClick={() => handleStatusChange("busy")}
          className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            shopStatus === "busy"
              ? "bg-amber-950/40 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
              : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          مشغول
        </button>
        
        <button
          onClick={() => handleStatusChange("break")}
          className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            shopStatus === "break"
              ? "bg-blue-950/40 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
              : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          استراحة
        </button>
        
        <button
          onClick={() => handleStatusChange("closed")}
          className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            shopStatus === "closed"
              ? "bg-red-950/40 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
              : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500" />
          مغلق
        </button>
      </div>

      <QueueList entries={entries} onCallNext={fetchQueueEntries} />
      
    </div>
  );
}
