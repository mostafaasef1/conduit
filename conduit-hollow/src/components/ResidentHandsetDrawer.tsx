import React, { useState } from 'react';
import {
  AlertTriangle,
  BatteryLow,
  CheckCircle2,
  Droplets,
  HeartHandshake,
  Radio,
  Stethoscope,
  Wind,
  X,
} from 'lucide-react';
import { LevelState } from '../types/hollow';

interface ResidentHandsetDrawerProps {
  open: boolean;
  onClose: () => void;
  levels: LevelState[];
  onQuickKinSafe: (level: number) => void;
  onQuickWaterHazard: (level: number) => void;
  onQuickNeedInhaler: (level: number) => void;
  onQuickSealDamper: (level: number) => void;
}

export const ResidentHandsetDrawer: React.FC<ResidentHandsetDrawerProps> = ({
  open,
  onClose,
  levels,
  onQuickKinSafe,
  onQuickWaterHazard,
  onQuickNeedInhaler,
  onQuickSealDamper,
}) => {
  const [residentLevel, setResidentLevel] = useState<number>(11);
  const [lastActionFeedback, setLastActionFeedback] = useState<string | null>(null);

  if (!open) return null;

  const lvl = levels.find((l) => l.level === residentLevel) || levels[10];

  const triggerFeedback = (msg: string, fn: () => void) => {
    fn();
    setLastActionFeedback(msg);
    setTimeout(() => setLastActionFeedback(null), 3200);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[340px] sm:w-[370px] rounded-[26px] bg-[#070a0e] border-2 border-slate-700 shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden">
      {/* Ruggedized Bezel Top */}
      <div className="px-4 py-2.5 bg-[#0f151e] border-b border-slate-800 flex items-center justify-between font-mono text-[11px]">
        <div className="flex items-center gap-1.5 text-amber-300">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-bold">PIEZO-CLAMP · 320bps</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex items-center gap-1 text-amber-400">
            <BatteryLow className="w-4 h-4" /> 7% ULP
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Close Resident Handset"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Handset Screen Body */}
      <div className="p-4 space-y-3 font-mono">
        {/* Level Selector (Simulating Resident Location) */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[10px]">RESIDENT HANDSET VIEW</span>
          <select
            value={residentLevel}
            onChange={(e) => setResidentLevel(Number(e.target.value))}
            className="rounded bg-[#111924] border border-slate-700 px-2 py-1 text-xs text-cyan-200"
          >
            {levels.map((l) => (
              <option key={l.level} value={l.level}>
                {l.code} · {l.name.slice(0, 16)}
              </option>
            ))}
          </select>
        </div>

        {/* High-Contrast Survival Alert Banner */}
        <div
          className={`p-3 rounded-xl border ${
            lvl.powerState === 'BLACKOUT' || lvl.waterContaminated
              ? 'bg-rose-950/45 border-rose-500/70 text-rose-100'
              : lvl.powerState === 'DROOP_WARNING' || lvl.waterSlugEtaSec !== null
              ? 'bg-amber-950/40 border-amber-500/70 text-amber-100'
              : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-100'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] opacity-85 mb-1">
            <span>{lvl.dirNetOnline ? 'DIRNET + MESH' : 'DIRNET DEAD · PIPE MESH LIVE'}</span>
            <span>
              {lvl.o2Pct.toFixed(1)}% O₂ · {lvl.tempC.toFixed(0)}°C
            </span>
          </div>

          {lvl.waterContaminated && !lvl.valveLocked ? (
            <div className="text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              DO NOT DRINK TAP WATER! ({lvl.waterTdsPpm} ppm)
            </div>
          ) : lvl.powerState === 'BLACKOUT' ? (
            <div className="text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              GRID BLACKOUT ACTIVE · {lvl.damperSealed ? 'DAMPER SEALED' : 'SEAL VENT DAMPER!'}
            </div>
          ) : lvl.predictedBlackoutSec !== null ? (
            <div className="text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
              BLACKOUT IN {Math.floor(lvl.predictedBlackoutSec / 60)}m · CHARGE LAMPS
            </div>
          ) : (
            <div className="text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              LOCAL PIPE &amp; LORA MESH NOMINAL ({lvl.meshPeers} peers)
            </div>
          )}
        </div>

        {/* 4 Giant Pitch-Dark Tactile One-Tap Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              triggerFeedback('64B Proof-of-Life sent up Steel Main #4!', () =>
                onQuickKinSafe(residentLevel)
              )
            }
            className="p-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/50 text-left transition cursor-pointer"
          >
            <HeartHandshake className="w-5 h-5 text-cyan-300 mb-1.5" />
            <div className="text-xs font-bold text-white">I AM SAFE</div>
            <div className="text-[10px] text-cyan-200/80">Ping Split Kin (#8)</div>
          </button>

          <button
            onClick={() =>
              triggerFeedback('Upstream Water Hazard + Valve Lock Broadcast!', () =>
                onQuickWaterHazard(residentLevel)
              )
            }
            className="p-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/50 text-left transition cursor-pointer"
          >
            <Droplets className="w-5 h-5 text-rose-300 mb-1.5" />
            <div className="text-xs font-bold text-white">BAD WATER</div>
            <div className="text-[10px] text-rose-200/80">Lock Tap Loop (#4)</div>
          </button>

          <button
            onClick={() =>
              triggerFeedback('ZK Cough Logged + Inhaler Mule Requested!', () =>
                onQuickNeedInhaler(residentLevel)
              )
            }
            className="p-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/50 text-left transition cursor-pointer"
          >
            <Stethoscope className="w-5 h-5 text-purple-300 mb-1.5" />
            <div className="text-xs font-bold text-white">COUGH / O₂</div>
            <div className="text-[10px] text-purple-200/80">Request Medic (#9)</div>
          </button>

          <button
            onClick={() =>
              triggerFeedback(
                lvl.damperSealed ? 'Vent Damper Unsealed' : 'O₂ Pocket Damper Sealed!',
                () => onQuickSealDamper(residentLevel)
              )
            }
            className="p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-left transition cursor-pointer"
          >
            <Wind className="w-5 h-5 text-amber-300 mb-1.5" />
            <div className="text-xs font-bold text-white">
              {lvl.damperSealed ? 'OPEN VENT' : 'SEAL DAMPER'}
            </div>
            <div className="text-[10px] text-amber-200/80">Hold O₂ Pocket (#1)</div>
          </button>
        </div>

        {/* Instant Confirmation Strip */}
        {lastActionFeedback ? (
          <div className="px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-[11px] text-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{lastActionFeedback}</span>
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 text-center pt-0.5">
            Audio-jack clipped to cold-water riser · 0.8mW standby draw
          </div>
        )}
      </div>
    </div>
  );
};
