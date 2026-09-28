import React, { useState, useMemo } from 'react';
import { SatelliteVariableKey, ArgoFloat } from '../types';
import { SATELLITE_VARIABLES, REAL_ARGO_FLOATS, generateReconstructedProfile } from '../data/oceanData';
import { Layers, Compass, Eye, Waves, Thermometer, Droplets, ArrowUpRight, CheckCircle2, Info } from 'lucide-react';

interface Props {
  selectedVariable: SatelliteVariableKey;
  onSelectVariable: (v: SatelliteVariableKey) => void;
  selectedLat: number;
  selectedLon: number;
  onSelectCoords: (lat: number, lon: number) => void;
  onNavigateToReconstruction: () => void;
  onNavigateToArgo: (floatId: string) => void;
  zoomRegion?: 'all' | 'arabian' | 'bengal' | 'equatorial';
  highlightPoint?: { lat: number; lon: number };
}

export const OceanMonitorView: React.FC<Props> = ({
  selectedVariable,
  onSelectVariable,
  selectedLat,
  selectedLon,
  onSelectCoords,
  onNavigateToReconstruction,
  onNavigateToArgo,
  zoomRegion = 'all',
}) => {
  const [showFloats, setShowFloats] = useState<boolean>(true);
  const [hoveredFloat, setHoveredFloat] = useState<ArgoFloat | null>(null);
  const [activeRegion, setActiveRegion] = useState<'all' | 'arabian' | 'bengal' | 'equatorial'>(zoomRegion);

  const varMeta = SATELLITE_VARIABLES[selectedVariable];

  // Derived reconstruction profile & embedding for selected point
  const currentAnalysis = useMemo(() => {
    return generateReconstructedProfile(selectedLat, selectedLon);
  }, [selectedLat, selectedLon]);

  // Spatial boundaries (5°N to 26°N, 50°E to 98°E)
  const bounds = useMemo(() => {
    switch (activeRegion) {
      case 'arabian':
        return { minLat: 8, maxLat: 26, minLon: 52, maxLon: 77 };
      case 'bengal':
        return { minLat: 6, maxLat: 24, minLon: 78, maxLon: 98 };
      case 'equatorial':
        return { minLat: 3, maxLat: 15, minLon: 55, maxLon: 95 };
      default:
        return { minLat: 4, maxLat: 26, minLon: 52, maxLon: 98 };
    }
  }, [activeRegion]);

  const mapWidth = 840;
  const mapHeight = 440;

  const project = (lat: number, lon: number) => {
    const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * mapWidth;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * mapHeight;
    return { x, y };
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const lon = bounds.minLon + (clickX / rect.width) * (bounds.maxLon - bounds.minLon);
    const lat = bounds.maxLat - (clickY / rect.height) * (bounds.maxLat - bounds.minLat);

    // Round to 0.25° grid
    const gridLat = Math.round(lat * 4) / 4;
    const gridLon = Math.round(lon * 4) / 4;

    onSelectCoords(Number(gridLat.toFixed(2)), Number(gridLon.toFixed(2)));
  };

  // Compute simulated variable value at given coordinates
  const getVariableValue = (lat: number, lon: number, key: SatelliteVariableKey): number => {
    const isBay = lon > 78;
    switch (key) {
      case 'sst':
        return Number((28.5 + (isBay ? 1.2 : 0.4) + Math.sin(lat * 0.2) * 0.8 - (lat - 10) * 0.08).toFixed(1));
      case 'sss':
        return Number((isBay ? 32.2 + (lat - 10) * 0.12 : 36.4 - (lat - 12) * 0.06).toFixed(1));
      case 'ssh':
        return Number((Math.sin((lat - 12) * 0.4) * 0.15 + Math.cos((lon - 70) * 0.3) * 0.12).toFixed(2));
      case 'current_u':
        return Number((Math.sin(lat * 0.3) * 0.45).toFixed(2));
      case 'current_v':
        return Number((Math.cos(lon * 0.25) * 0.35).toFixed(2));
      case 'mld':
        return Math.round(30 + Math.sin(lat * 0.25) * 18 + (isBay ? -8 : 10));
      case 'wind':
        return Number((0.08 + Math.sin(lat * 0.3) * 0.09).toFixed(2));
    }
  };

  const selectedValue = getVariableValue(selectedLat, selectedLon, selectedVariable);

  return (
    <div className="space-y-4">
      {/* Top Bar: Variable Selector & Region Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-lg">
        {/* Variable Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(SATELLITE_VARIABLES) as SatelliteVariableKey[]).map((key) => {
            const item = SATELLITE_VARIABLES[key];
            const isSelected = selectedVariable === key;
            return (
              <button
                key={key}
                onClick={() => onSelectVariable(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {key === 'sst' && <Thermometer className="w-3.5 h-3.5" />}
                {key === 'sss' && <Droplets className="w-3.5 h-3.5" />}
                {key === 'ssh' && <Waves className="w-3.5 h-3.5" />}
                {key === 'current_u' && <Compass className="w-3.5 h-3.5" />}
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Region Presets & Float Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setActiveRegion('all')}
              className={`px-2.5 py-1 rounded ${activeRegion === 'all' ? 'bg-cyan-900/50 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All Basin
            </button>
            <button
              onClick={() => setActiveRegion('arabian')}
              className={`px-2.5 py-1 rounded ${activeRegion === 'arabian' ? 'bg-cyan-900/50 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Arabian Sea
            </button>
            <button
              onClick={() => setActiveRegion('bengal')}
              className={`px-2.5 py-1 rounded ${activeRegion === 'bengal' ? 'bg-cyan-900/50 text-cyan-300 font-medium' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Bay of Bengal
            </button>
          </div>

          <button
            onClick={() => setShowFloats(!showFloats)}
            className={`px-2.5 py-1 text-xs rounded-lg border flex items-center gap-1.5 transition-colors ${
              showFloats
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            ARGO Floats ({REAL_ARGO_FLOATS.length})
          </button>
        </div>
      </div>

      {/* Main Map Canvas & Sidebar Info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Interactive Map Area */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
          {/* Map Status Header */}
          <div className="bg-slate-900/70 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-slate-200">{varMeta.fullName}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 font-mono">Standardized 0.25° × 0.25° Daily Grid</span>
            </div>
            <div className="text-slate-400 font-mono text-[11px]">
              Sensor: <span className="text-cyan-400">{varMeta.satelliteSensor}</span>
            </div>
          </div>

          {/* SVG Map Container */}
          <div className="relative w-full aspect-[21/11] bg-[#070e1b] cursor-crosshair overflow-hidden select-none">
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="w-full h-full"
              onClick={handleMapClick}
            >
              <defs>
                {/* Dynamic Gradient for Sea Surface Variable */}
                <linearGradient id="mapFieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0c1e38" />
                  <stop offset="35%" stopColor={selectedVariable === 'sss' ? '#0f4c81' : '#0369a1'} />
                  <stop offset="65%" stopColor={selectedVariable === 'sss' ? '#14b8a6' : '#0284c7'} />
                  <stop offset="100%" stopColor={selectedVariable === 'sss' ? '#0e7490' : '#0ea5e9'} />
                </linearGradient>

                <radialGradient id="arabianEddy" cx="35%" cy="45%" r="30%">
                  <stop offset="0%" stopColor={selectedVariable === 'sss' ? '#f59e0b' : '#38bdf8'} stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="bengalEddy" cx="72%" cy="42%" r="28%">
                  <stop offset="0%" stopColor={selectedVariable === 'sss' ? '#06b6d4' : '#f97316'} stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ocean Base Field */}
              <rect width={mapWidth} height={mapHeight} fill="url(#mapFieldGradient)" />
              <rect width={mapWidth} height={mapHeight} fill="url(#arabianEddy)" />
              <rect width={mapWidth} height={mapHeight} fill="url(#bengalEddy)" />

              {/* Bathymetry Depth Contours & Flow Streamlines */}
              <g stroke="#38bdf8" strokeOpacity="0.15" fill="none" strokeWidth="1">
                <path d="M 120 180 Q 240 220 320 320 T 450 400" />
                <path d="M 160 140 Q 280 180 380 260 T 520 380" />
                <path d="M 500 120 Q 580 220 620 340 T 700 420" />
                <path d="M 560 90 Q 640 180 720 280 T 800 360" />
              </g>

              {/* Graticule Grid Lines (Lat/Lon) */}
              {[10, 15, 20].map((lat) => {
                const { y } = project(lat, bounds.minLon);
                return (
                  <g key={`lat-${lat}`}>
                    <line x1="0" y1={y} x2={mapWidth} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                    <text x="8" y={y - 4} fill="#64748b" fontSize="10" fontFamily="monospace">
                      {lat}°N
                    </text>
                  </g>
                );
              })}
              {[60, 70, 80, 90].map((lon) => {
                const { x } = project(bounds.minLat, lon);
                return (
                  <g key={`lon-${lon}`}>
                    <line x1={x} y1="0" x2={x} y2={mapHeight} stroke="#1e293b" strokeDasharray="3 3" />
                    <text x={x + 4} y={mapHeight - 8} fill="#64748b" fontSize="10" fontFamily="monospace">
                      {lon}°E
                    </text>
                  </g>
                );
              })}

              {/* Simplified Landmass Outlines: India Subcontinent & Surrounding Shores */}
              {/* Indian Peninsula */}
              <polygon
                points={`
                  ${project(25.0, 68.0).x},${project(25.0, 68.0).y} 
                  ${project(22.0, 70.0).x},${project(22.0, 70.0).y} 
                  ${project(19.0, 72.8).x},${project(19.0, 72.8).y} 
                  ${project(15.0, 74.0).x},${project(15.0, 74.0).y} 
                  ${project(10.0, 76.0).x},${project(10.0, 76.0).y} 
                  ${project(8.08, 77.5).x},${project(8.08, 77.5).y} 
                  ${project(10.5, 79.8).x},${project(10.5, 79.8).y} 
                  ${project(13.0, 80.3).x},${project(13.0, 80.3).y} 
                  ${project(17.7, 83.3).x},${project(17.7, 83.3).y} 
                  ${project(21.5, 87.0).x},${project(21.5, 87.0).y} 
                  ${project(24.0, 89.0).x},${project(24.0, 89.0).y} 
                  ${project(26.0, 88.0).x},${project(26.0, 88.0).y} 
                  ${project(26.0, 68.0).x},${project(26.0, 68.0).y}
                `}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
              />

              {/* Sri Lanka */}
              <polygon
                points={`
                  ${project(9.5, 80.2).x},${project(9.5, 80.2).y} 
                  ${project(8.5, 81.2).x},${project(8.5, 81.2).y} 
                  ${project(6.5, 81.0).x},${project(6.5, 81.0).y} 
                  ${project(6.8, 80.0).x},${project(6.8, 80.0).y} 
                  ${project(8.0, 79.8).x},${project(8.0, 79.8).y}
                `}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.2"
              />

              {/* Arabian Peninsula & Horn of Africa (West Coast) */}
              <polygon
                points={`
                  ${project(26.0, 52.0).x},${project(26.0, 52.0).y} 
                  ${project(24.0, 57.0).x},${project(24.0, 57.0).y} 
                  ${project(20.0, 59.0).x},${project(20.0, 59.0).y} 
                  ${project(16.5, 54.0).x},${project(16.5, 54.0).y} 
                  ${project(12.0, 51.0).x},${project(12.0, 51.0).y} 
                  ${project(5.0, 51.0).x},${project(5.0, 51.0).y} 
                  ${project(5.0, 48.0).x},${project(5.0, 48.0).y} 
                  ${project(26.0, 48.0).x},${project(26.0, 48.0).y}
                `}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
              />

              {/* Myanmar & Southeast Asia (East Coast) */}
              <polygon
                points={`
                  ${project(24.0, 92.0).x},${project(24.0, 92.0).y} 
                  ${project(20.0, 93.5).x},${project(20.0, 93.5).y} 
                  ${project(16.0, 94.5).x},${project(16.0, 94.5).y} 
                  ${project(14.0, 98.0).x},${project(14.0, 98.0).y} 
                  ${project(6.0, 98.0).x},${project(6.0, 98.0).y} 
                  ${project(6.0, 100.0).x},${project(6.0, 100.0).y} 
                  ${project(26.0, 100.0).x},${project(26.0, 100.0).y}
                `}
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
              />

              {/* Geographic Basin Labels */}
              <text x={project(16, 64).x} y={project(16, 64).y} fill="#94a3b8" fontSize="13" fontWeight="600" opacity="0.6" textAnchor="middle">
                ARABIAN SEA
              </text>
              <text x={project(15, 87).x} y={project(15, 87).y} fill="#94a3b8" fontSize="13" fontWeight="600" opacity="0.6" textAnchor="middle">
                BAY OF BENGAL
              </text>
              <text x={project(6, 75).x} y={project(6, 75).y} fill="#94a3b8" fontSize="12" fontWeight="500" opacity="0.5" textAnchor="middle">
                EQUATORIAL INDIAN OCEAN
              </text>
              <text x={project(18, 77.5).x} y={project(18, 77.5).y} fill="#475569" fontSize="11" fontWeight="bold" textAnchor="middle">
                INDIA
              </text>

              {/* ARGO Float Markers */}
              {showFloats &&
                REAL_ARGO_FLOATS.map((float) => {
                  const pt = project(float.lat, float.lon);
                  const isHovered = hoveredFloat?.floatId === float.floatId;
                  const isCoLocated = currentAnalysis.nearestFloat?.floatId === float.floatId;

                  return (
                    <g
                      key={float.floatId}
                      transform={`translate(${pt.x}, ${pt.y})`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredFloat(float)}
                      onMouseLeave={() => setHoveredFloat(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCoords(float.lat, float.lon);
                      }}
                    >
                      {/* Pulse Circle */}
                      <circle r={isCoLocated ? "9" : "5"} fill="#f59e0b" fillOpacity={isCoLocated ? "0.4" : "0.2"} className="animate-ping" />
                      <circle
                        r={isCoLocated ? "5.5" : "3.5"}
                        fill={isCoLocated ? "#fbbf24" : "#f59e0b"}
                        stroke="#0f172a"
                        strokeWidth="1.2"
                      />
                      {/* Label if hovered */}
                      {isHovered && (
                        <g transform="translate(10, -10)">
                          <rect x="0" y="-18" width="130" height="24" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
                          <text x="6" y="-3" fill="#f8fafc" fontSize="10" fontFamily="monospace">
                            WMO: {float.wmo} (QC: 1)
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

              {/* Selected Point Marker */}
              {(() => {
                const sel = project(selectedLat, selectedLon);
                return (
                  <g transform={`translate(${sel.x}, ${sel.y})`}>
                    {/* Reticle Target */}
                    <circle r="18" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin" />
                    <circle r="7" fill="#00f0ff" fillOpacity="0.3" />
                    <circle r="3" fill="#ffffff" />
                    <line x1="-24" y1="0" x2="24" y2="0" stroke="#00f0ff" strokeWidth="1" opacity="0.7" />
                    <line x1="0" y1="-24" x2="0" y2="24" stroke="#00f0ff" strokeWidth="1" opacity="0.7" />
                  </g>
                );
              })()}
            </svg>

            {/* Interactive Color Scale Legend (Bottom Left) */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-xs shadow-xl space-y-1.5 pointer-events-none">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 gap-4">
                <span>{varMeta.name}</span>
                <span className="text-cyan-400 font-semibold">{varMeta.unit}</span>
              </div>
              <div
                className="w-48 h-3 rounded"
                style={{
                  background: `linear-gradient(to right, ${varMeta.palette.join(', ')})`,
                }}
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{varMeta.min} {varMeta.unit}</span>
                <span>{((varMeta.min + varMeta.max) / 2).toFixed(1)}</span>
                <span>{varMeta.max} {varMeta.unit}</span>
              </div>
            </div>

            {/* Coordinate Readout Badge (Top Right) */}
            <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 shadow-xl flex items-center gap-3">
              <span className="text-slate-500">Target:</span>
              <span className="text-cyan-300 font-bold">{selectedLat}°N, {selectedLon}°E</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-300 font-semibold">{selectedValue} {varMeta.unit}</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Location Inspector & 16-D Latent Satellite Embedding */}
        <div className="space-y-3 flex flex-col">
          {/* Query Point Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Spatial Sampling Point</span>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/60">
                Ocean Cell #9328
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-[10px] text-slate-500 uppercase">Latitude</div>
                <div className="text-sm font-bold text-slate-200">{selectedLat}°N</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <div className="text-[10px] text-slate-500 uppercase">Longitude</div>
                <div className="text-sm font-bold text-slate-200">{selectedLon}°E</div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Surface Temp (SST):</span>
                <span className="text-cyan-300 font-mono font-semibold">{getVariableValue(selectedLat, selectedLon, 'sst')} °C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Salinity (SSS):</span>
                <span className="text-emerald-300 font-mono font-semibold">{getVariableValue(selectedLat, selectedLon, 'sss')} PSU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sea Level (SSH):</span>
                <span className="text-amber-300 font-mono font-semibold">{getVariableValue(selectedLat, selectedLon, 'ssh')} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mixed Layer (MLD):</span>
                <span className="text-indigo-300 font-mono font-semibold">{getVariableValue(selectedLat, selectedLon, 'mld')} m</span>
              </div>
            </div>

            {/* Nearest ARGO Float Match Status */}
            {currentAnalysis.nearestFloat ? (
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between text-amber-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    ARGO In-Situ Match
                  </span>
                  <span className="text-[11px] font-mono">{currentAnalysis.floatDistanceKm} km</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Float: <strong className="text-slate-200 font-mono">{currentAnalysis.nearestFloat.wmo}</strong> ({currentAnalysis.nearestFloat.platformType})
                </div>
                <button
                  onClick={() => onNavigateToArgo(currentAnalysis.nearestFloat!.floatId)}
                  className="w-full mt-1 py-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded transition-colors flex items-center justify-center gap-1"
                >
                  Inspect In-Situ Comparison <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 italic p-2 bg-slate-950 rounded border border-slate-800/60">
                No ARGO float within 350 km. Click near an orange dot to compare with an in-situ float!
              </div>
            )}
          </div>

          {/* 16-D Latent Satellite Embedding Tensor Preview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg space-y-2 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Latent Tensor (z):
                </span>
                <span className="text-cyan-300 font-mono text-[11px] font-bold">16 Dimensions</span>
              </div>
              <div className="grid grid-cols-8 gap-1 py-1">
                {currentAnalysis.latentEmbedding.map((val, idx) => {
                  const intensity = Math.min(1, Math.abs(val));
                  const bg = val >= 0 ? `rgba(6, 182, 212, ${0.2 + intensity * 0.7})` : `rgba(239, 68, 68, ${0.2 + intensity * 0.7})`;
                  return (
                    <div
                      key={idx}
                      title={`Dim [${idx}]: ${val}`}
                      style={{ backgroundColor: bg }}
                      className="h-6 rounded text-[8px] font-mono flex items-center justify-center border border-slate-800 text-white font-semibold cursor-default"
                    >
                      {val > 0 ? '+' : ''}{val.toFixed(1)}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1">
                <span>z[0] (Thermal heave)</span>
                <span>z[7] (Baroclinic)</span>
                <span>z[15] (Ekman)</span>
              </div>
            </div>

            {/* Launch 3D Subsurface Reconstruction CTA */}
            <button
              onClick={onNavigateToReconstruction}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 text-xs transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Reconstruct 3D Water Column (0–1000m)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
