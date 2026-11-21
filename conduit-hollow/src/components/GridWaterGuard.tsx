import React, { useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Droplets,
  Gauge,
  Lock,
  ShieldCheck,
  Sparkles,
  Wind,
  Zap,
} from 'lucide-react';
import { LevelState, TelemetryHistoryPoint, WaterLoopSegment } from '../types/hollow';

interface GridWaterGuardProps {
  levels: LevelState[];
  history: TelemetryHistoryPoint[];
  waterLoops: WaterLoopSegment[];
  onArmPreBlackoutProtocol: () => void;
  onIsolateWaterLoop: (loopId: string) => void;
  onSubmitTapReport: (level: number, symptom: string, stripTds: number) => void;
}

export const GridWaterGuard: React.FC<GridWaterGuardProps> = ({
  levels,
  history,
  waterLoops,
  onArmPreBlackoutProtocol,
  onIsolateWaterLoop,
  onSubmitTapReport,
}) => {
  const [reportLevel, setReportLevel] = useState<number>(10);
  const [reportSymptom, setReportSymptom] = useState<string>('Metallic bitter taste + rust sheen');
  const [reportTds, setReportTds] = useState<number>(740);
  const [submittedFlash, setSubmittedFlash] = useState<boolean>(false);

  // Build SVG polyline points for Deep-Grid Frequency (48.0 .. 50.2 Hz)
  const chartW = 560;
  const chartH = 150;

  const hzPoints = history
    .map((pt, idx) => {
      const x = (idx / Math.max(1, history.length - 1)) * chartW;
      const clampedHz = Math.max(48.0, Math.min(50.2, pt.deepGridHz || 48.0));
      const y = chartH - ((clampedHz - 48.0) / 2.2) * (chartH - 20) - 10;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const rpmPoints = history
    .map((pt, idx) => {
      const x = (idx / Math.max(1, history.length - 1)) * chartW;
      const clampedRpm = Math.max(250, Math.min(1650, pt.deepFanRpm));
      const y = chartH - ((clampedRpm - 250) / 1400) * (chartH - 20) - 10;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const latest = history[history.length - 1] || {
    deepGridHz: 49.1,
    deepFanRpm: 910,
  };

  const atRiskLevels = levels.filter(
    (l) => l.powerState === 'DROOP_WARNING' || l.powerState === 'BLACKOUT'
  );

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitTapReport(reportLevel, reportSymptom, reportTds);
    setSubmittedFlash(true);
    setTimeout(() => setSubmittedFlash(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {/* LEFT HALF (#1): Predictive Blackout & Air-Stall Early Warning */}
      <div className="xl:col-span-6 bg-[#0b1017] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                PROBLEM #1 · PREDICTIVE POWER &amp; AIR WARNING
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-white mt-1.5">
                Harmonic Droop &amp; Duct-Acoustic Forecaster
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Detects geothermal turbine inertia decay (50Hz → 48.5Hz) &amp; fan blade-pass stall{' '}
                <strong className="text-amber-300">15–35 min before</strong> Directorate load-shed relays cut power or air.
              </p>
            </div>

            <button
              onClick={onArmPreBlackoutProtocol}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-100 text-xs font-mono font-semibold transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>AUTO-SEAL &amp; BUFFER DEEP LEVELS</span>
            </button>
          </div>

          {/* Live Dual-Trace Oscilloscope */}
          <div className="mt-4 p-3 rounded-xl bg-[#070b10] border border-slate-800/90">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
                  Deep Mains Hum: <strong>{latest.deepGridHz.toFixed(2)} Hz</strong>
                </span>
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
                  Vent Trunk B Acoustic: <strong>{latest.deepFanRpm} RPM</strong>
                </span>
              </div>
              <span className="text-[10px] text-rose-400">
                --- 48.50 Hz Relay Trip Line
              </span>
            </div>

            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-40 overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              {[0.2, 0.5, 0.8].map((r, idx) => (
                <line
                  key={idx}
                  x1={0}
                  y1={chartH * r}
                  x2={chartW}
                  y2={chartH * r}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              ))}
              {/* Critical 48.50 Hz Trip Threshold Line */}
              <line
                x1={0}
                y1={chartH - ((48.5 - 48.0) / 2.2) * (chartH - 20) - 10}
                x2={chartW}
                y2={chartH - ((48.5 - 48.0) / 2.2) * (chartH - 20) - 10}
                stroke="#f43f5e"
                strokeDasharray="5 4"
                strokeWidth="1.3"
              />
              {/* Fan RPM Trace */}
              <polyline
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.8"
                strokeOpacity="0.75"
                points={rpmPoints}
              />
              {/* Mains Hz Trace */}
              <polyline
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
                points={hzPoints}
              />
            </svg>
          </div>

          {/* Threatened Levels Countdown Matrix */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span>DEEP-LEVEL CUTOUT COUNTDOWNS &amp; O₂ POCKET PROTECTION</span>
              <span>{atRiskLevels.length} LEVELS FLAGGED</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {atRiskLevels.map((lvl) => {
                const isDead = lvl.powerState === 'BLACKOUT';
                const mins =
                  lvl.predictedBlackoutSec !== null
                    ? Math.floor(lvl.predictedBlackoutSec / 60)
                    : 0;
                const secs =
                  lvl.predictedBlackoutSec !== null ? lvl.predictedBlackoutSec % 60 : 0;

                return (
                  <div
                    key={lvl.level}
                    className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2 ${
                      isDead
                        ? 'bg-rose-950/25 border-rose-500/40'
                        : 'bg-amber-950/20 border-amber-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-xs font-bold text-white">
                          {lvl.code} · {lvl.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({lvl.populationK}k residents)
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-3 font-mono">
                        <span className="flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-amber-400" />
                          {isDead ? '0.00 Hz' : `${lvl.gridHz.toFixed(2)} Hz`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Wind className="w-3 h-3 text-cyan-400" />
                          {lvl.o2Pct.toFixed(1)}% O₂ · {lvl.fanRpm} RPM
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      {lvl.damperSealed ? (
                        <span className="text-[11px] px-2 py-1 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-200">
                          ✓ O₂ Damper Sealed
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-1 rounded bg-slate-800 text-slate-300">
                          Damper Open
                        </span>
                      )}

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded ${
                          isDead
                            ? 'bg-rose-500/30 text-rose-100'
                            : 'bg-amber-500/30 text-amber-100'
                        }`}
                      >
                        {isDead
                          ? 'IN BLACKOUT'
                          : `T-${mins}m ${secs.toString().padStart(2, '0')}s`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Physics Explainer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Zero-Infrastructure Sensor Fusion:</strong> Any resident device clipped near an AC cable or air grate computes FFT on 50Hz hum + duct blade harmonics, broadcasting warnings over LoRa &amp; pipe-ultrasound.
          </span>
        </div>
      </div>

      {/* RIGHT HALF (#4): Faster-Than-Flow Bad Water Interception */}
      <div className="xl:col-span-6 bg-[#0b1017] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                PROBLEM #4 · PRE-TAP WATER CONTAMINATION INTERCEPTOR
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-white mt-1.5">
                Faster-Than-Flow Acoustic Pipe Lockout
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dirty water travels at <strong className="text-rose-300">1.8 m/s</strong>. CONDUIT&apos;s ultrasonic warning races down the steel pipe wall at{' '}
                <strong className="text-cyan-300">4,890 m/s (2,716× faster)</strong>—shutting taps minutes before the toxic slug arrives.
              </p>
            </div>
          </div>

          {/* Visual Physics Speed Comparison Banner */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#070b10] border border-slate-800 space-y-2.5 font-mono text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-cyan-300 font-semibold">
                  ⚡ CONDUIT Ultrasonic Alert in Steel Pipe Wall (4,890 m/s)
                </span>
                <span className="text-emerald-300">1.5 km in 0.31 sec!</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-rose-300 font-semibold">
                  💧 Contaminated Recycler Water Slug Inside Pipe (1.8 m/s)
                </span>
                <span className="text-amber-300">1.5 km in 13 min 53 sec (INTERCEPTED)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-[16%] bg-rose-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Recycler Loop Cards */}
          <div className="mt-4 space-y-2.5">
            {waterLoops.map((loop) => {
              const isDanger = loop.status === 'SLUG_DETECTED' || loop.status === 'CONTAMINATED';
              const isLocked = loop.status === 'LOCKED_PROTECTED';

              return (
                <div
                  key={loop.id}
                  className={`p-3.5 rounded-xl border transition ${
                    isDanger
                      ? 'bg-rose-950/25 border-rose-500/50'
                      : isLocked
                      ? 'bg-cyan-950/25 border-cyan-400/50'
                      : 'bg-[#0e141d] border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">
                          {loop.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          Levels {loop.levelsServed.map((n) => `L${n}`).join(', ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1 flex flex-wrap gap-3">
                        <span>Origin: {loop.recyclerOrigin}</span>
                        <span>Turbidity: {loop.turbidityNtu.toFixed(1)} NTU</span>
                        <span>Metals: {loop.heavyMetalsPpb} ppb</span>
                        <span>Crowd Strips: {loop.crowdReports}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 font-mono text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          LOCKED ({loop.residentsProtected.toLocaleString()}k SAFE)
                        </span>
                      ) : (
                        <button
                          onClick={() => onIsolateWaterLoop(loop.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold border transition cursor-pointer ${
                            isDanger
                              ? 'bg-rose-500 hover:bg-rose-400 text-white border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.45)]'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{isDanger ? 'INTERCEPT & LOCK TAPS NOW' : 'PRE-LOCK LOOP'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Crowdsourced Resident DIY Water Strip / Sensor Submission */}
          <form
            onSubmit={handleReportSubmit}
            className="mt-4 p-3.5 rounded-xl bg-[#0e1520] border border-slate-800 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-cyan-300 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5" />
                SUBMIT CROWDSOURCED TAP SENSOR / PAPER-STRIP ALERT
              </span>
              {submittedFlash && (
                <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Pipe Lockout Broadcast Sent!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs font-mono">
              <div className="sm:col-span-3">
                <label className="text-[10px] text-slate-400 block mb-1">LEVEL</label>
                <select
                  value={reportLevel}
                  onChange={(e) => setReportLevel(Number(e.target.value))}
                  className="w-full rounded-lg bg-[#090d14] border border-slate-700 px-2.5 py-1.5 text-white"
                >
                  {levels.map((l) => (
                    <option key={l.level} value={l.level}>
                      {l.code} ({l.name.slice(0, 14)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] text-slate-400 block mb-1">DIY TDS (PPM)</label>
                <input
                  type="number"
                  min={80}
                  max={2500}
                  value={reportTds}
                  onChange={(e) => setReportTds(Number(e.target.value))}
                  className="w-full rounded-lg bg-[#090d14] border border-slate-700 px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="sm:col-span-6">
                <label className="text-[10px] text-slate-400 block mb-1">OBSERVATION</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reportSymptom}
                    onChange={(e) => setReportSymptom(e.target.value)}
                    className="w-full rounded-lg bg-[#090d14] border border-slate-700 px-2.5 py-1.5 text-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/25 hover:bg-cyan-500/35 border border-cyan-400/60 text-cyan-100 font-semibold shrink-0 cursor-pointer"
                  >
                    ALERT
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>2-of-N Neighborhood Quorum:</strong> Two independent tap conductivity spikes or piezo valve-cavitation signatures automatically trip downstream gravity-fed cistern bypasses.
          </span>
        </div>
      </div>
    </div>
  );
};
