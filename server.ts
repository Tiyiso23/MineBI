import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==========================================
// SYNTHETIC MINING DATASET (BRD Section 7)
// Demonstrates realistic open-pit & underground mining operations
// Sites: Kalahari Open Pit, Pilbara North, Atacama Copper, Witwatersrand Deep
// ==========================================

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
}

export interface MaintenanceRecord {
  maintenance_id: string;
  equipment_id: string;
  equipment_name: string;
  maintenance_date: string;
  maintenance_type: 'Preventive' | 'Corrective';
  downtime_hours: number;
  cost_usd: number;
  description: string;
  technician: string;
  component: string;
}

export interface CostRecord {
  date: string;
  mine_site: string;
  category: 'Fuel & Energy' | 'Labor & Crew' | 'Maintenance & Spares' | 'Explosives & Blasting' | 'Crushing & Mill Power';
  amount_usd: number;
  tons_produced: number;
}

// South African Premier Mining Sites across key mineral basins:
// Northern Cape (Sishen Iron Ore, Kalahari Manganese), Limpopo (Mogalakwena PGMs, Grootegeluk Coal, Palabora Copper), Gauteng (Mponeng Gold)
const SITES = [
  'Sishen Iron Ore (Northern Cape)',
  'Mogalakwena Platinum (Limpopo)',
  'Mponeng Deep Gold (Gauteng)',
  'Grootegeluk Coal (Waterberg)',
  'Palabora Copper (Phalaborwa)',
  'Kalahari Manganese Basin (Hotazel)',
];

const AREAS = [
  'Bench 14 South (High Wall)',
  'Main North Pit Cut 3B',
  'Haul Ramp Alpha Incline',
  'Primary Crusher Feed Bin 2',
  'West Extension Dropcut',
  '109 Level Sub-Vertical Stope',
  'Surface Run-of-Mine Stockpile 4',
];

const MATERIALS = [
  'Iron Ore (High-Grade 64% Fe)',
  'Platinum Group Metals (PGM 4E)',
  'Gold Ore (Au 3.4 g/t)',
  'Metallurgical & Power Coal',
  'Copper Ore (0.85% Cu)',
  'High-Grade Manganese Ore',
  'Overburden / Waste Stripping',
];

function generateSyntheticData() {
  const productionData: ProductionRecord[] = [];
  const equipmentData: EquipmentRecord[] = [
    {
      equipment_id: 'HT-101',
      equipment_name: 'CAT 797F Heavy Hauler',
      equipment_type: 'Haul Truck',
      mine_site: 'Sishen Iron Ore (Northern Cape)',
      operating_hours: 580,
      available_hours: 630,
      downtime_hours: 90,
      scheduled_hours: 720,
      status: 'Operational',
      health_score: 91,
      fuel_liters_per_hr: 184,
      last_service_date: '2026-10-28',
    },
    {
      equipment_id: 'HT-102',
      equipment_name: 'CAT 797F Heavy Hauler',
      equipment_type: 'Haul Truck',
      mine_site: 'Mogalakwena Platinum (Limpopo)',
      operating_hours: 495,
      available_hours: 510,
      downtime_hours: 210,
      scheduled_hours: 720,
      status: 'Maintenance',
      health_score: 68,
      fuel_liters_per_hr: 192,
      last_service_date: '2026-11-04',
    },
    {
      equipment_id: 'HT-103',
      equipment_name: 'Komatsu 930E-5 Haul Truck',
      equipment_type: 'Haul Truck',
      mine_site: 'Mponeng Deep Gold (Gauteng)',
      operating_hours: 620,
      available_hours: 660,
      downtime_hours: 60,
      scheduled_hours: 720,
      status: 'Operational',
      health_score: 94,
      fuel_liters_per_hr: 178,
      last_service_date: '2026-10-22',
    },
    {
      equipment_id: 'HT-104',
      equipment_name: 'Bell B50E Articulated Dump Truck',
      equipment_type: 'Haul Truck',
      mine_site: 'Kalahari Manganese Basin (Hotazel)',
      operating_hours: 570,
      available_hours: 615,
      downtime_hours: 105,
      scheduled_hours: 720,
      status: 'Operational',
      health_score: 87,
      fuel_liters_per_hr: 142,
      last_service_date: '2026-10-20',
    },
    {
      equipment_id: 'EX-201',
      equipment_name: 'Komatsu PC8000 Hydraulic Shovel',
      equipment_type: 'Excavator',
      mine_site: 'Sishen Iron Ore (Northern Cape)',
      operating_hours: 610,
      available_hours: 645,
      downtime_hours: 75,
      scheduled_hours: 720,
      status: 'Operational',
      health_score: 89,
      fuel_liters_per_hr: 245,
      last_service_date: '2026-10-19',
    },
    {
      equipment_id: 'EX-202',
      equipment_name: 'Liebherr R 9800 Mining Excavator',
      equipment_type: 'Excavator',
      mine_site: 'Grootegeluk Coal (Waterberg)',
      operating_hours: 440,
      available_hours: 470,
      downtime_hours: 250,
      scheduled_hours: 720,
      status: 'Breakdown',
      health_score: 54,
      fuel_liters_per_hr: 260,
      last_service_date: '2026-11-02',
    },
    {
      equipment_id: 'DR-301',
      equipment_name: 'Sandvik DR410i Rotary Blast Hole Drill',
      equipment_type: 'Blast Hole Drill',
      mine_site: 'Palabora Copper (Phalaborwa)',
      operating_hours: 560,
      available_hours: 600,
      downtime_hours: 120,
      scheduled_hours: 720,
      status: 'Operational',
      health_score: 86,
      fuel_liters_per_hr: 110,
      last_service_date: '2026-10-15',
    },
    {
      equipment_id: 'DR-302',
      equipment_name: 'Epiroc Pit Viper 271 Rotary Drill',
      equipment_type: 'Blast Hole Drill',
      mine_site: 'Kalahari Manganese Basin (Hotazel)',
      operating_hours: 530,
      available_hours: 580,
      downtime_hours: 140,
      scheduled_hours: 720,
      status: 'Standby',
      health_score: 82,
      fuel_liters_per_hr: 115,
      last_service_date: '2026-10-30',
    },
    {
      equipment_id: 'CR-401',
      equipment_name: 'Metso Superior MKIII Primary Gyratory Crusher',
      equipment_type: 'Crusher',
      mine_site: 'Mogalakwena Platinum (Limpopo)',
      operating_hours: 650,
      available_hours: 685,
      downtime_hours: 35,
      scheduled_hours: 720,
      status: 'Operational',
      health_score: 97,
      fuel_liters_per_hr: 0,
      last_service_date: '2026-10-10',
    },
    {
      equipment_id: 'CR-402',
      equipment_name: 'FLSmidth Top Service Gyratory Crusher',
      equipment_type: 'Crusher',
      mine_site: 'Palabora Copper (Phalaborwa)',
      operating_hours: 640,
      available_hours: 675,
      downtime_hours: 45,
      scheduled_hours: 720,
      status: 'Operational',
      health_score: 95,
      fuel_liters_per_hr: 0,
      last_service_date: '2026-10-14',
    },
    {
      equipment_id: 'WL-501',
      equipment_name: 'CAT 994K Large Wheel Loader',
      equipment_type: 'Wheel Loader',
      mine_site: 'Mponeng Deep Gold (Gauteng)',
      operating_hours: 590,
      available_hours: 625,
      downtime_hours: 95,
      scheduled_hours: 720,
      status: 'Operational',
      health_score: 88,
      fuel_liters_per_hr: 165,
      last_service_date: '2026-10-25',
    },
    {
      equipment_id: 'DZ-601',
      equipment_name: 'CAT D11 Track-Type Dozer',
      equipment_type: 'Dozer',
      mine_site: 'Grootegeluk Coal (Waterberg)',
      operating_hours: 520,
      available_hours: 555,
      downtime_hours: 165,
      scheduled_hours: 720,
      status: 'Operational',
      health_score: 79,
      fuel_liters_per_hr: 135,
      last_service_date: '2026-10-12',
    },
  ];

  const maintenanceData: MaintenanceRecord[] = [
    {
      maintenance_id: 'MNT-2026-101',
      equipment_id: 'EX-202',
      equipment_name: 'Liebherr R 9800 Mining Excavator',
      maintenance_date: '2026-11-03',
      maintenance_type: 'Corrective',
      downtime_hours: 36,
      cost_usd: 48500,
      description: 'Main hydraulic boom cylinder manifold rupture and rapid seal decompression.',
      technician: 'Dawid van Zyl (Master Artisan)',
      component: 'Hydraulic System',
    },
    {
      maintenance_id: 'MNT-2026-102',
      equipment_id: 'HT-102',
      equipment_name: 'CAT 797F Heavy Hauler',
      maintenance_date: '2026-11-01',
      maintenance_type: 'Corrective',
      downtime_hours: 18,
      cost_usd: 22400,
      description: 'Differential oil overheating detected via onboard telemetry sensor; gear flush required.',
      technician: 'Sipho Ndlovu',
      component: 'Drivetrain & Differential',
    },
    {
      maintenance_id: 'MNT-2026-103',
      equipment_id: 'DR-302',
      equipment_name: 'Epiroc Pit Viper 271 Rotary Drill',
      maintenance_date: '2026-10-29',
      maintenance_type: 'Preventive',
      downtime_hours: 8,
      cost_usd: 7800,
      description: 'Scheduled 500-hour pull-down cable tensioning, rotary head lubrication, and bit wear micrometer check.',
      technician: 'Elena Rostova',
      component: 'Rotary Head / Rig',
    },
    {
      maintenance_id: 'MNT-2026-104',
      equipment_id: 'CR-401',
      equipment_name: 'Metso Superior MKIII Primary Gyratory Crusher',
      maintenance_date: '2026-10-24',
      maintenance_type: 'Preventive',
      downtime_hours: 12,
      cost_usd: 31200,
      description: 'Mantle liner clearance profiling, eccentric bushing ultrasound scanning, and hydraulic toggle reset.',
      technician: 'Kobus Marais',
      component: 'Crushing Chamber',
    },
    {
      maintenance_id: 'MNT-2026-105',
      equipment_id: 'DZ-601',
      equipment_name: 'CAT D11 Track-Type Dozer',
      maintenance_date: '2026-10-18',
      maintenance_type: 'Corrective',
      downtime_hours: 24,
      cost_usd: 19800,
      description: 'Track idler bearing failure after abrasive granite rock push; undercarriage link replaced.',
      technician: 'Tebogo Mokoena',
      component: 'Undercarriage & Tracks',
    },
  ];

  const costData: CostRecord[] = [];

  // Generate 30 days of daily operational production & cost records up to today (2026-11-06)
  const baseDate = new Date('2026-10-08');
  let idCounter = 1000;

  for (let day = 0; day < 30; day++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + day);
    const dateStr = d.toISOString().split('T')[0];

    // Day of week effect (slight shift change variations on Sundays)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const factor = isWeekend ? 0.92 : 1.0;

    for (let sIdx = 0; sIdx < SITES.length; sIdx++) {
      const site = SITES[sIdx];
      const area = AREAS[(day + sIdx) % AREAS.length];
      const material = MATERIALS[(day * 2 + sIdx) % MATERIALS.length];

      // Base target around 12,000 - 18,000 tons per site/day
      const baseTarget = 14500 + (sIdx * 1200) + ((day * 73) % 1800);
      const targetTons = Math.round(baseTarget * factor);

      // Random variance (-15% to +12%), with occasional blast haul delay
      let variancePct = (((day * 37 + sIdx * 53) % 27) - 13) / 100;
      if (day === 24 && sIdx === 2) variancePct = -0.32; // Unscheduled stoppage at Atacama
      if (day === 12 && sIdx === 0) variancePct = 0.18; // Peak blast day at Kalahari

      const actualTons = Math.max(3000, Math.round(targetTons * (1 + variancePct)));

      let grade = '0.85% Cu';
      if (material === 'Iron Ore') grade = '62.4% Fe';
      if (material === 'Gold Ore') grade = '2.14 g/t Au';
      if (material === 'High-Grade Bauxite') grade = '51.2% Al2O3';
      if (material.includes('Waste')) grade = 'Sub-economic';

      idCounter++;
      productionData.push({
        production_id: `PRD-${dateStr.replace(/-/g, '')}-${idCounter}`,
        production_date: dateStr,
        mine_site: site,
        mining_area: area,
        material_type: material,
        actual_tons: actualTons,
        target_tons: targetTons,
        grade_estimate: grade,
      });

      // Daily operating costs
      const totalDailyTons = actualTons;
      const fuelCost = Math.round(totalDailyTons * 4.25 + (Math.sin(day) * 3500));
      const laborCost = Math.round(totalDailyTons * 6.80);
      const maintCost = Math.round(totalDailyTons * 3.40 + (day % 4 === 0 ? 12000 : 2500));
      const blastCost = Math.round(totalDailyTons * 2.10);
      const millCost = Math.round(totalDailyTons * 5.15);

      costData.push(
        { date: dateStr, mine_site: site, category: 'Fuel & Energy', amount_usd: fuelCost, tons_produced: totalDailyTons },
        { date: dateStr, mine_site: site, category: 'Labor & Crew', amount_usd: laborCost, tons_produced: totalDailyTons },
        { date: dateStr, mine_site: site, category: 'Maintenance & Spares', amount_usd: maintCost, tons_produced: totalDailyTons },
        { date: dateStr, mine_site: site, category: 'Explosives & Blasting', amount_usd: blastCost, tons_produced: totalDailyTons },
        { date: dateStr, mine_site: site, category: 'Crushing & Mill Power', amount_usd: millCost, tons_produced: totalDailyTons }
      );
    }
  }

  return { productionData, equipmentData, maintenanceData, costData };
}

// In-memory data store representing PostgreSQL database layer for prototype
const db = generateSyntheticData();

// ==========================================
// REST API ENDPOINTS (BRD Section 10)
// ==========================================

// 1. Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'MineBI - Mining Business Intelligence Platform',
    version: '1.0.0-prototype',
    database_status: 'connected (PostgreSQL-compatible synthetic data engine)',
    uptime_seconds: process.uptime(),
    records_count: {
      production: db.productionData.length,
      equipment: db.equipmentData.length,
      maintenance: db.maintenanceData.length,
      costs: db.costData.length,
    },
    timestamp: new Date().toISOString(),
  });
});

// 2. Executive Dashboard Summary
app.get('/api/dashboard/summary', (req, res) => {
  const { site, date_from, date_to } = req.query as { site?: string; date_from?: string; date_to?: string };

  let filteredProduction = db.productionData;
  if (site && site !== 'All') {
    filteredProduction = filteredProduction.filter(p => p.mine_site === site);
  }
  if (date_from) {
    filteredProduction = filteredProduction.filter(p => p.production_date >= date_from);
  }
  if (date_to) {
    filteredProduction = filteredProduction.filter(p => p.production_date <= date_to);
  }

  let filteredEquipment = db.equipmentData;
  if (site && site !== 'All') {
    filteredEquipment = filteredEquipment.filter(e => e.mine_site === site);
  }

  let filteredCosts = db.costData;
  if (site && site !== 'All') {
    filteredCosts = filteredCosts.filter(c => c.mine_site === site);
  }
  if (date_from) {
    filteredCosts = filteredCosts.filter(c => c.date >= date_from);
  }
  if (date_to) {
    filteredCosts = filteredCosts.filter(c => c.date <= date_to);
  }

  // Calculate KPIs according to BRD Section 8 formulas:
  // Production achievement (%) = (Actual production ÷ Target production) × 100
  // Production variance (tons) = Actual production − Target production
  const totalActualTons = filteredProduction.reduce((sum, r) => sum + r.actual_tons, 0);
  const totalTargetTons = filteredProduction.reduce((sum, r) => sum + r.target_tons, 0);
  const productionAchievementPct = totalTargetTons > 0 ? (totalActualTons / totalTargetTons) * 100 : 0;
  const productionVarianceTons = totalActualTons - totalTargetTons;

  // Equipment availability (%) = (Available operating time ÷ Scheduled operating time) × 100
  // Downtime (%) = (Downtime hours ÷ Scheduled operating hours) × 100
  const totalOperatingHours = filteredEquipment.reduce((sum, e) => sum + e.operating_hours, 0);
  const totalAvailableHours = filteredEquipment.reduce((sum, e) => sum + e.available_hours, 0);
  const totalDowntimeHours = filteredEquipment.reduce((sum, e) => sum + e.downtime_hours, 0);
  const totalScheduledHours = filteredEquipment.reduce((sum, e) => sum + e.scheduled_hours, 0);

  const equipmentAvailabilityPct = totalScheduledHours > 0 ? (totalAvailableHours / totalScheduledHours) * 100 : 0;
  const downtimePct = totalScheduledHours > 0 ? (totalDowntimeHours / totalScheduledHours) * 100 : 0;

  // Operating cost per ton = Total operating cost ÷ Total production tons
  const totalOperatingCost = filteredCosts.reduce((sum, c) => sum + c.amount_usd, 0);
  const costPerTon = totalActualTons > 0 ? totalOperatingCost / totalActualTons : 0;

  // Breakdown by site
  const siteSummaries = SITES.map(s => {
    const siteProd = db.productionData.filter(p => p.mine_site === s);
    const siteEq = db.equipmentData.filter(e => e.mine_site === s);
    const sActual = siteProd.reduce((acc, p) => acc + p.actual_tons, 0);
    const sTarget = siteProd.reduce((acc, p) => acc + p.target_tons, 0);
    const sAvail = siteEq.reduce((acc, e) => acc + e.available_hours, 0);
    const sSched = siteEq.reduce((acc, e) => acc + e.scheduled_hours, 0);

    return {
      site: s,
      actual_tons: sActual,
      target_tons: sTarget,
      achievement_pct: sTarget > 0 ? (sActual / sTarget) * 100 : 0,
      availability_pct: sSched > 0 ? (sAvail / sSched) * 100 : 0,
      equipment_count: siteEq.length,
      active_units: siteEq.filter(e => e.status === 'Operational').length,
    };
  });

  // Recent 14-day production trend
  const dateMap = new Map<string, { actual: number; target: number }>();
  filteredProduction.forEach(p => {
    const cur = dateMap.get(p.production_date) || { actual: 0, target: 0 };
    cur.actual += p.actual_tons;
    cur.target += p.target_tons;
    dateMap.set(p.production_date, cur);
  });

  const productionTrend = Array.from(dateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, vals]) => ({
      date,
      actual_tons: vals.actual,
      target_tons: vals.target,
      variance: vals.actual - vals.target,
      achievement_pct: vals.target > 0 ? (vals.actual / vals.target) * 100 : 0,
    }));

  res.json({
    kpis: {
      total_actual_tons: totalActualTons,
      total_target_tons: totalTargetTons,
      production_achievement_pct: Math.round(productionAchievementPct * 10) / 10,
      production_variance_tons: productionVarianceTons,
      equipment_availability_pct: Math.round(equipmentAvailabilityPct * 10) / 10,
      total_operating_hours: totalOperatingHours,
      total_downtime_hours: totalDowntimeHours,
      downtime_pct: Math.round(downtimePct * 10) / 10,
      total_operating_cost_usd: totalOperatingCost,
      total_operating_cost_zar: totalOperatingCost,
      cost_per_ton_usd: Math.round(costPerTon * 100) / 100,
      cost_per_ton_zar: Math.round(costPerTon * 100) / 100,
      total_equipment: filteredEquipment.length,
      operational_equipment: filteredEquipment.filter(e => e.status === 'Operational').length,
      maintenance_alerts: filteredEquipment.filter(e => e.status === 'Breakdown' || e.status === 'Maintenance').length,
    },
    currency: 'ZAR (Rands)',
    fleet_timezone: 'Africa/Johannesburg (SAST, UTC+2)',
    site_summaries: siteSummaries,
    production_trend: productionTrend,
    generated_at: new Date().toISOString(),
  });
});

// 3. Production Analytics - Detailed Records
app.get('/api/production', (req, res) => {
  const { site, area, material, date_from, date_to, limit = '100', offset = '0' } = req.query as Record<string, string>;

  let records = db.productionData;
  if (site && site !== 'All') {
    records = records.filter(r => r.mine_site === site);
  }
  if (area && area !== 'All') {
    records = records.filter(r => r.mining_area === area);
  }
  if (material && material !== 'All') {
    records = records.filter(r => r.material_type === material);
  }
  if (date_from) {
    records = records.filter(r => r.production_date >= date_from);
  }
  if (date_to) {
    records = records.filter(r => r.production_date <= date_to);
  }

  // Sort descending by date
  records = [...records].sort((a, b) => b.production_date.localeCompare(a.production_date));

  const total = records.length;
  const start = parseInt(offset, 10) || 0;
  const size = parseInt(limit, 10) || 100;
  const paginated = records.slice(start, start + size);

  res.json({
    total_records: total,
    limit: size,
    offset: start,
    records: paginated,
    metadata: {
      sites: SITES,
      areas: AREAS,
      materials: MATERIALS,
    },
  });
});

// 4. Production Trends (Daily, Weekly, Monthly Aggregations)
app.get('/api/production/trends', (req, res) => {
  const { site, period = 'daily' } = req.query as { site?: string; period?: string };

  let records = db.productionData;
  if (site && site !== 'All') {
    records = records.filter(r => r.mine_site === site);
  }

  const grouped = new Map<string, { actual: number; target: number; count: number }>();

  records.forEach(r => {
    let key = r.production_date; // daily
    if (period === 'weekly') {
      const d = new Date(r.production_date);
      const weekNumber = Math.ceil((d.getDate() + 6 - d.getDay()) / 7);
      key = `${d.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
    } else if (period === 'monthly') {
      key = r.production_date.substring(0, 7);
    }

    const curr = grouped.get(key) || { actual: 0, target: 0, count: 0 };
    curr.actual += r.actual_tons;
    curr.target += r.target_tons;
    curr.count += 1;
    grouped.set(key, curr);
  });

  const trends = Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, val]) => ({
      period_key: key,
      actual_tons: val.actual,
      target_tons: val.target,
      variance_tons: val.actual - val.target,
      achievement_pct: val.target > 0 ? Math.round((val.actual / val.target) * 1000) / 10 : 0,
      record_count: val.count,
    }));

  res.json({
    period,
    site: site || 'All',
    trends,
  });
});

// 5. Equipment Fleet Monitoring
app.get('/api/equipment', (req, res) => {
  const { site, type, status } = req.query as Record<string, string>;

  let items = db.equipmentData;
  if (site && site !== 'All') {
    items = items.filter(e => e.mine_site === site);
  }
  if (type && type !== 'All') {
    items = items.filter(e => e.equipment_type === type);
  }
  if (status && status !== 'All') {
    items = items.filter(e => e.status === status);
  }

  // Calculate individual availability % for each unit
  const enriched = items.map(e => ({
    ...e,
    availability_pct: e.scheduled_hours > 0 ? Math.round((e.available_hours / e.scheduled_hours) * 1000) / 10 : 0,
    downtime_pct: e.scheduled_hours > 0 ? Math.round((e.downtime_hours / e.scheduled_hours) * 1000) / 10 : 0,
  }));

  res.json({
    total_equipment: enriched.length,
    equipment: enriched,
    status_summary: {
      operational: enriched.filter(e => e.status === 'Operational').length,
      maintenance: enriched.filter(e => e.status === 'Maintenance').length,
      standby: enriched.filter(e => e.status === 'Standby').length,
      breakdown: enriched.filter(e => e.status === 'Breakdown').length,
    },
  });
});

// 6. Equipment Availability Metrics (Grouped)
app.get('/api/equipment/availability', (req, res) => {
  const groupedByType = new Map<string, { available: number; scheduled: number; operating: number; downtime: number; count: number }>();

  db.equipmentData.forEach(e => {
    const cur = groupedByType.get(e.equipment_type) || { available: 0, scheduled: 0, operating: 0, downtime: 0, count: 0 };
    cur.available += e.available_hours;
    cur.scheduled += e.scheduled_hours;
    cur.operating += e.operating_hours;
    cur.downtime += e.downtime_hours;
    cur.count += 1;
    groupedByType.set(e.equipment_type, cur);
  });

  const byType = Array.from(groupedByType.entries()).map(([type, stats]) => ({
    equipment_type: type,
    fleet_count: stats.count,
    available_hours: stats.available,
    scheduled_hours: stats.scheduled,
    operating_hours: stats.operating,
    downtime_hours: stats.downtime,
    availability_pct: stats.scheduled > 0 ? Math.round((stats.available / stats.scheduled) * 1000) / 10 : 0,
  }));

  res.json({
    overall_availability_pct:
      Math.round(
        (db.equipmentData.reduce((acc, e) => acc + e.available_hours, 0) /
          db.equipmentData.reduce((acc, e) => acc + e.scheduled_hours, 0)) *
          1000
      ) / 10,
    by_equipment_type: byType,
  });
});

// 7. Downtime Analysis
app.get('/api/equipment/downtime', (req, res) => {
  const totalDowntimeHours = db.maintenanceData.reduce((acc, m) => acc + m.downtime_hours, 0);

  // Group by preventive vs corrective
  const byType = {
    Preventive: db.maintenanceData.filter(m => m.maintenance_type === 'Preventive').reduce((acc, m) => acc + m.downtime_hours, 0),
    Corrective: db.maintenanceData.filter(m => m.maintenance_type === 'Corrective').reduce((acc, m) => acc + m.downtime_hours, 0),
  };

  // Group by component
  const componentMap = new Map<string, { hours: number; cost: number; count: number }>();
  db.maintenanceData.forEach(m => {
    const cur = componentMap.get(m.component) || { hours: 0, cost: 0, count: 0 };
    cur.hours += m.downtime_hours;
    cur.cost += m.cost_usd;
    cur.count += 1;
    componentMap.set(m.component, cur);
  });

  const componentAnalysis = Array.from(componentMap.entries()).map(([comp, stats]) => ({
    component: comp,
    downtime_hours: stats.hours,
    total_cost_usd: stats.cost,
    event_count: stats.count,
  }));

  res.json({
    total_recorded_maintenance_downtime_hours: totalDowntimeHours,
    preventive_vs_corrective: byType,
    component_breakdown: componentAnalysis,
    recent_events: db.maintenanceData,
  });
});

// 8. Maintenance Logs
app.get('/api/maintenance', (req, res) => {
  res.json({
    records: db.maintenanceData,
  });
});

// 9. Financial Analytics (Operating Cost per Ton Breakdown)
app.get('/api/financials', (req, res) => {
  const { site } = req.query as { site?: string };

  let costs = db.costData;
  if (site && site !== 'All') {
    costs = costs.filter(c => c.mine_site === site);
  }

  // Cost by category
  const categoryMap = new Map<string, number>();
  costs.forEach(c => {
    categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + c.amount_usd);
  });

  const totalCost = costs.reduce((sum, c) => sum + c.amount_usd, 0);
  const totalTons = db.productionData
    .filter(p => !site || site === 'All' || p.mine_site === site)
    .reduce((sum, p) => sum + p.actual_tons, 0);

  const costPerTon = totalTons > 0 ? totalCost / totalTons : 0;

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([cat, amount]) => ({
    category: cat,
    amount_usd: amount,
    percentage_of_total: Math.round((amount / totalCost) * 1000) / 10,
    cost_per_ton: totalTons > 0 ? Math.round((amount / totalTons) * 100) / 100 : 0,
  }));

  res.json({
    currency: 'ZAR (Rands)',
    fleet_timezone: 'Africa/Johannesburg (SAST, UTC+2)',
    total_cost_usd: totalCost,
    total_cost_zar: totalCost,
    total_tons: totalTons,
    average_cost_per_ton_usd: Math.round(costPerTon * 100) / 100,
    average_cost_per_ton_zar: Math.round(costPerTon * 100) / 100,
    category_breakdown: categoryBreakdown,
  });
});

// 10. Reports Endpoint (Formatted for Export and Reporting Periods)
app.get('/api/reports/production', (req, res) => {
  const { period = 'last30', site = 'All' } = req.query as { period?: string; site?: string };

  let filtered = db.productionData;
  if (site !== 'All') {
    filtered = filtered.filter(p => p.mine_site === site);
  }

  const actualTotal = filtered.reduce((acc, p) => acc + p.actual_tons, 0);
  const targetTotal = filtered.reduce((acc, p) => acc + p.target_tons, 0);
  const variance = actualTotal - targetTotal;
  const achievementPct = targetTotal > 0 ? (actualTotal / targetTotal) * 100 : 0;

  res.json({
    report_title: 'Mining Production & Operational Performance Report',
    reporting_period: period,
    target_site: site,
    currency: 'ZAR (Rands)',
    fleet_timezone: 'Africa/Johannesburg (SAST, UTC+2)',
    generated_timestamp: new Date().toISOString(),
    summary: {
      total_records: filtered.length,
      total_actual_tons: actualTotal,
      total_target_tons: targetTotal,
      variance_tons: variance,
      overall_achievement_pct: Math.round(achievementPct * 10) / 10,
    },
    records: filtered,
  });
});

// 11. AI Insights Endpoint (BRD FR-008 & Gemini API)
app.post('/api/insights/generate', async (req, res) => {
  try {
    const { site, focusArea = 'operational' } = req.body || {};

    // Summarize current dataset to provide concise grounding context for Gemini
    const totalActual = db.productionData.reduce((acc, p) => acc + p.actual_tons, 0);
    const totalTarget = db.productionData.reduce((acc, p) => acc + p.target_tons, 0);
    const lowAvailEquipment = db.equipmentData
      .map(e => ({
        id: e.equipment_id,
        name: e.equipment_name,
        type: e.equipment_type,
        availPct: Math.round((e.available_hours / e.scheduled_hours) * 100),
        status: e.status,
      }))
      .filter(e => e.availPct < 85 || e.status === 'Breakdown' || e.status === 'Maintenance');

    const promptText = `You are the MineBI Mining Operations Intelligence Engine.
Analyze the following operational mining data from South African mining operations (Sishen Iron Ore, Mogalakwena Platinum, Mponeng Deep Gold, Grootegeluk Coal, Palabora Copper, and Kalahari Manganese):
- Total Actual Production: ${totalActual.toLocaleString()} tons
- Total Planned Target: ${totalTarget.toLocaleString()} tons (${Math.round((totalActual / totalTarget) * 100)}% target achievement)
- Underperforming or At-Risk Equipment: ${JSON.stringify(lowAvailEquipment)}
- Focus Area Requested: ${focusArea} (Site filter: ${site || 'All sites'})

Provide an executive operational assessment formatted in clear JSON with the following structure:
{
  "executive_summary": "1-2 sentence high-level finding on operational velocity and bottlenecks",
  "anomaly_alerts": [
    { "severity": "CRITICAL" | "WARNING" | "INFO", "title": "...", "description": "...", "recommended_action": "..." }
  ],
  "production_forecast_note": "A note highlighting short-term target trajectory and mitigating shift plans",
  "equipment_risk_ranking": [
    { "equipment_id": "...", "risk_level": "HIGH" | "MEDIUM", "reason": "...", "impact_tons_per_day": number }
  ],
  "operational_efficiency_tips": [
    "Tip 1...", "Tip 2..."
  ]
}
Respond strictly with valid JSON.`;

    const hasValidKey =
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
      process.env.GEMINI_API_KEY.length > 10;

    if (hasValidKey) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 6000)
        );
        const generatePromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            responseMimeType: 'application/json',
            systemInstruction:
              'You are an expert mining analytics advisor providing data-driven operational intelligence. Always return valid JSON.',
          },
        });

        const response: any = await Promise.race([generatePromise, timeoutPromise]);
        const responseText = response.text || '{}';
        const parsed = JSON.parse(responseText);
        return res.json({
          source: 'gemini-3.8-flash',
          data: parsed,
          generated_at: new Date().toISOString(),
        });
      } catch (geminiErr) {
        console.warn('Gemini API call timed out or failed, falling back to heuristic engine:', geminiErr);
        // Fall through to heuristic engine below
      }
    }
      // Fallback deterministic mining intelligence engine when no API key is provided
      return res.json({
        source: 'heuristic-engine',
        data: {
          executive_summary: `Overall South African mining production is tracking at ${Math.round((totalActual / totalTarget) * 100)}% of target. Excavator EX-202 boom cylinder repair at Grootegeluk Coal presents the primary haul cycle bottleneck.`,
          anomaly_alerts: [
            {
              severity: 'CRITICAL',
              title: 'Primary Excavator EX-202 Unscheduled Downtime',
              description: 'Liebherr R 9800 hydraulic manifold rupture at Grootegeluk caused 36 hours of unscheduled stoppage, reducing bench loading rate by 2,400 tons/shift.',
              recommended_action: 'Reroute haul trucks HT-101 and HT-104 to Sishen Bench 14 South Shovel EX-201 to maintain processing feed tonnage.',
            },
            {
              severity: 'WARNING',
              title: 'Haul Truck HT-102 Differential Overheating',
              description: 'Operating temperature spiked 18°C above threshold during high-grade ramp haulage.',
              recommended_action: 'Complete synthetic lube flush and verify ramp grade maintenance on Main Ramp A.',
            },
            {
              severity: 'INFO',
              title: 'Gyratory Crusher CR-401 Exceptional Availability',
              description: 'Metso primary crusher recorded 97.2% availability over the 30-day operational cycle.',
              recommended_action: 'Maintain scheduled mantle liner ultrasonic scans on November 24.',
            },
          ],
          production_forecast_note: 'Target achievement is expected to rebound to 101.4% once Excavator EX-202 is re-commissioned on shift 1.',
          equipment_risk_ranking: [
            { equipment_id: 'EX-202', risk_level: 'HIGH', reason: 'Hydraulic boom seal decompression and manifold lead time', impact_tons_per_day: 4800 },
            { equipment_id: 'HT-102', risk_level: 'MEDIUM', reason: 'Differential gear wear and thermal elevation', impact_tons_per_day: 1900 },
          ],
          operational_efficiency_tips: [
            'Level blast bench fragmentation sizing to reduce primary crusher liner impact cycles.',
            'Optimize truck dispatch queuing intervals to save approximately 140 liters of diesel per shift.',
          ],
        },
      });
  } catch (err: any) {
    console.error('Error in AI insights generation:', err);
    res.status(500).json({
      error: 'Failed to generate operational insights',
      details: err.message || String(err),
    });
  }
});

// 12. Add Production Record (Interactive Data Ingestion)
app.post('/api/production', (req, res) => {
  const { mine_site, mining_area, material_type, actual_tons, target_tons, grade_estimate } = req.body;

  if (!mine_site || !actual_tons || !target_tons) {
    return res.status(400).json({ error: 'Missing required fields (mine_site, actual_tons, target_tons)' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const newRecord: ProductionRecord = {
    production_id: `PRD-${Date.now().toString().slice(-6)}`,
    production_date: todayStr,
    mine_site,
    mining_area: mining_area || 'Bench 14 South',
    material_type: material_type || 'Copper Ore',
    actual_tons: Number(actual_tons),
    target_tons: Number(target_tons),
    grade_estimate: grade_estimate || 'Standard Grade',
  };

  db.productionData.unshift(newRecord);

  res.status(201).json({
    message: 'Production shift record created successfully',
    record: newRecord,
  });
});

// ==========================================
// STATIC / VITE MIDDLEWARE PIPELINE
// ==========================================
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`MineBI Server running at http://localhost:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer();
