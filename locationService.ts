
/**
 * Detailed mapping for Bangladesh Agro-Ecological Zones (AEZ)
 * Data source: SRDI (Soil Resource Development Institute) - Official Legend 2020
 */

export interface NutrientLevels {
  n: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  p: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  k: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  s: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  zn: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  b: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  ca: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  mg: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  fe: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  mn?: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  cu?: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  mo?: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  cl?: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  ni?: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  c?: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  h?: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  o?: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  om: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'; // Organic Matter
  cec?: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'; // Cation Exchange Capacity
}

export interface AEZInfo {
  id: number;
  name: string;
  lat: number;
  lng: number;
  soilType: string;
  texture: string;
  topography: string;
  phRange: string;
  nutrients: NutrientLevels;
}

export interface StoredLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

/**
 * Official SRDI/BARC 2020-2024 Nutrient Status Ranges
 * Units: OM (%), N (%), K/Ca/Mg (meq/100g), P/S/Zn/B/Fe (µg/g)
 */
export const NUTRIENT_REFERENCE_RANGES: Record<keyof NutrientLevels, Record<string, string>> = {
  om: { 'Very Low': '< 1.0%', 'Low': '1.0 - 1.7%', 'Medium': '1.71 - 3.4%', 'High': '3.41 - 5.5%', 'Very High': '> 5.5%' },
  n: { 'Very Low': '< 0.075%', 'Low': '0.075 - 0.15%', 'Medium': '0.151 - 0.225%', 'High': '0.226 - 0.30%', 'Very High': '> 0.30%' },
  p: { 'Very Low': '< 7.5', 'Low': '7.5 - 15.0', 'Medium': '15.1 - 22.5', 'High': '22.51 - 30.0', 'Very High': '> 30.0' },
  k: { 'Very Low': '< 0.075', 'Low': '0.075 - 0.15', 'Medium': '0.151 - 0.225', 'High': '0.226 - 0.30', 'Very High': '> 0.30' },
  s: { 'Very Low': '< 7.5', 'Low': '7.5 - 15.0', 'Medium': '15.1 - 22.5', 'High': '22.51 - 30.0', 'Very High': '> 30.0' },
  zn: { 'Very Low': '< 0.45', 'Low': '0.451 - 0.90', 'Medium': '0.91 - 1.35', 'High': '1.351 - 1.80', 'Very High': '> 1.80' },
  b: { 'Very Low': '< 0.15', 'Low': '0.151 - 0.30', 'Medium': '0.31 - 0.45', 'High': '0.451 - 0.60', 'Very High': '> 0.60' },
  ca: { 'Very Low': '< 1.5', 'Low': '1.5 - 3.0', 'Medium': '3.1 - 4.5', 'High': '4.51 - 6.0', 'Very High': '> 6.0' },
  mg: { 'Very Low': '< 0.375', 'Low': '0.375 - 0.75', 'Medium': '0.751 - 1.125', 'High': '1.126 - 1.5', 'Very High': '> 1.5' },
  fe: { 'Very Low': '< 4.0', 'Low': '4.0 - 10.0', 'Medium': '10.1 - 18.0', 'High': '18.1 - 26.0', 'Very High': '> 26.0' },
  mn: { 'Very Low': '< 1.0', 'Low': '1.0 - 5.0', 'Medium': '5.1 - 10.0', 'High': '10.1 - 20.0', 'Very High': '> 20.0' },
  cu: { 'Very Low': '< 0.2', 'Low': '0.2 - 0.4', 'Medium': '0.41 - 0.6', 'High': '0.61 - 1.0', 'Very High': '> 1.0' },
  mo: { 'Very Low': '< 0.05', 'Low': '0.05 - 0.1', 'Medium': '0.11 - 0.2', 'High': '0.21 - 0.4', 'Very High': '> 0.4' },
  cl: { 'Very Low': '< 10', 'Low': '10 - 20', 'Medium': '21 - 40', 'High': '41 - 60', 'Very High': '> 60' },
  ni: { 'Very Low': '< 0.01', 'Low': '0.01 - 0.05', 'Medium': '0.06 - 0.1', 'High': '0.11 - 0.2', 'Very High': '> 0.2' },
  c: { 'Very Low': '< 10%', 'Low': '10-20%', 'Medium': '21-35%', 'High': '36-45%', 'Very High': '> 45%' },
  h: { 'Very Low': 'Low', 'Low': 'Low', 'Medium': 'Medium', 'High': 'High', 'Very High': 'High' },
  o: { 'Very Low': 'Low', 'Low': 'Low', 'Medium': 'Medium', 'High': 'High', 'Very High': 'High' },
  cec: { 'Very Low': '< 5', 'Low': '5 - 10', 'Medium': '11 - 20', 'High': '21 - 30', 'Very High': '> 30' },
};

/**
 * Optimum (Required) Ranges for healthy crop growth in Bangladesh
 */
export const OPTIMUM_NUTRIENT_RANGES: Record<keyof NutrientLevels, string> = {
  om: '৩.৪ - ৫.৫%',
  n: '০.২২ - ০.৩০%',
  p: '১৮.১ - ৩০.০',
  k: '০.১৮ - ০.২৭',
  s: '১৮.১ - ৩০.০',
  zn: '০.৯১ - ১.৮০',
  b: '০.৩১ - ০.৬০',
  ca: '৩.১ - ৭.৫',
  mg: '০.৭৫ - ১.৫০',
  fe: '১০.১ - ১৮.০',
  mn: '৫.১ - ১০.০',
  cu: '০.৪ - ০.৮',
  mo: '০.১ - ০.২',
  cl: '১০ - ২০',
  ni: '০.০৫ - ০.১',
  c: '৩৫ - ৫০%',
  h: 'N/A',
  o: 'N/A',
  cec: '১৫ - ২৫',
};

export const AEZ_DATA: AEZInfo[] = [
  { 
    id: 1, name: 'Old Himalayan Piedmont Plain', lat: 26.0, lng: 88.5, 
    soilType: 'Non-calcareous Brown Floodplain soils', texture: 'Sandy loams to silty loams', 
    topography: 'Highland and Medium Highland', phRange: '4.5 - 5.5 (Acidic)',
    nutrients: { n: 'Low', p: 'Low', k: 'Low', s: 'Low', zn: 'Low', b: 'Low', ca: 'Low', mg: 'Low', fe: 'High', om: 'Low', cec: 'Low', mn: 'Medium', cu: 'Low', mo: 'Low', cl: 'Medium', ni: 'Low', c: 'Medium', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 2, name: 'Active Tista Floodplain', lat: 25.8, lng: 89.4, 
    soilType: 'Alluvium soils', texture: 'Sands and silts', 
    topography: 'Lowland and Medium Lowland', phRange: '6.0 - 7.5',
    nutrients: { n: 'Low', p: 'Medium', k: 'Medium', s: 'Low', zn: 'Medium', b: 'Low', ca: 'Medium', mg: 'Medium', fe: 'Medium', om: 'Low', cec: 'Medium', mn: 'Medium', cu: 'Medium', mo: 'Low', cl: 'High', ni: 'Low', c: 'Low', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 3, name: 'Tista Meander Floodplain', lat: 25.5, lng: 89.1, 
    soilType: 'Non-calcareous Gray Floodplain soils', texture: 'Silt loams', 
    topography: 'Medium Highland', phRange: '5.2 - 6.5',
    nutrients: { n: 'Low', p: 'Low', k: 'Low', s: 'Low', zn: 'Medium', b: 'Low', ca: 'Low', mg: 'Medium', fe: 'Medium', om: 'Low', cec: 'Medium', mn: 'High', cu: 'Medium', mo: 'Medium', cl: 'Medium', ni: 'Low', c: 'Medium', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 4, name: 'Karatoya-bangali Floodplain', lat: 24.8, lng: 89.4, 
    soilType: 'Non-calcareous Gray Floodplain soils', texture: 'Silt loams to silty clay loams', 
    topography: 'Medium Highland to Medium Lowland', phRange: '5.5 - 6.8',
    nutrients: { n: 'Low', p: 'Low', k: 'Low', s: 'Low', zn: 'Low', b: 'Low', ca: 'Medium', mg: 'Medium', fe: 'Medium', om: 'Medium', cec: 'High', mn: 'Medium', cu: 'Low', mo: 'Low', cl: 'Low', ni: 'Low', c: 'Medium', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 5, name: 'Lower Atrai Basin', lat: 24.4, lng: 89.0, 
    soilType: 'Acid Basin Clays', texture: 'Heavy Clays', 
    topography: 'Lowland', phRange: '4.8 - 5.8',
    nutrients: { n: 'Low', p: 'Low', k: 'Medium', s: 'Medium', zn: 'Low', b: 'Low', ca: 'Low', mg: 'Medium', fe: 'High', om: 'Medium', cec: 'Very High', mn: 'Medium', cu: 'Medium', mo: 'Medium', cl: 'Medium', ni: 'Low', c: 'High', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 6, name: 'Lower Purnabhaba Floodplain', lat: 24.8, lng: 88.3, 
    soilType: 'Acid Basin Clays', texture: 'Heavy Clays', 
    topography: 'Lowland', phRange: '5.0 - 6.0',
    nutrients: { n: 'Low', p: 'Low', k: 'Medium', s: 'Low', zn: 'Low', b: 'Low', ca: 'Low', mg: 'Medium', fe: 'High', om: 'Medium', cec: 'High', mn: 'High', cu: 'Low', mo: 'Low', cl: 'Medium', ni: 'Low', c: 'Medium', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 7, name: 'Active Brahmaputra-jamuna Floodplain', lat: 24.5, lng: 89.8, 
    soilType: 'Alluvium', texture: 'Silty and sandy alluvium', 
    topography: 'Lowland', phRange: '6.5 - 7.5',
    nutrients: { n: 'Low', p: 'Medium', k: 'Medium', s: 'Low', zn: 'Medium', b: 'Low', ca: 'High', mg: 'High', fe: 'Medium', om: 'Low', cec: 'Medium', mn: 'Medium', cu: 'High', mo: 'Low', cl: 'High', ni: 'Medium', c: 'Low', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 8, name: 'Young Brahmaputra and Jamuna Floodplain', lat: 24.7, lng: 90.0, 
    soilType: 'Non-calcareous Gray Floodplain soils', texture: 'Silt loams', 
    topography: 'Medium Highland', phRange: '5.5 - 6.5',
    nutrients: { n: 'Low', p: 'Low', k: 'Low', s: 'Low', zn: 'Medium', b: 'Medium', ca: 'Medium', mg: 'Medium', fe: 'Medium', om: 'Low', cec: 'Medium', mn: 'Medium', cu: 'Medium', mo: 'Low', cl: 'Low', ni: 'Low', c: 'Medium', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 9, name: 'Old Brahmaputra Floodplain', lat: 24.5, lng: 90.5, 
    soilType: 'Non-calcareous Dark Gray Floodplain soils', texture: 'Silty clay loams', 
    topography: 'Medium Highland to Highland', phRange: '5.5 - 7.2',
    nutrients: { n: 'Low', p: 'Low', k: 'Low', s: 'Medium', zn: 'Medium', b: 'Medium', ca: 'Medium', mg: 'High', fe: 'Medium', om: 'Medium', cec: 'High', mn: 'High', cu: 'Medium', mo: 'Medium', cl: 'Medium', ni: 'Medium', c: 'High', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 10, name: 'Active Ganges Floodplain', lat: 24.0, lng: 89.2, 
    soilType: 'Calcareous Alluvium', texture: 'Silty and sandy alluvium', 
    topography: 'Medium Highland to Lowland', phRange: '7.0 - 8.2 (Alkaline)',
    nutrients: { n: 'Low', p: 'Medium', k: 'High', s: 'Low', zn: 'Medium', b: 'Low', ca: 'High', mg: 'High', fe: 'Low', om: 'Low', cec: 'Medium', mn: 'Low', cu: 'Medium', mo: 'Low', cl: 'Very High', ni: 'Low', c: 'Low', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 11, name: 'High Ganges River Floodplain', lat: 23.8, lng: 89.0, 
    soilType: 'Calcareous Brown/Gray Floodplain soils', texture: 'Silt loams to silty clay loams', 
    topography: 'Highland and Medium Highland', phRange: '7.0 - 8.5',
    nutrients: { n: 'Low', p: 'Medium', k: 'Medium', s: 'Low', zn: 'Medium', b: 'Low', ca: 'High', mg: 'High', fe: 'Low', om: 'Medium', cec: 'Medium', mn: 'Low', cu: 'Medium', mo: 'Low', cl: 'High', ni: 'Low', c: 'Medium', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 12, name: 'Low Ganges River Floodplain', lat: 23.5, lng: 90.0, 
    soilType: 'Calcareous Dark Gray Floodplain soils', texture: 'Heavy silty clays', 
    topography: 'Medium Lowland and Lowland', phRange: '7.2 - 8.0',
    nutrients: { n: 'Low', p: 'Medium', k: 'High', s: 'Low', zn: 'Medium', b: 'Low', ca: 'High', mg: 'High', fe: 'Low', om: 'Medium', cec: 'High', mn: 'Low', cu: 'Medium', mo: 'Low', cl: 'High', ni: 'Low', c: 'Medium', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 13, name: 'Ganges Tidal Floodplain', lat: 22.5, lng: 89.8, 
    soilType: 'Non-calcareous Gray Floodplain soils', texture: 'Silty clays', 
    topography: 'Medium Highland', phRange: '6.0 - 8.0',
    nutrients: { n: 'Low', p: 'Medium', k: 'High', s: 'High', zn: 'Low', b: 'Low', ca: 'High', mg: 'High', fe: 'Low', om: 'High', cec: 'Very High', mn: 'Medium', cu: 'Medium', mo: 'Medium', cl: 'Very High', ni: 'Low', c: 'High', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 14, name: 'Gopalganj-khulna Beel', lat: 23.1, lng: 89.9, 
    soilType: 'Peat and Muck', texture: 'Organic materials and Clays', 
    topography: 'Very Lowland', phRange: '4.5 - 5.5',
    nutrients: { n: 'High', p: 'Low', k: 'Low', s: 'High', zn: 'Low', b: 'Low', ca: 'Low', mg: 'Medium', fe: 'High', om: 'Very High', cec: 'Very High', mn: 'Medium', cu: 'Low', mo: 'Low', cl: 'Medium', ni: 'Low', c: 'Very High', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 15, name: 'Arial Beel', lat: 23.6, lng: 90.2, 
    soilType: 'Acid Basin Clays', texture: 'Clays', 
    topography: 'Lowland', phRange: '5.2 - 6.0',
    nutrients: { n: 'Medium', p: 'Low', k: 'Medium', s: 'Medium', zn: 'Low', b: 'Low', ca: 'Low', mg: 'Medium', fe: 'High', om: 'High', cec: 'High', mn: 'High', cu: 'Low', mo: 'Medium', cl: 'Low', ni: 'Low', c: 'High', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 16, name: 'Middle Meghna River Floodplain', lat: 23.6, lng: 90.8, 
    soilType: 'Non-calcareous Gray Floodplain soils', texture: 'Silty clay loams', 
    topography: 'Medium Highland and Lowland', phRange: '5.5 - 6.5',
    nutrients: { n: 'Low', p: 'Low', k: 'Low', s: 'Low', zn: 'Medium', b: 'Low', ca: 'Medium', mg: 'Medium', fe: 'High', om: 'Low', cec: 'Medium', mn: 'Medium', cu: 'Low', mo: 'Low', cl: 'Low', ni: 'Low', c: 'Low', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 17, name: 'Lower Meghna River Floodplain', lat: 23.0, lng: 90.7, 
    soilType: 'Calcareous Alluvium', texture: 'Silts', 
    topography: 'Medium Lowland', phRange: '7.0 - 8.0',
    nutrients: { n: 'Low', p: 'Medium', k: 'Medium', s: 'Low', zn: 'Medium', b: 'Low', ca: 'High', mg: 'High', fe: 'Low', om: 'Low', cec: 'Medium', mn: 'Low', cu: 'Medium', mo: 'Low', cl: 'High', ni: 'Low', c: 'Low', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 18, name: 'Young Meghna Estuarine Floodplain', lat: 22.5, lng: 91.0, 
    soilType: 'Non-calcareous Alluvium', texture: 'Silts and Sands', 
    topography: 'Medium Highland and Lowland', phRange: '6.5 - 7.5',
    nutrients: { n: 'Low', p: 'Medium', k: 'Medium', s: 'High', zn: 'Low', b: 'Low', ca: 'High', mg: 'High', fe: 'Low', om: 'Low', cec: 'Low', mn: 'Low', cu: 'Low', mo: 'Low', cl: 'High', ni: 'Low', c: 'Low', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 19, name: 'Old Meghna Estuarine Floodplain', lat: 23.0, lng: 91.2, 
    soilType: 'Non-calcareous Dark Gray Floodplain soils', texture: 'Silt loams to silty clays', 
    topography: 'Medium Highland', phRange: '5.2 - 6.8',
    nutrients: { n: 'Low', p: 'Low', k: 'Medium', s: 'Medium', zn: 'Medium', b: 'Medium', ca: 'Medium', mg: 'High', fe: 'Medium', om: 'Medium', cec: 'High', mn: 'High', cu: 'Medium', mo: 'Medium', cl: 'Medium', ni: 'Medium', c: 'High', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 20, name: 'Eastern Surma-kushyara Floodplain', lat: 24.8, lng: 91.8, 
    soilType: 'Non-calcareous Gray Floodplain soils', texture: 'Silty clay loams', 
    topography: 'Medium Lowland and Lowland', phRange: '5.0 - 6.2',
    nutrients: { n: 'Low', p: 'Low', k: 'Low', s: 'Low', zn: 'Medium', b: 'Low', ca: 'Low', mg: 'Medium', fe: 'High', om: 'Medium', cec: 'High', mn: 'High', cu: 'Low', mo: 'Medium', cl: 'Low', ni: 'Low', c: 'Medium', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 21, name: 'Sylhet Basin', lat: 24.6, lng: 91.4, 
    soilType: 'Acid Basin Clays', texture: 'Heavy Clays', 
    topography: 'Lowland and Very Lowland', phRange: '4.5 - 5.5',
    nutrients: { n: 'Low', p: 'Low', k: 'Medium', s: 'Medium', zn: 'Low', b: 'Low', ca: 'Low', mg: 'Medium', fe: 'High', om: 'High', cec: 'Very High', mn: 'Medium', cu: 'Low', mo: 'Low', cl: 'Medium', ni: 'Low', c: 'High', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 22, name: 'Northern & Eastern Piedmont Floodplain', lat: 25.1, lng: 91.0, 
    soilType: 'Non-calcareous Gray Floodplain soils', texture: 'Sandy loams to silts', 
    topography: 'Medium Highland', phRange: '4.8 - 6.0',
    nutrients: { n: 'Low', p: 'Low', k: 'Low', s: 'Low', zn: 'Medium', b: 'Low', ca: 'Low', mg: 'Medium', fe: 'High', om: 'Low', cec: 'Medium', mn: 'High', cu: 'Low', mo: 'Low', cl: 'Low', ni: 'Low', c: 'Low', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 23, name: 'Chittagong Coastal Plain', lat: 22.4, lng: 91.8, 
    soilType: 'Non-calcareous Gray Floodplain soils', texture: 'Silty clay loams', 
    topography: 'Medium Highland', phRange: '5.5 - 7.0',
    nutrients: { n: 'Low', p: 'Medium', k: 'Medium', s: 'Medium', zn: 'Medium', b: 'Low', ca: 'Medium', mg: 'Medium', fe: 'Medium', om: 'Medium', cec: 'Medium', mn: 'Medium', cu: 'Medium', mo: 'Low', cl: 'High', ni: 'Low', c: 'Medium', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 24, name: "St. Martin's Coral Island", lat: 20.6, lng: 92.3, 
    soilType: 'Calcareous Sandy Soils', texture: 'Sands', 
    topography: 'Island', phRange: '7.5 - 8.5',
    nutrients: { n: 'Very Low', p: 'Very Low', k: 'Very Low', s: 'Low', zn: 'Low', b: 'High', ca: 'Very High', mg: 'Very High', fe: 'Very Low', om: 'Very Low', cec: 'Low', mn: 'Very Low', cu: 'Very Low', mo: 'Low', cl: 'Very High', ni: 'Low', c: 'Very Low', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 25, name: 'Level Barind Tract', lat: 24.8, lng: 88.8, 
    soilType: 'Shallow Gray Terrace soils', texture: 'Silty clay loams', 
    topography: 'Medium Highland', phRange: '5.5 - 6.2',
    nutrients: { n: 'Very Low', p: 'Low', k: 'Very Low', s: 'Low', zn: 'Low', b: 'Low', ca: 'Low', mg: 'Low', fe: 'High', om: 'Very Low', cec: 'Low', mn: 'High', cu: 'Low', mo: 'Low', cl: 'Low', ni: 'Low', c: 'Very Low', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 26, name: 'High Barind Tract', lat: 24.5, lng: 88.4, 
    soilType: 'Deep Gray Terrace soils', texture: 'Silty clay loams', 
    topography: 'Highland', phRange: '5.2 - 6.0',
    nutrients: { n: 'Very Low', p: 'Low', k: 'Very Low', s: 'Low', zn: 'Low', b: 'Low', ca: 'Low', mg: 'Low', fe: 'High', om: 'Very Low', cec: 'Low', mn: 'High', cu: 'Low', mo: 'Low', cl: 'Low', ni: 'Low', c: 'Very Low', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 27, name: 'North-Eastern Barind Tract', lat: 25.2, lng: 89.0, 
    soilType: 'Deep Gray Terrace soils', texture: 'Silty clay loams', 
    topography: 'Medium Highland', phRange: '5.0 - 5.8',
    nutrients: { n: 'Very Low', p: 'Low', k: 'Low', s: 'Low', zn: 'Low', b: 'Low', ca: 'Low', mg: 'Low', fe: 'High', om: 'Low', cec: 'Medium', mn: 'High', cu: 'Low', mo: 'Low', cl: 'Medium', ni: 'Low', c: 'Low', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 28, name: 'Madhupur Tract', lat: 24.1, lng: 90.4, 
    soilType: 'Shallow/Deep Red-Brown Terrace soils', texture: 'Clay loams to clays', 
    topography: 'Highland to Medium Highland', phRange: '5.0 - 6.0',
    nutrients: { n: 'Low', p: 'Low', k: 'Low', s: 'Low', zn: 'Low', b: 'Low', ca: 'Low', mg: 'Low', fe: 'Very High', om: 'Low', cec: 'Medium', mn: 'High', cu: 'Low', mo: 'Low', cl: 'Low', ni: 'Low', c: 'Low', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 29, name: 'Northern And Eastern Hills', lat: 23.0, lng: 92.0, 
    soilType: 'Brown Hill soils', texture: 'Sandy loams to silt loams', 
    topography: 'Hills', phRange: '4.5 - 5.2',
    nutrients: { n: 'Low', p: 'Low', k: 'Low', s: 'Low', zn: 'Low', b: 'Low', ca: 'Very Low', mg: 'Low', fe: 'High', om: 'Medium', cec: 'Low', mn: 'Medium', cu: 'Low', mo: 'Low', cl: 'Medium', ni: 'Low', c: 'Medium', h: 'Medium', o: 'Medium' }
  },
  { 
    id: 30, name: 'Akhaura Terrace', lat: 23.8, lng: 91.2, 
    soilType: 'Deep Red-Brown Terrace soils', texture: 'Silty clay loams', 
    topography: 'Highland', phRange: '4.8 - 5.5',
    nutrients: { n: 'Low', p: 'Low', k: 'Low', s: 'Low', zn: 'Low', b: 'Low', ca: 'Low', mg: 'Low', fe: 'High', om: 'Low', cec: 'Medium', mn: 'High', cu: 'Low', mo: 'Low', cl: 'Low', ni: 'Low', c: 'Low', h: 'Medium', o: 'Medium' }
  },
];

const LOCATION_KEY = 'agritech_stored_location';

export const saveStoredLocation = (lat: number, lng: number) => {
  const data: StoredLocation = { lat, lng, timestamp: Date.now() };
  localStorage.setItem(LOCATION_KEY, JSON.stringify(data));
};

export const getStoredLocation = (): StoredLocation | null => {
  const item = localStorage.getItem(LOCATION_KEY);
  if (!item) return null;
  try {
    return JSON.parse(item);
  } catch {
    return null;
  }
};

export const clearStoredLocation = () => {
  localStorage.removeItem(LOCATION_KEY);
};

export const getNearestAEZ = (lat: number, lng: number): AEZInfo => {
  let nearest = AEZ_DATA[0];
  let minDistance = Number.MAX_VALUE;

  for (const aez of AEZ_DATA) {
    const distance = Math.sqrt(Math.pow(aez.lat - lat, 2) + Math.pow(aez.lng - lng, 2));
    if (distance < minDistance) {
      minDistance = distance;
      nearest = aez;
    }
  }

  return nearest;
};

export const detectCurrentAEZDetails = (force: boolean = false): Promise<AEZInfo> => {
  return new Promise((resolve, reject) => {
    const stored = getStoredLocation();
    if (!force && stored) {
      resolve(getNearestAEZ(stored.lat, stored.lng));
      return;
    }

    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        saveStoredLocation(latitude, longitude);
        resolve(getNearestAEZ(latitude, longitude));
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};
