'use client';

import React from 'react';
import { Link2, AlertTriangle, Check } from 'lucide-react';

interface DependencyMapProps {
  modules: Array<{
    code: string;
    name: string;
    dependencies: string[];
    enabled: boolean;
  }>;
}

export function DependencyMap({ modules }: DependencyMapProps) {
  const enabledCodes = new Set(modules.filter(m => m.enabled).map(m => m.code));

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* SVG Dependency Graph */}
        <svg width="100%" height="400" className="bg-gray-950 rounded-xl border border-gray-800">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#4b5563" />
            </marker>
          </defs>

          {/* Render modules as nodes */}
          {modules.map((mod, index) => {
            const x = 100 + (index % 4) * 150;
            const y = 80 + Math.floor(index / 4) * 120;
            const isEnabled = mod.enabled;
            const hasMissingDeps = mod.dependencies.some(dep => !enabledCodes.has(dep));

            return (
              <g key={mod.code}>
                {/* Module node */}
                <rect
                  x={x - 50}
                  y={y - 20}
                  width="100"
                  height="40"
                  rx="8"
                  className={`transition-colors ${isEnabled ? 'fill-blue-900/50 stroke-blue-600' : 'fill-gray-900 stroke-gray-700'}`}
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  className={`text-xs font-bold ${isEnabled ? 'fill-blue-400' : 'fill-gray-500'}`}
                >
                  {mod.code}
                </text>

                {/* Dependency lines */}
                {mod.dependencies.map((dep, depIndex) => {
                  const depModule = modules.find(m => m.code === dep);
                  if (!depModule) return null;
                  const depIndex2 = modules.indexOf(depModule);
                  const depX = 100 + (depIndex2 % 4) * 150;
                  const depY = 80 + Math.floor(depIndex2 / 4) * 120;

                  return (
                    <line
                      key={`${mod.code}-${dep}`}
                      x1={depX}
                      y1={depY + 20}
                      x2={x - 50}
                      y2={y - 20}
                      stroke={isEnabled && !enabledCodes.has(dep) ? '#ef4444' : '#4b5563'}
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      strokeDasharray={isEnabled && !enabledCodes.has(dep) ? '8,4' : 'none'}
                    />
                  );
                 })}
               </g>
            );
          })}

          {/* Legend */}
          <rect x="20" y="340" width="12" height="12" rx="2" className="fill-blue-900/50 stroke-blue-600" strokeWidth="2" />
          <text x="40" y="350" className="text-xs fill-gray-400">Enabled</text>

          <rect x="120" y="340" width="12" height="12" rx="2" className="fill-gray-900 stroke-gray-700" strokeWidth="2" />
          <text x="140" y="350" className="text-xs fill-gray-400">Disabled</text>

          <line x1="220" y1="346" x2="260" y2="346" stroke="#ef4444" strokeWidth="2" strokeDasharray="8,4" />
          <text x="270" y="350" className="text-xs fill-gray-400">Missing Dependency</text>
        </svg>
      </div>

      {/* Dependency List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {modules.filter(m => m.dependencies.length > 0).map(mod => {
          const missingDeps = mod.dependencies.filter(dep => !enabledCodes.has(dep));
          const hasMissing = missingDeps.length > 0 && mod.enabled;

          return (
            <div
              key={mod.code}
              className={`p-3 rounded-lg border ${hasMissing ? 'bg-red-900/20 border-red-800/50' : 'bg-gray-800/50 border-gray-700'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${mod.enabled ? 'text-blue-400' : 'text-gray-500'}`}>
                  {mod.code}
                </span>
                {hasMissing ? (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                ) : mod.enabled ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : null}
              </div>
              <div className="flex flex-wrap gap-1">
                {mod.dependencies.map(dep => {
                  const depEnabled = enabledCodes.has(dep);
                  return (
                    <span
                      key={dep}
                      className={`text-xs px-1.5 py-0.5 rounded ${depEnabled ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}
                    >
                      <Link2 className="w-2.5 h-2.5 inline mr-1" />
                      {dep}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
