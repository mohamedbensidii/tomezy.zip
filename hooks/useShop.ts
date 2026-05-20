"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shop } from "@/types";

export function useShop(identifier: string, isSlug = true) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!identifier) return;

    const fetchShop = async () => {
      setLoading(true);
      const column = isSlug ? 'slug' : 'id';
      
      const { data, error: err } = await supabase
        .from('shops')
        .select('*')
        .eq(column, identifier)
        .single();

      if (err) {
        console.error("Error fetching shop:", err);
        setError("لم يتم العثور على المحل");
      } else {
        setShop(data);
      }
      setLoading(false);
    };

    fetchShop();

    // Subscribe to shop status changes
    if (shop?.id) {
       const channel = supabase
        .channel(`shop-${shop.id}`)
        .on(
            'postgres_changes',
            {
            event: 'UPDATE',
            schema: 'public',
            table: 'shops',
            filter: `id=eq.${shop.id}`
            },
            (payload) => {
               setShop(payload.new as Shop);
            }
        )
        .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
  }, [identifier, isSlug, shop?.id]);

  return { shop, loading, error };
}
