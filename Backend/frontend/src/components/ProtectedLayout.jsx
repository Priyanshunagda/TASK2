import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const ProtectedLayout = ({ email, onLogout }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const userRole = localStorage.getItem('userRole');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          email={email} 
          onLogout={onLogout}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout; 