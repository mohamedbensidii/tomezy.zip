import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Scissors } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <div className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 -z-10 translate-x-1/3 -translate-y-1/2 opacity-30">
        <div className="h-[500px] w-[500px] rounded-full bg-gold-primary blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-right space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border-gold-dim text-sm text-gold-primary">
              <Scissors className="w-4 h-4" />
              <span>نظام الطابور الذكي</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              لا تنتظر داخل <span className="text-gold-primary">الحلاق</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto lg:mx-0">
              امسح الكود، احجز دورك، وعد عندما يحين وقتك. 
              طريقة أسهل لإدارة وقتك وتجنب الانتظار الممل.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-lg">
                  ابدأ مجاناً
                </Button>
              </Link>
              <Link href="/shop/demo" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full text-lg border-gold-dim text-gold-primary hover:bg-gold-dim/20">
                  تجربة مباشرة
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative mx-auto w-full max-w-[320px] lg:max-w-[400px]">
             {/* Mockup visual */}
             <div className="relative glass-card-gold rounded-[2rem] p-4 aspect-[9/19] shadow-2xl overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-gold-primary/10 before:to-transparent before:z-0">
                <div className="relative z-10 bg-bg-primary rounded-[1.5rem] h-full p-6 flex flex-col gap-6">
                  {/* Mock content */}
                  <div className="space-y-2 mt-4 text-center">
                    <div className="h-4 w-24 bg-bg-border rounded mx-auto mb-4" />
                    <div className="text-xl font-bold">صالون الأناقة</div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" /> مفتوح
                    </div>
                  </div>
                  
                  <div className="glass-card flex-1 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-center">
                     <div className="text-sm text-text-muted">رقمك في الطابور</div>
                     <div className="text-7xl font-bold text-gold-primary">7</div>
                     
                     <div className="w-full space-y-2 mt-4">
                        <div className="flex justify-between text-xs text-text-muted">
                           <span>أمامك: 3 أشخاص</span>
                           <span>~30 دقيقة</span>
                        </div>
                        <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden">
                          <div className="h-full bg-gold-primary w-[60%]" />
                        </div>
                     </div>
                  </div>
                </div>
             </div>
             
             <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-xl flex items-center gap-3 animate-bounce shadow-xl">
               <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                 <span className="text-lg">✂️</span>
               </div>
               <div>
                  <p className="text-sm font-bold text-white">دورك الآن!</p>
                  <p className="text-xs text-text-muted">توجه للحلاق فوراً</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
