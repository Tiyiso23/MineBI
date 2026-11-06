import React, { useState, useEffect } from 'react';
import { EquipmentRecord } from '../types/mining';
import { api } from '../services/api';
import {
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Search,
  Fuel,
  Wrench,
  Gauge,
} from 'lucide-react';

interface EquipmentMonitoringProps {
  selectedSite: string;
  onSiteChange: (site: string) => void;
  onNavigateToMaintenance?: () => void;
}

export function EquipmentMonitoring({
  selectedSite,
  onSiteChange,
  onNavigateToMaintenance,
}: EquipmentMonitoringProps) {
  const [equipmentList, setEquipmentList] = useState<EquipmentRecord[]>([]);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusSummary, setStatusSummary] = useState({
    operational: 0,
    maintenance: 0,
    standby: 0,
    breakdown: 0,
  });

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await api.getEquipment({
        site: selectedSite,
        type: selectedType,
        status: selectedStatus,
      });
      setEquipmentList(res.equipment);
      setStatusSummary(res.status_summary);
    } catch (err) {
      console.error('Failed to load equipment', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [selectedSite, selectedType, selectedStatus]);

  const filteredEquipment = equipmentList.filter(e => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.equipment_id.toLowerCase().includes(term) ||
      e.equipment_name.toLowerCase().includes(term) ||
      e.mine_site.toLowerCase().includes(term) ||
      e.equipment_type.toLowerCase().includes(term)
    );
  });

  // Low availability alert threshold (< 85%)
  const lowAvailabilityCount = filteredEquipment.filter(
    e => (e.availability_pct || 0) < 85 || e.status === 'Breakdown'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Status Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Equipment Fleet Monitoring & Availability</h2>
          <p className="text-xs text-slate-400">
            Track mechanical availability, operating cycles, telemetry fuel burn, and maintenance alert thresholds · <span className="font-mono text-amber-400">Fleet Time: SAST (UTC+2)</span>
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-800/60 rounded-md text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{statusSummary.operational} Operational</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/40 border border-amber-800/60 rounded-md text-xs font-mono text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{statusSummary.maintenance + statusSummary.standby} Standby/Maint</span>
          </div>
          {statusSummary.breakdown > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/50 border border-rose-800/80 rounded-md text-xs font-mono text-rose-400 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{statusSummary.breakdown} Breakdown</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Asset Spotlight Cards: Haul Truck, Excavator, Gyratory Crusher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-44 flex flex-col justify-end p-4">
          <img
            src="/src/assets/images/equipment_haul_truck_1793964352422.jpg"
            alt="Haul Truck Fleet"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Heavy Haulage</span>
            <h4 className="text-sm font-semibold text-white">Ultra-Class Haul Trucks</h4>
            <p className="text-[11px] text-slate-300">CAT 797F & Komatsu 930E-5 payload haulers</p>
          </div>
        </div>

        <div className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-44 flex flex-col justify-end p-4">
          <img
            src="/src/assets/images/equipment_excavator_1793964353524.jpg"
            alt="Excavator Loading"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Primary Loading</span>
            <h4 className="text-sm font-semibold text-white">Hydraulic Mining Shovels</h4>
            <p className="text-[11px] text-slate-300">Komatsu PC8000 & Liebherr R 9800 bench diggers</p>
          </div>
        </div>

        <div className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-44 flex flex-col justify-end p-4">
          <img
            src="/src/assets/images/equipment_crusher_1793964353087.jpg"
            alt="Gyratory Crusher Plant"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Mineral Processing</span>
            <h4 className="text-sm font-semibold text-white">Primary Gyratory Crushers</h4>
            <p className="text-[11px] text-slate-300">Metso Superior MKIII continuous feed reduction</p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Mining Site</label>
          <select
            value={selectedSite}
            onChange={e => onSiteChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden"
          >
            <option value="All">All Mining Assets</option>
            <option value="Kalahari Open Pit">Kalahari Open Pit</option>
            <option value="Pilbara North">Pilbara North</option>
            <option value="Atacama Copper">Atacama Copper</option>
            <option value="Witwatersrand Deep">Witwatersrand Deep</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Equipment Category</label>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Haul Truck">Haul Truck</option>
            <option value="Excavator">Excavator</option>
            <option value="Blast Hole Drill">Blast Hole Drill</option>
            <option value="Crusher">Crusher</option>
            <option value="Wheel Loader">Wheel Loader</option>
            <option value="Dozer">Dozer</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Mechanical Status</label>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Operational">Operational</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Standby">Standby</option>
            <option value="Breakdown">Breakdown</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Search ID or Machine</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Critical Alert banner if low availability detected */}
      {lowAvailabilityCount > 0 && (
        <div className="p-4 bg-rose-950/30 border border-rose-800/60 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-rose-300">
                {lowAvailabilityCount} Equipment Units Below 85% Target Availability
              </span>
              <p className="text-slate-400 mt-0.5">
                Mechanical bottlenecks detected on Excavator EX-202 (Breakdown) and Haul Truck HT-102 (Differential Maintenance).
              </p>
            </div>
          </div>
          {onNavigateToMaintenance && (
            <button
              onClick={onNavigateToMaintenance}
              className="px-3 py-1.5 text-xs font-semibold text-rose-200 bg-rose-900/60 hover:bg-rose-900 rounded-md border border-rose-700 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              View Work Orders
            </button>
          )}
        </div>
      )}

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map(eq => {
          const availPct = eq.availability_pct || 0;
          const isCritical = availPct < 75 || eq.status === 'Breakdown';
          const isWarning = availPct < 85 && !isCritical;

          return (
            <div
              key={eq.equipment_id}
              className={`p-5 rounded-xl border bg-slate-900 space-y-4 transition-all ${
                isCritical
                  ? 'border-rose-800/80 shadow-rose-950/20 shadow-lg'
                  : isWarning
                  ? 'border-amber-800/60'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{eq.equipment_id}</span>
                    <span className="text-[10px] text-slate-500">·</span>
                    <span className="text-[11px] text-slate-400">{eq.equipment_type}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-0.5 line-clamp-1">{eq.equipment_name}</h3>
                  <span className="text-xs text-slate-400">{eq.mine_site}</span>
                </div>

                {/* Status Indicator */}
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-sm font-medium ${
                    eq.status === 'Operational'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                      : eq.status === 'Breakdown'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                      : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                  }`}
                >
                  {eq.status}
                </span>
              </div>

              {/* Availability Progress Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-400">Mechanical Availability</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      availPct >= 85 ? 'text-emerald-400' : availPct >= 75 ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {availPct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      availPct >= 85 ? 'bg-emerald-500' : availPct >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, availPct)}%` }}
                  />
                </div>
              </div>

              {/* Hours Breakdown Strip */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-800/80">
                <div className="p-2 bg-slate-800/50 rounded-md">
                  <span className="text-[10px] text-slate-400 block">Operating</span>
                  <span className="font-mono font-medium text-slate-200">{eq.operating_hours}h</span>
                </div>
                <div className="p-2 bg-slate-800/50 rounded-md">
                  <span className="text-[10px] text-slate-400 block">Available</span>
                  <span className="font-mono font-medium text-slate-200">{eq.available_hours}h</span>
                </div>
                <div className="p-2 bg-slate-800/50 rounded-md">
                  <span className="text-[10px] text-slate-400 block">Downtime</span>
                  <span
                    className={`font-mono font-medium ${
                      eq.downtime_hours > 150 ? 'text-rose-400' : 'text-slate-200'
                    }`}
                  >
                    {eq.downtime_hours}h
                  </span>
                </div>
              </div>

              {/* Telemetry Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                <span className="flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-slate-500" />
                  {eq.fuel_liters_per_hr > 0 ? `${eq.fuel_liters_per_hr} L/h` : 'Electric/Grid'}
                </span>
                <span className="flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-slate-500" />
                  Serviced: {eq.last_service_date}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
