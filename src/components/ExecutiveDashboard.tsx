import React from 'react';
import { DashboardSummaryResponse, UserRole } from '../types/mining';
import { ProductionVelocityChart, VarianceBarChart, AvailabilityDonut } from './InteractiveCharts';
import { SOUTH_AFRICAN_SITES } from '../constants/miningSites';
import {
  TrendingUp,
  AlertCircle,
  Truck,
  DollarSign,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  data: DashboardSummaryResponse | null;
  loading: boolean;
  selectedSite: string;
  onSiteChange: (site: string) => void;
  currentRole: UserRole;
  onNavigateTab: (tab: any) => void;
}

export function ExecutiveDashboard({
  data,
  loading,
  selectedSite,
  onSiteChange,
  currentRole,
  onNavigateTab,
}: ExecutiveDashboardProps) {
  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-48 bg-slate-900 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-900 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, site_summaries, production_trend } = data;
  const isPositiveVariance = kpis.production_variance_tons >= 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Operational Banner with 16:9 aerial mining asset */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 min-h-[220px] flex flex-col justify-end p-6 md:p-8">
        <img
          src="/src/assets/images/hero_mining_open_pit_1793964352139.jpg"
          alt="Open Pit Mining Operations"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-400">
              <span>MINEBI EXECUTIVE CONSOLE</span>
              <span aria-hidden="true">·</span>
              <span>ROLE: {currentRole.toUpperCase()}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">FLEET TIME: SAST (UTC+2)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Consolidated Mining Operational Intelligence
            </h1>
            <p className="text-sm text-slate-300">
              Real-time aggregation of pit hauling, processing mill feed, fleet mechanical availability, and operating expenditure across active mining assets.
            </p>
          </div>

          {/* Quick Filter Control */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-lg border border-slate-700/80 backdrop-blur-md">
            <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Site Filter:
            </span>
            <select
              value={selectedSite}
              onChange={e => onSiteChange(e.target.value)}
              className="bg-slate-800 text-slate-100 text-xs px-2.5 py-1.5 rounded-md font-medium border border-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All South African Mining Assets ({SOUTH_AFRICAN_SITES.length})</option>
              {SOUTH_AFRICAN_SITES.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (BRD Section 5 FR-001 & Section 8 Formulas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Production Achievement */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Production (30d)
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white">
              {(kpis.total_actual_tons / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">tons</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>Target: {(kpis.total_target_tons / 1000).toFixed(1)}k t</span>
              <span className={`font-mono font-semibold ${isPositiveVariance ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositiveVariance ? '+' : ''}
                {(kpis.production_variance_tons / 1000).toFixed(1)}k t
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  kpis.production_achievement_pct >= 100
                    ? 'bg-emerald-500'
                    : kpis.production_achievement_pct >= 90
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, kpis.production_achievement_pct)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Achievement</span>
              <span className="text-slate-200 font-semibold">{kpis.production_achievement_pct}%</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Equipment Availability */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Fleet Availability
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white">
              {kpis.equipment_availability_pct}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Operational benchmark: <span className="text-slate-300 font-mono">≥ 85.0%</span>
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-800/80">
            <span className="text-slate-400">Active Units:</span>
            <span className="font-mono text-emerald-400 font-medium">
              {kpis.operational_equipment} / {kpis.total_equipment} Active
            </span>
          </div>
        </div>

        {/* KPI 3: Fleet Downtime */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Fleet Downtime
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white">
              {kpis.total_downtime_hours.toLocaleString()} <span className="text-xs font-normal text-slate-400">hrs</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Downtime rate: <span className="text-amber-400 font-mono font-medium">{kpis.downtime_pct}%</span> of scheduled
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-800/80">
            <span className="text-slate-400">Alert Status:</span>
            <span className="font-mono text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {kpis.maintenance_alerts} Work Orders
            </span>
          </div>
        </div>

        {/* KPI 4: Operating Cost Per Ton */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Operating Cost / Ton
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 font-mono font-bold text-xs">
              ZAR
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white">
              R {kpis.cost_per_ton_usd.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ ton</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Total Spend: <span className="text-slate-300 font-mono">R {(kpis.total_operating_cost_usd / 1000000).toFixed(2)}M</span>
            </div>
          </div>
          <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-800/80">
            <span className="text-slate-400">Target OPEX:</span>
            <span className="font-mono text-emerald-400 font-medium">&lt; R 24.50 / t</span>
          </div>
        </div>
      </div>

      {/* Main Charts Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Velocity Curve (2 Cols) */}
        <div className="lg:col-span-2 p-6 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-semibold text-white">Production Velocity: Actual vs Target Output</h3>
              <p className="text-xs text-slate-400">Daily tonnage extracted and hauled across reporting cycle</p>
            </div>
            <button
              onClick={() => onNavigateTab('production')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <span>Detailed Breakdown</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ProductionVelocityChart data={production_trend} height={260} />

          <div className="pt-2 border-t border-slate-800/70">
            <VarianceBarChart data={production_trend} />
          </div>
        </div>

        {/* Fleet Mechanical Availability & Downtime Gauge (1 Col) */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Fleet Availability Health</h3>
                <p className="text-xs text-slate-400">Calculated over scheduled operating shifts</p>
              </div>
              <button
                onClick={() => onNavigateTab('equipment')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>Fleet Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="py-6 flex flex-col items-center justify-center">
              <AvailabilityDonut
                availabilityPct={kpis.equipment_availability_pct}
                operatingPct={78}
                downtimePct={kpis.downtime_pct}
                size={160}
              />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Operating Time:</span>
                <span className="font-mono text-slate-200 font-medium">
                  {kpis.total_operating_hours.toLocaleString()} hrs
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Total Downtime:</span>
                <span className="font-mono text-rose-400 font-medium">
                  {kpis.total_downtime_hours.toLocaleString()} hrs
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">Target Standard:</span>
                <span className="font-mono text-emerald-400 font-medium">≥ 85.0% Availability</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Formula: (Available / Scheduled) × 100</span>
            <span className="text-amber-500 font-mono">BRD Sec. 8</span>
          </div>
        </div>
      </div>

      {/* Mining Site Performance Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">South African Mining Assets Performance Comparison</h3>
            <p className="text-xs text-slate-400">Operational benchmarks across Sishen, Mogalakwena, Mponeng, Grootegeluk, Palabora, and Kalahari</p>
          </div>
          <span className="text-xs font-mono text-slate-500">{site_summaries.length} Operations Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {site_summaries.map(site => {
            const isPassing = site.achievement_pct >= 95;
            return (
              <div
                key={site.site}
                className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200">{site.site}</h4>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-sm ${
                      isPassing ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    {site.achievement_pct.toFixed(1)}% Achieved
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Actual Output:</span>
                    <span className="font-mono text-slate-200">{(site.actual_tons / 1000).toFixed(1)}k tons</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Planned Target:</span>
                    <span className="font-mono text-slate-200">{(site.target_tons / 1000).toFixed(1)}k tons</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Fleet Availability:</span>
                    <span className="font-mono text-slate-200">{site.availability_pct.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Assigned Fleet:</span>
                  <span className="font-mono text-slate-300">
                    {site.active_units} / {site.equipment_count} Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Intelligence Spotlight Callout */}
      <div className="p-5 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-900/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <span>MineBI Analytical Intelligence</span>
              <span className="text-[10px] text-slate-400 font-mono">Gemini 3.8 Flash</span>
            </div>
            <p className="text-sm text-slate-200 mt-1">
              Automated anomaly detection identifies haul cycle drag on Bench 14 South and scheduled maintenance rebalancing for Excavator EX-202.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('ai-insights')}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors shrink-0 whitespace-nowrap cursor-pointer shadow-sm"
        >
          View Full AI Insights
        </button>
      </div>
    </div>
  );
}
