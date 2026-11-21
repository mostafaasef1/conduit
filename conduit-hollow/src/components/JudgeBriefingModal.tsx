import React from 'react';
import {
  CheckCircle2,
  Cpu,
  Layers,
  PlayCircle,
  Radio,
  ShieldCheck,
  X,
} from 'lucide-react';

interface JudgeBriefingModalProps {
  open: boolean;
  onClose: () => void;
}

export const JudgeBriefingModal: React.FC<JudgeBriefingModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  const problemMatrix = [
    {
      num: '#1',
      title: 'Blackout & Air-Cut Early Warning',
      solution:
        'Piezo clamps + phone mics continuously compute FFT on 50Hz mains hum & ventilation blade-pass RPM. Detects turbine rotational droop (50Hz → 48.5Hz) 15–35 min BEFORE Directorate load-shed relays cut power or air.',
    },
    {
      num: '#4',
      title: 'Catching Bad Water Before Taps',
      solution:
        'Contaminated water flows at ~1.8 m/s, while CONDUIT ultrasonic warnings travel through the steel pipe wall at 4,890 m/s (2,716× faster)—locking downstream neighborhood solenoids 13+ minutes before toxic slugs arrive.',
    },
    {
      num: '#7',
      title: 'Uncensorable Organizing Without DirNet',
      solution:
        'Horizontal sub-GHz LoRa/BLE hops bridge vertically across thick rock strata via 320 bps ultrasonic FSK on steel water mains + foot-courier ("Mule") airlock sync. QR Web-of-Trust drops unsigned Directorate spoofs.',
    },
    {
      num: '#8',
      title: 'Split-Family Proof-of-Life in Blackouts',
      solution:
        'Ultra-compact 64-byte store-and-forward Kin Beacons (with real CRC-16 + Ed25519 truncated sig) piggyback on pipe heartbeats, reuniting families across sealed blackout levels.',
    },
    {
      num: '#9 & #10',
      title: 'Real Outbreak Truth & Street-Medic Routing',
      solution:
        'Zero-knowledge signed SpO₂ & cough telemetry exposes the 20× gap between Directorate bulletins and reality, while routing volunteer couriers with inhalers & filters around blacked-out or flooded shafts.',
    },
    {
      num: '#13–#15',
      title: 'Surface Daybreak Proof & Zero-RF Exodus',
      solution:
        'A solar witness probe pushed up a pre-2087 storm standpipe hammers TPM-signed breathable-air proof (20.8% O₂) to all 12 levels—and keeps first surface outposts invisible to RF-hunting rogue machines!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0b1018] border border-cyan-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(34,211,238,0.18)]">
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 py-4 bg-[#0d141f]/95 backdrop-blur border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-mono font-bold text-sm sm:text-base text-white">
                CONDUIT // HACKATHON JUDGE BRIEFING &amp; SYSTEM ARCHITECTURE
              </h2>
              <p className="text-xs text-slate-400">
                Track: Life Underground (The Hollow, Year 2117) · Multi-Problem Unified Solution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* The Core Insight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/50 via-[#101927] to-amber-950/30 border border-cyan-500/30">
            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
              THE UNIFYING ENGINEERING INSIGHT (&ldquo;THE MEDIUM IS THE SENSOR&rdquo;)
            </div>
            <p className="text-sm text-slate-200 mt-1.5 leading-relaxed">
              When the Directorate flips the network kill-switch or blackouts plunge Levels 09–12 into darkness, Wi-Fi dies and radio waves cannot penetrate 150 meters of solid rock between stacked levels.{' '}
              <strong className="text-cyan-300">
                What still physically connects every single floor of the Hollow? Continuous steel water pipes and ventilation ducts.
              </strong>{' '}
              By clamping scavenged piezo contact transducers onto water risers, <strong>CONDUIT</strong> turns the pipes themselves into both an uncensorable cross-level ultrasonic modem AND a passive mechanical early-warning system for turbine frequency droop, fan failure, and toxic water backflow.
            </p>
          </div>

          {/* 5-Problem Unified Matrix */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
              <Layers className="w-4 h-4 text-cyan-400" />
              HOW ONE ARCHITECTURE SOLVES 6 HOLLOW CHALLENGES SIMULTANEOUSLY
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {problemMatrix.map((item) => (
                <div
                  key={item.num}
                  className="p-3.5 rounded-xl bg-[#0f1622] border border-slate-800 space-y-1"
                >
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.num}
                    </span>
                    <span className="text-xs font-semibold text-white">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.solution}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scavenged Hardware BOM & Power Sustainability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0e1520] border border-slate-800 space-y-2">
              <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />
                SCAVENGED HOLLOW HARDWARE BOM (~$6 EQUIV)
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                <li>• 27mm Brass Piezo Contact Disc + Steel Hose Clamp</li>
                <li>• Salvaged SX1262 915MHz LoRa + MCU / Audio-Jack Modem</li>
                <li>• DIY Stainless-Bolt Tap Water Conductivity Probe</li>
                <li>
                  • <strong>Peltier TEG Harvester:</strong> Powered indefinitely in blackouts by the ΔT between 36°C Sump air and 18°C cold pipe risers!
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#0e1520] border border-slate-800 space-y-2">
              <div className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4" />
                60-SECOND INTERACTIVE DEMO FLOW FOR JUDGES
              </div>
              <ol className="text-xs text-slate-300 space-y-1.5">
                <li>
                  <strong>1. Inject Crisis:</strong> Click <em>&ldquo;Deep Blackout Cascade&rdquo;</em> &amp; <em>&ldquo;DirNet Kill-Switch&rdquo;</em> in the top bar—watch DirNet sever while Pipe-Mesh stays 100% live.
                </li>
                <li>
                  <strong>2. Faster-Than-Flow Water Lock:</strong> Trigger <em>&ldquo;Recycler-8 Toxic Backflow&rdquo;</em>, open <strong>Early Warning &amp; Water</strong>, and lock Loop C before the slug hits taps.
                </li>
                <li>
                  <strong>3. Resident Handset + 64B Frame:</strong> Open <strong>L11 HANDSET</strong> or <strong>Kin-Link</strong> to transmit a real CRC-16 signed 64-byte family beacon!
                </li>
              </ol>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Built for the Hollow · Survive below so humanity can return above.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              RETURN TO LIVE SIMULATOR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
