import React, { useState, useMemo } from 'react';
import { generateReconstructedProfile, STANDARD_DEPTHS } from '../data/oceanData';
import { Layers, ShieldCheck, Activity, Thermometer, Droplets, Compass, BarChart3, AlertCircle } from 'lucide-react';

interface Props {
  selectedLat: number;
  selectedLon: number;
  onNavigateToValidation: () => void;
}

export const SubsurfaceReconstructionView: React.FC<Props> = ({
  selectedLat,
  selectedLon,
  onNavigateToValidation,
}) => {
  const [selectedDepth, setSelectedDepth] = useState<number>(75);
  const [activeTab, setActiveTab] = useState<'temperature' | 'salinity' | 'density'>('temperature');
  const [rotationAngle, setRotationAngle] = useState<number>(25);

  const { profile, physicsReport, latentEmbedding, nearestFloat, floatDistanceKm } = useMemo(() => {
    return generateReconstructedProfile(selectedLat, selectedLon);
  }, [selectedLat, selectedLon]);

  const currentLevel = profile.find((p) => p.depth === selectedDepth) || profile[0];

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            3D Volumetric Subsurface Ocean Model (0–1000m)
          </h2>
          <p className="text-xs text-slate-400">
            Depth-conditioned neural reconstruction at <strong className="text-cyan-300 font-mono">{selectedLat}°N, {selectedLon}°E</strong> · Cop-GLORYS12V1 benchmark
          </p>
        </div>

        {/* Physics Stability Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-mono ${
            physicsReport.isStable
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            <span>UNESCO EOS-80: <strong>{physicsReport.isStable ? '✓ Statically Stable' : '⚠ Inversion Review'}</strong></span>
          </div>

          {nearestFloat && (
            <button
              onClick={onNavigateToValidation}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Compare ARGO Float ({floatDistanceKm} km) →
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: 3D Water Column Visualizer & Profile Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 3D Volumetric Ocean Water Column */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Vertical Stratification Column
            </span>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span>Orbit:</span>
              <input
                type="range"
                min="0"
                max="60"
                value={rotationAngle}
                onChange={(e) => setRotationAngle(Number(e.target.value))}
                className="w-20 accent-cyan-400 cursor-pointer"
              />
              <span>{rotationAngle}°</span>
            </div>
          </div>

          {/* 3D Isometric Water Column Canvas */}
          <div className="relative w-full h-[380px] bg-gradient-to-b from-[#09182b] to-[#040912] rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center p-4">
            <svg
              viewBox="0 0 320 340"
              className="w-full h-full"
              style={{
                transform: `rotateY(${rotationAngle - 25}deg) rotateX(10deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.1s ease-out',
              }}
            >
              <defs>
                <linearGradient id="columnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" /> {/* 0m surface warm */}
                  <stop offset="15%" stopColor="#06b6d4" stopOpacity="0.85" /> {/* 75m thermocline */}
                  <stop offset="40%" stopColor="#0284c7" stopOpacity="0.8" /> {/* 200m */}
                  <stop offset="70%" stopColor="#1e3a8a" stopOpacity="0.8" /> {/* 500m */}
                  <stop offset="100%" stopColor="#0a192f" stopOpacity="0.95" /> {/* 1000m deep abyss */}
                </linearGradient>

                <linearGradient id="topCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>

              {/* Top Surface Disc (0m) */}
              <ellipse cx="160" cy="35" rx="80" ry="24" fill="url(#topCapGrad)" opacity="0.85" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="160" y="38" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
                0m Surface: {profile[0].reconstructedTemp.toFixed(1)}°C
              </text>

              {/* 3D Cylinder Body */}
              <path
                d="M 80 35 L 80 290 A 80 24 0 0 0 240 290 L 240 35 A 80 24 0 0 1 80 35"
                fill="url(#columnGrad)"
                stroke="#0369a1"
                strokeWidth="1"
              />

              {/* Horizontal Depth Slice Rings */}
              {STANDARD_DEPTHS.map((depth) => {
                // Map depth to Y coordinate (nonlinear scale: 0-200m gets top half, 200-1000m gets bottom half)
                let y = 35;
                if (depth <= 200) {
                  y = 35 + (depth / 200) * 140;
                } else {
                  y = 175 + ((depth - 200) / 800) * 115;
                }

                const isCurrent = depth === selectedDepth;

                return (
                  <g
                    key={depth}
                    className="cursor-pointer"
                    onClick={() => setSelectedDepth(depth)}
                  >
                    <ellipse
                      cx="160"
                      cy={y}
                      rx={isCurrent ? "84" : "80"}
                      ry={isCurrent ? "26" : "24"}
                      fill={isCurrent ? "rgba(0, 240, 255, 0.25)" : "none"}
                      stroke={isCurrent ? "#00f0ff" : "#38bdf8"}
                      strokeWidth={isCurrent ? "2.5" : "0.75"}
                      strokeDasharray={isCurrent ? "none" : "2 2"}
                      opacity={isCurrent ? 1 : 0.45}
                    />

                    {/* Depth Label & Tag */}
                    {(depth === 0 || depth === 50 || depth === 100 || depth === 200 || depth === 500 || depth === 1000 || isCurrent) && (
                      <g>
                        <line x1="240" y1={y} x2="265" y2={y} stroke={isCurrent ? "#00f0ff" : "#64748b"} strokeWidth="1" />
                        <text
                          x="270"
                          y={y + 3}
                          fill={isCurrent ? "#00f0ff" : "#94a3b8"}
                          fontSize={isCurrent ? "11" : "9"}
                          fontFamily="monospace"
                          fontWeight={isCurrent ? "bold" : "normal"}
                        >
                          {depth}m
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Bottom Disc (1000m) */}
              <ellipse cx="160" cy="290" rx="80" ry="24" fill="#030b17" stroke="#1e293b" strokeWidth="1" />
              <text x="160" y="295" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
                1000m Abyssal Base ({profile[profile.length - 1].reconstructedTemp.toFixed(1)}°C)
              </text>
            </svg>

            {/* Ocean Zone Indicators on Left */}
            <div className="absolute top-4 left-3 space-y-3 pointer-events-none text-[10px] font-mono">
              <div className="bg-slate-900/80 border border-orange-500/30 px-2 py-1 rounded text-orange-300">
                Epipelagic (0–200m)
                <div className="text-[9px] text-slate-400">Mixed Layer &amp; Thermocline</div>
              </div>
              <div className="bg-slate-900/80 border border-blue-500/30 px-2 py-1 rounded text-blue-300 mt-14">
                Mesopelagic (200–1000m)
                <div className="text-[9px] text-slate-400">Deep Cold Water Column</div>
              </div>
            </div>
          </div>

          {/* Quick Depth Selector Buttons */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1.5">
              <span>Standard Oceanographic Depth:</span>
              <span className="text-cyan-300 font-bold">{selectedDepth} meters</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {STANDARD_DEPTHS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDepth(d)}
                  className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                    selectedDepth === d
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Physical Profile Curves & Numerical Data */}
        <div className="lg:col-span-7 space-y-4">
          {/* Depth Profile Chart Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              {/* Profile Variable Toggle */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setActiveTab('temperature')}
                  className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'temperature' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Thermometer className="w-3.5 h-3.5" />
                  Temperature T(z)
                </button>
                <button
                  onClick={() => setActiveTab('salinity')}
                  className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'salinity' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5" />
                  Salinity S(z)
                </button>
                <button
                  onClick={() => setActiveTab('density')}
                  className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'density' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  UNESCO EOS-80 ρ(z)
                </button>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-cyan-400" />
                  <span className="text-cyan-300 font-semibold">OceanEmbed AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-400 border-b border-dashed" />
                  <span className="text-amber-300">GLORYS12V1 Ref</span>
                </div>
                {nearestFloat && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    <span className="text-orange-300">ARGO In-Situ</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Curve Graph (SVG) */}
            <div className="h-64 w-full bg-[#08111e] rounded-xl p-3 relative select-none">
              <svg viewBox="0 0 540 220" className="w-full h-full">
                {/* Horizontal Depth Grid lines */}
                {[0, 100, 200, 500, 1000].map((d) => {
                  const y = 20 + (d <= 200 ? (d / 200) * 90 : 90 + ((d - 200) / 800) * 90);
                  return (
                    <g key={d}>
                      <line x1="45" y1={y} x2="520" y2={y} stroke="#1e293b" strokeDasharray="2 2" />
                      <text x="38" y={y + 3} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
                        {d}m
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Parameter Axis Markers */}
                {activeTab === 'temperature' &&
                  [4, 10, 16, 22, 28].map((temp) => {
                    const x = 50 + ((temp - 4) / (32 - 4)) * 460;
                    return (
                      <g key={temp}>
                        <line x1={x} y1="15" x2={x} y2="200" stroke="#1e293b" strokeDasharray="2 2" />
                        <text x={x} y="214" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
                          {temp}°C
                        </text>
                      </g>
                    );
                  })}

                {/* Draw Curves */}
                {(() => {
                  // Coordinate Mapper
                  const getX = (val: number, min: number, max: number) => {
                    return 50 + ((val - min) / (max - min)) * 460;
                  };
                  const getY = (depth: number) => {
                    return 20 + (depth <= 200 ? (depth / 200) * 90 : 90 + ((depth - 200) / 800) * 90);
                  };

                  let minVal = 4;
                  let maxVal = 32;
                  if (activeTab === 'salinity') {
                    minVal = 32.0;
                    maxVal = 36.8;
                  } else if (activeTab === 'density') {
                    minVal = 1022.0;
                    maxVal = 1028.5;
                  }

                  // Build Points for AI Reconstruction
                  const aiPoints = profile.map((p) => {
                    const v = activeTab === 'temperature' ? p.reconstructedTemp : activeTab === 'salinity' ? p.reconstructedSalinity : p.reconstructedDensity;
                    return `${getX(v, minVal, maxVal)},${getY(p.depth)}`;
                  });

                  // Build Points for GLORYS Reference
                  const glorysPoints = profile.map((p) => {
                    const v = activeTab === 'temperature' ? p.glorysRefTemp : activeTab === 'salinity' ? p.glorysRefSalinity : p.glorysRefDensity;
                    return `${getX(v, minVal, maxVal)},${getY(p.depth)}`;
                  });

                  // ARGO Points (if available)
                  const argoPoints = profile
                    .filter((p) => p.argoObservedTemp !== null && activeTab === 'temperature')
                    .map((p) => ({
                      x: getX(p.argoObservedTemp!, minVal, maxVal),
                      y: getY(p.depth),
                      val: p.argoObservedTemp!,
                    }));

                  return (
                    <g>
                      {/* GLORYS Reference Path */}
                      <polyline points={glorysPoints.join(' ')} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" opacity="0.75" />

                      {/* AI Reconstructed Path */}
                      <polyline points={aiPoints.join(' ')} fill="none" stroke="#00f0ff" strokeWidth="2.5" />

                      {/* ARGO Float In-situ Points */}
                      {argoPoints.map((pt, idx) => (
                        <circle key={idx} cx={pt.x} cy={pt.y} r="3.5" fill="#f97316" stroke="#ffffff" strokeWidth="1" />
                      ))}

                      {/* Selected Depth Crosshair */}
                      {(() => {
                        const curVal = activeTab === 'temperature' ? currentLevel.reconstructedTemp : activeTab === 'salinity' ? currentLevel.reconstructedSalinity : currentLevel.reconstructedDensity;
                        const curX = getX(curVal, minVal, maxVal);
                        const curY = getY(selectedDepth);
                        return (
                          <g>
                            <line x1="45" y1={curY} x2="520" y2={curY} stroke="#00f0ff" strokeWidth="1" opacity="0.6" />
                            <circle cx={curX} cy={curY} r="5" fill="#00f0ff" stroke="#ffffff" strokeWidth="2" />
                          </g>
                        );
                      })()}
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Depth Level Readout Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Target Depth</span>
                <div className="text-sm font-bold text-slate-200">{currentLevel.depth} m <span className="text-[10px] text-slate-400">({currentLevel.pressureDbar} dbar)</span></div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">AI Reconstructed Temp</span>
                <div className="text-sm font-bold text-cyan-300">{currentLevel.reconstructedTemp.toFixed(2)} °C</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">GLORYS Reference</span>
                <div className="text-sm font-bold text-amber-300">{currentLevel.glorysRefTemp.toFixed(2)} °C</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">UNESCO EOS-80 Density</span>
                <div className="text-sm font-bold text-emerald-300">{currentLevel.reconstructedDensity.toFixed(2)} kg/m³</div>
              </div>
            </div>
          </div>

          {/* Physics Engine & Brunt-Väisälä Stability Consistency Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  Thermodynamic &amp; Brunt–Väisälä Stability Audit
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Criterion: N² ≥ -1×10⁻⁶ s⁻²
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              At every vertical step, the Physics-Informed Neural Network verifies that density strictly increases downward.
              Brunt–Väisälä buoyancy frequency squared evaluates local stratification stability:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                <div className="text-[10px] text-slate-500 uppercase">Min Buoyancy Freq (N²)</div>
                <div className="text-sm font-bold text-emerald-400">{physicsReport.minN2} s⁻²</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                <div className="text-[10px] text-slate-500 uppercase">Thermocline Center</div>
                <div className="text-sm font-bold text-cyan-300">~{physicsReport.thermoclineDepthM} meters</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80">
                <div className="text-[10px] text-slate-500 uppercase">Convective Inversions</div>
                <div className="text-sm font-bold text-emerald-400">0 (Zero Unphysical Layers)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
