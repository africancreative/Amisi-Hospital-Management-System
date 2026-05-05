'use client';

import React from 'react';
import { Check, X, Link2, Info } from 'lucide-react';

interface ModuleCardProps {
  module: {
    code: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    dependencies: string[];
    enabled: boolean;
    category: string;
  };
  onToggle: () => void;
  dependencyNames: string[];
}

export function ModuleCard({ module, onToggle, dependencyNames }: ModuleCardProps) {
  return (
    <div className={`border rounded-xl p-4 transition-all ${
      module.enabled
        ? 'bg-gray-900 border-blue-800/50 shadow-lg shadow-blue-900/10'
        : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${
          module.enabled ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-800 text-gray-500'
        }`}>
          {module.icon}
        </div>
        <button
          onClick={onToggle}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            module.enabled ? 'bg-blue-600' : 'bg-gray-700'
          }`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            module.enabled ? 'translate-x-5.5 left-0.5' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      <h3 className={`text-sm font-medium mb-1 ${
        module.enabled ? 'text-gray-200' : 'text-gray-400'
      }`}>{module.name}</h3>
      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{module.description}</p>

      {dependencyNames.length > 0 && (
        <div className="border-t border-gray-800 pt-2 mt-2">
          <p className="text-gray-600 text-xs mb-1 flex items-center gap-1">
            <Link2 className="w-3 h-3" />
            Dependencies
          </p>
          <div className="flex flex-wrap gap-1">
            {dependencyNames.map((dep, i) => (
              <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800/50">
        <span className="text-xs text-gray-600">{module.code}</span>
        {module.enabled ? (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <Check className="w-3 h-3" />
            Active
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <X className="w-3 h-3" />
            Inactive
          </span>
        )}
      </div>
    </div>
  );
}
