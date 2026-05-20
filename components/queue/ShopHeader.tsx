import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Shop } from "@/types";
import { Users, Clock } from "lucide-react";

export function ShopHeader({ shop, waitingCount }: { shop: Shop, waitingCount: number }) {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="success" className="px-3">مفتوح 🟢</Badge>;
      case 'closed': return <Badge variant="destructive" className="px-3">مغلق 🔴</Badge>;
      case 'break': return <Badge variant="warning" className="px-3">استراحة 🟡</Badge>;
      case 'busy': return <Badge variant="warning" className="px-3 bg-orange-500/20 text-orange-500">مشغول 🟠</Badge>;
      default: return null;
    }
  };

  const estWait = waitingCount * (shop.avg_service_minutes || 15);

  return (
    <Card className="mb-6 overflow-hidden">
      {shop.cover_image && (
         <div className="h-32 w-full bg-cover bg-center" style={{ backgroundImage: `url(${shop.cover_image})` }} />
      )}
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">{shop.name}</CardTitle>
        {getStatusDisplay(shop.status)}
      </CardHeader>
      <CardContent>
        <div className="flex justify-around items-center py-2 bg-black/20 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-text-muted mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">ينتظرون</span>
            </div>
            <div className="text-xl font-bold text-white">{waitingCount}</div>
          </div>
          <div className="w-px h-10 bg-bg-border" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-text-muted mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">الوقت المتوقع</span>
            </div>
            <div className="text-xl font-bold text-white">~{estWait} د</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
