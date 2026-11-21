import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Compass,
  PackagePlus,
  ShieldAlert,
  Stethoscope,
  Truck,
} from 'lucide-react';
import { LevelState, MedicCourierMission } from '../types/hollow';

interface LungWatchDispatchProps {
  levels: LevelState[];
  missions: MedicCourierMission[];
  onLogLungCluster: (level: number, casesCount: number, spo2: number) => void;
  onDispatchSupplyRun: (toLevel: number, cargo: string) => void;
}

export const LungWatchDispatch: React.FC<LungWatchDispatchProps> = ({
  levels,
  missions,
  onLogLungCluster,
  onDispatchSupplyRun,
}) => {
  const [logLevel, setLogLevel] = useState(11);
  const [logCases, setLogCases] = useState(5);
  const [logSpo2, setLogSpo2] = useState(91);

  const [dispatchLevel, setDispatchLevel] = useState(11);
  const [dispatchCargo, setDispatchCargo] = useState('Salbutamol Inhalers + P100 Filters (18x)');

  const totalOfficial = levels.reduce((acc, l) => acc + l.officialLungCases, 0);
  const totalVerified = levels.reduce((acc, l) => acc + l.verifiedLungCases, 0);
  const gapMultiplier = (totalVerified / Math.max(1, totalOfficial)).toFixed(1);
  const maxCases = Math.max(150, ...levels.map((l) => l.verifiedLungCases));

  const handleSymptomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogLungCluster(logLevel, logCases, logSpo2);
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDispatchSupplyRun(dispatchLevel, dispatchCargo);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {/* LEFT 7 COLS: Directorate Censorship vs Mesh-Verified Outbreak Map (#9) */}
      <div className="xl:col-span-7 bg-[#0b1017] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                PROBLEM #9 · REAL OUTBREAK TRACKING VS. STATE CENSORSHIP
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-white mt-1.5">
                &ldquo;Hollow-Lung&rdquo; Truth Ledger (ZK-Signed Crowd Epidemiology)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Compares official Directorate bulletins against zero-knowledge signed street-medic SpO₂ &amp; cough-acoustic telemetry across all 12 levels.
              </p>
            </div>

            {/* Discrepancy Callout Pill */}
            <div className="px-3 py-2 rounded-xl bg-rose-950/35 border border-rose-500/40 font-mono text-right">
              <div className="text-[10px] text-rose-300">TRUTH DISCREPANCY</div>
              <div className="text-lg font-bold text-white">{gapMultiplier}× Hidden</div>
              <div className="text-[10px] text-slate-400">
                {totalVerified} verified vs {totalOfficial} official
              </div>
            </div>
          </div>

          {/* Side-by-side Propaganda Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#0d131c] border border-slate-800">
              <div className="text-[10px] text-slate-400">DIRECTORATE PUBLIC BULLETIN #884</div>
              <div className="text-sm font-semibold text-slate-300 mt-1">
                &ldquo;{totalOfficial} mild dust cases · Air scrubbers 99.4% nominal&rdquo;
              </div>
            </div>

            <div className="p-3 rounded-lg bg-purple-950/25 border border-purple-500/40">
              <div className="text-[10px] text-purple-300 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                CONDUIT PLUME VECTOR LOCALIZATION
              </div>
              <div className="text-sm font-semibold text-white mt-1">
                {totalVerified} Acute Cases · Vent Trunk B Scrubber Rupture (L08→L12)
              </div>
            </div>
          </div>

          {/* 12-Level Comparative Bar Chart */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
              <span>LEVEL / INHALER RESERVE</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2 rounded-xs bg-slate-500 inline-block" /> Directorate Claim
                </span>
                <span className="flex items-center gap-1 text-purple-300">
                  <span className="w-2.5 h-2 rounded-xs bg-gradient-to-r from-purple-500 to-rose-500 inline-block" />{' '}
                  Mesh-Verified Cases
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              {levels.map((lvl) => {
                const verifiedPct = Math.min(100, (lvl.verifiedLungCases / maxCases) * 100);
                const officialPct = Math.min(100, (lvl.officialLungCases / maxCases) * 100);

                return (
                  <div
                    key={lvl.level}
                    className="grid grid-cols-12 items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0e141d] border border-slate-800/70 font-mono text-xs"
                  >
                    <div className="col-span-4 sm:col-span-3 flex items-center justify-between pr-2">
                      <span className="font-bold text-white">{lvl.code}</span>
                      <span
                        className={`text-[10px] ${
                          lvl.inhalerStockPct < 25 ? 'text-rose-400 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        Med {lvl.inhalerStockPct}%
                      </span>
                    </div>

                    <div className="col-span-5 sm:col-span-7 space-y-1">
                      {/* Verified Bar */}
                      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(2, verifiedPct)}%` }}
                        />
                      </div>
                      {/* Official Claim Bar */}
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-500 rounded-full"
                          style={{ width: `${Math.max(0.8, officialPct)}%` }}
                        />
                      </div>
                    </div>

                    <div className="col-span-3 sm:col-span-2 text-right text-[11px]">
                      <span className="text-purple-200 font-bold">{lvl.verifiedLungCases}</span>
                      <span className="text-slate-500"> / {lvl.officialLungCases}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Log Anonymous Street-Medic / Resident Triage Report */}
        <form
          onSubmit={handleSymptomSubmit}
          className="mt-4 p-3.5 rounded-xl bg-[#0e1520] border border-slate-800 space-y-2.5"
        >
          <div className="text-xs font-mono font-semibold text-purple-300 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5" />
            LOG ANONYMIZED STREET-MEDIC / COUGH-AUDIO TRIAGE PACKET
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 font-mono text-xs">
            <div className="sm:col-span-4">
              <label className="text-[10px] text-slate-400 block mb-1">WARD LEVEL</label>
              <select
                value={logLevel}
                onChange={(e) => setLogLevel(Number(e.target.value))}
                className="w-full rounded-lg bg-[#090d14] border border-slate-700 px-2.5 py-1.5 text-white"
              >
                {levels.map((l) => (
                  <option key={l.level} value={l.level}>
                    {l.code} · {l.name.slice(0, 15)}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="text-[10px] text-slate-400 block mb-1">NEW CASES</label>
              <input
                type="number"
                min={1}
                max={35}
                value={logCases}
                onChange={(e) => setLogCases(Number(e.target.value))}
                className="w-full rounded-lg bg-[#090d14] border border-slate-700 px-2.5 py-1.5 text-white"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="text-[10px] text-slate-400 block mb-1">MEAN SpO₂ (%) &amp; SUBMIT</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={78}
                  max={99}
                  value={logSpo2}
                  onChange={(e) => setLogSpo2(Number(e.target.value))}
                  className="w-full rounded-lg bg-[#090d14] border border-slate-700 px-2.5 py-1.5 text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-purple-500/25 hover:bg-purple-500/35 border border-purple-400/60 text-purple-100 font-semibold shrink-0 cursor-pointer"
                >
                  SIGN &amp; LOG
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* RIGHT 5 COLS: Street-Medic & Micro-Cache Supply Dispatcher (#9 & #10) */}
      <div className="xl:col-span-5 flex flex-col gap-4">
        <div className="bg-[#0b1017] border border-slate-800 rounded-xl p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              PROBLEMS #9 &amp; #10 · MUTUAL-AID MICRO-CLINIC DISPATCH
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-white mt-1.5 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              Hazard-Aware Courier (&ldquo;Mule&rdquo;) Supply Routing
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              When deep-level clinics run dry, CONDUIT computes safe ladder/conduit routes from neighborhood micro-caches—bypassing blacked-out shafts, flooded tunnels &amp; Directorate checkpoints.
            </p>

            {/* Active Courier Missions */}
            <div className="mt-4 space-y-3">
              {missions.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-[#0e1520] border border-slate-800 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" />
                        L{m.fromLevel.toString().padStart(2, '0')} → L
                        {m.toLevel.toString().padStart(2, '0')} · {m.courierCallsign}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-white mt-0.5">
                        {m.cargo}
                      </div>
                      <div className="text-[11px] text-slate-400">{m.routeProtocol}</div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                        m.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50'
                          : 'bg-cyan-500/15 text-cyan-200 border-cyan-400/40'
                      }`}
                    >
                      {m.status === 'DELIVERED' ? '✓ DELIVERED' : `ETA ${m.etaMinutes}m`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${m.progressPct}%` }}
                    />
                  </div>

                  {/* Avoided Hazards */}
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                    <span className="text-slate-500">Routed around:</span>
                    {m.avoidedHazards.map((h, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25 flex items-center gap-1"
                      >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch New Emergency Supply Run */}
          <form
            onSubmit={handleDispatchSubmit}
            className="mt-4 pt-4 border-t border-slate-800 space-y-2.5 font-mono text-xs"
          >
            <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
              <PackagePlus className="w-4 h-4" />
              DISPATCH MUTUAL-AID CACHE RUN TO DEEP WARD
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-4">
                <select
                  value={dispatchLevel}
                  onChange={(e) => setDispatchLevel(Number(e.target.value))}
                  className="w-full rounded-lg bg-[#080c12] border border-slate-700 px-2.5 py-2 text-white"
                >
                  {levels
                    .filter((l) => l.level >= 7)
                    .map((l) => (
                      <option key={l.level} value={l.level}>
                        To {l.code} (Med {l.inhalerStockPct}%)
                      </option>
                    ))}
                </select>
              </div>
              <div className="sm:col-span-8">
                <select
                  value={dispatchCargo}
                  onChange={(e) => setDispatchCargo(e.target.value)}
                  className="w-full rounded-lg bg-[#080c12] border border-slate-700 px-2.5 py-2 text-white"
                >
                  <option value="Salbutamol Inhalers + P100 Filters (18x)">
                    Salbutamol Inhalers + P100 Filters (18x)
                  </option>
                  <option value="Portable Zeolite O2 Concentrator + Tubing">
                    Portable Zeolite O2 Concentrator + Tubing
                  </option>
                  <option value="Ferrate Water Purifier Packs + ORS Salts">
                    Ferrate Water Purifier Packs + ORS Salts
                  </option>
                  <option value="Antibiotic Ampoules + Nebulizer Masks">
                    Antibiotic Ampoules + Nebulizer Masks
                  </option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-400/60 text-emerald-100 font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>ROUTE COURIER + PIGGYBACK CACHED KIN BEACONS</span>
            </button>
          </form>
        </div>

        {/* Tele-Triage Card */}
        <div className="bg-[#0b1017] border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-2.5">
          <Activity className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white font-mono">Offline Protocol Cards (#10):</strong> Every CONDUIT handset caches 48KB illustrated airway-triage &amp; oral-rehydration guides signed by Upper-Level volunteer physicians, letting neighbors stabilize hypoxia when clinics are 6 levels away.
          </div>
        </div>
      </div>
    </div>
  );
};
