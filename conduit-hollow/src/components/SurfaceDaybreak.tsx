import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Compass,
  Eye,
  LockOpen,
  Radar,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Wind,
} from 'lucide-react';
import { SurfaceProbeState } from '../types/hollow';

interface SurfaceDaybreakProps {
  probe: SurfaceProbeState;
  onBroadcastSurfaceProof: () => void;
}

type OutpostShelter = 'EVA_SUITS' | 'GEODESIC_DOME' | 'SUBWAY_HEADHOUSE';
type CommsStealth = 'CONDUIT_PIPE_ZERO_RF' | 'CONVENTIONAL_RADIO';
type VanguardMix = 'CROSS_SKILL_24' | 'SOLO_SCOUTS_4' | 'MASS_CROWD_250';

export const SurfaceDaybreak: React.FC<SurfaceDaybreakProps> = ({
  probe,
  onBroadcastSurfaceProof,
}) => {
  const [shelter, setShelter] = useState<OutpostShelter>('SUBWAY_HEADHOUSE');
  const [comms, setComms] = useState<CommsStealth>('CONDUIT_PIPE_ZERO_RF');
  const [cohort, setCohort] = useState<VanguardMix>('CROSS_SKILL_24');
  const [weeklyQuota, setWeeklyQuota] = useState<number>(18000);
  const [equityMode, setEquityMode] = useState<'DEEP_FIRST_EQUITY' | 'LOTTERY'>('DEEP_FIRST_EQUITY');
  const [broadcastFlash, setBroadcastFlash] = useState<boolean>(false);

  // #14 Outpost & Vanguard Viability Physics Model
  const simResult = useMemo(() => {
    let survival = 55;
    let machineRisk = 35;
    let rationale = '';

    if (shelter === 'SUBWAY_HEADHOUSE') {
      survival += 26;
      machineRisk -= 14;
      rationale =
        'Sealing an existing concrete subway headhouse provides thermal mass, radiation/wind shielding, and direct internal stair access to L01 airlocks—blending into dead-city ruins.';
    } else if (shelter === 'GEODESIC_DOME') {
      survival += 14;
      machineRisk += 12;
      rationale =
        'Transparent bio-domes enable rapid crop growth, but UV/thermal glare on open streets increases visual detection by autonomous surface patrols.';
    } else {
      survival -= 8;
      machineRisk -= 6;
      rationale =
        'EVA breather suits work for 6-hour recon walks, but lack sealed sleep/water recovery for multi-week footholds.';
    }

    if (comms === 'CONDUIT_PIPE_ZERO_RF') {
      survival += 14;
      machineRisk -= 16;
    } else {
      survival -= 22;
      machineRisk += 48;
    }

    if (cohort === 'CROSS_SKILL_24') {
      survival += 4;
    } else if (cohort === 'SOLO_SCOUTS_4') {
      survival -= 9;
    } else {
      survival -= 28;
      machineRisk += 29;
    }

    return {
      survivalScore: Math.max(8, Math.min(99, survival)),
      machineRiskPct: Math.max(3, Math.min(97, machineRisk)),
      rationale,
    };
  }, [shelter, comms, cohort]);

  const handleBroadcast = () => {
    onBroadcastSurfaceProof();
    setBroadcastFlash(true);
    setTimeout(() => setBroadcastFlash(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* TOP ROW (#13): Covert Storm-Riser Surface Truth Probe + Machine Patrol Radar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-7 bg-[#0b1017] border border-emerald-500/30 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  PROBLEM #13 · PROVING SURFACE HABITABILITY &amp; BYPASSING CENSORSHIP
                </span>
                <h2 className="text-base sm:text-lg font-semibold text-white mt-1.5 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-300" />
                  Covert Storm-Riser Probe &ldquo;DAYBREAK-01&rdquo; (+12m Street Level)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pushed up an abandoned pre-2087 cast-iron storm drain bypassing L01 blast guards. Hammers hardware-attested atmospheric proof down the steel riser to every level.
                </p>
              </div>

              <button
                onClick={handleBroadcast}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-mono font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>BROADCAST PROOF TO ALL 12 LEVELS</span>
              </button>
            </div>

            {broadcastFlash && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-xs font-mono text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  TPM-Signed Surface Telemetry hammered down Storm Standpipe #19 → Verified across {probe.truthVerifiedLevels}/12 Hollow Levels!
                </span>
              </div>
            )}

            {/* Directorate Lie vs Hardware-Signed Surface Truth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 font-mono">
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/35">
                <div className="text-[10px] text-rose-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  DIRECTORATE OFFICIAL CLAIM (30-YR LIE)
                </div>
                <div className="text-sm font-bold text-rose-100 mt-1">
                  &ldquo;Lethal in 180 Seconds&rdquo;
                </div>
                <ul className="text-[11px] text-slate-400 mt-1.5 space-y-0.5">
                  <li>• Claimed O₂: 11.4% (Asphyxiation)</li>
                  <li>• Claimed SO₂ / Ash: 480 ppm (Fatal)</li>
                  <li>• Verdict: Keep All Surface Shafts Welded</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-400/50">
                <div className="text-[10px] text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  DAYBREAK-01 TPM-SIGNED TRUTH (+12m)
                </div>
                <div className="text-sm font-bold text-emerald-200 mt-1">
                  ✓ BREATHABLE · BIOSPHERE REBOUNDING
                </div>
                <ul className="text-[11px] text-emerald-100/90 mt-1.5 space-y-0.5">
                  <li>• Measured O₂: <strong>{probe.surfaceO2Pct}%</strong> · Temp {probe.surfaceTempC}°C</li>
                  <li>• Toxins: <strong>{probe.toxinsPpm} ppm</strong> · PM2.5: {probe.pm25Ug} µg/m³</li>
                  <li>• Sunlight: <strong>{probe.solarWm2} W/m²</strong> · Flora Index {probe.sporeFloraRecoveryPct}%</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Why Residents Trust It (#13 Anti-Forgery Proof) */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <span className="font-mono text-[11px] text-cyan-300">
              Verified Reach: <strong>{probe.truthVerifiedLevels}/12 Levels</strong> ({probe.proofBroadcastCount} acoustic bursts)
            </span>
            <span className="text-[11px] text-slate-400">
              Includes cosmic-ray muon count + natural solar spectrum hash impossible to fake underground.
            </span>
          </div>
        </div>

        {/* TOP RIGHT: Autonomous Surface Machine Acoustic Radar */}
        <div className="xl:col-span-5 bg-[#0b1017] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ROGUE MACHINE EXCLUSION RADAR
              </span>
              <h3 className="text-base font-semibold text-white mt-1.5 flex items-center gap-2">
                <Radar className="w-4 h-4 text-amber-400" />
                Passive Seismic &amp; Acoustic Surface Watch
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/40">
              QUIET WINDOW OPEN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 my-3">
            {/* Compact Polar Radar SVG */}
            <div className="sm:col-span-5 flex justify-center">
              <svg viewBox="0 0 160 160" className="w-36 h-36">
                <circle cx="80" cy="80" r="72" fill="#070b10" stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="80" cy="80" r="48" fill="none" stroke="#1e293b" strokeDasharray="3 3" />
                <circle cx="80" cy="80" r="24" fill="none" stroke="#1e293b" strokeDasharray="2 2" />
                <line x1="8" y1="80" x2="152" y2="80" stroke="#1e293b" />
                <line x1="80" y1="8" x2="80" y2="152" stroke="#1e293b" />
                {/* Safe Extraction Corridor Wedge */}
                <path
                  d="M80,80 L32,24 A72,72 0 0,1 80,8 Z"
                  fill="rgba(16, 185, 129, 0.18)"
                  stroke="rgba(16, 185, 129, 0.5)"
                />
                {/* Center Hatch */}
                <circle cx="80" cy="80" r="4.5" fill="#22d3ee" />
                {/* Rogue Machine Contacts */}
                <circle cx="122" cy="52" r="4" fill="#f43f5e" />
                <text x="102" y="45" fill="#fda4af" fontSize="8" fontFamily="monospace">
                  M-A9 (1.8km)
                </text>
                <circle cx="114" cy="118" r="3.5" fill="#f59e0b" />
                <text x="92" y="131" fill="#fcd34d" fontSize="8" fontFamily="monospace">
                  GRID-4 (2.4km)
                </text>
              </svg>
            </div>

            <div className="sm:col-span-7 space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#0e1520] border border-slate-800">
                <div className="text-[10px] text-slate-400">NEAREST AUTONOMOUS MACHINE</div>
                <div className="text-sm font-bold text-amber-300 mt-0.5">
                  {probe.nearestMachineKm.toFixed(2)} km NE (Automated Paver-Drone)
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0e1520] border border-slate-800">
                <div className="text-[10px] text-slate-400">SAFE NORTHWEST CORRIDOR</div>
                <div className="text-sm font-bold text-emerald-300 mt-0.5">
                  Subway Exit 4B · 02:15–04:55 Solar Recharge Lull
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Key Discovery: Surface machines hunt RF radio emissions &amp; high-wattage grid signatures—ignoring zero-RF human foot teams!
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: #14 Outpost Simulator + #15/#11 Staged Exodus & Sunlight Acclimation */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* #14 Outpost & First-Team Testbed */}
        <div className="xl:col-span-6 bg-[#0b1017] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3.5">
          <div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              PROBLEM #14 · OUTPOST ARCHITECTURE &amp; FIRST-TEAM SIMULATOR
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-white mt-1.5 flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              Foothold Viability &amp; Machine-Stealth Optimizer
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">1. SHELTER OPTION</label>
              <select
                value={shelter}
                onChange={(e) => setShelter(e.target.value as OutpostShelter)}
                className="w-full rounded-lg bg-[#080c12] border border-slate-700 px-2.5 py-2 text-white"
              >
                <option value="SUBWAY_HEADHOUSE">Sealed Subway Headhouse</option>
                <option value="GEODESIC_DOME">Inflatable Bio-Dome</option>
                <option value="EVA_SUITS">EVA Breather Suits Only</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">2. COMMS PROTOCOL</label>
              <select
                value={comms}
                onChange={(e) => setComms(e.target.value as CommsStealth)}
                className="w-full rounded-lg bg-[#080c12] border border-slate-700 px-2.5 py-2 text-white"
              >
                <option value="CONDUIT_PIPE_ZERO_RF">CONDUIT Pipe Ultrasound (0-RF)</option>
                <option value="CONVENTIONAL_RADIO">VHF/UHF Surface Radio</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">3. VANGUARD COHORT</label>
              <select
                value={cohort}
                onChange={(e) => setCohort(e.target.value as VanguardMix)}
                className="w-full rounded-lg bg-[#080c12] border border-slate-700 px-2.5 py-2 text-white"
              >
                <option value="CROSS_SKILL_24">24x Pipefitter/Medic/Agri</option>
                <option value="SOLO_SCOUTS_4">4x Light Recon Runners</option>
                <option value="MASS_CROWD_250">250x Unstaged Residents</option>
              </select>
            </div>
          </div>

          {/* Computed Simulation Readout */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-xl bg-[#0e1520] border border-slate-800">
              <div className="text-[10px] text-slate-400">30-DAY FOOTHOLD SURVIVAL</div>
              <div
                className={`text-2xl font-bold mt-0.5 ${
                  simResult.survivalScore >= 75
                    ? 'text-emerald-400'
                    : simResult.survivalScore >= 50
                    ? 'text-amber-300'
                    : 'text-rose-400'
                }`}
              >
                {simResult.survivalScore}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0e1520] border border-slate-800">
              <div className="text-[10px] text-slate-400">ROGUE MACHINE DETECTION RISK</div>
              <div
                className={`text-2xl font-bold mt-0.5 ${
                  simResult.machineRiskPct <= 20
                    ? 'text-emerald-400'
                    : simResult.machineRiskPct <= 50
                    ? 'text-amber-300'
                    : 'text-rose-400'
                }`}
              >
                {simResult.machineRiskPct}%
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090d14] border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-cyan-300 font-mono">Simulation Finding:</strong> {simResult.rationale}{' '}
            {comms === 'CONDUIT_PIPE_ZERO_RF' ? (
              <span className="text-emerald-300">
                Using CONDUIT&apos;s underground pipe ultrasound emits zero electromagnetic RF, keeping the outpost invisible to rogue surface machines!
              </span>
            ) : (
              <span className="text-rose-300">
                WARNING: Surface RF radio immediately triangulates autonomous city-machines onto the outpost!
              </span>
            )}
          </div>
        </div>

        {/* #15 (+ #2 & #11) Staged Exodus & Circadian Phototherapy Decompression */}
        <div className="xl:col-span-6 bg-[#0b1017] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5">
          <div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
              PROBLEMS #15, #11 &amp; #2 · STAGED EXODUS &amp; SUNLIGHT ACCLIMATION
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-white mt-1.5 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-300" />
              Decompression-Style Return &amp; Anti-Stampede Scheduler
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Prevents shaft crushes &amp; retinal/circadian shock (#11) by staging cohorts through progressive UV/lux locks, prioritizing sick Deep-Sump residents fairly (#2).
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">SECTOR SHAFT ASCENT RATE (PER WEEK)</span>
                <span className="text-amber-300 font-bold">
                  {weeklyQuota.toLocaleString()} residents / wk
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={50000}
                step={2500}
                value={weeklyQuota}
                onChange={(e) => setWeeklyQuota(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEquityMode('DEEP_FIRST_EQUITY')}
                className={`flex-1 py-2 px-2.5 rounded-lg border text-xs transition cursor-pointer ${
                  equityMode === 'DEEP_FIRST_EQUITY'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 font-bold'
                    : 'bg-[#090d14] border-slate-700 text-slate-400'
                }`}
              >
                ✓ Deep-Sump &amp; Lung-Triage Priority (#2)
              </button>
              <button
                onClick={() => setEquityMode('LOTTERY')}
                className={`flex-1 py-2 px-2.5 rounded-lg border text-xs transition cursor-pointer ${
                  equityMode === 'LOTTERY'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100 font-bold'
                    : 'bg-[#090d14] border-slate-700 text-slate-400'
                }`}
              >
                Cryptographic Kin-Together Lottery
              </button>
            </div>

            {/* 3-Stage Phototherapy & Pressure Acclimation Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-[#0e1520] border border-slate-800">
                <div className="text-[10px] text-cyan-300 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> DAYS 1–5 (L04 LOCK)
                </div>
                <div className="font-bold text-white mt-0.5">400 → 2,500 Lux</div>
                <div className="text-[10px] text-slate-400">
                  Prevents photokeratitis after 30 yrs in dark; Vitamin D3 bolus
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1520] border border-slate-800">
                <div className="text-[10px] text-amber-300 flex items-center gap-1">
                  <Wind className="w-3 h-3" /> DAYS 6–10 (L01 DOME)
                </div>
                <div className="font-bold text-white mt-0.5">Pollen &amp; Immune Prep</div>
                <div className="text-[10px] text-slate-400">
                  Gradual surface biome exposure + airway rehab
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0e1520] border border-slate-800">
                <div className="text-[10px] text-emerald-300 flex items-center gap-1">
                  <LockOpen className="w-3 h-3" /> DAY 14 (SURFACE)
                </div>
                <div className="font-bold text-white mt-0.5">
                  {Math.round((2466000 / weeklyQuota) * 0.25)} Wks First 25%
                </div>
                <div className="text-[10px] text-slate-400">
                  Relieves Hollow crowding (#6) by 25% in Sector 07!
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Notice the feedback loop: moving even 20% of residents to sealed surface districts immediately relieves geothermal heat (#3), water load (#4), and crowding (#6) below!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
