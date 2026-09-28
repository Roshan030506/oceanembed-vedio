/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenRecorderPlayer } from './components/ScreenRecorderPlayer';
import { StandaloneVideoOnly } from './components/StandaloneVideoOnly';
import { TranscriptDrawer } from './components/TranscriptDrawer';
import {
  Waves,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  Radio,
  Layers,
  Sparkles,
  Info,
  Compass,
  Cpu,
  Play,
  Film,
  MousePointer2,
} from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<'video-only' | 'walkthrough' | 'interactive'>('video-only');
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(false);
  const [jumpTime, setJumpTime] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#060b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-cyan-500/20">
              <Waves className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  OceanEmbed
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                  SIH26066
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  ARGO Validated
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Screenrecording Video Walkthrough &amp; Explanatory Audio Guide
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('video-only')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'video-only'
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Video Only</span>
            </button>
            <button
              onClick={() => setViewMode('walkthrough')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'walkthrough'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Full Walkthrough</span>
            </button>
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'interactive'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MousePointer2 className="w-3.5 h-3.5" />
              <span>Interactive App</span>
            </button>
          </div>

          {/* Quick Action Badges & Visit Original Website */}
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setIsTranscriptOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Audio Script</span>
            </button>

            <a
              href="https://ocean-embed-bice.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <span>Original Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Render Specific Mode Requested */}
        {viewMode === 'video-only' ? (
          <StandaloneVideoOnly onBackToApp={() => setViewMode('walkthrough')} />
        ) : (
          <>
            {/* Master Screen Recorder & Video Player Component */}
            <ScreenRecorderPlayer
              onOpenTranscript={() => setIsTranscriptOpen(true)}
              isInteractiveMode={viewMode === 'interactive'}
              onToggleInteractiveMode={(isInteractive) =>
                setViewMode(isInteractive ? 'interactive' : 'walkthrough')
              }
            />

            {/* Technical Architecture Quick Highlights Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono">
                  <Compass className="w-4 h-4" />
                  0.25° Daily Basin Grid
                </div>
                <p className="text-xs text-slate-400">
                  Standardized spatial bounds covering Northern Indian Ocean (5°N–30°N, 45°E–105°E) with 9,328 active ocean cells.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider font-mono">
                  <Layers className="w-4 h-4" />
                  15 Standard Ocean Depths
                </div>
                <p className="text-xs text-slate-400">
                  Reconstructing full vertical profiles [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000m].
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  UNESCO EOS-80 Physics
                </div>
                <p className="text-xs text-slate-400">
                  Strict Brunt–Väisälä buoyancy frequency evaluation (N² ≥ -1×10⁻⁶ s⁻²) ensuring stable stratification.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider font-mono">
                  <Radio className="w-4 h-4" />
                  INCOIS ARGO Ground Truth
                </div>
                <p className="text-xs text-slate-400">
                  Real-time co-location against 120 autonomous profiling floats with live RMSE, MAE, and Pearson r metrics.
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Transcript Drawer Modal */}
      <TranscriptDrawer
        isOpen={isTranscriptOpen}
        onClose={() => setIsTranscriptOpen(false)}
        onJumpToTime={(t) => {
          setJumpTime(t);
        }}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            OceanEmbed — Smart India Hackathon (SIH26066) Walkthrough Guide.
            Data sources: Copernicus Marine GLORYS12V1, OSTIA, SMAP, DUACS, INCOIS ARGO Floats Array.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://ocean-embed-bice.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
            >
              ocean-embed-bice.vercel.app <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
