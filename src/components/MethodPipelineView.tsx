import React from 'react';
import { Cpu, CheckCircle2, Clock, GitMerge, FileCode, Binary, Shield, Database, Sparkles, ArrowRight } from 'lucide-react';

export const MethodPipelineView: React.FC = () => {
  const pipelineSteps = [
    {
      step: 1,
      name: 'Multi-Source Satellite Harmonization Pipeline',
      status: 'IMPLEMENTED',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Ingest multi-source satellite products (OSTIA, SMAP, DUACS, OSCAR, CCMP/ASCAT) and standardize to 0.25° daily.',
      detail: 'Standardized spatial bounds: North Indian Ocean 5°N–30°N, 45°E–105°E. Area-weighted conservative regridding on SSS (0.125°) and bilinear on SST (0.05°).',
    },
    {
      step: 2,
      name: 'Surface Cloud-Gap & Feature Standardization',
      status: 'IMPLEMENTED',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Standardize multimodal surface fields to 0.25° × 0.25° daily grid with land masking.',
      detail: 'Resampled to 0.25° grid covering Northern Indian Ocean. 81×160 grid, 9,328 ocean cells identified via null masking.',
    },
    {
      step: 3,
      name: 'Satellite Embedding Engine (ViT / CNN / FNO / GNN)',
      status: 'PROTOTYPE',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: 'Extract compact latent representation (16-D / 32-D) from multimodal surface observation tensor [B, 5, H, W].',
      detail: 'Prototype: Deterministic 16-D vector derived from physical proxies (thermal heave, haline stratification, geostrophic shear). Production: Vision Transformer (ViT-Patch16) or Fourier Neural Operator (FNO-2D).',
    },
    {
      step: 4,
      name: 'Depth-Conditioned Continuous Decoder',
      status: 'PROTOTYPE',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description: 'Decode latent embedding to 15-depth temperature and salinity profiles.',
      detail: 'Hypernetwork / depth-conditional MLP decoder mapping continuous depth z ∈ [0, 1000m] into T(z) and S(z). Target depths: 0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000m.',
    },
    {
      step: 5,
      name: 'UNESCO EOS-80 Density Computation',
      status: 'IMPLEMENTED',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Compute in-situ seawater density at every reconstructed depth level.',
      detail: 'Full UNESCO 1983 EOS-80 formulation with Saunders (1981) depth-to-pressure approximation (pDbar = 0.1005·z). Verified: S=35, T=20, P=0 → 1024.76 kg/m³.',
    },
    {
      step: 6,
      name: 'Brunt–Väisälä Stability & Physics Loss Check',
      status: 'IMPLEMENTED',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Evaluate N² static stability across all 14 inter-depth layers.',
      detail: 'N² = −(g/ρ)·(dρ/dz) computed per layer. Stability criterion: N² ≥ −1×10⁻⁶ s⁻² (tolerance for numerical noise). Convective inversions penalized via PINN loss term.',
    },
    {
      step: 7,
      name: 'Physics Consistency Report',
      status: 'IMPLEMENTED',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Summarize physical realism with labeled status badge.',
      detail: 'StatusBadge: "✓ Stable" or "⚠ Review Required" — reports min/max N², mean density gradient, and inversion depths.',
    },
    {
      step: 8,
      name: 'Probabilistic Uncertainty (MC-Dropout / Ensemble)',
      status: 'PLANNED',
      badgeColor: 'text-slate-400 bg-slate-800 border-slate-700',
      description: 'Calibrated 1σ/2σ confidence bounds on reconstructed T and S profiles.',
      detail: 'Production: MC-Dropout (Gal & Ghahramani 2016) or Deep Ensemble uncertainty quantification trained with GLORYS holdout sets.',
    },
    {
      step: 9,
      name: 'INCOIS LAS & ARGO Observational Validation',
      status: 'IMPLEMENTED',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description: 'Co-locate ARGO profiles with reconstruction and compute live metrics.',
      detail: 'Haversine nearest-neighbor search (max 350 km) against 120 in-situ ARGO profiling floats and INCOIS Live Access Server climatology. Live RMSE, MAE, Bias, Pearson r.',
    },
    {
      step: 10,
      name: 'Model Backend (PyTorch / ONNX / API)',
      status: 'PLANNED',
      badgeColor: 'text-slate-400 bg-slate-800 border-slate-700',
      description: 'Swap in trained neural network weights without frontend modifications.',
      detail: 'OceanEmbedModelInterface abstraction layer ready. When a trained FNO/MAE model is available, replace PrototypeOceanEmbedModel with a concrete implementation.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Methodology &amp; Technical Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            SIH26066 Architecture: Multi-Source Satellite Harmonization → Satellite Embedding Engine → 15-Depth Physical Reconstruction
          </p>
        </div>
      </div>

      {/* End-to-End Computational Flow Ribbon */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl overflow-x-auto">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-cyan-400" />
          End-to-End Computational Data Flow
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 min-w-max pb-2">
          <div className="px-3 py-2 bg-slate-900 border border-cyan-500/40 rounded-lg text-cyan-300 text-center">
            Multi-Satellite Inputs<br /><span className="text-[10px] text-slate-400">OSTIA, SMAP, DUACS</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-center">
            0.25° Daily<br /><span className="text-[10px] text-slate-400">Harmonization</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="px-3 py-2 bg-slate-900 border border-cyan-500/40 rounded-lg text-cyan-300 text-center">
            Satellite Embedding<br /><span className="text-[10px] text-slate-400">16-D Latent Tensor (z)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="px-3 py-2 bg-slate-900 border border-blue-500/40 rounded-lg text-blue-300 text-center">
            Depth-Conditioned Decoder<br /><span className="text-[10px] text-slate-400">Continuous MLP (z ∈ [0, 1000m])</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="px-3 py-2 bg-slate-900 border border-emerald-500/40 rounded-lg text-emerald-300 text-center">
            UNESCO EOS-80<br /><span className="text-[10px] text-slate-400">Brunt-Väisälä N² &gt; 0</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-lg text-amber-300 text-center">
            ARGO In-Situ Validation<br /><span className="text-[10px] text-slate-400">120+ Oceanic Floats</span>
          </div>
        </div>
      </div>

      {/* Neural Network Spec & Physics Loss Function Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Architecture Spec */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wide">
            <Binary className="w-4 h-4 text-cyan-400" />
            Neural Model Specification
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Encoder Backbone</span>
              <span className="text-slate-200">Vision Transformer (ViT-Patch16) / Fourier Neural Operator (FNO-2D)</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Depth Decoder Mechanism</span>
              <span className="text-slate-200">Hypernetwork Depth-Conditional MLP [z_dim=16 → 128 → 64 → T(z), S(z)]</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Reconstruction Target</span>
              <span className="text-cyan-300">15 Standard Depths down to 1000m depth with continuous depth interpolation</span>
            </div>
          </div>
        </div>

        {/* Physics-Informed Loss Function */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wide">
            <Shield className="w-4 h-4 text-emerald-400" />
            Physics-Informed Loss Function (PINN)
          </div>
          <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-cyan-300">
            L_total = L_MSE + λ_phys · L_stability + λ_grad · L_gradient
          </div>
          <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>
              • <strong>L_MSE</strong>: Data fidelity loss against Copernicus GLORYS12V1 reanalysis targets and ARGO profiles.
            </p>
            <p>
              • <strong>L_stability</strong>: Heavily penalizes unphysical convective density inversions (where Brunt–Väisälä N² &lt; 0).
            </p>
            <p>
              • <strong>L_gradient</strong>: Regularizes the vertical temperature lapse rate |dT/dz| through the sharp pycnocline.
            </p>
          </div>
        </div>
      </div>

      {/* 10 Pipeline Stages Detailed Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          The 10 Computational Pipeline Stages
        </h3>

        <div className="divide-y divide-slate-800/80">
          {pipelineSteps.map((step) => (
            <div key={step.step} className="py-3.5 space-y-1.5 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                  <span className="font-semibold text-slate-200 text-xs">{step.name}</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${step.badgeColor}`}>
                  {step.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 pl-7">{step.description}</p>
              <div className="text-[11px] font-mono text-slate-500 pl-7">{step.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
