import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

export default function Layout({ email, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">

      <Sidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1">
        <Header onToggle={() => setCollapsed(!collapsed)} onLogout={onLogout} />
        <main className="flex-1 p-6 overflow-auto">
          <MainContent email={email} />
        </main>
      </div>

    </div>
  );
}