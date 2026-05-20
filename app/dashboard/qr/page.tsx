"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function QRPage() {
    const [shopSlug, setShopSlug] = useState<string | null>(null);
    const [shopName, setShopName] = useState<string>("");
    const supabase = createClient();

    useEffect(() => {
        const fetchShop = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            
            const { data: shop } = await supabase
                .from('shops')
                .select('slug, name')
                .eq('owner_id', session.user.id)
                .single();
                
            if (shop) {
                setShopSlug(shop.slug);
                setShopName(shop.name);
            }
        };
        fetchShop();
    }, [supabase]);

    if (!shopSlug) return <div className="p-8 text-center animate-pulse">جاري التحميل...</div>;

    const qrUrl = `${window.location.origin}/shop/${shopSlug}`;

    return (
        <div className="max-w-2xl mx-auto flex flex-col items-center py-12">
            <h1 className="text-3xl font-bold text-white mb-8">رمز QR الخاص بالمحل</h1>
            
            <Card className="p-8 pb-12 bg-white text-black max-w-md w-full text-center mb-8 shadow-[0_0_50px_rgba(212,168,67,0.15)] relative overflow-hidden" id="qr-poster">
               {/* Pattern overlay */}
               <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
               
               <div className="relative z-10">
                  <div className="text-gold-primary font-bold text-xl mb-6">Tomezy</div>
                  <h2 className="text-3xl font-black mb-8 text-gray-900">{shopName}</h2>
                  
                  <div className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 inline-block mb-10">
                      <QRCodeSVG 
                          value={qrUrl} 
                          size={240} 
                          level="H"
                          bgColor="#ffffff"
                          fgColor="#000000"
                          imageSettings={{
                              src: "/icons/icon-192x192.png",
                              x: undefined,
                              y: undefined,
                              height: 48,
                              width: 48,
                              excavate: true,
                          }}
                      />
                  </div>
                  
                  <div className="space-y-2">
                      <p className="text-xl font-bold text-gray-800">لا تنتظر طويلاً!</p>
                      <p className="text-gray-500">امسح الكود لمعرفة وقت دورك</p>
                  </div>
               </div>
            </Card>

            <div className="flex gap-4 w-full max-w-md">
                <Button 
                    className="flex-1 text-lg h-14" 
                    onClick={() => {
                        window.print();
                    }}
                >
                    طباعة مباشرة
                </Button>
            </div>
            
            <p className="text-text-muted mt-8 text-sm max-w-md text-center">
                قم بطباعة هذه الصفحة ووضعها في مكان بارز داخل محلك ليتمكن الزبائن من مسحها بسهولة.
            </p>
        </div>
    );
}
