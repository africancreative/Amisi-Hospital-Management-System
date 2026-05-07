'use client';

import React from 'react';

export function WebAdminDashboard({ feature }: { feature: string }) {
    if (feature === 'blog') {
        const WebBlogView = require('./WebBlogView').WebBlogView;
        return <WebBlogView />;
    }
    
    if (feature === 'seo') {
        const WebSeoView = require('./WebSeoView').WebSeoView;
        return <WebSeoView />;
    }
    
    if (feature === 'pricing') {
        const WebPricingView = require('./WebPricingView').WebPricingView;
        return <WebPricingView />;
    }

    if (feature === 'contact') {
        const WebContactView = require('./WebContactView').WebContactView;
        return <WebContactView />;
    }

    return (
        <div className="p-12 text-center h-full flex flex-col items-center justify-center space-y-4 text-gray-400">
            <h1 className="text-3xl font-black text-white italic uppercase tracking-widest capitalize">Web Administration</h1>
            <p>Select a module from the sidebar to manage website content.</p>
        </div>
    );
}
