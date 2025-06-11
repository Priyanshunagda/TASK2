import React from 'react';

export default function MainContent({ email }) {
  // Extract first part of email (before @) as a fallback name
  const displayName = email ? email.split('@')[0] : 'Guest';
  
  return (
    <div className="h-full">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-md p-6 mb-6 text-white relative overflow-hidden">
        {/* Decorative Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">
            Welcome back, {displayName} 👋
          </h2>
          <p className="text-sm text-indigo-100">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
