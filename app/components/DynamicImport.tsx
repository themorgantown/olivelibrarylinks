'use client';

import dynamic from 'next/dynamic';
import { ComponentType, Suspense } from 'react';

interface DynamicImportProps {
  load: () => Promise<{ default: ComponentType<any> }>;
  props: any;
  loading?: React.ReactNode;
}

export default function DynamicImport({ load, props, loading = null }: DynamicImportProps) {
  const DynamicComponent = dynamic(load, {
    loading: () => <>{loading}</>,
    ssr: false, // Disable server-side rendering for client components
  });

  return (
    <Suspense fallback={loading}>
      <DynamicComponent {...props} />
    </Suspense>
  );
}
