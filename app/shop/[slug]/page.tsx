import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // استدعاء قاعدة البيانات
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const supabase = createClient();

  // جلب الـ ID الحقيقي للمحل باستخدام الـ slug مباشرة من السيرفر
  const { data: shopData } = await supabase
    .from('shops')
    .select('id')
    .eq('slug', slug)
    .single();

  // إذا لم يجد المحل في قاعدة البيانات يظهر صفحة 404
  if (!shopData) {
    notFound();
  }

  // نمرر الـ id الحقيقي والـ slug معاً للملف الداخلي بنجاح
  return <ShopClient slug={slug} shopId={shopData.id} />;
}
