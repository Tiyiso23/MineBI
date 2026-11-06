import React, { useState, useEffect } from 'react';
import { ActiveTab, UserRole } from '../types/mining';
import { PlusCircle, UserCheck, Clock } from 'lucide-react';
import { getSASTShiftDetails } from '../utils/formatters';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenNewShift: () => void;
}

export function TopNav({
  activeTab,
  onTabChange,
  currentRole,
  onRoleChange,
  onOpenNewShift,
}: TopNavProps) {
  const [shiftDetails, setShiftDetails] = useState(getSASTShiftDetails());

  useEffect(() => {
    const timer = setInterval(() => {
      setShiftDetails(getSASTShiftDetails());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'executive', label: 'Executive' },
    { id: 'production', label: 'Production' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'financials', label: 'Financials' },
    { id: 'ai-insights', label: 'AI Insights' },
    { id: 'reports', label: 'Reports' },
    { id: 'admin', label: 'Admin' },
  ];

  const roles: UserRole[] = [
    'Mine Manager',
    'Production Manager',
    'Maintenance Manager',
    'Data Analyst',
    'Administrator',
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#executive"
          onClick={e => {
            e.preventDefault();
            onTabChange('executive');
          }}
          className="text-xl font-extrabold tracking-tight text-white font-sans whitespace-nowrap"
        >
          <span className="text-amber-500">Mine</span>BI
        </a>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
                isActive
                  ? 'text-amber-400 font-semibold border-b-2 border-amber-500'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary Action, SA Fleet Time & Role Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* South African Fleet Time Indicator (SAST UTC+2) */}
        <div
          title="South Africa Standard Time (SAST, UTC+2) - Active Mining Shift"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-md text-xs font-mono text-slate-200"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{shiftDetails.timeStr}</span>
          <span className="text-slate-500">·</span>
          <span className="text-amber-400 font-medium">{shiftDetails.shiftName}</span>
        </div>

        {/* Role Selector dropdown */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-md text-xs text-slate-300">
          <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <select
            value={currentRole}
            onChange={e => onRoleChange(e.target.value as UserRole)}
            className="bg-transparent border-none text-slate-200 text-xs font-medium focus:outline-hidden cursor-pointer"
            aria-label="Select user role"
          >
            {roles.map(r => (
              <option key={r} value={r} className="bg-slate-900 text-slate-200">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenNewShift}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Shift</span>
        </button>
      </div>
    </header>
  );
}
