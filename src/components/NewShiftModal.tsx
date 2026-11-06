import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

interface NewShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordCreated: () => void;
  sites: string[];
  areas: string[];
  materials: string[];
}

export function NewShiftModal({
  isOpen,
  onClose,
  onRecordCreated,
  sites,
  areas,
  materials,
}: NewShiftModalProps) {
  const [site, setSite] = useState(sites[0] || 'Kalahari Open Pit');
  const [area, setArea] = useState(areas[0] || 'Bench 14 South');
  const [material, setMaterial] = useState(materials[0] || 'Copper Ore');
  const [actualTons, setActualTons] = useState('14800');
  const [targetTons, setTargetTons] = useState('15000');
  const [grade, setGrade] = useState('0.88% Cu');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const actual = parseFloat(actualTons);
    const target = parseFloat(targetTons);

    if (isNaN(actual) || actual <= 0) {
      setError('Actual production must be a positive number of metric tons.');
      return;
    }
    if (isNaN(target) || target <= 0) {
      setError('Target production must be a positive number of metric tons.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mine_site: site,
          mining_area: area,
          material_type: material,
          actual_tons: actual,
          target_tons: target,
          grade_estimate: grade,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit production record');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onRecordCreated();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Log Mining Shift Production</h3>
            <p className="text-xs text-slate-400">Record actual vs target tons for daily operational telemetry</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-950/50 border border-rose-800 rounded-md">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-800 rounded-md">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Shift record saved! Dashboard recalibrating...</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Mine Site</label>
              <select
                value={site}
                onChange={e => setSite(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-500"
              >
                {sites.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Mining Area</label>
              <select
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-500"
              >
                {areas.map(a => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Material Category</label>
              <select
                value={material}
                onChange={e => setMaterial(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-500"
              >
                {materials.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Estimated Grade</label>
              <input
                type="text"
                value={grade}
                onChange={e => setGrade(e.target.value)}
                placeholder="e.g. 0.85% Cu, 62% Fe"
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Actual Production (Metric Tons)</label>
              <input
                type="number"
                required
                min="0"
                step="10"
                value={actualTons}
                onChange={e => setActualTons(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Plan (Metric Tons)</label>
              <input
                type="number"
                required
                min="1"
                step="10"
                value={targetTons}
                onChange={e => setTargetTons(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-md text-xs border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-400">Calculated Shift Variance:</span>
            <span
              className={`font-mono font-semibold ${
                parseFloat(actualTons) >= parseFloat(targetTons) ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {parseFloat(actualTons) >= parseFloat(targetTons) ? '+' : ''}
              {Math.round(parseFloat(actualTons) - parseFloat(targetTons) || 0).toLocaleString()} tons (
              {(
                ((parseFloat(actualTons) || 0) / (parseFloat(targetTons) || 1)) *
                100
              ).toFixed(1)}
              %)
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
            >
              {loading ? 'Recording Shift...' : 'Save Shift Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
