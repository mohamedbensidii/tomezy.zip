"use client";

import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function QueueList({ 
    entries, 
    onCallNext 
}: { 
    entries: any[]; 
    onCallNext?: (id: string) => void;
}) {
  const supabase = createClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 1️⃣ فرز وتصنيف الزبائن بناءً على الحالة (Status) القادمة من قاعدة البيانات
  const servingEntry = entries.find(entry => entry.status === 'serving');
  const waitingEntries = entries.filter(entry => entry.status === 'waiting' || entry.status === '' || !entry.status);
  
  // تحديد الزبون التالي وباقي الصف
  const nextEntry = waitingEntries[0];
  const otherEntries = waitingEntries.slice(1);

  // شرط الحماية: هل يوجد زبون يتم خدمته حالياً؟
  const isClientServing = !!servingEntry;

  // دالة نداء الواتساب التلقائية
  const openWhatsAppCall = (phone: string, name: string, isNext: boolean) => {
    if (!phone) {
      alert("هذا الزبون لم يقم بإدخال رقم هاتف!");
      return;
    }
    
    const message = isNext 
      ? `مرحباً ${name}، معك صالون التجميل. لقد جاء دورك الآن! المرجو الدخول للمحل فوراً لبدء الخدمة.`
      : `مرحباً ${name}، معك صالون التجميل. تذكير: أنت الزبون التالي في الانتظار، المرجو الاقتراب من المحل لكي لا تفقد دورك.`;
    
    const cleanPhone = phone.replace("+", "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // دالة (ابدأ الخدمة): تنقل الزبون للأعلى وتغير حالته إلى serving
  const handleStartService = async (id: string) => {
    if (isClientServing) return; // حماية إضافية تمنع التشغيل إذا كان هناك زبون بالأعلى
    
    setLoadingId(id);
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ status: 'serving' })
        .eq('id', id);
        
      if (error) throw error;
      if (onCallNext) onCallNext(id);
    } catch (err) {
      console.error("خطأ أثناء بدء الخدمة:", err);
    } finally {
      setLoadingId(null);
    }
  };

  // دالة (انتهت الخدمة): تحذف الزبون من الأعلى وتغير حالته إلى completed
  const handleCompleteService = async (id: string) => {
    setLoadingId(id);
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ status: 'completed' })
        .eq('id', id);
        
      if (error) throw error;
    } catch (err) {
      console.error("خطأ أثناء إنهاء الخدمة:", err);
    } finally {
      setLoadingId(null);
    }
  };

  // دالة (إلى آخر الصف): تعديل الترتيب بالاعتماد على الـ position
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

  // دالة (إلغاء الدور)
  const handleCancelEntry = async (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في إلغاء دور هذا الزبون وحذفه؟')) {
      await supabase
        .from('queue_entries')
        .update({ status: 'cancelled' })
        .eq('id', id);
    }
  };

  // دالة عرض الوقت بأمان
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'hh:mm a');
    } catch (e) {
      return "00:00";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ─── القسم الأول: الخانة العلوية الكبيرة (الزبون الحالي) ─── */}
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center flex flex-col items-center justify-center min-h-[140px] transition-all">
        {servingEntry ? (
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <p className="text-xs text-amber-500 font-mono tracking-wider uppercase">يخدم حالياً في الصالون</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{servingEntry.customer_name}</h2>
              {servingEntry.phone && <p className="text-xs text-zinc-400 mt-1">{servingEntry.phone}</p>}
            </div>
            <Button
              disabled={loadingId === servingEntry.id}
              onClick={() => handleCompleteService(servingEntry.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-2 rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] mt-2"
            >
              {loadingId === servingEntry.id ? "جاري التحديث..." : "انتهت الخدمة ✓"}
            </Button>
          </div>
        ) : (
          <div className="text-zinc-400 space-y-1">
            <p className="text-base font-medium text-zinc-300">لا يوجد زبون يخدم حالياً</p>
            <p className="text-xs text-zinc-500">قم بالنداء على الزبون التالي من القائمة أدناه وبدء الخدمة معه.</p>
          </div>
        )}
      </div>

      {/* ─── عدادات الإحصائيات التلقائية ─── */}
      <div className="grid grid-cols-2 gap-4 border border-zinc-800 p-4 rounded-xl bg-zinc-900/30 text-center">
        <div>
          <p className="text-xs text-zinc-500">المنتظرون الآن</p>
          <p className="text-xl font-bold text-white mt-0.5">{waitingEntries.length} شخص</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">وقت الخدمة المقدر</p>
          <p className="text-xl font-bold text-amber-500 mt-0.5">~ {waitingEntries.length * 15} دقيقة</p>
        </div>
      </div>

      {/* ─── القسم الثاني: التالي في الصف (الدور الحالي) ─── */}
      {nextEntry ? (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 px-1 uppercase tracking-wider">التالي في الصف (الدور الحالي)</h3>
          <div className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between border-l-4 border-l-amber-500 bg-zinc-900 border border-zinc-800 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg">{nextEntry.customer_name}</span>
                <span className="text-zinc-500 text-xs">({formatTime(nextEntry.joined_at || nextEntry.created_at)})</span>
              </div>
              {nextEntry.phone && <p className="text-xs text-emerald-500 mt-1">{nextEntry.phone}</p>}
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => openWhatsAppCall(nextEntry.phone, nextEntry.customer_name, true)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 text-xs h-10 flex-1 sm:flex-none border border-zinc-700"
              >
                نداء واتساب 💬
              </Button>
              <Button 
                disabled={isClientServing || loadingId === nextEntry.id}
                onClick={() => handleStartService(nextEntry.id)}
                className={`font-bold px-6 text-xs h-10 flex-1 sm:flex-none transition-all ${
                  isClientServing 
                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-40 border border-zinc-800/50 line-through" 
                    : "bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse"
                }`}
              >
                {loadingId === nextEntry.id ? "جاري البدء..." : "ابدأ الخدمة ⏭"}
              </Button>
            </div>
          </div>
          {isClientServing && (
            <p className="text-[11px] text-amber-500/70 bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg text-center font-mono">
              ⚠️ يجب إنهاء خدمة الزبون الحالي في الأعلى أولاً لتتمكن من تفعيل زر البدء لـ {nextEntry.customer_name}.
            </p>
          )}
        </div>
      ) : (
        waitingEntries.length === 0 && (
          <div className="text-center p-8 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800 text-sm">
            لا يوجد أي زبائن في قائمة الانتظار حالياً.
          </div>
        )
      )}

      {/* ─── القسم الثالث: باقي المنتظرين خلفه ─── */}
      {otherEntries.length > 0 && (
        <div className="pt-2">
          <h3 className="text-xs font-bold text-zinc-400 mb-3 px-1 uppercase tracking-wider">باقي المنتظرين خلفه ({otherEntries.length})</h3>
          <div className="space-y-3">
            {otherEntries.map((entry) => (
              <div key={entry.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 gap-4">
                <div>
                  <p className="font-medium text-white text-base">{entry.customer_name}</p>
                  <p className="text-xs text-zinc-500 mt-1">انضم في: {formatTime(entry.joined_at || entry.created_at)}</p>
                  {entry.phone && <p className="text-xs text-zinc-400 mt-0.5">{entry.phone}</p>}
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                  <Button 
                    size="sm"
                    className="bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 border border-zinc-800 text-xs px-3 h-8"
                    onClick={() => openWhatsAppCall(entry.phone, entry.customer_name, false)}
                  >
                    تنبيه (واتساب)
                  </Button>
                  
                  <Button 
                    size="sm"
                    className="bg-zinc-800/40 hover:bg-zinc-700 text-zinc-400 text-xs px-3 h-8 border border-zinc-800/40"
                    onClick={() => handleMoveToBack(entry.id)}
                  >
                    إلى آخر الصف 🔽
                  </Button>

                  <Button 
                    size="sm" 
                    className="bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-950/40 text-xs px-3 h-8"
                    onClick={() => handleCancelEntry(entry.id)}
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
