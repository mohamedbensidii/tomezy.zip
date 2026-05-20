import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        
        {/* Barber CTA Section */}
        <section className="py-24 relative overflow-hidden bg-bg-surface border-t border-bg-border">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-primary/50 to-transparent" />
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-[800px] h-[300px] bg-gold-primary/20 blur-[120px] rounded-full" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">أنت حلاق؟ انضم الآن مجاناً</h2>
            <p className="text-xl text-text-muted mb-10 max-w-2xl mx-auto">
              قم بإدارة الطابور الخاص بك بسهولة وارفع من مستوى خدمة زبائنك ليتجنبوا الانتظار المزعج.
            </p>
            <Link href="/register">
              <Button size="lg" className="px-12 text-lg h-14 rounded-full">
                إنشاء حساب حلاق
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-text-faint bg-bg-primary border-t border-bg-border/30">
        <div className="container mx-auto">
          <p className="text-sm font-medium">Tomezy. © {new Date().getFullYear()} جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
