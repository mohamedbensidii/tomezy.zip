"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, LogOut, Settings, Home, X, Save, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    
    const [shopName, setShopName] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // جلب البيانات الحالية عند فتح نافذة الإعدادات
    useEffect(() => {
        if (isSettingsOpen) {
            const fetchShopDetails = async () => {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // جلب اسم المحل من جدول الصالونات بشكل مرن
                const { data: shopData } = await supabase
                    .from("shops")
                    .select("name")
                    .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
                    .maybeSingle();

                if (shopData?.name) {
                    setShopName(shopData.name);
                }
                
                // جلب اسم صاحب الحساب من بيانات المستخدم الاختيارية
                if (user.user_metadata?.full_name) {
                    setOwnerName(user.user_metadata.full_name);
                } else if (user.email) {
                    setOwnerName(user.email.split('@')[0]);
                }
            };
            fetchShopDetails();
        }
    }, [isSettingsOpen]);

    // دالة حفظ التعديلات في قاعدة البيانات
    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. تحديث اسم المحل في جدول الصالونات
            await supabase
                .from("shops")
                .update({ name: shopName })
                .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`);

            // 2. تحديث الاسم الشخصي في بيانات Supabase Auth Metadata
            await supabase.auth.updateUser({
                data: { full_name: ownerName }
            });

            alert("تم حفظ الإعدادات بنجاح! 🎉");
            setIsSettingsOpen(false);
            window.location.reload(); // تحديث الصفحة لتطبيق الاسم الجديد في كل مكان
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("حدث خطأ غير متوقع أثناء الحفظ.");
        } finally {
            setIsSaving(false);
        }
    };

    // دالة تسجيل الخروج النهائية
    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col md:flex-row relative">
            
            {/* Mobile Header */}
            <header className="md:hidden glass-card sticky top-0 z-50 px-4 py-3 border-b-0 rounded-none flex items-center justify-between">
                <div className="font-bold text-gold-primary text-xl tracking-tight">Tomezy</div>
                <MobileNav onOpenSettings={() => setIsSettingsOpen(true)} />
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 glass-card rounded-none border-t-0 border-b-0 border-l-0 border-r border-bg-border p-6 fixed h-full shrink-0">
                <div className="font-bold text-gold-primary text-2xl mb-10 tracking-tight">Tomezy</div>
                <DesktopNav onOpenSettings={() => setIsSettingsOpen(true)} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:mr-64 p-4 lg:p-8">
                {children}
            </main>

            {/* 🛠️ نافذة الإعدادات الاحترافية المنبثقة (Settings Modal) */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" dir="rtl">
                    <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-bg-border bg-zinc-950 space-y-6 shadow-2xl relative">
                        
                        {/* رأس النافذة */}
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                            <div className="flex items-center gap-2 text-gold-primary font-bold text-lg">
                                <Settings className="w-5 h-5 animate-spin-slow" />
                                <h3>إعدادات الحساب والمحل</h3>
                            </div>
                            <button 
                                onClick={() => setIsSettingsOpen(false)} 
                                className="text-text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* الحقول المدخلة */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400">اسم صالون التجميل / المحل</label>
                                <input 
                                    type="text" 
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    placeholder="مثال: صالون التميز الفخم"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-primary transition-colors font-sans"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-400">الاسم الشخصي (المدير)</label>
                                <input 
                                    type="text" 
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    placeholder="مثال: محمد بن سيدي"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold-primary transition-colors font-sans"
                                />
                            </div>
                        </div>

                        {/* أزرار التحكم السفلى */}
                        <div className="pt-2 space-y-3">
                            <button 
                                onClick={handleSaveSettings}
                                disabled={isSaving}
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold h-11 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? "جاري حفظ التغييرات..." : "حفظ الإعدادات الجديدة"}
                            </button>

                            <div className="border-t border-zinc-900 my-2 pt-2" />

                            <button 
                                onClick={() => setIsLogoutConfirmOpen(true)}
                                className="w-full bg-red-950/30 hover:bg-red-950/60 text-error border border-red-900/30 font-medium h-11 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                تسجيل الخروج من الحساب
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ⚠️ نافذة تأكيد تسجيل الخروج (Logout Confirmation Dialog) */}
            {isLogoutConfirmOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4" dir="rtl">
                    <div className="glass-card max-w-xs w-full p-5 rounded-xl border border-red-900/40 bg-zinc-950 text-center space-y-4 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-500/30 flex items-center justify-center mx-auto text-error">
                            <AlertTriangle className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-white font-bold text-sm">هل أنت متأكد حقاً؟</h4>
                            <p className="text-xs text-text-muted">سيتم إنهاء جلستك الحالية وتحتاج لتسجيل الدخول مرة أخرى للوصول للطابور.</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button 
                                onClick={handleSignOut}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                            >
                                نعم، خروج
                            </button>
                            <button 
                                onClick={() => setIsLogoutConfirmOpen(false)}
                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2 rounded-lg text-xs transition-colors"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

function MobileNav({ onOpenSettings }: { onOpenSettings: () => void }) {
    return (
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-text-muted hover:text-white p-2">
                <Home className="w-5 h-5" />
            </Link>
            <Link href="/dashboard/qr" className="text-text-muted hover:text-white p-2">
                <QrCode className="w-5 h-5" />
            </Link>
            {/* تم استبدال الخروج المباشر بفتح الإعدادات الاحترافية */}
            <button onClick={onOpenSettings} className="text-gold-primary hover:text-amber-400 p-2 transition-colors">
                <Settings className="w-5 h-5" />
            </button>
        </div>
    )
}

function DesktopNav({ onOpenSettings }: { onOpenSettings: () => void }) {
    return (
        <div className="flex flex-col h-full justify-between">
            <nav className="space-y-2">
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors">
                    <Home className="w-5 h-5" /> الرئيسة
                </Link>
                <Link href="/dashboard/qr" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors">
                    <QrCode className="w-5 h-5" /> رمز QR الخاص بالمحل
                </Link>
                {/* إضافة زر الإعدادات أيضاً في القائمة الرئيسية للحواسب لتكامل احترافي */}
                <button onClick={onOpenSettings} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors text-right">
                    <Settings className="w-5 h-5" /> إعدادات الصالون
                </button>
            </nav>
            
            <div>
               {/* زر تسجيل الخروج السفلي يفتح الآن نافذة الإعدادات والتأكيد الفاخرة */}
               <button onClick={onOpenSettings} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors mt-auto">
                    <LogOut className="w-5 h-5" /> تسجيل الخروج...
                </button>
            </div>
        </div>
    )
}
