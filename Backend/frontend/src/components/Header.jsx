import React, { useState } from 'react';

export default function Header({ onToggle, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
    onToggle();
  };

  return (
    <header className="flex items-center justify-between bg-white px-6 h-16 shadow-md border-b border-gray-200">
      {/* Left section: Toggle + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggle}
          className="p-2 rounded-md hover:bg-gray-100 transition"
        >
          <svg
            className={`w-6 h-6 text-gray-600 transform transition-transform duration-300 ${
              isOpen ? 'rotate-0' : 'rotate-180'
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M9.17 16.17L13.34 12L9.17 7.83M14.83 16.17L19 12L14.83 7.83"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="text-xl font-semibold text-gray-800">
          My Enterprise
        </span>
      </div>

      {/* Right section: Logout */}
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 14a9 9 0 100-18 9 9 0 000 18z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Logout
      </button>
    </header>
  );
}
