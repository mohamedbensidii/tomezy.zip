import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ShopClient from './ShopClient';

// Using dummy data or supabase lookup. Setting dynamic = 'force-dynamic' for Vercel
export const dynamic = 'force-dynamic';

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <ShopClient slug={resolvedParams.slug} />;
}
