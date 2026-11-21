import React from 'react';
import {
  Activity,
  BookOpen,
  Droplets,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ShieldOff,
  Smartphone,
  Sun,
  Volume2,
  VolumeX,
  Wind,
  ZapOff,
} from 'lucide-react';
import { ActiveTab, CrisisScenarioId } from '../types/hollow';

interface TopCrisisBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isRunning: boolean;
  simSpeed: 1 | 2;
  onToggleRun: () => void;
  onToggleSpeed: () => void;
  onTriggerScenario: (id: CrisisScenarioId) => void;
  onReset: () => void;
  activeScenarios: CrisisScenarioId[];
  audioEnabled: boolean;
  onToggleAudio: () => void;
  handsetOpen: boolean;
  onToggleHandset: () => void;
  onOpenBriefing: () => void;
  kpis: {
    meshNodesTotal: number;
    dirNetDownCount: number;
    blackoutLevels: number;
    droopWarnLevels: number;
    residentsWaterProtectedK: number;
    lungGapRatio: string;
    kinVerifiedCount: number;
    kinTotalCount: number;
    spoofsBlocked: number;
  };
}

export const TopCrisisBar: React.FC<TopCrisisBarProps> = ({
  activeTab,
  onSelectTab,
  isRunning,
  simSpeed,
  onToggleRun,
  onToggleSpeed,
  onTriggerScenario,
  onReset,
  activeScenarios,
  audioEnabled,
  onToggleAudio,
  handsetOpen,
  onToggleHandset,
  onOpenBriefing,
  kpis,
}) => {
  const tabs: { id: ActiveTab; label: string; badge: string; sub: string }[] = [
    {
      id: 'TOPOLOGY',
      label: 'HOLLOW CROSS-SECTION',
      badge: 'L01–L12',
      sub: 'Pipe-Mesh & Level Control',
    },
    {
      id: 'GRID_WATER',
      label: 'EARLY WARNING & WATER',
      badge: '#1 · #4',
      sub: 'Hz Droop & Faster-Than-Flow Lock',
    },
    {
      id: 'KIN_MESH',
      label: 'KIN-LINK & OFF-GRID',
      badge: '#7 · #8',
      sub: '64-Byte Beacons & Spoof Shield',
    },
    {
      id: 'LUNG_WATCH',
      label: 'LUNG WATCH & MEDIC',
      badge: '#9 · #10',
      sub: 'Outbreak Truth vs. Directorate',
    },
    {
      id: 'SURFACE_EXODUS',
      label: 'SURFACE TRUTH & EXODUS',
      badge: '#13–#15',
      sub: 'Storm-Pipe Probe & Outpost Sim',
    },
    {
      id: 'ACOUSTIC_LAB',
      label: 'LIVE AUDIO MODEM',
      badge: 'REAL TX/RX',
      sub: 'Speaker + Mic 16-MFSK Lab',
    },
  ];

  const scenarioButtons: {
    id: CrisisScenarioId;
    label: string;
    tags: string;
    icon: React.ReactNode;
    accent: string;
    activeBg: string;
  }[] = [
    {
      id: 'BLACKOUT_CASCADE',
      label: 'Deep Blackout Cascade',
      tags: '#1 · #8',
      icon: <ZapOff className="w-3.5 h-3.5" />,
      accent: 'border-amber-500/40 text-amber-300 hover:bg-amber-500/15',
      activeBg: 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    },
    {
      id: 'DIRECTORATE_SHUTDOWN',
      label: 'DirNet Kill-Switch + Spoof',
      tags: '#7',
      icon: <ShieldOff className="w-3.5 h-3.5" />,
      accent: 'border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/15',
      activeBg: 'bg-cyan-500/25 border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.3)]',
    },
    {
      id: 'TOXIC_WATER_SLUG',
      label: 'Recycler-8 Toxic Backflow',
      tags: '#4',
      icon: <Droplets className="w-3.5 h-3.5" />,
      accent: 'border-rose-500/40 text-rose-300 hover:bg-rose-500/15',
      activeBg: 'bg-rose-500/25 border-rose-400 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
    },
    {
      id: 'LUNG_SURGE',
      label: 'Vent-Shaft Lung Surge',
      tags: '#9 · #10',
      icon: <Wind className="w-3.5 h-3.5" />,
      accent: 'border-purple-500/40 text-purple-300 hover:bg-purple-500/15',
      activeBg: 'bg-purple-500/25 border-purple-400 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.3)]',
    },
    {
      id: 'DAYBREAK_PROOF',
      label: 'Surface Daybreak Proof',
      tags: '#13',
      icon: <Sun className="w-3.5 h-3.5" />,
      accent: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/15',
      activeBg: 'bg-emerald-500/25 border-emerald-400 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
    },
  ];

  return (
    <header className="border-b border-slate-800/90 bg-[#0a0e14]/95 backdrop-blur sticky top-0 z-40">
      {/* Top Row: Brand, Global Telemetry Strip, Resident Device & Judge Pitch */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/70">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.18)]">
            <Radio className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0e14]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-wider text-sm sm:text-base text-white">
                CONDUIT
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                HOLLOW YR 2117 · BOREHOLE-07
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Sub-Surface Acoustic Steel-Pipe &amp; LoRa Delay-Tolerant Crisis OS
            </p>
          </div>
        </div>

        {/* Live System KPI Strip */}
        <div className="hidden xl:flex items-center gap-4 bg-[#0d131b] border border-slate-800 rounded-lg px-3.5 py-1.5 font-mono text-xs">
          <div>
            <span className="text-slate-500 text-[10px] block">MESH PEERS (#7)</span>
            <span className="text-cyan-300 font-semibold">
              {kpis.meshNodesTotal.toLocaleString()} nodes
            </span>
            {kpis.dirNetDownCount > 0 && (
              <span className="ml-1.5 text-[10px] text-amber-400">
                (DirNet cut: {kpis.dirNetDownCount}L)
              </span>
            )}
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 text-[10px] block">GRID / AIR (#1)</span>
            <span className="text-amber-300 font-semibold">
              {kpis.blackoutLevels} dark · {kpis.droopWarnLevels} warn
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 text-[10px] block">WATER GUARD (#4)</span>
            <span className="text-emerald-300 font-semibold">
              {kpis.residentsWaterProtectedK.toLocaleString()}k safe
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 text-[10px] block">KIN HEARTBEATS (#8)</span>
            <span className="text-slate-100 font-semibold">
              {kpis.kinVerifiedCount}/{kpis.kinTotalCount} alive
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 text-[10px] block">TRUTH GAP (#9)</span>
            <span className="text-rose-400 font-semibold">{kpis.lungGapRatio}x hidden</span>
          </div>
        </div>

        {/* Right Controls: Audio, Sim Clock, Resident Handset, Judge Guide */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-800 bg-[#0e141d] p-0.5">
            <button
              onClick={onToggleRun}
              title={isRunning ? 'Pause Live Simulation' : 'Resume Live Simulation'}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition ${
                isRunning
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'LIVE' : 'PAUSED'}</span>
            </button>
            <button
              onClick={onToggleSpeed}
              className="px-2 py-1 text-xs font-mono text-slate-300 hover:text-white transition"
              title="Toggle Simulation Speed"
            >
              {simSpeed}x
            </button>
          </div>

          <button
            onClick={onToggleAudio}
            title="Toggle WebAudio Piezo Pipe Chirps & Early Warning Tones"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition ${
              audioEnabled
                ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200'
                : 'border-slate-800 bg-[#0e141d] text-slate-400 hover:text-slate-200'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{audioEnabled ? 'SONIC ON' : 'AUDIO'}</span>
          </button>

          <button
            onClick={onToggleHandset}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition ${
              handsetOpen
                ? 'border-amber-400 bg-amber-500/25 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.28)]'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>L11 HANDSET</span>
          </button>

          <button
            onClick={onOpenBriefing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-500/50 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 text-xs font-mono font-medium transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JUDGE PITCH</span>
          </button>
        </div>
      </div>

      {/* Second Row: Judge Crisis Simulator Bar */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 bg-[#080b10]/90 border-b border-slate-800/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-400 mr-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>INJECT CRISIS:</span>
          </span>
          {scenarioButtons.map((btn) => {
            const isActive = activeScenarios.includes(btn.id);
            return (
              <button
                key={btn.id}
                onClick={() => onTriggerScenario(btn.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono transition cursor-pointer ${
                  isActive ? btn.activeBg : btn.accent
                }`}
              >
                {btn.icon}
                <span>{btn.label}</span>
                <span className="text-[10px] opacity-75 px-1 py-0.2 bg-black/30 rounded">
                  {btn.tags}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono transition cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET BASELINE</span>
        </button>
      </div>

      {/* Third Row: Primary Workspace Navigation Tabs */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 flex items-center gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const selected = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`group relative flex items-center gap-2.5 px-3.5 py-2.5 text-left border-b-2 transition whitespace-nowrap cursor-pointer ${
                selected
                  ? 'border-cyan-400 text-white bg-cyan-500/[0.07]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-semibold tracking-wide">
                    {t.label}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      selected
                        ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t.badge}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 hidden md:block">{t.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
    </header>
  );
};
