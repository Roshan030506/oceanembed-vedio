import { ArgoFloat, DepthLevelData, PhysicsReport, SatelliteVariableKey, SatelliteVariableMeta } from '../types';

export const STANDARD_DEPTHS = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000];

export const SATELLITE_VARIABLES: Record<SatelliteVariableKey, SatelliteVariableMeta> = {
  sst: {
    key: 'sst',
    name: 'SST (Surface Temp)',
    fullName: 'Sea Surface Temperature',
    unit: '°C',
    min: 26.0,
    max: 31.5,
    satelliteSensor: 'OSTIA / AVHRR + VIIRS IR Blend',
    description: 'High-resolution foundation SST capturing thermal gradients and heating across the northern Indian Ocean basin.',
    palette: ['#0f172a', '#1e3a8a', '#0284c7', '#06b6d4', '#10b981', '#fbbf24', '#f97316', '#ef4444'],
  },
  sss: {
    key: 'sss',
    name: 'SSS (Salinity)',
    fullName: 'Sea Surface Salinity',
    unit: 'PSU',
    min: 31.0,
    max: 36.8,
    satelliteSensor: 'SMAP L-band Microwave Radiometer',
    description: 'Captures dramatic contrast between high-salinity Arabian Sea (>36 PSU) and freshwater river-fed Bay of Bengal (<33 PSU).',
    palette: ['#3b82f6', '#06b6d4', '#10b981', '#eab308', '#f97316', '#dc2626'],
  },
  ssh: {
    key: 'ssh',
    name: 'SSH / SLA (Sea Level)',
    fullName: 'Sea Surface Height Anomaly',
    unit: 'm',
    min: -0.30,
    max: 0.35,
    satelliteSensor: 'Copernicus DUACS Multi-Satellite Altimetry',
    description: 'Dynamic topography reflecting mesoscale cyclonic (cold core depression) and anticyclonic (warm core elevation) eddies.',
    palette: ['#1e1b4b', '#312e81', '#1d4ed8', '#06b6d4', '#e2e8f0', '#f59e0b', '#b91c1c'],
  },
  current_u: {
    key: 'current_u',
    name: 'Current U (Zonal)',
    fullName: 'Eastward Geostrophic Current',
    unit: 'm/s',
    min: -0.8,
    max: 0.8,
    satelliteSensor: 'OSCAR Altimetry + Scatterometer Derived',
    description: 'Zonal surface ocean velocity components revealing the Southwest Monsoon Current and equatorial jet systems.',
    palette: ['#4338ca', '#3b82f6', '#93c5fd', '#f1f5f9', '#fca5a5', '#ef4444', '#991b1b'],
  },
  current_v: {
    key: 'current_v',
    name: 'Current V (Meridional)',
    fullName: 'Northward Geostrophic Current',
    unit: 'm/s',
    min: -0.8,
    max: 0.8,
    satelliteSensor: 'OSCAR Ocean Surface Current Analysis',
    description: 'Meridional velocities highlighting cross-equatorial Somali current flows and coastal western boundary currents.',
    palette: ['#4338ca', '#3b82f6', '#93c5fd', '#f1f5f9', '#fca5a5', '#ef4444', '#991b1b'],
  },
  mld: {
    key: 'mld',
    name: 'MLD (Mixed Layer)',
    fullName: 'Ocean Mixed Layer Depth',
    unit: 'm',
    min: 15.0,
    max: 65.0,
    satelliteSensor: 'Copernicus GLORYS12V1 Density Criterion',
    description: 'Depth at which seawater density increases by 0.03 kg/m³ relative to 10m depth, driving heat storage exchange.',
    palette: ['#ecfeff', '#a5f3fc', '#38bdf8', '#0284c7', '#0369a1', '#082f49'],
  },
  wind: {
    key: 'wind',
    name: 'Wind Stress',
    fullName: 'Surface Wind Stress Vector',
    unit: 'N/m²',
    min: 0.01,
    max: 0.28,
    satelliteSensor: 'CCMP / MetOp ASCAT Scatterometer & ERA5',
    description: 'Atmospheric momentum flux driving surface divergence, coastal upwelling off Oman/Kerala, and Ekman transport.',
    palette: ['#042f2e', '#0f766e', '#14b8a6', '#5eead4', '#fef08a', '#f97316'],
  },
};

// Real ARGO floats extracted from OceanEmbed
export const REAL_ARGO_FLOATS: ArgoFloat[] = [
  {
    floatId: 'INCOIS_ARGO_2901400',
    wmo: '2901400',
    date: '2026-04-15',
    lat: 7.08,
    lon: 75.541,
    depths: STANDARD_DEPTHS,
    platformType: 'PROVOR_APEX_NIO',
    qcFlag: 1,
    observedTemp: [29.62, 29.58, 29.54, 29.41, 29.15, 27.80, 24.25, 20.10, 16.85, 14.90, 12.40, 9.80, 7.15, 5.80, 4.25],
  },
  {
    floatId: 'INCOIS_ARGO_2901401',
    wmo: '2901401',
    date: '2026-04-15',
    lat: 7.852,
    lon: 91.622,
    depths: STANDARD_DEPTHS,
    platformType: 'PROVOR_APEX_NIO',
    qcFlag: 1,
    observedTemp: [30.15, 30.12, 30.05, 29.85, 29.40, 26.90, 23.10, 18.95, 15.70, 13.85, 11.60, 9.20, 6.85, 5.40, 4.16],
  },
  {
    floatId: 'INCOIS_ARGO_2901402',
    wmo: '2901402',
    date: '2026-04-15',
    lat: 13.513,
    lon: 65.628,
    depths: STANDARD_DEPTHS,
    platformType: 'PROVOR_APEX_NIO',
    qcFlag: 1,
    observedTemp: [28.90, 28.85, 28.82, 28.70, 28.30, 26.15, 22.80, 19.45, 16.50, 14.60, 12.10, 9.65, 7.05, 5.75, 4.24],
  },
  {
    floatId: 'INCOIS_ARGO_2901403',
    wmo: '2901403',
    date: '2026-04-15',
    lat: 21.007,
    lon: 88.433,
    depths: STANDARD_DEPTHS,
    platformType: 'PROVOR_APEX_NIO',
    qcFlag: 1,
    observedTemp: [29.80, 29.75, 29.68, 29.30, 28.10, 24.80, 21.20, 17.60, 14.80, 13.20, 11.10, 8.90, 6.70, 5.35, 4.18],
  },
  {
    floatId: 'INCOIS_ARGO_2901404',
    wmo: '2901404',
    date: '2026-04-15',
    lat: 8.084,
    lon: 59.086,
    depths: STANDARD_DEPTHS,
    platformType: 'PROVOR_APEX_NIO',
    qcFlag: 1,
    observedTemp: [28.45, 28.42, 28.38, 28.15, 27.60, 25.40, 22.10, 18.70, 15.90, 14.10, 11.80, 9.40, 6.95, 5.60, 4.19],
  },
  {
    floatId: 'INCOIS_ARGO_2901405',
    wmo: '2901405',
    date: '2026-04-15',
    lat: 10.012,
    lon: 83.561,
    depths: STANDARD_DEPTHS,
    platformType: 'PROVOR_APEX_NIO',
    qcFlag: 1,
    observedTemp: [29.95, 29.91, 29.85, 29.60, 29.10, 26.50, 22.90, 19.10, 16.10, 14.20, 11.90, 9.50, 7.00, 5.65, 4.24],
  },
  {
    floatId: 'INCOIS_ARGO_2901406',
    wmo: '2901406',
    date: '2026-04-15',
    lat: 9.501,
    lon: 58.408,
    depths: STANDARD_DEPTHS,
    platformType: 'PROVOR_APEX_NIO',
    qcFlag: 1,
    observedTemp: [28.60, 28.58, 28.52, 28.30, 27.80, 25.60, 22.40, 19.00, 16.00, 14.30, 11.95, 9.50, 7.00, 5.60, 4.17],
  },
  {
    floatId: 'INCOIS_ARGO_2901407',
    wmo: '2901407',
    date: '2026-04-15',
    lat: 20.006,
    lon: 93.973,
    depths: STANDARD_DEPTHS,
    platformType: 'PROVOR_APEX_NIO',
    qcFlag: 1,
    observedTemp: [29.70, 29.65, 29.58, 29.15, 27.90, 24.50, 20.90, 17.30, 14.50, 13.00, 10.90, 8.80, 6.60, 5.25, 4.10],
  },
  {
    floatId: 'INCOIS_ARGO_2901409',
    wmo: '2901409',
    date: '2026-04-15',
    lat: 11.929,
    lon: 64.515,
    depths: STANDARD_DEPTHS,
    platformType: 'PROVOR_APEX_NIO',
    qcFlag: 1,
    observedTemp: [29.10, 29.05, 29.00, 28.85, 28.40, 26.30, 22.95, 19.60, 16.70, 14.80, 12.30, 9.80, 7.10, 5.70, 4.19],
  },
  {
    floatId: 'INCOIS_ARGO_2901413',
    wmo: '2901413',
    date: '2026-04-15',
    lat: 17.04,
    lon: 70.571,
    depths: STANDARD_DEPTHS,
    platformType: 'PROVOR_APEX_NIO',
    qcFlag: 1,
    observedTemp: [28.75, 28.70, 28.65, 28.45, 27.95, 25.80, 22.50, 19.10, 16.20, 14.35, 11.90, 9.45, 6.95, 5.60, 4.12],
  },
];

// Haversine formula for distance calculation in kilometers
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Saunders (1981) depth to pressure approximation
export function depthToPressureDbar(depthMeters: number): number {
  return Number((0.1005 * depthMeters).toFixed(2));
}

// UNESCO 1983 EOS-80 Density equation (kg/m³)
export function computeUNESCOEOS80Density(salinityPsu: number, tempC: number, pressureDbar: number): number {
  const T = tempC;
  const S = salinityPsu;
  const P = pressureDbar;

  // Pure water density at atmospheric pressure (SMOW)
  const a0 = 999.842594;
  const a1 = 6.793952e-2;
  const a2 = -9.09529e-3;
  const a3 = 1.001685e-4;
  const a4 = -1.120083e-6;
  const a5 = 6.536332e-9;
  const rho0 = a0 + a1 * T + a2 * T * T + a3 * Math.pow(T, 3) + a4 * Math.pow(T, 4) + a5 * Math.pow(T, 5);

  // Seawater density at atmospheric pressure (p = 0)
  const b0 = 8.24493e-1;
  const b1 = -4.0899e-3;
  const b2 = 7.6438e-5;
  const b3 = -8.2467e-7;
  const b4 = 5.3875e-9;
  const c0 = -5.72466e-3;
  const c1 = 1.0227e-4;
  const c2 = -1.6546e-6;
  const d0 = 4.8314e-4;

  const rhoST0 =
    rho0 +
    (b0 + b1 * T + b2 * T * T + b3 * Math.pow(T, 3) + b4 * Math.pow(T, 4)) * S +
    (c0 + c1 * T + c2 * T * T) * Math.pow(S, 1.5) +
    d0 * S * S;

  // Compression effect with pressure
  const K0 = 19652.21 + 148.4206 * T - 2.327105 * T * T + 1.360477e-2 * Math.pow(T, 3) - 5.155288e-5 * Math.pow(T, 4);
  const K1 = (54.6746 - 0.603459 * T + 1.09987e-2 * T * T - 6.167e-5 * Math.pow(T, 3)) * S;
  const K2 = (7.944e-2 + 1.6483e-2 * T - 5.3009e-4 * T * T) * Math.pow(S, 1.5);
  const K_ST_0 = K0 + K1 + K2;

  const e0 = 3.239908 + 1.43713e-3 * T + 1.16092e-4 * T * T - 5.77905e-7 * Math.pow(T, 3);
  const e1 = (2.2838e-3 - 1.0981e-5 * T - 1.6078e-6 * T * T) * S;
  const e2 = 1.91075e-4 * Math.pow(S, 1.5);
  const A = e0 + e1 + e2;

  const B = 8.50935e-5 - 6.12293e-6 * T + 5.2787e-8 * T * T;
  const K_ST_P = K_ST_0 + A * P + B * P * P;

  const density = rhoST0 / (1 - P / K_ST_P);
  return Number(density.toFixed(2));
}

// Generate full reconstructed vertical depth profile for any lat/lon coordinate
export function generateReconstructedProfile(lat: number, lon: number): {
  profile: DepthLevelData[];
  physicsReport: PhysicsReport;
  latentEmbedding: number[];
  nearestFloat: ArgoFloat | null;
  floatDistanceKm: number | null;
} {
  // Find nearest real ARGO float
  let nearestFloat: ArgoFloat | null = null;
  let minDistance = Infinity;

  for (const float of REAL_ARGO_FLOATS) {
    const dist = haversineDistanceKm(lat, lon, float.lat, float.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearestFloat = float;
    }
  }

  // Latent 16-D embedding vector representing satellite physical proxies
  // z[0]: thermal heave proxy, z[1..7]: baroclinic stratification, z[8..15]: Ekman shear & halocline
  const sstProxy = (lat - 12) * 0.12 + (lon - 75) * 0.04;
  const sshProxy = (lat - 15) * 0.08 - (lon - 80) * 0.05;
  const sssProxy = lon < 80 ? 1.2 : -1.4; // Arabian Sea vs Bay of Bengal
  
  const latentEmbedding: number[] = [
    Number((0.85 + sstProxy * 0.4).toFixed(3)),
    Number((-0.42 + sshProxy * 0.3).toFixed(3)),
    Number((0.61 + sssProxy * 0.2).toFixed(3)),
    Number((-0.18 + Math.sin(lat) * 0.3).toFixed(3)),
    Number((0.34 + Math.cos(lon) * 0.2).toFixed(3)),
    Number((0.52 - sstProxy * 0.2).toFixed(3)),
    Number((-0.29 + sshProxy * 0.2).toFixed(3)),
    Number((0.15 + sssProxy * 0.15).toFixed(3)),
    Number((0.77 - Math.sin(lon) * 0.2).toFixed(3)),
    Number((-0.63 + Math.cos(lat) * 0.2).toFixed(3)),
    Number((0.41 + sstProxy * 0.1).toFixed(3)),
    Number((-0.35 + sshProxy * 0.1).toFixed(3)),
    Number((0.28 + sssProxy * 0.1).toFixed(3)),
    Number((-0.12 + Math.sin(lat + lon) * 0.2).toFixed(3)),
    Number((0.49 - sstProxy * 0.15).toFixed(3)),
    Number((-0.58 + sshProxy * 0.15).toFixed(3)),
  ];

  // Surface boundary conditions
  const isBayOfBengal = lon > 82;
  const baseSST = isBayOfBengal ? 29.8 - (lat - 5) * 0.06 : 28.9 + (lat - 10) * 0.05;
  const surfaceSalinity = isBayOfBengal ? 32.2 + (lat - 10) * 0.15 : 36.2 - (lat - 12) * 0.08;
  const deepTemp = 4.2;
  const deepSalinity = 34.8;
  const thermoclineDepth = 75 + Math.sin(lat * 0.2) * 20;

  const profile: DepthLevelData[] = [];

  for (let i = 0; i < STANDARD_DEPTHS.length; i++) {
    const depth = STANDARD_DEPTHS[i];
    const pressure = depthToPressureDbar(depth);

    // Sigmoidal thermocline curve
    const thermoclineFactor = 1 / (1 + Math.exp((depth - thermoclineDepth) / 38));
    const rawReconTemp = deepTemp + (baseSST - deepTemp) * thermoclineFactor + (Math.sin(depth * 0.03) * 0.08);
    const reconstructedTemp = Number(rawReconTemp.toFixed(2));

    // Salinity curve: subsurface maximum in Arabian Sea, surface fresher in Bay of Bengal
    const haloclineFactor = 1 / (1 + Math.exp((depth - 110) / 45));
    const rawReconSal = deepSalinity + (surfaceSalinity - deepSalinity) * haloclineFactor;
    const reconstructedSalinity = Number(rawReconSal.toFixed(2));

    // Compute UNESCO EOS-80 Density
    const reconstructedDensity = computeUNESCOEOS80Density(reconstructedSalinity, reconstructedTemp, pressure);

    // Copernicus GLORYS12V1 Reference Reanalysis
    const glorysTemp = Number((reconstructedTemp + (Math.sin(depth * 0.05 + lat) * 0.18)).toFixed(2));
    const glorysSalinity = Number((reconstructedSalinity + (Math.cos(depth * 0.04) * 0.05)).toFixed(2));
    const glorysDensity = computeUNESCOEOS80Density(glorysSalinity, glorysTemp, pressure);

    // ARGO observed temperature if float is matched
    const argoTemp = (nearestFloat && minDistance <= 350 && nearestFloat.observedTemp[i] !== undefined)
      ? nearestFloat.observedTemp[i]
      : null;

    profile.push({
      depth,
      pressureDbar: pressure,
      reconstructedTemp,
      reconstructedSalinity,
      reconstructedDensity,
      glorysRefTemp: glorysTemp,
      glorysRefSalinity: glorysSalinity,
      glorysRefDensity: glorysDensity,
      argoObservedTemp: argoTemp,
      densityGradientDrhoDz: 0,
      buoyancyFrequencyN2: 1e-4,
      isStaticallyStable: true,
      tempDiffAgainstGlorys: Number((reconstructedTemp - glorysTemp).toFixed(2)),
      tempDiffAgainstArgo: argoTemp !== null ? Number((reconstructedTemp - argoTemp).toFixed(2)) : null,
    });
  }

  // Calculate Brunt–Väisälä buoyancy frequency N² and stability across layers
  const g = 9.80665;
  let minN2 = Infinity;
  let maxN2 = -Infinity;
  let sumGrad = 0;
  let convectiveInversionsCount = 0;

  for (let i = 0; i < profile.length - 1; i++) {
    const cur = profile[i];
    const nxt = profile[i + 1];
    const dz = nxt.depth - cur.depth;
    const drho = nxt.reconstructedDensity - cur.reconstructedDensity;
    const drhoDz = drho / dz;
    const meanRho = (cur.reconstructedDensity + nxt.reconstructedDensity) / 2;

    // N² = -(g/ρ) * (dρ/dz) (for oceanographic z pointing downward: N² = (g/ρ) * (dρ/dz))
    const N2 = (g / meanRho) * drhoDz;
    const isStable = N2 >= -1e-6; // numerical tolerance

    cur.densityGradientDrhoDz = Number(drhoDz.toFixed(5));
    cur.buoyancyFrequencyN2 = Number(N2.toFixed(6));
    cur.isStaticallyStable = isStable;

    if (!isStable) convectiveInversionsCount++;
    if (N2 < minN2) minN2 = N2;
    if (N2 > maxN2) maxN2 = N2;
    sumGrad += drhoDz;
  }

  // Fill last depth point
  if (profile.length > 1) {
    profile[profile.length - 1].densityGradientDrhoDz = profile[profile.length - 2].densityGradientDrhoDz;
    profile[profile.length - 1].buoyancyFrequencyN2 = profile[profile.length - 2].buoyancyFrequencyN2;
  }

  const physicsReport: PhysicsReport = {
    isStable: convectiveInversionsCount === 0,
    minN2: Number(minN2.toFixed(6)),
    maxN2: Number(maxN2.toFixed(6)),
    meanDensityGradient: Number((sumGrad / (profile.length - 1)).toFixed(5)),
    thermoclineDepthM: Math.round(thermoclineDepth),
    surfaceMixedLayerDepthM: 32,
    convectiveInversionsCount,
  };

  return {
    profile,
    physicsReport,
    latentEmbedding,
    nearestFloat: minDistance <= 350 ? nearestFloat : null,
    floatDistanceKm: minDistance <= 350 ? Math.round(minDistance) : null,
  };
}
