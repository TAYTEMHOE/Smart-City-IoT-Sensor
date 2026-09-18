import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Smart City IoT Dashboard</h1>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">{children}</main>
    </div>
  );
}
