import { Card } from "@/components/ui/Card";
import { QrCode, Smartphone, BellRing } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: <QrCode className="w-8 h-8 text-gold-primary" />,
      title: "امسح الكود",
      desc: "الحلاق يضع QR في محله، تقوم بمسحه بكاميرا هاتفك"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-gold-primary" />,
      title: "احجز دورك",
      desc: "أدخل اسمك فقط وانضم للطابور الافتراضي بضغطة زر"
    },
    {
      icon: <BellRing className="w-8 h-8 text-gold-primary" />,
      title: "تلقى إشعاراً",
      desc: "سنرسل لك تنبيهاً عند اقتراب دورك لتعود للمحل"
    }
  ];

  return (
    <section className="py-24 bg-bg-surface relative border-y border-bg-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">كيف يعمل النظام؟</h2>
          <p className="text-text-muted text-lg">ثلاث خطوات بسيطة تنهي معاناتك مع الانتظار الطويل</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[40px] left-1/6 right-1/6 h-[1px] bg-gradient-to-r from-transparent via-gold-dim to-transparent z-0" />

          {steps.map((step, idx) => (
            <Card key={idx} className="relative z-10 glass-card bg-bg-primary/50 border-bg-border hover:border-gold-dim transition-colors">
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-bg-elevated rounded-2xl flex items-center justify-center shrink-0 border border-bg-border/50 shadow-inner relative">
                  {/* Step number badge */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gold-primary text-bg-primary rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                    {idx + 1}
                  </div>
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-text-muted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
