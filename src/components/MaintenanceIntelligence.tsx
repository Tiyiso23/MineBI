import React, { useState, useEffect } from 'react';
import { MaintenanceRecord } from '../types/mining';
import { api } from '../services/api';
import {
  Wrench,
  AlertTriangle,
  Clock,
  DollarSign,
  ShieldAlert,
  Calendar,
  User,
  Settings,
} from 'lucide-react';

export function MaintenanceIntelligence() {
  const [downtimeData, setDowntimeData] = useState<{
    total_recorded_maintenance_downtime_hours: number;
    preventive_vs_corrective: { Preventive: number; Corrective: number };
    component_breakdown: Array<{ component: string; downtime_hours: number; total_cost_usd: number; event_count: number }>;
    recent_events: MaintenanceRecord[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'All' | 'Preventive' | 'Corrective'>('All');

  useEffect(() => {
    const fetchDowntime = async () => {
      try {
        const res = await api.getDowntimeAnalysis();
        setDowntimeData(res);
      } catch (err) {
        console.error('Failed to load maintenance intelligence', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDowntime();
  }, []);

  if (loading || !downtimeData) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-28 bg-slate-900 rounded-xl" />
        <div className="h-64 bg-slate-900 rounded-xl" />
      </div>
    );
  }

  const { total_recorded_maintenance_downtime_hours, preventive_vs_corrective, component_breakdown, recent_events } =
    downtimeData;

  const totalCost = recent_events.reduce((sum, e) => sum + e.cost_usd, 0);
  const filteredEvents =
    filterType === 'All' ? recent_events : recent_events.filter(e => e.maintenance_type === filterType);

  const prevPct =
    total_recorded_maintenance_downtime_hours > 0
      ? (preventive_vs_corrective.Preventive / total_recorded_maintenance_downtime_hours) * 100
      : 0;
  const corrPct =
    total_recorded_maintenance_downtime_hours > 0
      ? (preventive_vs_corrective.Corrective / total_recorded_maintenance_downtime_hours) * 100
      : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Maintenance Intelligence & Downtime Root Cause</h2>
          <p className="text-xs text-slate-400">
            Analyze unscheduled breakdown frequencies, preventive servicing schedules, and component repair costs.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {(['All', 'Preventive', 'Corrective'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterType === type
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Maintenance Downtime
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {total_recorded_maintenance_downtime_hours} <span className="text-xs font-normal text-slate-400">hours</span>
          </div>
          <p className="text-[11px] text-slate-400">Across tracked heavy equipment units</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Maintenance Spend
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            R {(totalCost / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">ZAR</span>
          </div>
          <p className="text-[11px] text-slate-400">Parts, artisan labor, and hydraulic consumables</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Preventive Service Share
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {prevPct.toFixed(1)}% <span className="text-xs font-normal text-slate-400">({preventive_vs_corrective.Preventive}h)</span>
          </div>
          <p className="text-[11px] text-slate-400">Scheduled proactive lubrication & liner scans</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Corrective Breakdown Share
          </span>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {corrPct.toFixed(1)}% <span className="text-xs font-normal text-slate-400">({preventive_vs_corrective.Corrective}h)</span>
          </div>
          <p className="text-[11px] text-slate-400">Unscheduled component replacements</p>
        </div>
      </div>

      {/* Component Failure & Downtime Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Analysis */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-white">Downtime Hours by Subsystem Component</h3>
              <p className="text-xs text-slate-400">Identifies mechanical vulnerabilities across fleet</p>
            </div>
            <Settings className="w-4 h-4 text-slate-500" />
          </div>

          <div className="space-y-4">
            {component_breakdown.map(item => {
              const maxHours = Math.max(...component_breakdown.map(c => c.downtime_hours));
              const widthPct = (item.downtime_hours / maxHours) * 100;
              return (
                <div key={item.component} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-200">{item.component}</span>
                    <span className="font-mono text-slate-300">
                      {item.downtime_hours}h · R {item.total_cost_usd.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preventive vs Corrective Ratio */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Maintenance Strategy Ratio</h3>
                <p className="text-xs text-slate-400">Preventive maintenance ratio target: &gt; 60%</p>
              </div>
              <Wrench className="w-4 h-4 text-slate-500" />
            </div>

            <div className="py-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold">Preventive Maintenance</span>
                <span className="text-rose-400 font-semibold">Corrective / Breakdowns</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${prevPct}%` }}
                  title={`Preventive: ${prevPct.toFixed(1)}%`}
                />
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{ width: `${corrPct}%` }}
                  title={`Corrective: ${corrPct.toFixed(1)}%`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-4">
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">Scheduled Servicing</span>
                  <span className="text-emerald-400 font-mono font-bold text-lg">{preventive_vs_corrective.Preventive} hrs</span>
                  <p className="text-[11px] text-slate-400 mt-1">Lube packs & wear micrometer checks</p>
                </div>
                <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">Unplanned Repairs</span>
                  <span className="text-rose-400 font-mono font-bold text-lg">{preventive_vs_corrective.Corrective} hrs</span>
                  <p className="text-[11px] text-slate-400 mt-1">Hydraulic line & idler bearing repairs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60 text-xs text-slate-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Target ratio is 70% Preventive / 30% Corrective to avoid pit dispatch haul stalls.</span>
          </div>
        </div>
      </div>

      {/* Maintenance Activity Event History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Maintenance Work Order Audit Log</h3>
          <span className="text-xs text-slate-400 font-mono">{filteredEvents.length} Work Orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Work Order ID</th>
                <th className="px-4 py-3">Equipment Unit</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Component</th>
                <th className="px-4 py-3 text-right">Downtime (hrs)</th>
                <th className="px-4 py-3 text-right">Repair Cost (ZAR)</th>
                <th className="px-4 py-3">Certified Artisan</th>
                <th className="px-4 py-3">Action Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredEvents.map(evt => (
                <tr key={evt.maintenance_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400">{evt.maintenance_id}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-amber-400 font-medium block">{evt.equipment_id}</span>
                    <span className="text-[11px] text-slate-400">{evt.equipment_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-xs font-mono text-[11px] ${
                        evt.maintenance_type === 'Preventive'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-rose-950 text-rose-300'
                      }`}
                    >
                      {evt.maintenance_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-200">{evt.component}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-100">
                    {evt.downtime_hours}h
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-400">
                    R {evt.cost_usd.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{evt.technician}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={evt.description}>
                    {evt.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
