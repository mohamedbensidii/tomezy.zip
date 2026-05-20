"use client";

import { Button } from "@/components/ui/Button";
import { Shop } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function StatusControls({ shop }: { shop: Shop }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const updateStatus = async (status: Shop['status']) => {
    if (status === shop.status) return;
    setLoading(true);
    await supabase.from('shops').update({ status }).eq('id', shop.id);
    setLoading(false);
  };

  const statuses = [
    { value: 'open', label: 'مفتوح 🟢', color: 'success' },
    { value: 'busy', label: 'مشغول 🟠', color: 'warning' },
    { value: 'break', label: 'استراحة 🟡', color: 'warning' },
    { value: 'closed', label: 'مغلق 🔴', color: 'error' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
      {statuses.map((s) => (
        <Button
          key={s.value}
          variant={shop.status === s.value ? "default" : "glass"}
          onClick={() => updateStatus(s.value as Shop['status'])}
          disabled={loading}
          className={`h-12 ${shop.status === s.value ? 'ring-2 ring-white/20' : ''}`}
        >
          {s.label}
        </Button>
      ))}
    </div>
  );
}
