"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export function CurrentCustomer({ 
    entry, 
    onFinish 
}: { 
    entry: any; 
    onFinish: (id: string, action: 'done' | 'skipped') => void 
}) {
  if (!entry) {
    return (
      <Card className="border-dashed border-2 border-bg-border bg-transparent text-center py-8">
        <p className="text-text-muted mb-2">لا يوجد زبون يخدم حالياً</p>
        <p className="text-sm">قم بالنداء على الزبون التالي من القائمة أدناه.</p>
      </Card>
    );
  }

  const waitTime = formatDistanceToNow(new Date(entry.joined_at), { locale: ar });

  return (
    <Card className="glass-card-gold overflow-hidden relative mb-6">
        <div className="absolute top-0 right-0 w-2 h-full bg-gold-primary" />
        <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-text-muted text-sm mb-1">يُخدم الآن</h3>
                    <div className="text-2xl font-bold text-white flex items-center gap-3">
                        {entry.customer_name}
                        <span className="bg-bg-elevated text-gold-primary px-3 py-1 rounded-lg text-lg border border-gold-dim">
                            #{entry.queue_number}
                        </span>
                    </div>
                </div>
                <div className="text-left text-sm text-text-muted">
                    <p>انتظر لمدة</p>
                    <p className="font-medium text-white">{waitTime}</p>
                </div>
            </div>

            <div className="flex gap-3">
                <Button 
                    className="flex-1 bg-success hover:bg-success/90 text-white font-bold h-12"
                    onClick={() => onFinish(entry.id, 'done')}
                >
                    إنهاء الخدمة
                </Button>
                <Button 
                    variant="outline"
                    className="flex-none px-6 border-warning text-warning hover:bg-warning hover:text-white"
                    onClick={() => onFinish(entry.id, 'skipped')}
                >
                    تخطي
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
