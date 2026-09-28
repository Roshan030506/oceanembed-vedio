import React, { useState } from 'react';
import { WALKTHROUGH_CHAPTERS, TOTAL_WALKTHROUGH_DURATION } from '../data/walkthroughScript';
import { audioNarrator, VoiceOption } from '../utils/audioNarrator';
import { Chapter } from '../types';
import {
  X,
  Play,
  Volume2,
  FileText,
  Search,
  Download,
  BookOpen,
  CheckCircle2,
  Layers,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onJumpToTime: (timeSecs: number) => void;
}

export const TranscriptDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  onJumpToTime,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>('en-US-natural-f');
  const [voices, setVoices] = useState<VoiceOption[]>(() => audioNarrator.getVoices());

  if (!isOpen) return null;

  const filteredChapters = WALKTHROUGH_CHAPTERS.filter((ch) => {
    const q = searchQuery.toLowerCase();
    return (
      ch.title.toLowerCase().includes(q) ||
      ch.subtitle.toLowerCase().includes(q) ||
      ch.audioScript.toLowerCase().includes(q) ||
      ch.keyInsights.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    audioNarrator.setVoice(voiceId);
  };

  const handleDownloadTranscript = () => {
    let content = `# OceanEmbed Walkthrough Guide & Technical Narration Script\n`;
    content += `Website: https://ocean-embed-bice.vercel.app/\n`;
    content += `Generated: ${new Date().toISOString()}\n`;
    content += `Total Duration: ${Math.floor(TOTAL_WALKTHROUGH_DURATION / 60)}m ${TOTAL_WALKTHROUGH_DURATION % 60}s\n\n`;
    content += `---\n\n`;

    WALKTHROUGH_CHAPTERS.forEach((ch, i) => {
      content += `## Chapter ${i + 1}: ${ch.title}\n`;
      content += `**Subtitle**: ${ch.subtitle}\n`;
      content += `**Timecode**: [${Math.floor(ch.startTime / 60)}:${(ch.startTime % 60).toString().padStart(2, '0')} - ${Math.floor(ch.endTime / 60)}:${(ch.endTime % 60).toString().padStart(2, '0')}]\n\n`;
      content += `### English Voiceover Script:\n"${ch.audioScript}"\n\n`;
      content += `### Key Technical Insights:\n`;
      ch.keyInsights.forEach((k) => {
        content += `- ${k}\n`;
      });
      content += `\n---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OceanEmbed_Walkthrough_Guide_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Walkthrough Guide &amp; Audio Transcript
              </h2>
              <p className="text-xs text-slate-400">
                Complete English explanatory script, technical benchmarks &amp; audio controls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTranscript}
              className="p-2 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              title="Download Full Guide (Markdown)"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Download Script
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voiceover Narrator Config Bar */}
        <div className="px-5 py-3 bg-slate-900/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Narrator Voice:</span>
            <select
              value={selectedVoice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-cyan-500"
            >
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guide topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 outline-none focus:border-cyan-500 w-44"
            />
          </div>
        </div>

        {/* Chapters Transcript List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {filteredChapters.map((ch, idx) => (
            <div
              key={ch.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 hover:border-slate-700 transition-colors"
            >
              {/* Chapter Title & Action Bar */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-cyan-950 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center border border-cyan-800/60">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-sm text-slate-100">{ch.title}</h3>
                  </div>
                  <div className="text-xs text-cyan-300 font-medium ml-7 mt-0.5">
                    {ch.subtitle}
                  </div>
                </div>

                {/* Jump to time & Play Audio buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      onJumpToTime(ch.startTime);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 text-cyan-400 fill-current" />
                    {Math.floor(ch.startTime / 60)}:{(ch.startTime % 60).toString().padStart(2, '0')}
                  </button>

                  <button
                    onClick={() => audioNarrator.speak(ch.audioScript)}
                    className="p-1.5 rounded-lg bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-800/80 transition-colors"
                    title="Speak this chapter audio"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Explanatory Spoken Audio Script */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans italic border-l-2 border-l-cyan-500">
                "{ch.audioScript}"
              </div>

              {/* Key Technical Insights */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Core Scientific Takeaways
                </span>
                <ul className="space-y-1 text-xs text-slate-400">
                  {ch.keyInsights.map((insight, kIdx) => (
                    <li key={kIdx} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
