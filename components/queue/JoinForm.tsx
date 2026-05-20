"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

export function JoinForm({ shopId, onJoined }: { shopId: string, onJoined: (entry: any) => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("الرجاء إدخال اسمك");
      return;
    }
    
    setLoading(true);
    setError("");

    // 1. Get current max queue number
    const { data: maxObj, error: maxErr } = await supabase
      .from('queue_entries')
      .select('queue_number')
      .eq('shop_id', shopId)
      .order('queue_number', { ascending: false })
      .limit(1)
      .single();

    const nextNum = (maxObj?.queue_number || 0) + 1;

    // 2. Insert new entry
    const { data, error: insertErr } = await supabase
      .from('queue_entries')
      .insert({
        shop_id: shopId,
        customer_name: name.trim(),
        queue_number: nextNum,
        status: 'waiting'
      })
      .select()
      .single();

    setLoading(false);

    if (insertErr) {
      console.error(insertErr);
      setError("حدث خطأ أثناء الانضمام للطابور. يرجى المحاولة مرة أخرى.");
    } else if (data) {
       // Save to localstorage so user can reload page and stay in queue
       localStorage.setItem(`tomezy_queue_${shopId}`, data.id);
       onJoined(data);
    }
  };

  return (
    <Card>
       <CardContent className="pt-6">
          <form onSubmit={handleJoin} className="space-y-4">
             <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-muted mb-2">
                   اسمك الحقيقي (أو لقبك)
                </label>
                <input
                   type="text"
                   id="name"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full bg-bg-elevated border border-bg-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold-primary transition-all"
                   placeholder="مثال: أمين"
                   disabled={loading}
                />
             </div>
             
             {error && <p className="text-error text-sm">{error}</p>}
             
             <Button type="submit" className="w-full h-14 text-lg font-bold" disabled={loading}>
                {loading ? "جاري الانضمام..." : "احجز دوري"}
             </Button>
          </form>
       </CardContent>
    </Card>
  );
}
