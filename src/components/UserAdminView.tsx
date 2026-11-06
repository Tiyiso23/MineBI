import React, { useState, useEffect } from 'react';
import { UserRole } from '../types/mining';
import { api } from '../services/api';
import {
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  Database,
  Activity,
  Server,
  Lock,
} from 'lucide-react';

interface UserAdminViewProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function UserAdminView({ currentRole, onRoleChange }: UserAdminViewProps) {
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    api.getHealth()
      .then(res => setHealthData(res))
      .catch(err => console.error('Health check err', err));
  }, []);

  const roles: {
    role: UserRole;
    description: string;
    permissions: string[];
  }[] = [
    {
      role: 'Mine Manager',
      description: 'Reviews consolidated operational performance, executive KPIs, and financial indicators.',
      permissions: [
        'Consolidated Executive Dashboard',
        'Production Variance Review',
        'Fleet Availability Oversight',
        'Financial OPEX Analysis',
        'Official Report Sign-Off',
      ],
    },
    {
      role: 'Production Manager',
      description: 'Monitors daily shift output, pit bench targets, and material hauling velocities.',
      permissions: [
        'Production Analytics & Trends',
        'Target vs Actual Calibration',
        'Log Shift Production Data',
        'Mining Area Bench Tracking',
        'Material Grade Audits',
      ],
    },
    {
      role: 'Maintenance Manager',
      description: 'Manages equipment availability, unscheduled breakdown logs, and artisan work orders.',
      permissions: [
        'Equipment Fleet Monitoring',
        'Downtime Root Cause Analysis',
        'Preventive Service Scheduling',
        'Component Failure Tracking',
        'Maintenance Cost Auditing',
      ],
    },
    {
      role: 'Data Analyst',
      description: 'Conducts statistical modeling, custom SQL filtering, and AI operational anomaly studies.',
      permissions: [
        'Raw Dataset Querying',
        'Advanced Date Filtering',
        'AI Insights Engine Trigger',
        'Full CSV Data Export',
        'Statistical Variance Calculation',
      ],
    },
    {
      role: 'Administrator',
      description: 'Oversees platform user access, PostgreSQL schema synchronization, and system configuration.',
      permissions: [
        'Full System Configuration',
        'User Role Administration',
        'Database Schema & Synthetic Seeding',
        'API Health Monitoring',
        'Security & Audit Logging',
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">User Administration & Role Access Control</h2>
        <p className="text-xs text-slate-400">
          Enforce Role-Based Access Control (RBAC) across operational mining management tiers (BRD Section 4 & FR-007).
        </p>
      </div>

      {/* Backend Infrastructure & Health Status */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Platform Infrastructure & Service Health</h3>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            ONLINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Backend API</span>
            <span className="font-mono text-slate-200 font-semibold">{healthData?.system || 'FastAPI / Express Gateway'}</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Database Layer</span>
            <span className="font-mono text-slate-200 font-semibold">{healthData?.database_status || 'PostgreSQL Engine'}</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Total Loaded Records</span>
            <span className="font-mono text-amber-400 font-semibold">
              {healthData?.records_count
                ? `${healthData.records_count.production} Production · ${healthData.records_count.equipment} Fleet`
                : '120+ Telemetry Records'}
            </span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-lg">
            <span className="text-slate-400 block text-[11px]">Uptime</span>
            <span className="font-mono text-slate-200 font-semibold">
              {healthData?.uptime_seconds ? `${Math.round(healthData.uptime_seconds)}s continuous` : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Configured Operational Personas (BRD Section 4)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {roles.map(item => {
            const isCurrent = currentRole === item.role;
            return (
              <div
                key={item.role}
                className={`p-5 rounded-xl border bg-slate-900 space-y-4 transition-all ${
                  isCurrent
                    ? 'border-amber-500 ring-1 ring-amber-500/50 shadow-lg shadow-amber-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-white">{item.role}</h4>
                    <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                  </div>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-xs bg-amber-500 text-slate-950 font-bold font-mono text-[10px]">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Granted Permissions:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {item.permissions.map((perm, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onRoleChange(item.role)}
                  className={`w-full py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-800 text-amber-400 border border-slate-700'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {isCurrent ? 'Current Session Role' : `Switch to ${item.role}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
