
"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const TeacherAnalyticsDashboard = dynamic(
  () => import('@/components/TeacherAnalyticsDashboard'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      </div>
    ),
  }
);

export default function TeacherAnalyticsPage() {
  return <TeacherAnalyticsDashboard />;
}
