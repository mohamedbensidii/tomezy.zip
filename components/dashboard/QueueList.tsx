"use client";

import { Button } from "@/components/ui/Button";
import { format } from "date-fns";

export function QueueList({ 
    entries, 
    onCallNext 
}: { 
    entries: any[]; 
    onCallNext: (id: string) => void;
}) {
  if (entries.length === 0) {
    return null;
  }

  const nextEntry = entries[0];
  const otherEntries = entries.slice(1);

  return (
    <div className="space-y-4">
        {/* Next up featured */}
        <div className="glass-card rounded-xl p-4 flex items-center justify-between border-l-4 border-l-success">
            <div>
                <p className="text-xs text-text-muted mb-1">التالي</p>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">{nextEntry.customer_name}</span>
                    <span className="text-bg-muted text-sm">#{nextEntry.queue_number}</span>
                </div>
            </div>
            <Button 
                onClick={() => onCallNext(nextEntry.id)}
                size="lg"
                className="bg-gold-primary hover:bg-gold-light text-bg-primary font-bold px-8 shadow-[0_0_20px_rgba(212,168,67,0.3)] animate-pulse"
            >
                نداء ⏭
            </Button>
        </div>

        {/* Rest of queue */}
        {otherEntries.length > 0 && (
            <div className="mt-8">
                <h3 className="text-sm font-bold text-text-muted mb-4 px-2">المنتظرون ({otherEntries.length})</h3>
                <div className="space-y-2">
                    {otherEntries.map((entry) => (
                        <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-bg-surface/50 border border-bg-border">
                            <div className="flex items-center gap-4 mb-2 sm:mb-0">
                                <div className="w-10 h-10 rounded bg-bg-elevated flex items-center justify-center font-bold text-text-muted">
                                    {entry.queue_number}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{entry.customer_name}</p>
                                    <p className="text-xs text-text-faint">انضم في {format(new Date(entry.joined_at), 'hh:mm a')}</p>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-warning hover:text-warning w-full sm:w-auto mt-2 sm:mt-0 border border-bg-border/50 sm:border-none"
                                onClick={() => { if(confirm('متأكد من تخطي هذا الزبون؟')) { /* logic could be passed via props */ } }} // Simplified for MVP
                            >
                                إزالة
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}
