import React, { useState, useEffect } from 'react';
import { AIInsightsData } from '../types/mining';
import { api } from '../services/api';
import { formatSASTTime } from '../utils/formatters';
import {
  Sparkles,
  AlertTriangle,
  Info,
  ShieldAlert,
  Lightbulb,
  RefreshCw,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle,
} from 'lucide-react';

interface AIInsightsViewProps {
  selectedSite: string;
}

export function AIInsightsView({ selectedSite }: AIInsightsViewProps) {
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [source, setSource] = useState<string>('');
  const [generatedAt, setGeneratedAt] = useState<string>('');
  const [focusArea, setFocusArea] = useState<string>('operational velocity');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchInsights = async (focus = focusArea) => {
    setRegenerating(true);
    try {
      const res = await api.generateAIInsights({ site: selectedSite, focusArea: focus });
      setInsights(res.data);
      setSource(res.source);
      setGeneratedAt(res.generated_at);
    } catch (err) {
      console.error('Failed to generate insights', err);
    } finally {
      setRegenerating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [selectedSite]);

  const handleFocusChange = (newFocus: string) => {
    setFocusArea(newFocus);
    fetchInsights(newFocus);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-28 bg-slate-900 rounded-xl" />
        <div className="h-64 bg-slate-900 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">AI Operational Insights & Anomaly Detection</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {source.includes('gemini') ? 'Gemini 3.8 Flash' : 'MineBI Heuristic Intelligence Engine'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time pattern identification across production variance, mechanical alerts, and equipment downtime risks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchInsights()}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Analyzing...' : 'Re-Run Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Focus Area Pill Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-amber-400" /> Focus Target:
        </span>
        {[
          'Operational Velocity',
          'Equipment Reliability',
          'Fuel & Energy Optimization',
          'Haul Cycle Bottlenecks',
        ].map(focus => (
          <button
            key={focus}
            onClick={() => handleFocusChange(focus.toLowerCase())}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              focusArea.toLowerCase() === focus.toLowerCase()
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {focus}
          </button>
        ))}
      </div>

      {/* Executive Summary Card */}
      {insights && (
        <div className="p-6 bg-slate-900 border border-amber-900/40 rounded-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Sparkles className="w-24 h-24 text-amber-400" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Executive Operational Finding</span>
          </div>
          <p className="text-base font-medium text-slate-100 max-w-3xl leading-relaxed">
            {insights.executive_summary}
          </p>
          <div className="text-xs text-slate-400 flex items-center gap-4 pt-2 border-t border-slate-800 font-mono">
            <span>Generated: {generatedAt ? formatSASTTime(generatedAt) : 'Current Shift SAST'}</span>
            <span>·</span>
            <span>Fleet Timezone: SAST (UTC+2)</span>
            <span>·</span>
            <span>Analyzed Mining Scope: {selectedSite}</span>
          </div>
        </div>
      )}

      {/* Anomaly Alerts Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Detected Anomaly Alerts & Work Orders</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights?.anomaly_alerts.map((alert, idx) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';
            return (
              <div
                key={idx}
                className={`p-5 rounded-xl border bg-slate-900 space-y-3 ${
                  isCritical
                    ? 'border-rose-800/80'
                    : isWarning
                    ? 'border-amber-800/60'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold ${
                      isCritical
                        ? 'bg-rose-950 text-rose-300'
                        : isWarning
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-blue-950 text-blue-300'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  {isCritical ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-400" />
                  )}
                </div>

                <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                <div className="p-3 bg-slate-800/70 rounded-lg text-xs space-y-1 border border-slate-700/50">
                  <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider block">
                    Recommended Operational Action:
                  </span>
                  <p className="text-slate-200">{alert.recommended_action}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment Risk Ranking & Short-term Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Ranking */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Equipment Mechanical Risk Ranking</h3>
              <p className="text-xs text-slate-400">Identified bottlenecks impacting daily pit extraction</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-3">
            {insights?.equipment_risk_ranking.map(item => (
              <div
                key={item.equipment_id}
                className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-lg flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{item.equipment_id}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs ${
                        item.risk_level === 'HIGH' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {item.risk_level} RISK
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{item.reason}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase">Daily Impact</span>
                  <span className="font-mono text-rose-400 font-semibold text-xs">
                    -{item.impact_tons_per_day.toLocaleString()} t/d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Short-Term Trajectory & Efficiency Tips */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">Production Forecast Trajectory</h3>
              <p className="text-xs text-slate-400">Shift pacing against monthly operational quotas</p>
            </div>

            <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-lg text-xs text-slate-200 leading-relaxed">
              {insights?.production_forecast_note}
            </div>

            <div>
              <span className="text-xs font-medium text-slate-300 block mb-2">
                Operational Engineering Recommendations:
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {insights?.operational_efficiency_tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-md border border-slate-800 text-[11px] text-slate-500">
            Compliance Note (BRD FR-008): AI outputs are provided as advisory operational indicators based on
            synthetic demonstration telemetry.
          </div>
        </div>
      </div>
    </div>
  );
}
