import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  DollarSign,
  PieChart,
  TrendingDown,
  Fuel,
  Users,
  Wrench,
  Zap,
  Bomb,
  Layers,
} from 'lucide-react';

interface FinancialAnalyticsProps {
  selectedSite: string;
  onSiteChange: (site: string) => void;
}

export function FinancialAnalytics({ selectedSite, onSiteChange }: FinancialAnalyticsProps) {
  const [data, setData] = useState<{
    total_cost_usd: number;
    total_tons: number;
    average_cost_per_ton_usd: number;
    category_breakdown: Array<{
      category: string;
      amount_usd: number;
      percentage_of_total: number;
      cost_per_ton: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancials = async () => {
      setLoading(true);
      try {
        const res = await api.getFinancials(selectedSite);
        setData(res);
      } catch (err) {
        console.error('Failed to load financial analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinancials();
  }, [selectedSite]);

  if (loading || !data) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-32 bg-slate-900 rounded-xl" />
        <div className="h-64 bg-slate-900 rounded-xl" />
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fuel & Energy':
        return <Fuel className="w-4 h-4 text-amber-400" />;
      case 'Labor & Crew':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'Maintenance & Spares':
        return <Wrench className="w-4 h-4 text-emerald-400" />;
      case 'Explosives & Blasting':
        return <Bomb className="w-4 h-4 text-rose-400" />;
      case 'Crushing & Mill Power':
        return <Zap className="w-4 h-4 text-purple-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Financial & Cost-Per-Ton Analytics</h2>
          <p className="text-xs text-slate-400">
            Monitor operational expenditure (OPEX) drivers across pit haulage, diesel consumption, blasting, and milling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Site Scope:</span>
          <select
            value={selectedSite}
            onChange={e => onSiteChange(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden"
          >
            <option value="All">All Mining Assets (Consolidated)</option>
            <option value="Kalahari Open Pit">Kalahari Open Pit</option>
            <option value="Pilbara North">Pilbara North</option>
            <option value="Atacama Copper">Atacama Copper</option>
            <option value="Witwatersrand Deep">Witwatersrand Deep</option>
          </select>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Operational Expenditure
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 font-mono font-bold text-xs">
              ZAR
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            R {(data.total_cost_usd / 1000000).toFixed(2)}M <span className="text-xs font-normal text-slate-400">ZAR</span>
          </div>
          <p className="text-[11px] text-slate-400">Total operational expenditure incurred over 30-day reporting cycle</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Average Cost Per Metric Ton
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            R {data.average_cost_per_ton_usd.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ ton</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Formula: Total Cost ÷ Total Extracted Tons ({data.total_tons.toLocaleString()} t)
          </p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Target Cost Variance
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            -R 1.45 <span className="text-xs font-normal text-emerald-400">Under Budget (-6.3%)</span>
          </div>
          <p className="text-[11px] text-slate-400">Mining engineering OPEX target: R 24.50 / ton</p>
        </div>
      </div>

      {/* Cost Category Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.category_breakdown.map(item => (
          <div key={item.category} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-slate-800">{getCategoryIcon(item.category)}</div>
                <h4 className="text-sm font-semibold text-slate-100">{item.category}</h4>
              </div>
              <span className="text-xs font-mono font-semibold text-amber-400">{item.percentage_of_total}%</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Expenditure:</span>
                <span className="font-mono text-slate-200">R {item.amount_usd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Contribution / Ton:</span>
                <span className="font-mono text-slate-200">R {item.cost_per_ton.toFixed(2)} / t</span>
              </div>
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${item.percentage_of_total * 2.5}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stacked Proportional Waterfall Bar */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-white">Operational Expenditure Share Distribution</h3>
        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
          {data.category_breakdown.map((item, idx) => {
            const colors = ['bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-purple-500'];
            return (
              <div
                key={item.category}
                className={`${colors[idx % colors.length]} h-full transition-all`}
                style={{ width: `${item.percentage_of_total}%` }}
                title={`${item.category}: ${item.percentage_of_total}% (R ${item.cost_per_ton.toFixed(2)}/t)`}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
          {data.category_breakdown.map((item, idx) => {
            const colors = ['bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-purple-500'];
            return (
              <div key={item.category} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-xs ${colors[idx % colors.length]}`} />
                <span>
                  {item.category} ({item.percentage_of_total}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
