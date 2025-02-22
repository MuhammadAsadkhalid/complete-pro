'use client';

import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      <main className="pl-64 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 