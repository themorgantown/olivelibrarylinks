'use client';

import dynamic from 'next/dynamic';
import { ComponentType, Suspense } from 'react';

interface DynamicImportProps<T extends Record<string, unknown> = Record<string, unknown>> {
  load: () => Promise<{ default: ComponentType<T> }>;
  props: T;
  loading?: React.ReactNode;
}

export default function DynamicImport<T extends Record<string, unknown> = Record<string, unknown>>({ load, props, loading = null }: DynamicImportProps<T>) {
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
