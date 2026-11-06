import React, { useState, useEffect } from 'react';
import { ProductionRecord, TrendPoint } from '../types/mining';
import { api } from '../services/api';
import { ProductionVelocityChart, VarianceBarChart } from './InteractiveCharts';
import {
  Download,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ProductionAnalyticsProps {
  selectedSite: string;
  onSiteChange: (site: string) => void;
  onOpenNewShift: () => void;
}

export function ProductionAnalytics({
  selectedSite,
  onSiteChange,
  onOpenNewShift,
}: ProductionAnalyticsProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [metadata, setMetadata] = useState<{ sites: string[]; areas: string[]; materials: string[] }>({
    sites: [],
    areas: [],
    materials: [],
  });
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof ProductionRecord>('production_date');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recRes, trendRes] = await Promise.all([
        api.getProductionRecords({
          site: selectedSite,
          area: selectedArea,
          material: selectedMaterial,
          limit: 200,
        }),
        api.getProductionTrends({
          site: selectedSite,
          period: period,
        }),
      ]);

      setRecords(recRes.records);
      setMetadata(recRes.metadata);
      setTrends(
        trendRes.trends.map((t: any) => ({
          date: t.period_key,
          actual_tons: t.actual_tons,
          target_tons: t.target_tons,
          variance: t.variance_tons,
          achievement_pct: t.achievement_pct,
        }))
      );
    } catch (err) {
      console.error('Failed to load production analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSite, selectedArea, selectedMaterial, period]);

  // Client-side filtering and sorting for table
  const filteredRecords = records.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.production_id.toLowerCase().includes(term) ||
      r.mine_site.toLowerCase().includes(term) ||
      r.mining_area.toLowerCase().includes(term) ||
      r.material_type.toLowerCase().includes(term)
    );
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = sortedRecords.slice(page * pageSize, (page + 1) * pageSize);

  // Totals for the current filtered view
  const totalActual = filteredRecords.reduce((acc, r) => acc + r.actual_tons, 0);
  const totalTarget = filteredRecords.reduce((acc, r) => acc + r.target_tons, 0);
  const totalVariance = totalActual - totalTarget;
  const achievementPct = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

  // Material Distribution Breakdown
  const materialMap = new Map<string, { tons: number; count: number }>();
  filteredRecords.forEach(r => {
    const cur = materialMap.get(r.material_type) || { tons: 0, count: 0 };
    cur.tons += r.actual_tons;
    cur.count += 1;
    materialMap.set(r.material_type, cur);
  });

  const materialBreakdown = Array.from(materialMap.entries()).map(([material, stats]) => ({
    material,
    tons: stats.tons,
    percentage: totalActual > 0 ? (stats.tons / totalActual) * 100 : 0,
    count: stats.count,
  }));

  const handleExportCSV = () => {
    const headers = [
      'Production ID',
      'Production Date',
      'Mine Site',
      'Mining Area',
      'Material Category',
      'Actual Tons',
      'Target Tons',
      'Variance Tons',
      'Achievement %',
      'Grade Estimate',
    ];
    const rows = filteredRecords.map(r => [
      r.production_id,
      r.production_date,
      `"${r.mine_site}"`,
      `"${r.mining_area}"`,
      `"${r.material_type}"`,
      r.actual_tons,
      r.target_tons,
      r.actual_tons - r.target_tons,
      ((r.actual_tons / r.target_tons) * 100).toFixed(1),
      `"${r.grade_estimate}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `minebi_production_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field: keyof ProductionRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header controls & Aggregation filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Production Analytics & Target Variance</h2>
          <p className="text-xs text-slate-400">
            Compare actual extraction tonnage against planned mine engineering targets across shifts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
            {(['daily', 'weekly', 'monthly'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize cursor-pointer ${
                  period === p
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewShift}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors cursor-pointer"
          >
            <span>Log Shift</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
        {/* Site Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Mining Site</label>
          <select
            value={selectedSite}
            onChange={e => onSiteChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden"
          >
            <option value="All">All Mining Assets</option>
            {metadata.sites.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Area Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Operational Area</label>
          <select
            value={selectedArea}
            onChange={e => setSelectedArea(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden"
          >
            <option value="All">All Operational Areas</option>
            {metadata.areas.map(a => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Material Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Material Category</label>
          <select
            value={selectedMaterial}
            onChange={e => setSelectedMaterial(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden"
          >
            <option value="All">All Materials & Ore</option>
            {metadata.materials.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Search ID or Bench</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Filtered Actual Output</span>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {totalActual.toLocaleString()} <span className="text-xs font-normal text-slate-400">tons</span>
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Planned Target Baseline</span>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {totalTarget.toLocaleString()} <span className="text-xs font-normal text-slate-400">tons</span>
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Net Variance</span>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              totalVariance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalVariance >= 0 ? '+' : ''}
            {totalVariance.toLocaleString()} <span className="text-xs font-normal text-slate-400">tons</span>
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Target Achievement</span>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              achievementPct >= 100
                ? 'text-emerald-400'
                : achievementPct >= 90
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {achievementPct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Primary Trend Chart */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white capitalize">{period} Production Velocity Curve</h3>
            <p className="text-xs text-slate-400">Actual extracted tons vs planned engineering targets</p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-sm">
            {trends.length} Intervals Plotted
          </span>
        </div>

        <ProductionVelocityChart data={trends} height={260} />
      </div>

      {/* Material Composition Split */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Extracted Material Composition</h3>
            <p className="text-xs text-slate-400">Distribution across mineral types and waste removal</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{materialBreakdown.length} Categories</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {materialBreakdown.map(m => (
            <div key={m.material} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 space-y-1">
              <span className="text-xs font-medium text-slate-200 block truncate">{m.material}</span>
              <div className="text-sm font-bold font-mono text-white">{(m.tons / 1000).toFixed(1)}k t</div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Share:</span>
                <span className="font-mono text-amber-400">{m.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Density Data Grid (BRD Section 7.1) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Production Shift Records Log</h3>
          <span className="text-xs text-slate-400 font-mono">
            Showing {paginatedRecords.length} of {filteredRecords.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th
                  onClick={() => handleSort('production_id')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Record ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('production_date')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('mine_site')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Site</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3">Area / Bench</th>
                <th className="px-4 py-3">Material</th>
                <th
                  onClick={() => handleSort('actual_tons')}
                  className="px-4 py-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Actual Tons</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('target_tons')}
                  className="px-4 py-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Target Tons</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">Variance</th>
                <th className="px-4 py-3 text-right">Achievement</th>
                <th className="px-4 py-3">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {paginatedRecords.map(r => {
                const variance = r.actual_tons - r.target_tons;
                const achPct = r.target_tons > 0 ? (r.actual_tons / r.target_tons) * 100 : 0;
                return (
                  <tr key={r.production_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-slate-400">{r.production_id}</td>
                    <td className="px-4 py-2.5 font-mono">{r.production_date}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-200">{r.mine_site}</td>
                    <td className="px-4 py-2.5">{r.mining_area}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-slate-300">{r.material_type}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-medium text-slate-100">
                      {r.actual_tons.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-400">
                      {r.target_tons.toLocaleString()}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-mono font-medium ${
                        variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {variance >= 0 ? '+' : ''}
                      {variance.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded-xs text-[11px] ${
                          achPct >= 100
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : achPct >= 90
                            ? 'text-amber-400 bg-amber-950/60'
                            : 'text-rose-400 bg-rose-950/60'
                        }`}
                      >
                        {achPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-400">{r.grade_estimate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 cursor-pointer text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 cursor-pointer text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
