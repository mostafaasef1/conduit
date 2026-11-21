import React, { useMemo, useState } from 'react';
import {
  BatteryCharging,
  CheckCircle2,
  HeartHandshake,
  KeyRound,
  Radio,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { encode64ByteKinFrame } from '../data/initialHollow';
import { KinFamilyGroup, KinMember } from '../types/hollow';

interface KinLinkMeshProps {
  families: KinFamilyGroup[];
  spoofsBlocked: number;
  dirNetDownCount: number;
  onSendKinBeacon: (params: {
    familyId: string;
    senderName: string;
    fromLevel: number;
    toLevel: number;
    bay: string;
    status: KinMember['status'];
    message: string;
  }) => void;
}

export const KinLinkMesh: React.FC<KinLinkMeshProps> = ({
  families,
  spoofsBlocked,
  dirNetDownCount,
  onSendKinBeacon,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState(families[0]?.id || 'fam-okafor');
  const [senderName, setSenderName] = useState('Kojo Mensah');
  const [fromLevel, setFromLevel] = useState(11);
  const [toLevel, setToLevel] = useState(4);
  const [bay, setBay] = useState('WARD-11C');
  const [status, setStatus] = useState<KinMember['status']>('IN_BLACKOUT_SAFE');
  const [message, setMessage] = useState('Twins safe, damper sealed, 18.6% O2');
  const [sentBanner, setSentBanner] = useState(false);

  const statusCodeMap: Record<KinMember['status'], number> = {
    SAFE: 1,
    IN_BLACKOUT_SAFE: 2,
    NEEDS_INHALER: 3,
    AWAITING_PING: 4,
  };

  const liveFrame = useMemo(
    () =>
      encode64ByteKinFrame({
        fromLevel,
        toLevel,
        bay,
        statusCode: statusCodeMap[status],
        message,
        senderName,
      }),
    [fromLevel, toLevel, bay, status, message, senderName]
  );

  const filteredFamilies = families.filter((f) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      f.familyName.toLowerCase().includes(q) ||
      f.homeLevels.toLowerCase().includes(q) ||
      f.members.some(
        (m) => m.name.toLowerCase().includes(q) || m.bay.toLowerCase().includes(q)
      )
    );
  });

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendKinBeacon({
      familyId: selectedFamilyId,
      senderName,
      fromLevel,
      toLevel,
      bay,
      status,
      message,
    });
    setSentBanner(true);
    setTimeout(() => setSentBanner(false), 3000);
  };

  const statusBadge = (s: KinMember['status']) => {
    switch (s) {
      case 'SAFE':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'IN_BLACKOUT_SAFE':
        return 'bg-cyan-500/15 text-cyan-200 border-cyan-400/40';
      case 'NEEDS_INHALER':
        return 'bg-rose-500/20 text-rose-200 border-rose-400/50';
      default:
        return 'bg-amber-500/15 text-amber-200 border-amber-400/40';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {/* LEFT 7 COLS: Split-Family Store-and-Forward Ledger (#8) */}
      <div className="xl:col-span-7 bg-[#0b1017] border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              PROBLEM #8 · SPLIT-FAMILY PROOF-OF-LIFE LEDGER
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-white mt-1.5 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-cyan-400" />
              Delay-Tolerant Kin Reconnection Across Blackout Strata
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tiny 64-byte beacons piggyback on ultrasonic steel-pipe chirps &amp; foot-courier (&ldquo;Mule&rdquo;) airlock syncs when DirNet &amp; power are dead.
            </p>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search family, bay, level..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#080c12] border border-slate-700 text-xs font-mono text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {filteredFamilies.map((fam) => (
            <div
              key={fam.id}
              className="rounded-xl bg-[#0e141e] border border-slate-800/90 overflow-hidden"
            >
              <div className="px-4 py-2.5 bg-[#111927] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">{fam.familyName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    KinKey {fam.kinHash}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">{fam.homeLevels}</span>
              </div>

              <div className="divide-y divide-slate-800/60">
                {fam.members.map((m) => (
                  <div key={m.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-300">
                          L{m.level.toString().padStart(2, '0')} · {m.bay}
                        </span>
                        <span className="text-sm font-semibold text-white">{m.name}</span>
                        <span className="text-xs text-slate-400">({m.role})</span>
                      </div>

                      <p className="text-xs text-slate-200 italic">&ldquo;{m.lastNote}&rdquo;</p>

                      {/* Multi-Hop Transport Trail */}
                      <div className="flex flex-wrap items-center gap-1 pt-0.5 font-mono text-[10px] text-slate-400">
                        <span className="text-slate-500">Hop Path:</span>
                        {m.hopTrail.map((hop, idx) => (
                          <React.Fragment key={idx}>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800/90 text-cyan-200">
                              {hop}
                            </span>
                            {idx < m.hopTrail.length - 1 && <span className="text-slate-600">→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between gap-1.5 shrink-0 font-mono">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${statusBadge(
                          m.status
                        )}`}
                      >
                        {m.status.replace(/_/g, ' ')}
                      </span>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{m.o2Pct.toFixed(1)}% O₂</span>
                        <span className="flex items-center gap-0.5">
                          <BatteryCharging className="w-3 h-3 text-amber-400" />
                          {m.deviceBatteryPct}%
                        </span>
                        <span className="text-emerald-400">{m.lastHeartbeatSec}s ago</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT 5 COLS: Interactive 64-Byte Frame Encoder + Censorship Shield (#7) */}
      <div className="xl:col-span-5 flex flex-col gap-4">
        <form
          onSubmit={handleTransmit}
          className="bg-[#0b1017] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                LIVE 64-BYTE PIPE-MODEM COMPOSER
              </span>
              <h3 className="text-base font-semibold text-white mt-1">
                Transmit Off-Grid Kin Heartbeat
              </h3>
            </div>
            {sentBanner && (
              <span className="text-xs font-mono text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Dispatched!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">FAMILY GROUP</label>
              <select
                value={selectedFamilyId}
                onChange={(e) => setSelectedFamilyId(e.target.value)}
                className="w-full rounded-lg bg-[#080c12] border border-slate-700 px-2.5 py-1.5 text-white"
              >
                {families.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.familyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">SENDER NAME</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full rounded-lg bg-[#080c12] border border-slate-700 px-2.5 py-1.5 text-white"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">FROM LEVEL / BAY</label>
              <div className="flex gap-1.5">
                <select
                  value={fromLevel}
                  onChange={(e) => setFromLevel(Number(e.target.value))}
                  className="w-20 rounded-lg bg-[#080c12] border border-slate-700 px-2 py-1.5 text-white"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      L{n.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={bay}
                  onChange={(e) => setBay(e.target.value)}
                  className="w-full rounded-lg bg-[#080c12] border border-slate-700 px-2 py-1.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">DEST LEVEL &amp; STATUS</label>
              <div className="flex gap-1.5">
                <select
                  value={toLevel}
                  onChange={(e) => setToLevel(Number(e.target.value))}
                  className="w-20 rounded-lg bg-[#080c12] border border-slate-700 px-2 py-1.5 text-white"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      L{n.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as KinMember['status'])}
                  className="w-full rounded-lg bg-[#080c12] border border-slate-700 px-2 py-1.5 text-white"
                >
                  <option value="IN_BLACKOUT_SAFE">SAFE (DARK)</option>
                  <option value="SAFE">SAFE (GRID)</option>
                  <option value="NEEDS_INHALER">NEED INHALER</option>
                </select>
              </div>
            </div>
          </div>

          <div className="font-mono text-xs">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>COMPACT MESSAGE (MAX 34 CHARS)</span>
              <span>{message.length}/34</span>
            </div>
            <input
              type="text"
              maxLength={34}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg bg-[#080c12] border border-slate-700 px-3 py-1.5 text-white"
            />
          </div>

          {/* Live Color-Coded 64-Byte Frame Breakdown */}
          <div className="p-3 rounded-xl bg-[#070a0f] border border-slate-800 font-mono text-[11px] space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">
                REAL-TIME {liveFrame.byteCount}-BYTE PACKET FRAME
              </span>
              <span className="text-cyan-300">
                Pipe FSK: {liveFrame.airtimeAcousticMs}ms · LoRa: {liveFrame.airtimeLoraMs}ms
              </span>
            </div>

            <div className="leading-relaxed break-all text-[10px]">
              <span className="text-cyan-400 font-bold" title="4B Header">
                {liveFrame.headerHex}{' '}
              </span>
              <span className="text-amber-400" title="6B Level/Bay Route">
                {liveFrame.routingHex}{' '}
              </span>
              <span className="text-slate-300" title="42B Compressed Payload">
                {liveFrame.payloadHex}{' '}
              </span>
              <span className="text-emerald-400" title="10B Ed25519 Web-of-Trust Sig">
                {liveFrame.sigHex}{' '}
              </span>
              <span className="text-purple-400 font-bold" title="2B CRC-16-CCITT">
                {liveFrame.crcHex}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-[9px] pt-1 border-t border-slate-800/80">
              <span className="text-cyan-400">■ 4B Magic/TTL</span>
              <span className="text-amber-400">■ 6B Level Route</span>
              <span className="text-slate-300">■ 42B Payload</span>
              <span className="text-emerald-400">■ 10B WoT Sig</span>
              <span className="text-purple-400">■ 2B CRC16</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_18px_rgba(34,211,238,0.28)] transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>TRANSMIT 64B BEACON VIA STEEL PIPE + LORA MESH</span>
          </button>
        </form>

        {/* Problem #7 Directorate Censorship & Spoof Resistance Card */}
        <div className="bg-[#0b1017] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              PROBLEM #7 · CENSORSHIP &amp; SPOOF SHIELD
            </span>
            <span className="text-xs font-mono text-rose-300 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              {spoofsBlocked} Directorate Spoofs Dropped
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-[#0e151f] border border-slate-800">
              <div className="text-[10px] text-slate-400">DIRNET KILL-SWITCH SURVIVAL</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">
                {dirNetDownCount}/12 Levels Off-DirNet
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">
                100% Bridged by Pipe Ultrasound
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0e151f] border border-slate-800">
              <div className="text-[10px] text-slate-400">TRUST MODEL</div>
              <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                QR Key-Signing
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Rejects unsigned state bulletins
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Neighbors cross-sign public keys face-to-face at water taps and shift changes. When the Directorate shuts down DirNet or injects fake &ldquo;Air Safe&rdquo; packets, CONDUIT nodes drop unsigned frames at the physical relay layer.
            </span>
          </p>

          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300 pt-1">
            <Radio className="w-3.5 h-3.5" />
            <span>Try clicking &ldquo;DirNet Kill-Switch + Spoof&rdquo; in the top bar to test!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
