'use client';

import React, { useState } from 'react';
import SystemSidebar from './SystemSidebar';
import SystemTopBar from './SystemTopBar';
import SystemContextPanel from './SystemContextPanel';

interface SystemAdminLayoutProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}

export default function SystemAdminLayout({ children, userName, userRole }: SystemAdminLayoutProps) {
  const [contextPanelOpen, setContextPanelOpen] = useState(true);
  const [contextPanelContent, setContextPanelContent] = useState<'actions' | 'logs' | 'insights'>('insights');

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top Bar - Global Status & Alerts */}
      <SystemTopBar userName={userName} userRole={userRole} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: System Navigation */}
        <SystemSidebar userRole={userRole} />

        {/* Center: Workspace */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-6">
          {children}
        </main>

        {/* Right: Context Panel (collapsible) */}
        {contextPanelOpen && (
          <SystemContextPanel
            contentType={contextPanelContent}
            onClose={() => setContextPanelOpen(false)}
            onSwitchType={setContextPanelContent}
          />
        )}

        {/* Context Panel Toggle */}
        {!contextPanelOpen && (
          <button
            onClick={() => setContextPanelOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 p-2 rounded-l-md border border-r-0 border-gray-700 transition-colors z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
