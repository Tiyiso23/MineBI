export interface ProductionRecord {
  production_id: string;
  production_date: string;
  mine_site: string;
  mining_area: string;
  material_type: string;
  actual_tons: number;
  target_tons: number;
  grade_estimate: string;
}

export interface EquipmentRecord {
  equipment_id: string;
  equipment_name: string;
  equipment_type: 'Haul Truck' | 'Excavator' | 'Blast Hole Drill' | 'Crusher' | 'Wheel Loader' | 'Dozer';
  mine_site: string;
  operating_hours: number;
  available_hours: number;
  downtime_hours: number;
  scheduled_hours: number;
  status: 'Operational' | 'Maintenance' | 'Standby' | 'Breakdown';
  health_score: number;
  fuel_liters_per_hr: number;
  last_service_date: string;
  availability_pct?: number;
  downtime_pct?: number;
}

export interface MaintenanceRecord {
  maintenance_id: string;
  equipment_id: string;
  equipment_name: string;
  maintenance_date: string;
  maintenance_type: 'Preventive' | 'Corrective';
  downtime_hours: number;
  cost_usd: number;
  cost_zar?: number;
  description: string;
  technician: string;
  component: string;
}

export interface CostRecord {
  date: string;
  mine_site: string;
  category: string;
  amount_usd: number;
  amount_zar?: number;
  tons_produced: number;
}

export interface ExecutiveKPIs {
  total_actual_tons: number;
  total_target_tons: number;
  production_achievement_pct: number;
  production_variance_tons: number;
  equipment_availability_pct: number;
  total_operating_hours: number;
  total_downtime_hours: number;
  downtime_pct: number;
  total_operating_cost_usd: number;
  total_operating_cost_zar?: number;
  cost_per_ton_usd: number;
  cost_per_ton_zar?: number;
  total_equipment: number;
  operational_equipment: number;
  maintenance_alerts: number;
}

export interface SiteSummary {
  site: string;
  actual_tons: number;
  target_tons: number;
  achievement_pct: number;
  availability_pct: number;
  equipment_count: number;
  active_units: number;
}

export interface TrendPoint {
  date: string;
  actual_tons: number;
  target_tons: number;
  variance: number;
  achievement_pct: number;
}

export interface DashboardSummaryResponse {
  kpis: ExecutiveKPIs;
  site_summaries: SiteSummary[];
  production_trend: TrendPoint[];
  generated_at: string;
}

export interface AnomalyAlert {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  recommended_action: string;
}

export interface EquipmentRisk {
  equipment_id: string;
  risk_level: 'HIGH' | 'MEDIUM';
  reason: string;
  impact_tons_per_day: number;
}

export interface AIInsightsData {
  executive_summary: string;
  anomaly_alerts: AnomalyAlert[];
  production_forecast_note: string;
  equipment_risk_ranking: EquipmentRisk[];
  operational_efficiency_tips: string[];
}

export type UserRole = 'Mine Manager' | 'Production Manager' | 'Maintenance Manager' | 'Data Analyst' | 'Administrator';

export type ActiveTab =
  | 'executive'
  | 'production'
  | 'equipment'
  | 'maintenance'
  | 'financials'
  | 'ai-insights'
  | 'reports'
  | 'admin';
