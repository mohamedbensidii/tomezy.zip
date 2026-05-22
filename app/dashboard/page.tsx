"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { QueueList } from "@/components/dashboard/QueueList";

export default function DashboardPage() {
  const supabase = createClient();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopStatus, setShopStatus] = useState("open"); 
  
  // حالات التحكم في النوافذ المنبثقة (Modals)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  // حالات الإعدادات والبيانات
  const [shopId, setShopId] = useState<string>("");
  const [shopName, setShopName] = useState("صالون التميز");
  const [ownerName, setOwnerName] = useState("صاحب الصالون");
  const [accentColor, setAccentColor] = useState("amber"); // amber, emerald, blue, violet
  const [isSaving, setIsSaving] = useState(false);

  const fetchQueueEntries = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }

      // جلب اسم المستخدم الافتراضي إذا وجد
      if (user.user_metadata?.full_name) {
        setOwnerName(user.user_metadata.full_name);
      }

      let currentShopId = user.id;

      // جلب بيانات الصالون من قاعدة البيانات لتعبئة الإعدادات تلقائياً
      const { data: shopData } = await supabase
        .from("shops")
        .select("id, name")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (shopData) {
        currentShopId = shopData.id;
        setShopId(shopData.id);
        if (shopData.name) setShopName(shopData.name);
      } else {
        setShopId(user.id);
      }

      // جلب طابور الانتظار للصالون الحالي فقط
      const { data, error } = await supabase
        .from("queue_entries")
        .select("*")
        .eq("shop_id", currentShopId)
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

  // دالة حفظ الإعدادات في Supabase
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // تحديث اسم الصالون في جدول shops
      await supabase
        .from("shops")
        .update({ name: shopName })
        .eq("user_id", user.id);

      // تحديث اسم المستخدم في ميتاداتا الحساب
      await supabase.auth.updateUser({
        data: { full_name: ownerName }
      });

      setIsSettingsOpen(false);
      alert("تم حفظ الإعدادات بنجاح! ✨");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("حدث خطأ أثناء الحفظ، يرجى المحاولة مجدداً.");
    } finally {
      setIsSaving(false);
    }
  };

  // دالة تسجيل الخروج النهائية
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login"; // التوجيه لصفحة تسجيل الدخول
  };

  const handleStatusChange = (status: string) => {
    setShopStatus(status);
  };

  // مصفوفة الألوان الديناميكية للتحكم بالثيم المخصص
  const colorMap: Record<string, string> = {
    amber: "text-amber-500 border-amber-500 bg-amber-950/20",
    emerald: "text-emerald-500 border-emerald-500 bg-emerald-950/20",
    blue: "text-blue-500 border-blue-500 bg-blue-950/20",
    violet: "text-violet-500 border-violet-500 bg-violet-950/20",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-sm font-mono tracking-widest">
        جاري تحميل لوحة التحكم الفورية...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-2xl mx-auto space-y-6 relative select-none">
      
      {/* الشريط العلوي الاحترافي المطور */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          {/* زر الإعدادات الجديد بدلاً من زر الخروج المباشر */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all active:scale-95"
            title="الإعدادات وحسابي"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          
          <div className="w-px h-5 bg-zinc-800" />
          
          <button className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h.01"/><path d="M12 7h.01"/><path d="M17 7h.01"/><path d="M7 12h.01"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 17h.01"/><path d="M12 17h.01"/><path d="M17 17h.01"/></svg>
          </button>
        </div>
        
        <div className="text-right">
          <h1 className={`text-xl font-black font-mono tracking-wider transition-colors duration-500 ${colorMap[accentColor].split(" ")[0]}`}>
            {shopName}
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono">مرحبًا، {ownerName}</p>
        </div>
      </div>

      {/* أزرار الحالات الأربعة للصالون */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          onClick={() => handleStatusChange("open")}
          className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            shopStatus === "open"
              ? "bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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

      {/* قائمة طابور الانتظار الفورية */}
      <QueueList entries={entries} onCallNext={fetchQueueEntries} />

      {/* 1. نافذة الإعدادات المنبثقة الشاملة (Settings Modal) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* رأس النافذة */}
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/30">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <h2 className="text-sm font-bold text-zinc-200 font-mono">إعدادات الحساب والمحل</h2>
            </div>

            {/* محتوى الإعدادات */}
            <form onSubmit={handleSaveSettings} className="p-6 space-y-5 text-right" dir="rtl">
              
              {/* حقل اسم المحل */}
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">اسم الصالون / المحل</label>
                <input 
                  type="text" 
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 text-white transition-all font-mono"
                  placeholder="أدخل اسم المحل الجديد"
                />
              </div>

              {/* حقل اسم صاحب الحساب */}
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-medium">اسم صاحب الحساب</label>
                <input 
                  type="text" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 text-white transition-all font-mono"
                  placeholder="أدخل اسمك الكريم"
                />
              </div>

              {/* تخصيص اللون التجميلي للموقع */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-medium block">اللون الرئيسي للوحة التحكم</label>
                <div className="flex gap-3 justify-start items-center pt-1">
                  {(["amber", "emerald", "blue", "violet"] as const).map((color) => {
                    const bgClass = color === "amber" ? "bg-amber-500" : color === "emerald" ? "bg-emerald-500" : color === "blue" ? "bg-blue-500" : "bg-violet-500";
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAccentColor(color)}
                        className={`w-7 h-7 rounded-full ${bgClass} transition-all duration-200 ${accentColor === color ? "ring-4 ring-offset-2 ring-offset-black ring-zinc-500 scale-110" : "opacity-60 hover:opacity-100"}`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-900 space-y-3">
                {/* زر حفظ التعديلات */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-white text-black font-bold text-xs py-3 rounded-xl hover:bg-zinc-200 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {isSaving ? "جاري الحفظ والرفع..." : "حفظ التغييرات الفورية"}
                </button>

                {/* زر تسجيل الخروج الاحترافي */}
                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className="w-full bg-red-950/30 border border-red-900/50 text-red-400 font-bold text-xs py-3 rounded-xl hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  تسجيل خروج من الحساب
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. نافذة تأكيد تسجيل الخروج الفائقة (Logout Confirmation Modal) */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            {/* أيقونة تحذيرية */}
            <div className="mx-auto w-12 h-12 bg-red-950/50 border border-red-800 rounded-full flex items-center justify-center text-red-400 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white font-mono">تأكيد تسجيل الخروج</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                هل أنت متأكد حقاً من رغبتك في تسجيل الخروج؟ ستفقد القدرة على مراقبة الطابور فورياً حتى تسجل دخولك مجدداً.
              </p>
            </div>

            {/* أزرار اتخاذ القرار */}
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                نعم، خروج
              </button>
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                إلغاء وتراجع
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
