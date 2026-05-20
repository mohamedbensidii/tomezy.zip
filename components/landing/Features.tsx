import { Card } from "@/components/ui/Card";
import { Zap, Clock, Smartphone, UserCheck, ShieldCheck, QrCode } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "طابور ذكي بدون تطبيق",
      desc: "لا حاجة لتحميل أي تطبيق، كل شيء يعمل من المتصفح مباشرة."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "تحديث لحظي",
      desc: "تابع تقدم الطابور بشكل حي ومباشر دون الحاجة لتحديث الصفحة."
    },
    {
      icon: <BellRingIcon className="w-6 h-6" />,
      title: "إشعارات فورية",
      desc: "تنبيهات على متصفحك عند اقتراب دورك، حتى لو أغلقت الشاشة."
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "سهل للحلاق",
      desc: "لوحة تحكم بسيطة جداً بضغطة زر واحدة تنادي الزبون التالي."
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "QR خاص لكل محل",
      desc: "احصل على رمز استجابة سريعة جاهز للطباعة والتعليق في محلك."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "يعمل على كل الهواتف",
      desc: "متوافق مع جميع الهواتف الذكية القديمة والحديثة."
    }
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">مميزات النظام</h2>
          <p className="text-text-muted text-lg">صُمم خصيصاً ليناسب احتياجات صالونات الحلاقة في المغرب</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="bg-bg-surface/50 border-bg-border/50 hover:bg-bg-surface hover:border-gold-dim transition-all">
              <div className="p-6 flex items-start gap-4">
                <div className="p-3 bg-bg-elevated rounded-xl text-gold-primary shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Simple fallback for BellRing if not imported above correctly
function BellRingIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
  );
}
