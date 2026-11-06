/**
 * South African Premier Mining Assets & Operational Sites
 * Covers major mining regions: Northern Cape (Iron/Manganese), Limpopo (Platinum/Coal/Copper), Gauteng (Gold).
 */

export interface MiningSiteInfo {
  id: string;
  name: string;
  province: string;
  primaryCommodity: string;
  miningMethod: 'Open Cast / Pit' | 'Deep Underground' | 'Block Cave / Hybrid';
}

export const SOUTH_AFRICAN_SITES: MiningSiteInfo[] = [
  {
    id: 'sishen',
    name: 'Sishen Iron Ore (Northern Cape)',
    province: 'Northern Cape',
    primaryCommodity: 'Iron Ore (High Grade Fe)',
    miningMethod: 'Open Cast / Pit',
  },
  {
    id: 'mogalakwena',
    name: 'Mogalakwena Platinum (Limpopo)',
    province: 'Limpopo',
    primaryCommodity: 'Platinum Group Metals (PGMs)',
    miningMethod: 'Open Cast / Pit',
  },
  {
    id: 'mponeng',
    name: 'Mponeng Deep Gold (Gauteng)',
    province: 'Gauteng',
    primaryCommodity: 'Gold Ore (Deep Level Stopes)',
    miningMethod: 'Deep Underground',
  },
  {
    id: 'grootegeluk',
    name: 'Grootegeluk Coal (Waterberg)',
    province: 'Limpopo',
    primaryCommodity: 'Metallurgical & Power Coal',
    miningMethod: 'Open Cast / Pit',
  },
  {
    id: 'palabora',
    name: 'Palabora Copper (Phalaborwa)',
    province: 'Limpopo',
    primaryCommodity: 'Copper Ore & Magnetite',
    miningMethod: 'Block Cave / Hybrid',
  },
  {
    id: 'kalahari',
    name: 'Kalahari Manganese Basin (Hotazel)',
    province: 'Northern Cape',
    primaryCommodity: 'High-Grade Manganese',
    miningMethod: 'Open Cast / Pit',
  },
];

export const SA_SITE_NAMES = SOUTH_AFRICAN_SITES.map(s => s.name);

export const SA_MINING_AREAS = [
  'Bench 14 South (High Wall)',
  'Main North Pit Cut 3B',
  'Haul Ramp Alpha Incline',
  'Primary Crusher Feed Bin 2',
  'West Extension Dropcut',
  '109 Level Sub-Vertical Stope',
  'Surface Run-of-Mine Stockpile 4',
];

export const SA_MINING_MATERIALS = [
  'Iron Ore (High-Grade 64% Fe)',
  'Platinum Group Metals (PGM 4E)',
  'Gold Ore (Au 3.4 g/t)',
  'Metallurgical & Power Coal',
  'Copper Ore (0.85% Cu)',
  'High-Grade Manganese Ore',
  'Overburden / Waste Stripping',
];
