"use client";

import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";

export function QueueList({ 
    entries, 
    onCallNext 
}: { 
    entries: any[]; 
    onCallNext: (id: string) => void;
}) {
  const supabase = createClient();

  if (entries.length === 0) {
    return (
      <div className="text-center p-8 text-zinc-500 glass-card rounded-xl border border-zinc-800">
        لا يوجد أي زبائن في قائمة الانتظار حالياً.
      </div>
    );
  }

  const nextEntry = entries[0];
  const otherEntries = entries.slice(1);

  // دالة ذكية لتوليد رابط نداء الواتساب المجاني بالرسالة المجهزة
  const openWhatsAppCall = (phone: string, name: string, isNext: boolean) => {
    if (!phone) {
      alert("هذا الزبون لم يقم بإدخال رقم هاتف!");
      return;
    }
    
    // تجهيز نص الرسالة التلقائية
    const message = isNext 
      ? `مرحباً ${name}، معك صالون التجميل. لقد جاء دورك الآن! المرجو الدخول للمحل فوراً.`
      : `مرحباً ${name}، معك صالون التجميل. لقد بقي شخص واحد فقط قبلك في الطابور! المرجو الحضور إلى المحل الآن لتجنب إلغاء دورك وتأخيرك.`;
    
    // تنظيف الرقم من علامة + ليعمل الرابط بنجاح
    const cleanPhone = phone.replace("+", "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // فتح المحادثة في علامة تبويب جديدة فوراً
    window.open(url, "_blank");
  };

  // دالة نقل الزبون إلى آخر الصف بالاعتماد على حقل position
  const handleMoveToBack = async (id: string) => {
    try {
      const maxPosition = entries.reduce((max, item) => item.position > max ? item.position : max, 0);
      
      await supabase
        .from('queue_entries')
        .update({ position: maxPosition + 1 })
        .eq('id', id);
    } catch (err) {
      console.error("خطأ في نقل الزبون لآخر الصف:", err);
    }
  };

  // دالة تخطي أو إزالة الزبون
  const handleRemoveEntry = async (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في تخطي وإزالة هذا الزبون من القائمة؟')) {
      await supabase
        .from('queue_entries')
        .update({ status: 'cancelled' })
        .eq('id', id);
    }
  };

  // مساعد لعرض الوقت بأمان لتجنب الأخطاء البرمجية
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'hh:mm a');
    } catch (e) {
      return "00:00";
    }
  };

  return (
    <div className="space-y-4">
        {/* الزبون التالي في الدور */}
        <div className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between border-l-4 border-l-emerald-500 bg-zinc-900 border border-zinc-800 gap-4">
            <div>
                <p className="text-xs text-zinc-400 mb-1">التالي في الصف (الدور الحالي)</p>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">{nextEntry.customer_name}</span>
                    <span className="text-zinc-500 text-xs">
                      ({formatTime(nextEntry.joined_at || nextEntry.created_at)})
                    </span>
                </div>
                {nextEntry.phone && <p className="text-xs text-emerald-500 mt-1">{nextEntry.phone}</p>}
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                    onClick={() => openWhatsAppCall(nextEntry.phone, nextEntry.customer_name, true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 text-sm flex-1 sm:flex-none"
                >
                    نداء واتساب 💬
                </Button>
                <Button 
                    onClick={() => onCallNext(nextEntry.id)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 text-sm flex-1 sm:flex-none animate-pulse"
                >
                    ابدأ الخدمة ⏭
                </Button>
            </div>
        </div>

        {/* باقي المنتظرين في الطابور خلفه */}
        {otherEntries.length > 0 && (
            <div className="mt-8">
                <h3 className="text-sm font-bold text-zinc-400 mb-4 px-2">باقي المنتظرين خلفه ({otherEntries.length})</h3>
                <div className="space-y-3">
                    {otherEntries.map((entry) => (
                        <div key={entry.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 gap-4">
                            <div>
                                <p className="font-medium text-white text-base">{entry.customer_name}</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                  انضم في: {formatTime(entry.joined_at || entry.created_at)}
                                </p>
                                {entry.phone && <p className="text-xs text-zinc-400 mt-0.5">{entry.phone}</p>}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                                <Button 
                                    size="sm"
                                    className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 border border-emerald-500/30 text-xs px-3"
                                    onClick={() => openWhatsAppCall(entry.phone, entry.customer_name, false)}
                                >
                                    تنبيه (واتساب)
                                </Button>
                                
                                <Button 
                                    size="sm"
                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-3"
                                    onClick={() => handleMoveToBack(entry.id)}
                                >
                                    إلى آخر الصف 🔽
                                </Button>

                                <Button 
                                    size="sm" 
                                    className="bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-950 text-xs px-3"
                                    onClick={() => handleRemoveEntry(entry.id)}
                                >
                                    إلغاء الدور ❌
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}
