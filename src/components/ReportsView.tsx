import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatSASTDateTime } from '../utils/formatters';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle,
  Building2,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface ReportsViewProps {
  selectedSite: string;
}

export function ReportsView({ selectedSite }: ReportsViewProps) {
  const [period, setPeriod] = useState('last30');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.getProductionReport({ period, site: selectedSite });
        setReportData(res);
      } catch (err) {
        console.error('Failed to load report', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [period, selectedSite]);

  const handleDownloadCSV = () => {
    if (!reportData || !reportData.records) return;

    const headers = [
      'Production ID',
      'Date',
      'Mine Site',
      'Mining Area',
      'Material',
      'Actual Tons',
      'Target Tons',
      'Variance Tons',
      'Grade',
    ];
    const rows = reportData.records.map((r: any) => [
      r.production_id,
      r.production_date,
      `"${r.mine_site}"`,
      `"${r.mining_area}"`,
      `"${r.material_type}"`,
      r.actual_tons,
      r.target_tons,
      r.actual_tons - r.target_tons,
      `"${r.grade_estimate}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MineBI_Executive_Report_${period}_${selectedSite.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !reportData) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-32 bg-slate-900 rounded-xl" />
        <div className="h-96 bg-slate-900 rounded-xl" />
      </div>
    );
  }

  const { summary, generated_timestamp, target_site } = reportData;

  return (
    <div className="space-y-6 pb-12 print:text-black print:bg-white">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Business Intelligence Reports & Exports</h2>
          <p className="text-xs text-slate-400">
            Generate formal operational audit summaries, executive sign-off sheets, and data exports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg">
            {[
              { id: 'last7', label: '7 Days' },
              { id: 'last14', label: '14 Days' },
              { id: 'last30', label: '30 Days' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  period === p.id
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Formal Printable Document Card */}
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 shadow-xl print:border-none print:shadow-none print:p-0 print:bg-transparent">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-amber-500 font-sans">MineBI</span>
              <span className="text-xs px-2 py-0.5 rounded-sm bg-slate-800 text-slate-300 font-mono">
                OFFICIAL REPORT
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Mining Production & Operational Performance Report
            </h1>
            <p className="text-xs text-slate-400">
              Operational Scope: <span className="text-slate-200 font-medium">{target_site}</span>
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 font-mono text-slate-400">
            <div>Report ID: <span className="text-slate-200">MB-REP-{Date.now().toString().slice(-6)}</span></div>
            <div>Generated: <span className="text-slate-200">{formatSASTDateTime(generated_timestamp)}</span></div>
            <div>Fleet Timezone: <span className="text-amber-400">SAST (UTC+2)</span></div>
            <div>Status: <span className="text-emerald-400">PROTOTYPE VERIFIED</span></div>
          </div>
        </div>

        {/* Executive Summary Stat Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-700/60">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Actual Output</span>
            <span className="text-xl font-bold font-mono text-white">
              {(summary.total_actual_tons / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">tons</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Planned Target Quota</span>
            <span className="text-xl font-bold font-mono text-white">
              {(summary.total_target_tons / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">tons</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Net Variance</span>
            <span
              className={`text-xl font-bold font-mono ${
                summary.variance_tons >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {summary.variance_tons >= 0 ? '+' : ''}
              {(summary.variance_tons / 1000).toFixed(1)}k tons
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Overall Target Achieved</span>
            <span className="text-xl font-bold font-mono text-amber-400">
              {summary.overall_achievement_pct}%
            </span>
          </div>
        </div>

        {/* Selected Sample Records in this Report */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Audited Shift Production Sample</h3>
            <span className="text-xs font-mono text-slate-400">
              Showing top {Math.min(10, reportData.records.length)} of {reportData.records.length} records
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Site</th>
                  <th className="px-3 py-2.5">Mining Area</th>
                  <th className="px-3 py-2.5">Material</th>
                  <th className="px-3 py-2.5 text-right">Actual Tons</th>
                  <th className="px-3 py-2.5 text-right">Target Tons</th>
                  <th className="px-3 py-2.5 text-right">Achievement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                {reportData.records.slice(0, 10).map((r: any) => {
                  const ach = r.target_tons > 0 ? (r.actual_tons / r.target_tons) * 100 : 0;
                  return (
                    <tr key={r.production_id} className="hover:bg-slate-800/30">
                      <td className="px-3 py-2 text-slate-400">{r.production_date}</td>
                      <td className="px-3 py-2 font-sans text-slate-200">{r.mine_site}</td>
                      <td className="px-3 py-2 font-sans">{r.mining_area}</td>
                      <td className="px-3 py-2 font-sans">{r.material_type}</td>
                      <td className="px-3 py-2 text-right text-slate-100 font-medium">
                        {r.actual_tons.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-400">
                        {r.target_tons.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className={ach >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
                          {ach.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approval and Sign-Off Section (BRD Section 15) */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Operational Governance & Approval Sign-Off (BRD Section 15)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Mine Manager</span>
              <div className="h-8 border-b border-dashed border-slate-600 flex items-end pb-1 text-slate-300 italic font-serif">
                J. van der Merwe
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Status: Approved</span>
                <span>Date: 2026-11-06</span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Production Manager</span>
              <div className="h-8 border-b border-dashed border-slate-600 flex items-end pb-1 text-slate-300 italic font-serif">
                S. Sibanda
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Status: Approved</span>
                <span>Date: 2026-11-06</span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Maintenance Lead</span>
              <div className="h-8 border-b border-dashed border-slate-600 flex items-end pb-1 text-slate-300 italic font-serif">
                D. van Zyl
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Status: Approved</span>
                <span>Date: 2026-11-05</span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Chief Data Analyst</span>
              <div className="h-8 border-b border-dashed border-slate-600 flex items-end pb-1 text-slate-300 italic font-serif">
                A. Chen
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Status: Verified</span>
                <span>Date: 2026-11-06</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
