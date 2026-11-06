import { DashboardSummaryResponse, EquipmentRecord, MaintenanceRecord, ProductionRecord, AIInsightsData } from '../types/mining';

export const api = {
  async getHealth() {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getDashboardSummary(params: { site?: string; date_from?: string; date_to?: string } = {}): Promise<DashboardSummaryResponse> {
    const query = new URLSearchParams();
    if (params.site && params.site !== 'All') query.append('site', params.site);
    if (params.date_from) query.append('date_from', params.date_from);
    if (params.date_to) query.append('date_to', params.date_to);

    const res = await fetch(`/api/dashboard/summary?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  async getProductionRecords(params: {
    site?: string;
    area?: string;
    material?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.site && params.site !== 'All') query.append('site', params.site);
    if (params.area && params.area !== 'All') query.append('area', params.area);
    if (params.material && params.material !== 'All') query.append('material', params.material);
    if (params.date_from) query.append('date_from', params.date_from);
    if (params.date_to) query.append('date_to', params.date_to);
    if (params.limit) query.append('limit', String(params.limit));
    if (params.offset) query.append('offset', String(params.offset));

    const res = await fetch(`/api/production?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch production records');
    return res.json() as Promise<{
      total_records: number;
      limit: number;
      offset: number;
      records: ProductionRecord[];
      metadata: { sites: string[]; areas: string[]; materials: string[] };
    }>;
  },

  async getProductionTrends(params: { site?: string; period?: 'daily' | 'weekly' | 'monthly' } = {}) {
    const query = new URLSearchParams();
    if (params.site && params.site !== 'All') query.append('site', params.site);
    if (params.period) query.append('period', params.period);

    const res = await fetch(`/api/production/trends?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch production trends');
    return res.json();
  },

  async getEquipment(params: { site?: string; type?: string; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.site && params.site !== 'All') query.append('site', params.site);
    if (params.type && params.type !== 'All') query.append('type', params.type);
    if (params.status && params.status !== 'All') query.append('status', params.status);

    const res = await fetch(`/api/equipment?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch equipment');
    return res.json() as Promise<{
      total_equipment: number;
      equipment: EquipmentRecord[];
      status_summary: { operational: number; maintenance: number; standby: number; breakdown: number };
    }>;
  },

  async getEquipmentAvailability() {
    const res = await fetch('/api/equipment/availability');
    if (!res.ok) throw new Error('Failed to fetch equipment availability');
    return res.json();
  },

  async getDowntimeAnalysis() {
    const res = await fetch('/api/equipment/downtime');
    if (!res.ok) throw new Error('Failed to fetch downtime analysis');
    return res.json() as Promise<{
      total_recorded_maintenance_downtime_hours: number;
      preventive_vs_corrective: { Preventive: number; Corrective: number };
      component_breakdown: Array<{ component: string; downtime_hours: number; total_cost_usd: number; event_count: number }>;
      recent_events: MaintenanceRecord[];
    }>;
  },

  async getMaintenanceLogs() {
    const res = await fetch('/api/maintenance');
    if (!res.ok) throw new Error('Failed to fetch maintenance logs');
    return res.json() as Promise<{ records: MaintenanceRecord[] }>;
  },

  async getFinancials(site?: string) {
    const query = new URLSearchParams();
    if (site && site !== 'All') query.append('site', site);
    const res = await fetch(`/api/financials?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch financial analytics');
    return res.json() as Promise<{
      total_cost_usd: number;
      total_tons: number;
      average_cost_per_ton_usd: number;
      category_breakdown: Array<{
        category: string;
        amount_usd: number;
        percentage_of_total: number;
        cost_per_ton: number;
      }>;
    }>;
  },

  async getProductionReport(params: { period?: string; site?: string } = {}) {
    const query = new URLSearchParams();
    if (params.period) query.append('period', params.period);
    if (params.site && params.site !== 'All') query.append('site', params.site);

    const res = await fetch(`/api/reports/production?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch production report');
    return res.json();
  },

  async generateAIInsights(payload: { site?: string; focusArea?: string } = {}): Promise<{
    source: string;
    data: AIInsightsData;
    generated_at: string;
  }> {
    const res = await fetch('/api/insights/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate AI insights');
    return res.json();
  },

  async addProductionRecord(data: {
    mine_site: string;
    mining_area: string;
    material_type: string;
    actual_tons: number;
    target_tons: number;
    grade_estimate?: string;
  }) {
    const res = await fetch('/api/production', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit production record');
    }
    return res.json();
  },
};
