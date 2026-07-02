"use client";

import { use, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDesignStore } from '@/store/useDesignStore';

const EditorPageContent = dynamic(
  () => import('@/components/editor/EditorPageContent'), 
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }
);

export default function EditorPage({ searchParams }: { searchParams: Promise<{ width?: string, height?: string, type?: string }> }) {
  const resolvedSearch = use(searchParams);
  const router = useRouter();

  const storeWidth = useDesignStore(state => state.width);
  const storeHeight = useDesignStore(state => state.height);
  const storeType = useDesignStore(state => state.type);

  const finalWidth = storeWidth || (resolvedSearch.width ? parseInt(resolvedSearch.width) : undefined);
  const finalHeight = storeHeight || (resolvedSearch.height ? parseInt(resolvedSearch.height) : undefined);
  const finalType = storeType || resolvedSearch.type;

  useEffect(() => {
    if (!finalWidth || !finalHeight) {
      router.push('/dashboard');
    }
  }, [finalWidth, finalHeight, router]);

  if (!finalWidth || !finalHeight) return null;

  const config = {
    width: finalWidth,
    height: finalHeight,
    type: finalType || 'Custom'
  };

  return <EditorPageContent projectId={undefined} config={config} />;
}
