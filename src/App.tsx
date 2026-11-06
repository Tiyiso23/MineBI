import React, { useState, useEffect } from 'react';
import { ActiveTab, DashboardSummaryResponse, UserRole } from './types/mining';
import { api } from './services/api';
import { TopNav } from './components/TopNav';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { ProductionAnalytics } from './components/ProductionAnalytics';
import { EquipmentMonitoring } from './components/EquipmentMonitoring';
import { MaintenanceIntelligence } from './components/MaintenanceIntelligence';
import { FinancialAnalytics } from './components/FinancialAnalytics';
import { AIInsightsView } from './components/AIInsightsView';
import { ReportsView } from './components/ReportsView';
import { UserAdminView } from './components/UserAdminView';
import { NewShiftModal } from './components/NewShiftModal';
import {
  Layers,
  ShieldCheck,
  Cpu,
  Info,
} from 'lucide-react';

import { SA_SITE_NAMES, SA_MINING_AREAS, SA_MINING_MATERIALS } from './constants/miningSites';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('executive');
  const [selectedSite, setSelectedSite] = useState<string>('All');
  const [currentRole, setCurrentRole] = useState<UserRole>('Mine Manager');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // South African mining assets metadata for modal and filters
  const sites = SA_SITE_NAMES;
  const areas = SA_MINING_AREAS;
  const materials = SA_MINING_MATERIALS;

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardSummary({ site: selectedSite });
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedSite]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar (adheres to 3-zone Top Bar Contract) */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenNewShift={() => setIsShiftModalOpen(true)}
      />

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden flex items-center overflow-x-auto gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs no-scrollbar">
        {[
          { id: 'executive', label: 'Executive' },
          { id: 'production', label: 'Production' },
          { id: 'equipment', label: 'Equipment' },
          { id: 'maintenance', label: 'Maintenance' },
          { id: 'financials', label: 'Financials' },
          { id: 'ai-insights', label: 'AI Insights' },
          { id: 'reports', label: 'Reports' },
          { id: 'admin', label: 'Admin' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as ActiveTab)}
            className={`whitespace-nowrap px-3 py-1 rounded-md text-xs font-medium cursor-pointer ${
              activeTab === item.id
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'executive' && (
          <ExecutiveDashboard
            data={dashboardData}
            loading={loading}
            selectedSite={selectedSite}
            onSiteChange={setSelectedSite}
            currentRole={currentRole}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'production' && (
          <ProductionAnalytics
            selectedSite={selectedSite}
            onSiteChange={setSelectedSite}
            onOpenNewShift={() => setIsShiftModalOpen(true)}
          />
        )}

        {activeTab === 'equipment' && (
          <EquipmentMonitoring
            selectedSite={selectedSite}
            onSiteChange={setSelectedSite}
            onNavigateToMaintenance={() => setActiveTab('maintenance')}
          />
        )}

        {activeTab === 'maintenance' && <MaintenanceIntelligence />}

        {activeTab === 'financials' && (
          <FinancialAnalytics selectedSite={selectedSite} onSiteChange={setSelectedSite} />
        )}

        {activeTab === 'ai-insights' && <AIInsightsView selectedSite={selectedSite} />}

        {activeTab === 'reports' && <ReportsView selectedSite={selectedSite} />}

        {activeTab === 'admin' && (
          <UserAdminView currentRole={currentRole} onRoleChange={setCurrentRole} />
        )}
      </main>

      {/* Log Shift Modal */}
      <NewShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onRecordCreated={() => {
          loadDashboardData();
        }}
        sites={sites}
        areas={areas}
        materials={materials}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-300">MineBI</span>
            <span>·</span>
            <span>Mining Business Intelligence & Operational Data Analytics Platform</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-400">
            <span className="text-amber-400">Fleet Time: SAST (UTC+2)</span>
            <span>·</span>
            <span className="text-slate-300">Currency: ZAR (R)</span>
            <span>·</span>
            <span>Synthetic Demonstration Dataset (BRD Sec. 7)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
