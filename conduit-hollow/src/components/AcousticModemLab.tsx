import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Cpu,
  Mic,
  MicOff,
  Play,
  Radio,
  Sparkles,
  Volume2,
  Waves,
} from 'lucide-react';

interface AcousticModemLabProps {
  onPacketDecoded: (decodedText: string, crcValid: boolean) => void;
}

const PREAMBLE_A_HZ = 1220;
const PREAMBLE_B_HZ = 1360;
const EOF_HZ = 3120;
const BASE_NIBBLE_HZ = 1550;
const STEP_NIBBLE_HZ = 90; // 0x0 = 1550 Hz .. 0xF = 2900 Hz

function nibbleToFreq(nibble: number): number {
  return BASE_NIBBLE_HZ + (nibble & 0x0f) * STEP_NIBBLE_HZ;
}

function freqToNearestNibble(freq: number): { nibble: number; errorHz: number } {
  const raw = Math.round((freq - BASE_NIBBLE_HZ) / STEP_NIBBLE_HZ);
  const clamped = Math.max(0, Math.min(15, raw));
  const expected = nibbleToFreq(clamped);
  return { nibble: clamped, errorHz: Math.abs(freq - expected) };
}

function computeCrc8(bytes: number[]): number {
  let crc = 0x00;
  for (const b of bytes) {
    crc ^= b & 0xff;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x80) !== 0 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

export const AcousticModemLab: React.FC<AcousticModemLabProps> = ({ onPacketDecoded }) => {
  const [txText, setTxText] = useState<string>('SAFE L11 O2 OK');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [activeToneHz, setActiveToneHz] = useState<number | null>(null);
  const [activeSymbolIdx, setActiveSymbolIdx] = useState<number>(-1);

  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [detectedPeakHz, setDetectedPeakHz] = useState<number>(0);
  const [rxStatus, setRxStatus] = useState<string>('IDLE — Ready to listen or run pipe loopback');
  const [decodedOutput, setDecodedOutput] = useState<string>('');
  const [crcStatus, setCrcStatus] = useState<'NONE' | 'VALID' | 'MISMATCH'>('NONE');
  const [spectrumBars, setSpectrumBars] = useState<number[]>(() => new Array(32).fill(6));

  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // Build nibble sequence + CRC8 for the current txText
  const cleanBytes = Array.from(txText.slice(0, 18)).map((ch) => ch.charCodeAt(0) & 0x7f);
  const crcByte = computeCrc8(cleanBytes);
  const frameBytes = [...cleanBytes, crcByte];
  const nibbles: number[] = [];
  frameBytes.forEach((b) => {
    nibbles.push((b >> 4) & 0x0f);
    nibbles.push(b & 0x0f);
  });

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const ensureAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  // Real physical WebAudio 16-MFSK Speaker Broadcast
  const handleTransmitSpeaker = () => {
    if (isTransmitting) return;
    const ctx = ensureAudioContext();
    setIsTransmitting(true);
    setActiveSymbolIdx(-1);

    const symbolDuration = 0.085; // 85ms per nibble
    const sequence: { freq: number; symIndex: number }[] = [
      { freq: PREAMBLE_A_HZ, symIndex: -1 },
      { freq: PREAMBLE_B_HZ, symIndex: -1 },
      ...nibbles.map((n, idx) => ({ freq: nibbleToFreq(n), symIndex: idx })),
      { freq: EOF_HZ, symIndex: -2 },
    ];

    const startTime = ctx.currentTime + 0.04;

    sequence.forEach((item, i) => {
      const t0 = startTime + i * symbolDuration;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(item.freq, t0);

      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.exponentialRampToValueAtTime(0.14, t0 + 0.012);
      gain.gain.setValueAtTime(0.14, t0 + symbolDuration - 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + symbolDuration - 0.002);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + symbolDuration);

      setTimeout(() => {
        setActiveToneHz(item.freq);
        setActiveSymbolIdx(item.symIndex);
        // Animate spectrum bars around the active tone
        const centerBin = Math.min(
          31,
          Math.max(0, Math.round(((item.freq - 1100) / 2200) * 31))
        );
        setSpectrumBars(
          Array.from({ length: 32 }, (_, idx) => {
            const dist = Math.abs(idx - centerBin);
            if (dist === 0) return 96;
            if (dist === 1) return 54;
            if (dist === 2) return 22;
            return 5 + Math.round(Math.random() * 7);
          })
        );
      }, Math.round((t0 - ctx.currentTime) * 1000));
    });

    const totalMs = Math.round(sequence.length * symbolDuration * 1000) + 120;
    setTimeout(() => {
      setIsTransmitting(false);
      setActiveToneHz(null);
      setActiveSymbolIdx(-1);
      setSpectrumBars(new Array(32).fill(6));
    }, totalMs);
  };

  // Simulated Steel-Pipe Multipath + Demodulator Loopback (Works without Mic Permission!)
  const handlePipeLoopbackTest = () => {
    setRxStatus('SYNCING PREAMBLE (1220Hz → 1360Hz) ON STEEL PIPE...');
    setDecodedOutput('');
    setCrcStatus('NONE');
    handleTransmitSpeaker();

    const rxNibbles: number[] = [];
    nibbles.forEach((n, idx) => {
      setTimeout(() => {
        // Add +/- 6 Hz simulated steel-pipe Doppler/dispersion jitter and demodulate
        const noisyFreq = nibbleToFreq(n) + (Math.random() - 0.5) * 12;
        const { nibble } = freqToNearestNibble(noisyFreq);
        rxNibbles.push(nibble);
        setDetectedPeakHz(Math.round(noisyFreq));

        if (rxNibbles.length % 2 === 0) {
          const byteCount = rxNibbles.length / 2;
          const partialBytes: number[] = [];
          for (let k = 0; k < byteCount; k++) {
            partialBytes.push((rxNibbles[k * 2] << 4) | rxNibbles[k * 2 + 1]);
          }
          // Exclude trailing CRC byte while streaming text preview
          const textBytes = partialBytes.slice(0, cleanBytes.length);
          setDecodedOutput(String.fromCharCode(...textBytes));
          setRxStatus(`DEMODULATING SYMBOL ${rxNibbles.length}/${nibbles.length}...`);
        }

        if (idx === nibbles.length - 1) {
          const allRxBytes: number[] = [];
          for (let k = 0; k < rxNibbles.length / 2; k++) {
            allRxBytes.push((rxNibbles[k * 2] << 4) | rxNibbles[k * 2 + 1]);
          }
          const payload = allRxBytes.slice(0, -1);
          const rxCrc = allRxBytes[allRxBytes.length - 1];
          const valid = computeCrc8(payload) === rxCrc;
          const finalStr = String.fromCharCode(...payload);

          setDecodedOutput(finalStr);
          setCrcStatus(valid ? 'VALID' : 'MISMATCH');
          setRxStatus(
            valid
              ? `✓ EOF 3120Hz · CRC-8 0x${rxCrc.toString(16).toUpperCase().padStart(2, '0')} VERIFIED!`
              : 'CRC MISMATCH — REQUESTING ARQ RETRANSMIT'
          );
          onPacketDecoded(finalStr, valid);
        }
      }, 210 + idx * 85);
    });
  };

  // Real Live Microphone FFT Receiver (For Two-Device Judging Table Demo!)
  const toggleMicListener = async () => {
    if (isListeningMic) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      setIsListeningMic(false);
      setRxStatus('MIC STOPPED');
      return;
    }

    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      micStreamRef.current = stream;
      const ctx = ensureAudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.25;
      source.connect(analyser);

      const bins = new Uint8Array(analyser.frequencyBinCount);
      const binHz = ctx.sampleRate / analyser.fftSize;

      let state: 'WAIT_PRE_A' | 'WAIT_PRE_B' | 'DATA' = 'WAIT_PRE_A';
      let lastSampleTime = 0;
      let collectedNibbles: number[] = [];

      setIsListeningMic(true);
      setDecodedOutput('');
      setCrcStatus('NONE');
      setRxStatus('LISTENING ON MICROPHONE FOR 1220Hz PREAMBLE...');

      const loop = (now: number) => {
        analyser.getByteFrequencyData(bins);

        // Find dominant peak between 1100 Hz and 3300 Hz
        const minBin = Math.floor(1100 / binHz);
        const maxBin = Math.ceil(3300 / binHz);
        let bestBin = minBin;
        let bestVal = 0;
        for (let b = minBin; b <= maxBin; b++) {
          if (bins[b] > bestVal) {
            bestVal = bins[b];
            bestBin = b;
          }
        }
        const peakFreq = Math.round(bestBin * binHz);
        setDetectedPeakHz(bestVal > 45 ? peakFreq : 0);

        // Update 32 spectrum bars across 1100..3300 Hz
        const bars: number[] = [];
        for (let i = 0; i < 32; i++) {
          const f = 1100 + (i / 31) * 2200;
          const idx = Math.round(f / binHz);
          bars.push(Math.max(5, Math.round((bins[idx] / 255) * 100)));
        }
        setSpectrumBars(bars);

        if (bestVal > 75) {
          if (state === 'WAIT_PRE_A' && Math.abs(peakFreq - PREAMBLE_A_HZ) < 45) {
            state = 'WAIT_PRE_B';
            setRxStatus('PREAMBLE A LOCKED (1220Hz) → WAITING 1360Hz...');
          } else if (state === 'WAIT_PRE_B' && Math.abs(peakFreq - PREAMBLE_B_HZ) < 45) {
            state = 'DATA';
            collectedNibbles = [];
            lastSampleTime = now + 45;
            setRxStatus('RECEIVING 16-MFSK ACOUSTIC SYMBOLS...');
          } else if (state === 'DATA' && now - lastSampleTime >= 85) {
            lastSampleTime = now;
            if (Math.abs(peakFreq - EOF_HZ) < 60 && collectedNibbles.length >= 4) {
              const byteCount = Math.floor(collectedNibbles.length / 2);
              const bytes: number[] = [];
              for (let k = 0; k < byteCount; k++) {
                bytes.push((collectedNibbles[k * 2] << 4) | collectedNibbles[k * 2 + 1]);
              }
              const payload = bytes.slice(0, -1);
              const rxCrc = bytes[bytes.length - 1];
              const valid = computeCrc8(payload) === rxCrc;
              const str = String.fromCharCode(
                ...payload.map((c) => (c >= 32 && c <= 126 ? c : 63))
              );
              setDecodedOutput(str);
              setCrcStatus(valid ? 'VALID' : 'MISMATCH');
              setRxStatus(
                valid ? '✓ LIVE ACOUSTIC PACKET DECODED & CRC VERIFIED!' : 'FRAME RECEIVED (NOISY CRC)'
              );
              onPacketDecoded(str, valid);
              state = 'WAIT_PRE_A';
            } else {
              const { nibble, errorHz } = freqToNearestNibble(peakFreq);
              if (errorHz < 52 && collectedNibbles.length < 44) {
                collectedNibbles.push(nibble);
                if (collectedNibbles.length % 2 === 0) {
                  const chars: number[] = [];
                  for (let k = 0; k < collectedNibbles.length / 2; k++) {
                    const c = (collectedNibbles[k * 2] << 4) | collectedNibbles[k * 2 + 1];
                    if (c >= 32 && c <= 126) chars.push(c);
                  }
                  setDecodedOutput(String.fromCharCode(...chars));
                }
              }
            }
          }
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setMicError(
        'Microphone blocked by browser/iframe permissions. Use "Pipe Channel Loopback" below or open in Chrome/VS Code localhost for 2-device live mic demo!'
      );
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {/* LEFT 6 COLS: Live 16-MFSK Acoustic Transmitter */}
      <div className="xl:col-span-6 bg-[#0b1017] border border-cyan-500/35 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            PHYSICAL LAYER HARDWARE DEMO · REAL AUDIO MODEM
          </span>
          <h2 className="text-base sm:text-lg font-semibold text-white mt-1.5 flex items-center gap-2">
            <Waves className="w-5 h-5 text-cyan-400" />
            16-MFSK Ultrasonic / Acoustic Pipe Transmitter (TX)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Converts survival beacons into real frequency-shift tones (1550 Hz – 2900 Hz + CRC-8). Hold a metal water bottle or pipe between two laptops to bridge data with zero Wi-Fi!
          </p>

          <div className="mt-4 space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>PAYLOAD TO MODULATE INTO SOUND (MAX 18 CHARS)</span>
                <span>
                  CRC-8: 0x{crcByte.toString(16).toUpperCase().padStart(2, '0')} · {nibbles.length} nibbles
                </span>
              </div>
              <input
                type="text"
                maxLength={18}
                value={txText}
                onChange={(e) => setTxText(e.target.value)}
                className="w-full rounded-lg bg-[#070b10] border border-slate-700 px-3 py-2 text-sm text-cyan-200 font-bold tracking-wider"
              />
            </div>

            {/* Live Nibble-to-Frequency Matrix */}
            <div className="p-3 rounded-xl bg-[#070b10] border border-slate-800">
              <div className="flex justify-between text-[10px] text-slate-400 mb-2">
                <span>MFSK SYMBOL STREAM (4-BIT NIBBLES → HZ)</span>
                <span className="text-amber-300">
                  {activeToneHz ? `TX TONE: ${activeToneHz} Hz` : 'READY'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {nibbles.map((n, idx) => {
                  const isCurrent = idx === activeSymbolIdx;
                  const isCrcNibble = idx >= nibbles.length - 2;
                  return (
                    <span
                      key={idx}
                      className={`px-1.5 py-0.5 rounded text-[10px] border transition ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 border-amber-200 font-bold scale-110'
                          : isCrcNibble
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : 'bg-slate-900 text-cyan-300 border-slate-800'
                      }`}
                      title={`${nibbleToFreq(n)} Hz`}
                    >
                      {n.toString(16).toUpperCase()}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleTransmitSpeaker}
                disabled={isTransmitting}
                className="py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isTransmitting ? 'MODULATING...' : 'PLAY REAL MFSK SOUND'}</span>
              </button>

              <button
                onClick={handlePipeLoopbackTest}
                disabled={isTransmitting}
                className="py-2.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-amber-100 font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 text-amber-300" />
                <span>PIPE CHANNEL LOOPBACK</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Judge Table Stunt:</strong> Open CONDUIT on your phone and your laptop. Click{' '}
            <em>&ldquo;Arm Live Mic&rdquo;</em> on the laptop, press your phone speaker against a steel thermos/pipe touching the laptop, and click <em>&ldquo;Play Real MFSK Sound&rdquo;</em>!
          </span>
        </div>
      </div>

      {/* RIGHT 6 COLS: Live FFT Spectrum Analyzer & Acoustic Demodulator (RX) */}
      <div className="xl:col-span-6 bg-[#0b1017] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                FFT SPECTRUM ANALYZER &amp; CRC-8 DECODER
              </span>
              <h3 className="text-base sm:text-lg font-semibold text-white mt-1.5 flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                Acoustic Pipe Receiver (RX)
              </h3>
            </div>

            <button
              onClick={toggleMicListener}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border font-mono text-xs font-bold transition cursor-pointer ${
                isListeningMic
                  ? 'bg-rose-500/25 border-rose-400 text-rose-100 animate-pulse'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/60 text-emerald-100'
              }`}
            >
              {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListeningMic ? 'STOP LIVE MIC' : 'ARM LIVE MIC RX'}</span>
            </button>
          </div>

          {micError && (
            <div className="mt-3 p-2.5 rounded-lg bg-amber-950/35 border border-amber-500/40 text-[11px] font-mono text-amber-200">
              {micError}
            </div>
          )}

          {/* 32-Bar Real-Time Frequency Spectrum */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#070b10] border border-slate-800">
            <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-2">
              <span>BANDPASS FFT (1,100 Hz – 3,300 Hz)</span>
              <span className="text-cyan-300">
                PEAK: {detectedPeakHz > 0 ? `${detectedPeakHz} Hz` : '---'}
              </span>
            </div>

            <div className="h-28 flex items-end gap-1 pt-2">
              {spectrumBars.map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-t bg-gradient-to-t from-cyan-600 via-cyan-400 to-amber-300 transition-all duration-75"
                  style={{ height: `${Math.max(5, val)}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between font-mono text-[9px] text-slate-500 mt-1">
              <span>1220Hz Sync</span>
              <span>1550Hz (0x0)</span>
              <span>2270Hz (0x8)</span>
              <span>2900Hz (0xF)</span>
              <span>3120Hz EOF</span>
            </div>
          </div>

          {/* Decoded Terminal Readout */}
          <div className="mt-4 p-4 rounded-xl bg-[#070a0f] border border-slate-800 font-mono space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{rxStatus}</span>
              {crcStatus === 'VALID' && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CRC-8 OK
                </span>
              )}
            </div>

            <div className="p-3 rounded-lg bg-[#0d141e] border border-slate-800 min-h-[52px] flex items-center">
              {decodedOutput ? (
                <span className="text-base sm:text-lg font-bold text-emerald-300 tracking-wider">
                  {decodedOutput}
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Decoded off-grid packet payload will appear here...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
          <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Why steel pipes rock: Acoustic attenuation in Schedule-40 steel water mains is &lt;0.03 dB/m—carrying 2–25 kHz bursts across 10+ tunnel levels!
          </span>
        </div>
      </div>
    </div>
  );
};
