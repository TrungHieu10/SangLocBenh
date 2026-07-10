/**
 * MainLayout — Dark futuristic layout wrapper with Medical Disclaimer
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MedicalDisclaimer from '../ui/MedicalDisclaimer';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-midnight">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto medical-bg flex flex-col">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 lg:py-8 flex-1">
            <Outlet />
          </div>
          <MedicalDisclaimer />
        </main>
      </div>
    </div>
  );
};
export default MainLayout;
