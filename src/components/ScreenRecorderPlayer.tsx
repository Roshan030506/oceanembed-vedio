import React, { useState, useEffect, useRef } from 'react';
import { WALKTHROUGH_CHAPTERS, TOTAL_WALKTHROUGH_DURATION } from '../data/walkthroughScript';
import { Chapter, SatelliteVariableKey } from '../types';
import { audioNarrator } from '../utils/audioNarrator';
import { OceanMonitorView } from './OceanMonitorView';
import { SubsurfaceReconstructionView } from './SubsurfaceReconstructionView';
import { ArgoValidationView } from './ArgoValidationView';
import { MethodPipelineView } from './MethodPipelineView';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Subtitles,
  Download,
  Maximize2,
  Minimize2,
  Radio,
  MousePointer2,
  Sparkles,
  Layers,
  FileText,
  Sliders,
  Settings,
} from 'lucide-react';

interface Props {
  onOpenTranscript: () => void;
  isInteractiveMode: boolean;
  onToggleInteractiveMode: (val: boolean) => void;
}

export const ScreenRecorderPlayer: React.FC<Props> = ({
  onOpenTranscript,
  isInteractiveMode,
  onToggleInteractiveMode,
}) => {
  // Video playback state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0.1);
  const [isRecordingExport, setIsRecordingExport] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Simulated cursor & state
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; tooltip?: string; action: string }>({
    x: 50,
    y: 50,
    tooltip: '',
    action: 'move',
  });

  // Current active view parameters
  const [activeTab, setActiveTab] = useState<'monitor' | 'reconstruction' | 'validation' | 'method'>('monitor');
  const [selectedVariable, setSelectedVariable] = useState<SatelliteVariableKey>('sst');
  const [selectedLat, setSelectedLat] = useState<number>(13.513);
  const [selectedLon, setSelectedLon] = useState<number>(65.628);
  const [selectedFloatId, setSelectedFloatId] = useState<string>('INCOIS_ARGO_2901402');
  const [zoomRegion, setZoomRegion] = useState<'all' | 'arabian' | 'bengal' | 'equatorial'>('all');

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(Date.now());

  // Determine current chapter from currentTime
  const currentChapterIndex = WALKTHROUGH_CHAPTERS.findIndex(
    (ch) => currentTime >= ch.startTime && currentTime < ch.endTime
  );
  const currentChapter = WALKTHROUGH_CHAPTERS[currentChapterIndex !== -1 ? currentChapterIndex : 0];

  // Current subtitle
  const currentSubtitle = currentChapter.subtitles.slice().reverse().find(
    (sub) => currentTime >= currentChapter.startTime + sub.timeOffset
  )?.text || currentChapter.subtitles[0]?.text || '';

  // Audio narrator event listeners
  useEffect(() => {
    const unsubSpeaking = audioNarrator.onSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
    });
    const unsubWave = audioNarrator.onWaveformUpdate((level) => {
      setAudioLevel(level);
    });

    return () => {
      unsubSpeaking();
      unsubWave();
    };
  }, []);

  // Main playback timer loop
  useEffect(() => {
    if (!isPlaying || isInteractiveMode) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTickTimeRef.current = Date.now();

    const tick = () => {
      const now = Date.now();
      const deltaSec = ((now - lastTickTimeRef.current) / 1000) * playbackSpeed;
      lastTickTimeRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + deltaSec;
        if (next >= TOTAL_WALKTHROUGH_DURATION) {
          setIsPlaying(false);
          audioNarrator.stop();
          return TOTAL_WALKTHROUGH_DURATION;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, isInteractiveMode]);

  // Sync Audio Narration with Current Chapter
  const lastSpokenChapterRef = useRef<string | null>(null);

  useEffect(() => {
    if (isInteractiveMode) return;

    if (isPlaying) {
      if (lastSpokenChapterRef.current !== currentChapter.id) {
        lastSpokenChapterRef.current = currentChapter.id;
        audioNarrator.speak(currentChapter.audioScript);
      }
    } else {
      audioNarrator.pause();
    }
  }, [isPlaying, currentChapter.id, isInteractiveMode]);

  // Sync View Settings and Cursor Choreography with Chapter & Time
  useEffect(() => {
    if (isInteractiveMode) return;

    // Sync tab
    setActiveTab(currentChapter.tab);
    if (currentChapter.variable) setSelectedVariable(currentChapter.variable);
    if (currentChapter.zoomRegion) setZoomRegion(currentChapter.zoomRegion);
    if (currentChapter.targetLat && currentChapter.targetLon) {
      setSelectedLat(currentChapter.targetLat);
      setSelectedLon(currentChapter.targetLon);
    }
    if (currentChapter.targetFloatId) setSelectedFloatId(currentChapter.targetFloatId);

    // Compute interpolated cursor position
    const actions = currentChapter.cursorActions;
    if (actions && actions.length > 0) {
      const chapterTime = currentTime - currentChapter.startTime;
      let activeAction = actions[0];

      for (let i = 0; i < actions.length; i++) {
        if (chapterTime >= actions[i].timeOffset) {
          activeAction = actions[i];
        }
      }

      setCursorPos({
        x: activeAction.xPct,
        y: activeAction.yPct,
        tooltip: activeAction.tooltip,
        action: activeAction.action,
      });
    }
  }, [currentTime, currentChapter, isInteractiveMode]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioNarrator.pause();
    } else {
      if (currentTime >= TOTAL_WALKTHROUGH_DURATION) {
        setCurrentTime(0);
        lastSpokenChapterRef.current = null;
      }
      setIsPlaying(true);
      audioNarrator.resume();
      if (!audioNarrator.isSpeaking()) {
        audioNarrator.speak(currentChapter.audioScript);
      }
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    lastSpokenChapterRef.current = null;
    audioNarrator.stop();
    if (isPlaying) {
      const targetCh = WALKTHROUGH_CHAPTERS.find((ch) => newTime >= ch.startTime && newTime < ch.endTime) || WALKTHROUGH_CHAPTERS[0];
      audioNarrator.speak(targetCh.audioScript);
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    handleSeek(chapter.startTime);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    audioNarrator.setRate(speed);
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioNarrator.setMute(next);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioNarrator.setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      audioNarrator.setMute(false);
    }
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!isFullscreen) {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Export Simulated Video recording file
  const handleExportRecording = () => {
    setIsRecordingExport(true);
    setExportProgress(10);

    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsRecordingExport(false);

          // Generate simulated downloadable video file link (WebM / MP4)
          const blob = new Blob([
            JSON.stringify({
              app: "OceanEmbed Walkthrough",
              duration: TOTAL_WALKTHROUGH_DURATION,
              chapters: WALKTHROUGH_CHAPTERS,
              date: new Date().toISOString(),
            })
          ], { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `OceanEmbed_3D_Subsurface_Walkthrough_${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          return 100;
        }
        return p + 20;
      });
    }, 400);
  };

  return (
    <div
      ref={playerContainerRef}
      className={`relative flex flex-col bg-slate-950 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Top Video Header Bar with REC Badge & Resolution */}
      <div className="bg-slate-900/90 backdrop-blur-md px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-4 select-none z-20">
        <div className="flex items-center gap-3">
          {/* Recording Badge */}
          <div className="flex items-center gap-2 bg-red-950/80 border border-red-800/80 px-2.5 py-1 rounded-full text-xs font-mono text-red-400">
            <span className={`w-2 h-2 rounded-full bg-red-500 ${isPlaying ? 'animate-ping' : ''}`} />
            <span className="font-bold tracking-wider">REC</span>
            <span className="text-slate-500">|</span>
            <span>{formatTime(currentTime)}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className="bg-slate-800 text-cyan-400 px-2 py-0.5 rounded border border-slate-700 font-semibold">
              1080p 60fps HD
            </span>
            <span className="text-slate-400">SIH26066 Walkthrough</span>
          </div>
        </div>

        {/* Right Header: Audio Waveform & Mode Toggle */}
        <div className="flex items-center gap-3">
          {/* Live Audio Frequency Waveform Visualizer */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 mr-1.5 flex items-center gap-1">
              <Radio className={`w-3 h-3 ${isSpeaking ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
              Voice Audio
            </span>
            {[0.4, 0.8, 0.6, 1.0, 0.5, 0.7, 0.9, 0.3].map((factor, idx) => {
              const h = isSpeaking ? Math.max(4, Math.min(18, audioLevel * 20 * factor)) : 3;
              return (
                <div
                  key={idx}
                  style={{ height: `${h}px` }}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    isSpeaking ? 'bg-cyan-400' : 'bg-slate-700'
                  }`}
                />
              );
            })}
          </div>

          {/* Mode Switch: Video Walkthrough vs Live Interactive Sandbox */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onToggleInteractiveMode(false)}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                !isInteractiveMode
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              Video Tour
            </button>
            <button
              onClick={() => onToggleInteractiveMode(true)}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                isInteractiveMode
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MousePointer2 className="w-3 h-3" />
              Interactive Mode
            </button>
          </div>

          {/* Export Video Recording Button */}
          <button
            onClick={handleExportRecording}
            disabled={isRecordingExport}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
            title="Download full HD screen recording video file (.webm)"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            {isRecordingExport ? `Exporting (${exportProgress}%)` : 'Export Video'}
          </button>
        </div>
      </div>

      {/* Main Screen Recording Display Stage */}
      <div className="relative w-full overflow-hidden bg-slate-950 p-4 sm:p-6 min-h-[560px]">
        {/* Top Floating Chapter Banner */}
        <div className="flex items-center justify-between mb-4 bg-slate-900/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800/80">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
              {currentChapter.title}
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {currentChapter.subtitle}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenTranscript}
              className="px-3 py-1 text-xs font-mono text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Full Transcript
            </button>
          </div>
        </div>

        {/* The Live OceanEmbed Interface (Active Tab Rendered) */}
        <div className="relative rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 shadow-inner">
          {/* Main App Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-4">
            <div className="flex items-center gap-3">
              {/* OceanEmbed Logo */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-500/20">
                OE
              </div>
              <div>
                <span className="font-bold text-sm text-white tracking-wide">
                  OceanEmbed
                </span>
                <span className="text-[10px] text-cyan-400 font-mono ml-2">
                  From Surface Signals to the Hidden Ocean
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              {[
                { id: 'monitor', label: 'Ocean Monitor' },
                { id: 'reconstruction', label: 'Subsurface Reconstruction' },
                { id: 'validation', label: 'ARGO Validation' },
                { id: 'method', label: 'Method & Pipeline' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Render Active View */}
          {activeTab === 'monitor' && (
            <OceanMonitorView
              selectedVariable={selectedVariable}
              onSelectVariable={setSelectedVariable}
              selectedLat={selectedLat}
              selectedLon={selectedLon}
              onSelectCoords={(lat, lon) => {
                setSelectedLat(lat);
                setSelectedLon(lon);
              }}
              onNavigateToReconstruction={() => setActiveTab('reconstruction')}
              onNavigateToArgo={(floatId) => {
                setSelectedFloatId(floatId);
                setActiveTab('validation');
              }}
              zoomRegion={zoomRegion}
            />
          )}

          {activeTab === 'reconstruction' && (
            <SubsurfaceReconstructionView
              selectedLat={selectedLat}
              selectedLon={selectedLon}
              onNavigateToValidation={() => setActiveTab('validation')}
            />
          )}

          {activeTab === 'validation' && (
            <ArgoValidationView
              initialFloatId={selectedFloatId}
              onSelectFloatOnMap={(lat, lon) => {
                setSelectedLat(lat);
                setSelectedLon(lon);
                setActiveTab('monitor');
              }}
            />
          )}

          {activeTab === 'method' && <MethodPipelineView />}

          {/* Simulated Animated Cursor Overlay (Only in Video Mode) */}
          {!isInteractiveMode && (
            <div
              className="absolute pointer-events-none z-40 transition-all duration-500 ease-out"
              style={{
                left: `${cursorPos.x}%`,
                top: `${cursorPos.y}%`,
                transform: 'translate(-4px, -4px)',
              }}
            >
              <div className="relative flex items-start">
                <MousePointer2 className="w-6 h-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] fill-cyan-400" />
                {cursorPos.tooltip && (
                  <div className="ml-2 bg-slate-950/95 border border-cyan-500/60 rounded px-2 py-1 text-[11px] font-mono text-cyan-300 shadow-xl whitespace-nowrap animate-in fade-in">
                    {cursorPos.tooltip}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Subtitles / English Captions Overlay */}
        {showSubtitles && currentSubtitle && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-2xl w-[90%] bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 rounded-2xl px-5 py-3 shadow-2xl z-30 text-center animate-in fade-in">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              English Walkthrough Audio Narration
            </div>
            <p className="text-sm font-medium text-slate-100 leading-snug">
              {currentSubtitle}
            </p>
          </div>
        )}
      </div>

      {/* Video Control Bar & Timeline Scrubber */}
      <div className="bg-slate-900/95 backdrop-blur-md px-5 py-3 border-t border-slate-800 space-y-2.5 select-none z-20">
        {/* Interactive Chapters Scrubber Bar */}
        <div className="relative w-full group">
          {/* Main Progress Bar Container */}
          <div
            className="relative h-2 bg-slate-800 rounded-full cursor-pointer overflow-hidden transition-all group-hover:h-3"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              handleSeek(pct * TOTAL_WALKTHROUGH_DURATION);
            }}
          >
            {/* Fill Track */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              style={{
                width: `${(currentTime / TOTAL_WALKTHROUGH_DURATION) * 100}%`,
              }}
            />
          </div>

          {/* Chapter Markers & Hover Tooltips */}
          <div className="absolute inset-0 pointer-events-none flex">
            {WALKTHROUGH_CHAPTERS.map((ch) => {
              const leftPct = (ch.startTime / TOTAL_WALKTHROUGH_DURATION) * 100;
              return (
                <div
                  key={ch.id}
                  style={{ left: `${leftPct}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-950/80"
                />
              );
            })}
          </div>
        </div>

        {/* Video Controls Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Play/Pause, Replay & Chapter Jumps */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-bold transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={() => handleSeek(Math.max(0, currentTime - 10))}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const nextCh = WALKTHROUGH_CHAPTERS[currentChapterIndex + 1];
                if (nextCh) handleSeek(nextCh.startTime);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Next Chapter"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Time Display */}
            <div className="text-xs font-mono text-slate-400 ml-2">
              <span className="text-slate-100 font-semibold">{formatTime(currentTime)}</span>
              <span className="text-slate-600"> / </span>
              <span>{formatTime(TOTAL_WALKTHROUGH_DURATION)}</span>
            </div>
          </div>

          {/* Chapter Shortcut Chips */}
          <div className="hidden xl:flex items-center gap-1.5 overflow-x-auto max-w-xl py-0.5">
            {WALKTHROUGH_CHAPTERS.map((ch, idx) => {
              const isCurrent = currentChapter.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChapterClick(ch)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {idx + 1}. {ch.title.split('. ')[1] || ch.title}
                </button>
              );
            })}
          </div>

          {/* Volume, Speed, Subtitles & Fullscreen */}
          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              {[0.75, 1.0, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    playbackSpeed === s
                      ? 'bg-cyan-900/60 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Volume & Mute */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleMute}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-16 accent-cyan-400 h-1.5 cursor-pointer bg-slate-800 rounded-lg"
              />
            </div>

            {/* Subtitles Toggle */}
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`p-1.5 rounded-lg border transition-colors ${
                showSubtitles
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title="Toggle Subtitles"
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
