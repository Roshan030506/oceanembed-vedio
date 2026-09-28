export interface ArgoFloat {
  floatId: string;
  wmo: string;
  date: string;
  lat: number;
  lon: number;
  depths: number[];
  platformType: string;
  qcFlag: number;
  observedTemp: number[];
}

export type SatelliteVariableKey = 'sst' | 'sss' | 'ssh' | 'current_u' | 'current_v' | 'mld' | 'wind';

export interface SatelliteVariableMeta {
  key: SatelliteVariableKey;
  name: string;
  fullName: string;
  unit: string;
  min: number;
  max: number;
  satelliteSensor: string;
  description: string;
  palette: string[];
}

export interface DepthLevelData {
  depth: number;
  pressureDbar: number;
  reconstructedTemp: number;
  reconstructedSalinity: number;
  reconstructedDensity: number;
  glorysRefTemp: number;
  glorysRefSalinity: number;
  glorysRefDensity: number;
  argoObservedTemp: number | null;
  densityGradientDrhoDz: number;
  buoyancyFrequencyN2: number;
  isStaticallyStable: boolean;
  tempDiffAgainstGlorys: number;
  tempDiffAgainstArgo: number | null;
}

export interface PhysicsReport {
  isStable: boolean;
  minN2: number;
  maxN2: number;
  meanDensityGradient: number;
  thermoclineDepthM: number;
  surfaceMixedLayerDepthM: number;
  convectiveInversionsCount: number;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  startTime: number; // in seconds
  endTime: number;
  tab: 'monitor' | 'reconstruction' | 'validation' | 'method';
  subTab?: string;
  zoomRegion?: 'all' | 'arabian' | 'bengal' | 'equatorial';
  variable?: SatelliteVariableKey;
  targetLat?: number;
  targetLon?: number;
  targetFloatId?: string;
  cursorActions: Array<{
    timeOffset: number; // seconds from chapter start
    xPct: number;
    yPct: number;
    action: 'move' | 'click' | 'hover' | 'drag';
    tooltip?: string;
  }>;
  audioScript: string;
  subtitles: Array<{
    timeOffset: number;
    text: string;
  }>;
  keyInsights: string[];
}
