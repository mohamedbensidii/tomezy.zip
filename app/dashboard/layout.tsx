"use client";

import Link from "next/link";
import { QrCode, LogOut, Settings, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bg-primary flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden glass-card sticky top-0 z-50 px-4 py-3 border-b-0 rounded-none flex items-center justify-between">
                <div className="font-bold text-gold-primary text-xl tracking-tight">Tomezy</div>
                <MobileNav />
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 glass-card rounded-none border-t-0 border-b-0 border-l-0 border-r border-bg-border p-6 fixed h-full shrink-0">
                <div className="font-bold text-gold-primary text-2xl mb-10 tracking-tight">Tomezy</div>
                <DesktopNav />
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:mr-64 p-4 lg:p-8">
                {children}
            </main>
        </div>
    )
}

function MobileNav() {
    return (
        <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-text-muted hover:text-white p-2">
                <Home className="w-5 h-5" />
            </Link>
            <Link href="/dashboard/qr" className="text-text-muted hover:text-white p-2">
                <QrCode className="w-5 h-5" />
            </Link>
            <button onClick={async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/login'; }} className="text-error p-2">
                <LogOut className="w-5 h-5" />
            </button>
        </div>
    )
}

function DesktopNav() {
    return (
        <div className="flex flex-col h-full justify-between">
            <nav className="space-y-2">
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors">
                    <Home className="w-5 h-5" /> الرئيسة
                </Link>
                <Link href="/dashboard/qr" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-text-muted hover:text-white transition-colors">
                    <QrCode className="w-5 h-5" /> رمز QR الخاص بالمحل
                </Link>
            </nav>
            
            <div>
               <button onClick={async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/login'; }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-colors mt-auto">
                    <LogOut className="w-5 h-5" /> تسجيل الخروج
                </button>
            </div>
        </div>
    )
}
