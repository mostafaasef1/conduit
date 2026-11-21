import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Droplets,
  Lock,
  Radio,
  ShieldAlert,
  Thermometer,
  Unlock,
  Users,
  Wind,
  WifiOff,
  Zap,
} from 'lucide-react';
import { EventLogEntry, LevelState, LivePacket } from '../types/hollow';

interface HollowCrossSectionProps {
  levels: LevelState[];
  selectedLevelNum: number;
  onSelectLevel: (lvl: number) => void;
  packets: LivePacket[];
  logs: EventLogEntry[];
  onToggleDamper: (lvl: number) => void;
  onToggleValve: (lvl: number) => void;
  onBoostRepeater: (lvl: number) => void;
  onBroadcastSiren: (lvl: number) => void;
}

function formatCountdown(sec: number | null): string {
  if (sec === null) return 'Stable';
  if (sec <= 0) return 'CUTOUT';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export const HollowCrossSection: React.FC<HollowCrossSectionProps> = ({
  levels,
  selectedLevelNum,
  onSelectLevel,
  packets,
  logs,
  onToggleDamper,
  onToggleValve,
  onBoostRepeater,
  onBroadcastSiren,
}) => {
  const selected = levels.find((l) => l.level === selectedLevelNum) || levels[10];

  const tierLabel = (tier: LevelState['tier']) => {
    if (tier === 'UPPER_DIRECTORATE') return { text: 'DIRECTORATE TIER', cls: 'text-sky-300 bg-sky-500/10 border-sky-500/30' };
    if (tier === 'MID_COMMONS') return { text: 'MID COMMONS', cls: 'text-slate-300 bg-slate-700/40 border-slate-600/50' };
    return { text: 'DEEP SUMP', cls: 'text-amber-300 bg-amber-500/10 border-amber-500/30' };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* LEFT / CENTER: 12-Level Vertical Cross Section of The Hollow */}
      <div className="lg:col-span-8 bg-[#0b1017] border border-slate-800/90 rounded-xl overflow-hidden flex flex-col">
        {/* Sealed Dead Surface Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-rose-950/50 via-[#111621] to-[#0d121a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <Lock className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="font-mono text-xs font-bold tracking-wider text-rose-200">
                SURFACE +0m // SEALED BLAST DOORS (CLOSED 2087–2117)
              </div>
              <div className="text-[11px] text-slate-400">
                Autonomous rogue machine zone above · 2.46M residents stacked across 12 sub-levels below
              </div>
            </div>
          </div>

          {/* Vertical Conduit Spine Legend */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              Pipe Acoustic Bus
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              DirNet Fiber
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Packet Hop
            </span>
          </div>
        </div>

        {/* Column Header Labels */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 border-b border-slate-800/80 bg-[#090d13]">
          <div className="col-span-2">SPINES / DEPTH</div>
          <div className="col-span-3">LEVEL &amp; SECTOR</div>
          <div className="col-span-3">#1 GRID &amp; AIR FORECAST</div>
          <div className="col-span-2">#4 TAP WATER</div>
          <div className="col-span-2 text-right">#7/#9 MESH &amp; LUNG</div>
        </div>

        {/* 12 Stacked Underground Levels */}
        <div className="divide-y divide-slate-800/60">
          {levels.map((lvl) => {
            const isSelected = lvl.level === selectedLevelNum;
            const packetsHere = packets.filter((p) => Math.round(p.currentLevel) === lvl.level);
            const lungRatio =
              lvl.officialLungCases > 0
                ? Math.round(lvl.verifiedLungCases / lvl.officialLungCases)
                : lvl.verifiedLungCases;

            let rowBg = 'bg-[#0b1017] hover:bg-[#101824]';
            if (lvl.powerState === 'BLACKOUT') {
              rowBg = 'bg-rose-950/[0.18] hover:bg-rose-950/[0.28]';
            } else if (lvl.powerState === 'DROOP_WARNING') {
              rowBg = 'bg-amber-950/[0.12] hover:bg-amber-950/[0.22]';
            }
            if (isSelected) {
              rowBg = 'bg-cyan-950/35 ring-1 ring-inset ring-cyan-400/60';
            }

            return (
              <div
                key={lvl.level}
                onClick={() => onSelectLevel(lvl.level)}
                className={`relative grid grid-cols-1 md:grid-cols-12 gap-2 items-center px-4 py-2.5 transition cursor-pointer ${rowBg}`}
              >
                {/* Vertical Spine Tracks (DirNet Fiber + Steel Water Main Acoustic Bus) */}
                <div className="md:col-span-2 flex items-center gap-3">
                  <div className="flex items-center gap-2 relative py-0.5">
                    {/* DirNet Spine */}
                    <div
                      title={lvl.dirNetOnline ? 'DirNet Fiber Online' : 'DirNet Severed / Killed'}
                      className={`w-1.5 h-8 rounded-full transition ${
                        lvl.dirNetOnline
                          ? 'bg-emerald-500/70'
                          : 'bg-rose-500/40 border border-dashed border-rose-500'
                      }`}
                    />
                    {/* CONDUIT Steel Pipe Ultrasonic Backbone (Always intact!) */}
                    <div
                      title="Steel Water Main #4 — 4,900 m/s Ultrasonic Pipe Modem"
                      className="relative w-2 h-8 rounded-full bg-cyan-500/35 border border-cyan-400/70 flex items-center justify-center"
                    >
                      {packetsHere.length > 0 && (
                        <span
                          className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-ping absolute"
                          title={packetsHere[0].summary}
                        />
                      )}
                      {packetsHere.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-300 z-10" />
                      )}
                    </div>
                  </div>

                  <div className="font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{lvl.code}</span>
                      <span className="text-[11px] text-slate-500">-{lvl.depthMeters}m</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Users className="w-2.5 h-2.5 text-slate-500" />
                      {lvl.populationK}k pop
                    </div>
                  </div>
                </div>

                {/* Level Name & Tier */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                      {lvl.name}
                    </span>
                    {lvl.tier === 'DEEP_SUMP' && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        DEEP
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{lvl.subtitle}</div>
                </div>

                {/* #1 Power & Air Early Warning */}
                <div className="md:col-span-3 flex flex-wrap items-center gap-1.5 font-mono text-xs">
                  {lvl.powerState === 'BLACKOUT' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/50 text-rose-200 text-[11px] font-semibold">
                      <Zap className="w-3 h-3 text-rose-400" />
                      BLACKOUT · {lvl.o2Pct.toFixed(1)}% O₂
                    </span>
                  ) : lvl.powerState === 'DROOP_WARNING' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-200 text-[11px]">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      {lvl.gridHz.toFixed(2)}Hz · Cut {formatCountdown(lvl.predictedBlackoutSec)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
                      {lvl.gridHz.toFixed(2)}Hz · {lvl.o2Pct.toFixed(1)}% O₂
                    </span>
                  )}

                  {lvl.damperSealed && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/40">
                      DAMPER SEALED
                    </span>
                  )}
                </div>

                {/* #4 Tap Water Status */}
                <div className="md:col-span-2 font-mono text-xs">
                  {lvl.valveLocked ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 text-[11px]">
                      <Lock className="w-3 h-3 text-cyan-300" />
                      VALVE LOCKED
                    </span>
                  ) : lvl.waterContaminated ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/25 border border-rose-400 text-rose-100 text-[11px] animate-pulse">
                      <Droplets className="w-3 h-3 text-rose-300" />
                      TOXIC {lvl.waterTdsPpm}ppm
                    </span>
                  ) : lvl.waterSlugEtaSec !== null ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/25 border border-amber-400 text-amber-100 text-[11px]">
                      <AlertTriangle className="w-3 h-3 text-amber-300" />
                      SLUG {formatCountdown(lvl.waterSlugEtaSec)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-300">
                      {lvl.waterTdsPpm} ppm{' '}
                      <span className="text-slate-500">
                        {lvl.waterTdsPpm > 350 ? 'hard' : 'ok'}
                      </span>
                    </span>
                  )}
                </div>

                {/* #7 Comms & #9 Outbreak Discrepancy */}
                <div className="md:col-span-2 flex items-center md:justify-end gap-2 font-mono text-[11px]">
                  {!lvl.dirNetOnline ? (
                    <span
                      title="Directorate Network Offline — Routing via CONDUIT Pipe+LoRa Mesh"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    >
                      <WifiOff className="w-3 h-3 text-rose-400" />
                      PIPE MESH
                    </span>
                  ) : (
                    <span className="text-slate-400">{lvl.meshPeers}p</span>
                  )}

                  {lvl.verifiedLungCases >= 50 && (
                    <span
                      title={`Verified Mesh Cases: ${lvl.verifiedLungCases} vs Official Directorate Claim: ${lvl.officialLungCases}`}
                      className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-400/40 text-purple-200"
                    >
                      🫁 {lvl.verifiedLungCases} ({lungRatio}x)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Geothermal Sump Footer */}
        <div className="px-4 py-2.5 bg-[#080b10] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <span>BEDROCK -1,720m // AGING GEOTHERMAL STEAM WELLS (BUILT 2084)</span>
          <span className="text-cyan-400">
            TIP: Click any level L01–L12 to operate bulkhead dampers, water valves &amp; pipe repeaters →
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Selected Level Tactical Console + Live Packet Feed */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Selected Level Inspector Card */}
        <div className="bg-[#0b1017] border border-slate-800 rounded-xl p-4">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-cyan-300">
                  {selected.code}
                </span>
                <h2 className="font-semibold text-base text-white">{selected.name}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Depth -{selected.depthMeters}m · {selected.populationK},000 residents ·{' '}
                {selected.subtitle}
              </p>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                tierLabel(selected.tier).cls
              }`}
            >
              {tierLabel(selected.tier).text}
            </span>
          </div>

          {/* 4 Live Sensor Readouts */}
          <div className="grid grid-cols-2 gap-2.5 my-3 font-mono">
            <div className="p-2.5 rounded-lg bg-[#0e151f] border border-slate-800/90">
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>MAINS / TURBINE</span>
                <Zap className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {selected.powerState === 'BLACKOUT' ? '0.00 Hz (DEAD)' : `${selected.gridHz.toFixed(2)} Hz`}
              </div>
              <div className="text-[11px] text-amber-300 mt-0.5">
                {selected.powerState === 'BLACKOUT'
                  ? 'On Supercap + Pipe Relay'
                  : selected.predictedBlackoutSec !== null
                  ? `Cutout in ${formatCountdown(selected.predictedBlackoutSec)}`
                  : 'Harmonics Nominal'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0e151f] border border-slate-800/90">
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>AIR &amp; THERMAL</span>
                <Thermometer className="w-3 h-3 text-rose-400" />
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {selected.o2Pct.toFixed(1)}% O₂ · {selected.tempC.toFixed(1)}°C
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Fan {selected.fanRpm} RPM {selected.damperSealed ? '· Sealed' : '· Open'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0e151f] border border-slate-800/90">
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>TAP CONDUCTIVITY</span>
                <Droplets className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {selected.waterTdsPpm} ppm TDS
              </div>
              <div className="text-[11px] mt-0.5">
                {selected.valveLocked ? (
                  <span className="text-cyan-300">Tap Solenoid Locked Safe</span>
                ) : selected.waterContaminated ? (
                  <span className="text-rose-400 font-semibold">BIO/METAL HAZARD!</span>
                ) : selected.waterSlugEtaSec !== null ? (
                  <span className="text-amber-300">
                    Toxic slug ETA {formatCountdown(selected.waterSlugEtaSec)}
                  </span>
                ) : (
                  <span className="text-emerald-400">Potable Threshold OK</span>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0e151f] border border-slate-800/90">
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>LUNG CASES (#9)</span>
                <ShieldAlert className="w-3 h-3 text-purple-400" />
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {selected.verifiedLungCases} <span className="text-xs font-normal text-slate-400">mesh</span>
              </div>
              <div className="text-[11px] text-rose-300 mt-0.5">
                DirNet claims: {selected.officialLungCases} · Inhalers {selected.inhalerStockPct}%
              </div>
            </div>
          </div>

          {/* Direct Neighborhood Hardware / Mesh Actions */}
          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              DIRECT CONDUIT NODE ACTIONS ({selected.code})
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => onToggleDamper(selected.level)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition cursor-pointer ${
                  selected.damperSealed
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100'
                    : 'bg-[#101722] border-slate-700 hover:border-cyan-500/50 text-slate-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  {selected.damperSealed ? 'Unseal Air Damper' : 'Seal Air Damper'}
                </span>
                <span className="text-[10px] opacity-75">#1/#9</span>
              </button>

              <button
                onClick={() => onToggleValve(selected.level)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition cursor-pointer ${
                  selected.valveLocked
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
                    : 'bg-[#101722] border-slate-700 hover:border-emerald-500/50 text-slate-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {selected.valveLocked ? (
                    <Unlock className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  {selected.valveLocked ? 'Reopen Tap Valve' : 'Lock Tap Solenoid'}
                </span>
                <span className="text-[10px] opacity-75">#4</span>
              </button>

              <button
                onClick={() => onBoostRepeater(selected.level)}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-700 bg-[#101722] hover:border-cyan-400/60 text-slate-200 text-xs font-mono transition cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Clamp Pipe Node ({selected.acousticSnrDb}dB)
                </span>
                <span className="text-[10px] opacity-75">#7</span>
              </button>

              <button
                onClick={() => onBroadcastSiren(selected.level)}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-xs font-mono transition cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  Ping Kin &amp; Reserve
                </span>
                <span className="text-[10px] opacity-75">#1/#8</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Acoustic-Pipe & LoRa Packet Stream */}
        <div className="bg-[#0b1017] border border-slate-800 rounded-xl p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono font-semibold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              IN-FLIGHT PIPE &amp; MESH FRAMES
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              320 bps Steel-Pipe FSK · LoRa 915MHz
            </span>
          </div>

          <div className="space-y-2 mb-3">
            {packets.slice(0, 4).map((pkt) => (
              <div
                key={pkt.id}
                className="p-2 rounded-lg bg-[#0f1621] border border-slate-800/90 text-xs"
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-cyan-300 font-semibold">
                    L{pkt.fromLevel.toString().padStart(2, '0')} → L
                    {pkt.toLevel.toString().padStart(2, '0')} · {pkt.transport.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    WoT-Signed
                  </span>
                </div>
                <div className="text-slate-200 text-xs mt-0.5">{pkt.summary}</div>
                <div className="mt-1.5 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-amber-400 h-full transition-all duration-500"
                    style={{ width: `${pkt.progressPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Scrolling Verified Mesh Log */}
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
            CRYPTOGRAPHIC TELEMETRY LEDGER
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 font-mono text-[11px]">
            {logs.slice(0, 10).map((entry) => {
              const badgeCls =
                entry.severity === 'CRITICAL'
                  ? 'text-rose-300 bg-rose-500/15 border-rose-500/30'
                  : entry.severity === 'WARN'
                  ? 'text-amber-300 bg-amber-500/15 border-amber-500/30'
                  : entry.severity === 'SUCCESS'
                  ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                  : 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30';
              return (
                <div
                  key={entry.id}
                  className="p-2 rounded bg-[#0d131c] border border-slate-800/70 leading-relaxed"
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border ${badgeCls}`}>
                      {entry.problemTag} · {entry.levelCode}
                    </span>
                    <span className="text-[10px] text-slate-500">{entry.timestamp}</span>
                  </div>
                  <div className="text-slate-300 text-[11px]">{entry.message}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
