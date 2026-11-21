import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createInitialFamilies,
  createInitialLevels,
  createInitialLogs,
  createInitialMissions,
  createInitialPackets,
  createInitialSurfaceProbe,
  createInitialTelemetryHistory,
  createInitialWaterSegments,
  encode64ByteKinFrame,
} from './data/initialHollow';
import {
  ActiveTab,
  CrisisScenarioId,
  EventLogEntry,
  KinFamilyGroup,
  KinMember,
  LevelState,
  LivePacket,
  MedicCourierMission,
  SurfaceProbeState,
  TelemetryHistoryPoint,
  WaterLoopSegment,
} from './types/hollow';
import { sonic } from './utils/sound';
import { TopCrisisBar } from './components/TopCrisisBar';
import { HollowCrossSection } from './components/HollowCrossSection';
import { GridWaterGuard } from './components/GridWaterGuard';
import { KinLinkMesh } from './components/KinLinkMesh';
import { LungWatchDispatch } from './components/LungWatchDispatch';
import { SurfaceDaybreak } from './components/SurfaceDaybreak';
import { AcousticModemLab } from './components/AcousticModemLab';
import { ResidentHandsetDrawer } from './components/ResidentHandsetDrawer';
import { JudgeBriefingModal } from './components/JudgeBriefingModal';

function nowClockString(): string {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('TOPOLOGY');
  const [levels, setLevels] = useState<LevelState[]>(() => createInitialLevels());
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(11);
  const [packets, setPackets] = useState<LivePacket[]>(() => createInitialPackets());
  const [families, setFamilies] = useState<KinFamilyGroup[]>(() => createInitialFamilies());
  const [waterLoops, setWaterLoops] = useState<WaterLoopSegment[]>(() =>
    createInitialWaterSegments()
  );
  const [missions, setMissions] = useState<MedicCourierMission[]>(() =>
    createInitialMissions()
  );
  const [history, setHistory] = useState<TelemetryHistoryPoint[]>(() =>
    createInitialTelemetryHistory()
  );
  const [logs, setLogs] = useState<EventLogEntry[]>(() => createInitialLogs());
  const [surfaceProbe, setSurfaceProbe] = useState<SurfaceProbeState>(() =>
    createInitialSurfaceProbe()
  );

  const [activeScenarios, setActiveScenarios] = useState<CrisisScenarioId[]>([]);
  const [spoofsBlocked, setSpoofsBlocked] = useState<number>(14);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<1 | 2>(1);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [handsetOpen, setHandsetOpen] = useState<boolean>(false);
  const [briefingOpen, setBriefingOpen] = useState<boolean>(false);

  const appendLog = useCallback(
    (
      problemTag: EventLogEntry['problemTag'],
      severity: EventLogEntry['severity'],
      levelCode: string,
      message: string
    ) => {
      setLogs((prev) => [
        {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: nowClockString(),
          problemTag,
          severity,
          levelCode,
          message,
        },
        ...prev.slice(0, 39),
      ]);
    },
    []
  );

  const spawnPacket = useCallback((pkt: Omit<LivePacket, 'id' | 'createdAt'>) => {
    setPackets((prev) => [
      {
        ...pkt,
        id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: 'just now',
      },
      ...prev.slice(0, 9),
    ]);
  }, []);

  // Real-time simulation heartbeat
  useEffect(() => {
    if (!isRunning) return;
    const intervalMs = simSpeed === 2 ? 900 : 1700;

    const timer = setInterval(() => {
      // 1. Advance in-flight packets along the steel pipe / mesh
      setPackets((prev) => {
        const updated = prev
          .map((p) => {
            const nextProgress = Math.min(100, p.progressPct + 22);
            const span = p.toLevel - p.fromLevel;
            const cur = p.fromLevel + (span * nextProgress) / 100;
            return {
              ...p,
              progressPct: nextProgress,
              currentLevel: cur,
            };
          })
          .filter((p) => p.progressPct < 100);

        // Keep ambient mesh traffic flowing
        if (updated.length < 3) {
          const fromL = 8 + Math.floor(Math.random() * 5);
          const toL = 3 + Math.floor(Math.random() * 4);
          const frame = encode64ByteKinFrame({
            fromLevel: fromL,
            toLevel: toL,
            bay: `BAY-${fromL}B`,
            statusCode: 1,
            message: 'Mesh sync heartbeat OK',
            senderName: 'Node',
          });
          updated.unshift({
            id: `pkt-auto-${Date.now()}`,
            category: Math.random() > 0.45 ? 'KIN_HEARTBEAT' : 'GRID_EARLY_WARN',
            fromLevel: fromL,
            toLevel: toL,
            currentLevel: fromL,
            transport: Math.abs(toL - fromL) >= 3 ? 'ACOUSTIC_PIPE' : 'LORA_SUBGHZ',
            summary: `Auto Pipe Sync L${fromL.toString().padStart(2, '0')} → L${toL
              .toString()
              .padStart(2, '0')} (CRC Valid)`,
            hexFrame: frame.rawHex,
            verifiedSignature: true,
            progressPct: 14,
            createdAt: 'live',
          });
        }
        return updated;
      });

      // 2. Evolve level physics based on active scenarios
      setLevels((prevLevels) => {
        const hasBlackoutCascade = activeScenarios.includes('BLACKOUT_CASCADE');
        const hasWaterSlug = activeScenarios.includes('TOXIC_WATER_SLUG');
        const hasLungSurge = activeScenarios.includes('LUNG_SURGE');

        const nextLevels = prevLevels.map((lvl) => {
          let {
            gridHz,
            fanRpm,
            powerState,
            predictedBlackoutSec,
            o2Pct,
            waterSlugEtaSec,
            waterContaminated,
            waterTdsPpm,
            verifiedLungCases,
          } = lvl;

          // Subtle organic sensor jitter
          if (powerState !== 'BLACKOUT') {
            gridHz = Number(
              Math.max(48.35, Math.min(50.04, gridHz + (Math.random() - 0.52) * 0.04)).toFixed(2)
            );
          }

          if (hasBlackoutCascade && lvl.level >= 8 && powerState !== 'BLACKOUT') {
            gridHz = Number(Math.max(48.42, gridHz - 0.08).toFixed(2));
            fanRpm = Math.max(420, fanRpm - 25);
            powerState = 'DROOP_WARNING';
            predictedBlackoutSec =
              predictedBlackoutSec === null ? 660 : Math.max(0, predictedBlackoutSec - 25);
            if (predictedBlackoutSec === 0 || gridHz <= 48.48) {
              powerState = 'BLACKOUT';
              gridHz = 0;
              fanRpm = 280;
            }
          } else if (predictedBlackoutSec !== null && predictedBlackoutSec > 0) {
            predictedBlackoutSec = Math.max(30, predictedBlackoutSec - 4);
          }

          // O2 drifts slightly in blackout if damper is NOT sealed
          if (powerState === 'BLACKOUT' && !lvl.damperSealed) {
            o2Pct = Number(Math.max(17.8, o2Pct - 0.02).toFixed(2));
          } else if (lvl.damperSealed && o2Pct < 19.1) {
            o2Pct = Number(Math.min(19.4, o2Pct + 0.01).toFixed(2));
          }

          // Water slug countdown progression
          if (hasWaterSlug && lvl.level >= 8 && !lvl.valveLocked) {
            if (waterSlugEtaSec !== null && waterSlugEtaSec > 0) {
              waterSlugEtaSec = Math.max(0, waterSlugEtaSec - 15);
              if (waterSlugEtaSec === 0) {
                waterContaminated = true;
                waterTdsPpm = Math.max(waterTdsPpm, 980);
              }
            }
          }

          // Outbreak progression if unsealed during Vent Surge
          if (hasLungSurge && lvl.level >= 8 && !lvl.damperSealed && Math.random() > 0.65) {
            verifiedLungCases += 1;
          }

          return {
            ...lvl,
            gridHz,
            fanRpm,
            powerState,
            predictedBlackoutSec,
            o2Pct,
            waterSlugEtaSec,
            waterContaminated,
            waterTdsPpm,
            verifiedLungCases,
          };
        });

        // Update oscilloscope telemetry history from L10/L09
        const refLvl =
          nextLevels.find((l) => l.level === 10 && l.powerState !== 'BLACKOUT') ||
          nextLevels.find((l) => l.level === 9) ||
          nextLevels[7];

        setHistory((prevHist) => {
          const nextTick = (prevHist[prevHist.length - 1]?.tick || 0) + 1;
          return [
            ...prevHist.slice(1),
            {
              tick: nextTick,
              label: 'now',
              deepGridHz: refLvl.powerState === 'BLACKOUT' ? 48.2 : refLvl.gridHz,
              deepFanRpm: refLvl.fanRpm,
              acousticTrafficBps: 240 + Math.round(Math.random() * 75),
              waterPeakTds: Math.max(...nextLevels.map((l) => l.waterTdsPpm)),
            },
          ];
        });

        return nextLevels;
      });

      // 3. Advance active street-medic courier missions
      setMissions((prev) =>
        prev.map((m) => {
          if (m.status === 'DELIVERED') return m;
          const nextPct = Math.min(100, m.progressPct + 4);
          return {
            ...m,
            progressPct: nextPct,
            etaMinutes: nextPct >= 100 ? 0 : Math.max(1, Math.round(((100 - nextPct) / 100) * 18)),
            status: nextPct >= 100 ? 'DELIVERED' : 'CLIMBING_SHAFT',
          };
        })
      );

      // 4. Increment blocked Directorate spoofs when DirNet shutdown scenario is active
      if (activeScenarios.includes('DIRECTORATE_SHUTDOWN') && Math.random() > 0.55) {
        setSpoofsBlocked((n) => n + 1);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRunning, simSpeed, activeScenarios]);

  // Crisis Scenario Injector
  const handleTriggerScenario = (scenarioId: CrisisScenarioId) => {
    const alreadyActive = activeScenarios.includes(scenarioId);
    if (!alreadyActive) {
      setActiveScenarios((prev) => [...prev, scenarioId]);
    }

    if (scenarioId === 'BLACKOUT_CASCADE') {
      sonic.playWarningTone(true);
      setLevels((prev) =>
        prev.map((l) => {
          if (l.level >= 10) {
            return {
              ...l,
              powerState: 'BLACKOUT',
              gridHz: 0,
              fanRpm: 310,
              predictedBlackoutSec: 0,
              dirNetOnline: false,
            };
          }
          if (l.level >= 8) {
            return {
              ...l,
              powerState: 'DROOP_WARNING',
              gridHz: 48.74,
              fanRpm: 760,
              predictedBlackoutSec: 540,
            };
          }
          return l;
        })
      );
      spawnPacket({
        category: 'GRID_EARLY_WARN',
        fromLevel: 12,
        toLevel: 8,
        currentLevel: 12,
        transport: 'ACOUSTIC_PIPE',
        summary: 'URGENT: Turbine #4 Relay Shed! L10-L12 Blackout — L08-L09 T-9m',
        hexFrame: '43 4E 02 7F 0C 08 FF 01 42 4C 41 43 4B 4F 55 54 5F 43 41 53 43 41 44 45',
        verifiedSignature: true,
        progressPct: 12,
      });
      appendLog(
        '#1 GRID/AIR',
        'CRITICAL',
        'L08–L12',
        'Deep Blackout Cascade! L10–L12 grid severed; CONDUIT issued 9-min early cutout countdown to L08–L09.'
      );
    }

    if (scenarioId === 'DIRECTORATE_SHUTDOWN') {
      sonic.playPipeChirp();
      setSpoofsBlocked((s) => s + 5);
      setLevels((prev) =>
        prev.map((l) => (l.level >= 4 ? { ...l, dirNetOnline: false, meshPeers: l.meshPeers + 42 } : l))
      );
      spawnPacket({
        category: 'SPOOF_REJECTED',
        fromLevel: 2,
        toLevel: 10,
        currentLevel: 6,
        transport: 'ACOUSTIC_PIPE',
        summary: 'DirNet Severed! Rerouting all L04–L12 traffic via Steel Water Main #4',
        hexFrame: '43 4E 02 7C 0A 04 B2 09 4D 45 53 48 5F 46 41 49 4C 4F 56 45 52 5F 4F 4B',
        verifiedSignature: true,
        progressPct: 20,
      });
      appendLog(
        '#7 MESH',
        'WARN',
        'L04–L12',
        'Directorate activated Protocol Silence (DirNet severed) + injected 5 fake "All-Clear" frames (dropped by WoT).'
      );
    }

    if (scenarioId === 'TOXIC_WATER_SLUG') {
      sonic.playWarningTone(true);
      setWaterLoops((prev) =>
        prev.map((loop) =>
          loop.id === 'loop-deep-8'
            ? {
                ...loop,
                turbidityNtu: 26.4,
                heavyMetalsPpb: 510,
                conductivityUs: 1840,
                crowdReports: loop.crowdReports + 6,
                status: 'SLUG_DETECTED',
              }
            : loop
        )
      );
      setLevels((prev) =>
        prev.map((l) => {
          if (l.level >= 8 && !l.valveLocked) {
            return {
              ...l,
              waterTdsPpm: l.level === 8 ? 1120 : 690,
              waterContaminated: l.level === 8,
              waterSlugEtaSec: l.level === 8 ? 0 : (l.level - 8) * 210,
            };
          }
          return l;
        })
      );
      spawnPacket({
        category: 'WATER_INTERCEPT',
        fromLevel: 8,
        toLevel: 12,
        currentLevel: 8,
        transport: 'ACOUSTIC_PIPE',
        summary: '4,890 m/s PIPE ALERT: Recycler-8 Toxic Backflow (510ppb Pb/Cd) — LOCK TAPS!',
        hexFrame: '43 4E 02 7F 08 0C EE 04 54 4F 58 49 43 5F 53 4C 55 47 5F 4C 4F 43 4B',
        verifiedSignature: true,
        progressPct: 18,
      });
      appendLog(
        '#4 WATER',
        'CRITICAL',
        'L08→L12',
        'Recycler-8 membrane rupture! Ultrasonic pipe alert outran 1.8m/s toxic water slug—ready to lock L09–L12 taps.'
      );
    }

    if (scenarioId === 'LUNG_SURGE') {
      sonic.playWarningTone(false);
      setLevels((prev) =>
        prev.map((l) =>
          l.level >= 8
            ? {
                ...l,
                verifiedLungCases: l.verifiedLungCases + (l.level >= 10 ? 34 : 19),
                coughAnomalyIndex: Math.min(99, l.coughAnomalyIndex + 16),
                inhalerStockPct: Math.max(4, l.inhalerStockPct - 9),
              }
            : l
        )
      );
      spawnPacket({
        category: 'LUNG_TELEMETRY',
        fromLevel: 11,
        toLevel: 5,
        currentLevel: 11,
        transport: 'ACOUSTIC_PIPE',
        summary: 'ZK Outbreak Surge: +120 Spore-Pneumonitis cases in Vent Trunk B',
        hexFrame: '43 4E 02 7A 0B 05 D1 09 4C 55 4E 47 5F 50 4C 55 4D 45 5F 56 45 4E 54 5F 42',
        verifiedSignature: true,
        progressPct: 15,
      });
      appendLog(
        '#9 LUNG/MED',
        'CRITICAL',
        'L08–L12',
        'Vent Trunk B scrubber breach! Mesh verified +140 acute Hollow-Lung cases; Directorate still claims 28 total.'
      );
    }

    if (scenarioId === 'DAYBREAK_PROOF') {
      sonic.playBeaconConfirm();
      setSurfaceProbe((prev) => ({
        ...prev,
        truthVerifiedLevels: 12,
        proofBroadcastCount: prev.proofBroadcastCount + 1,
      }));
      spawnPacket({
        category: 'KIN_HEARTBEAT',
        fromLevel: 1,
        toLevel: 12,
        currentLevel: 1,
        transport: 'ACOUSTIC_PIPE',
        summary: 'DAYBREAK-01 TPM PROOF: Surface Air 20.84% O₂ · 0.01ppm SAFE — Broadcast L01→L12!',
        hexFrame: '43 4E 02 7F 01 0C 55 99 44 41 59 42 52 45 41 4B 5F 32 30 2E 38 34 5F 4F 32',
        verifiedSignature: true,
        progressPct: 12,
      });
      appendLog(
        '#13-#15 SURFACE',
        'SUCCESS',
        '+12m→ALL',
        'DAYBREAK-01 hammered TPM-signed Surface Habitability Proof (20.84% O₂, 642 W/m² sunlight) down Storm Riser #19 to all 12 levels!'
      );
      setActiveTab('SURFACE_EXODUS');
    }
  };

  const handleBroadcastSurfaceProof = () => {
    sonic.playBeaconConfirm();
    setSurfaceProbe((prev) => ({
      ...prev,
      truthVerifiedLevels: 12,
      proofBroadcastCount: prev.proofBroadcastCount + 1,
    }));
    spawnPacket({
      category: 'KIN_HEARTBEAT',
      fromLevel: 1,
      toLevel: 12,
      currentLevel: 1,
      transport: 'ACOUSTIC_PIPE',
      summary: 'STORM RISER #19: Surface Healed (20.84% O₂) — TPM Proof Verified L01→L12',
      hexFrame: '43 4E 02 7F 01 0C 55 99 44 41 59 42 52 45 41 4B 5F 53 41 46 45',
      verifiedSignature: true,
      progressPct: 10,
    });
    appendLog(
      '#13-#15 SURFACE',
      'SUCCESS',
      '+12m→L12',
      'Hardware-signed Surface Truth burst reached 12/12 Hollow levels via Pre-2087 Cast-Iron Storm Standpipe #19.'
    );
  };

  const handleAcousticPacketDecoded = (decodedText: string, crcValid: boolean) => {
    appendLog(
      '#7 MESH',
      crcValid ? 'SUCCESS' : 'WARN',
      'AUDIO-LAB',
      `Live 16-MFSK Acoustic Demodulator decoded "${decodedText}" (${
        crcValid ? 'CRC-8 Verified' : 'Noisy Channel'
      }).`
    );
  };

  const handleReset = () => {
    sonic.playValveLock();
    setActiveScenarios([]);
    setLevels(createInitialLevels());
    setPackets(createInitialPackets());
    setFamilies(createInitialFamilies());
    setWaterLoops(createInitialWaterSegments());
    setMissions(createInitialMissions());
    setHistory(createInitialTelemetryHistory());
    setLogs(createInitialLogs());
    setSurfaceProbe(createInitialSurfaceProbe());
    setSpoofsBlocked(14);
  };

  // Level-specific actions
  const handleToggleDamper = (levelNum: number) => {
    sonic.playValveLock();
    setLevels((prev) =>
      prev.map((l) => (l.level === levelNum ? { ...l, damperSealed: !l.damperSealed } : l))
    );
    appendLog(
      '#1 GRID/AIR',
      'SUCCESS',
      `L${levelNum.toString().padStart(2, '0')}`,
      `Bulkhead air damper toggled on L${levelNum
        .toString()
        .padStart(2, '0')} to protect neighborhood O₂ & block spore plumes.`
    );
  };

  const handleToggleValve = (levelNum: number) => {
    sonic.playValveLock();
    setLevels((prev) =>
      prev.map((l) =>
        l.level === levelNum
          ? {
              ...l,
              valveLocked: !l.valveLocked,
              waterContaminated: false,
              waterSlugEtaSec: null,
            }
          : l
      )
    );
    appendLog(
      '#4 WATER',
      'SUCCESS',
      `L${levelNum.toString().padStart(2, '0')}`,
      `Neighborhood tap solenoid valve toggled on L${levelNum
        .toString()
        .padStart(2, '0')}; bypass cistern engaged.`
    );
  };

  const handleBoostRepeater = (levelNum: number) => {
    sonic.playPipeChirp();
    setLevels((prev) =>
      prev.map((l) =>
        l.level === levelNum
          ? {
              ...l,
              pipeRepeaterInstalled: true,
              acousticSnrDb: Math.min(38, l.acousticSnrDb + 4),
              meshPeers: l.meshPeers + 36,
            }
          : l
      )
    );
    appendLog(
      '#7 MESH',
      'INFO',
      `L${levelNum.toString().padStart(2, '0')}`,
      `Piezo pipe-clamp repeater calibrated on L${levelNum
        .toString()
        .padStart(2, '0')}: +4 dB ultrasonic SNR, +36 resident peers bridged.`
    );
  };

  const handleBroadcastSiren = (levelNum: number) => {
    sonic.playBeaconConfirm();
    const frame = encode64ByteKinFrame({
      fromLevel: levelNum,
      toLevel: 4,
      bay: `WARD-${levelNum}A`,
      statusCode: 2,
      message: 'Reserve armed & kin check-in OK',
      senderName: `L${levelNum}Hub`,
    });
    spawnPacket({
      category: 'KIN_HEARTBEAT',
      fromLevel: levelNum,
      toLevel: 4,
      currentLevel: levelNum,
      transport: 'ACOUSTIC_PIPE',
      summary: `L${levelNum.toString().padStart(2, '0')} Neighborhood Supercap Armed + Mass Kin Heartbeat`,
      hexFrame: frame.rawHex,
      verifiedSignature: true,
      progressPct: 10,
    });
    appendLog(
      '#8 KIN-LINK',
      'SUCCESS',
      `L${levelNum.toString().padStart(2, '0')}`,
      `Broadcasted pre-blackout lamp charge chime & synced split-family Proof-of-Life beacons from L${levelNum
        .toString()
        .padStart(2, '0')}.`
    );
  };

  // View 2 Actions
  const handleArmPreBlackoutProtocol = () => {
    sonic.playBeaconConfirm();
    setLevels((prev) =>
      prev.map((l) => (l.level >= 8 ? { ...l, damperSealed: true } : l))
    );
    appendLog(
      '#1 GRID/AIR',
      'SUCCESS',
      'L08–L12',
      'Auto-sealed O₂ bulkhead dampers & buffered medical supercapacitors across all Deep Sump levels!'
    );
  };

  const handleIsolateWaterLoop = (loopId: string) => {
    sonic.playValveLock();
    const targetLoop = waterLoops.find((w) => w.id === loopId);
    if (!targetLoop) return;

    const protectedPopK = levels
      .filter((l) => targetLoop.levelsServed.includes(l.level))
      .reduce((s, l) => s + l.populationK, 0);

    setWaterLoops((prev) =>
      prev.map((w) =>
        w.id === loopId
          ? { ...w, status: 'LOCKED_PROTECTED', residentsProtected: protectedPopK }
          : w
      )
    );
    setLevels((prev) =>
      prev.map((l) =>
        targetLoop.levelsServed.includes(l.level)
          ? { ...l, valveLocked: true, waterContaminated: false, waterSlugEtaSec: null }
          : l
      )
    );
    appendLog(
      '#4 WATER',
      'SUCCESS',
      targetLoop.levelsServed.map((n) => `L${n}`).join(','),
      `Faster-than-flow ultrasonic lockout sealed ${targetLoop.name}—protecting ${protectedPopK.toLocaleString()},000 residents before bad water reached taps!`
    );
  };

  const handleSubmitTapReport = (levelNum: number, symptom: string, stripTds: number) => {
    sonic.playWarningTone(stripTds > 500);
    setLevels((prev) =>
      prev.map((l) =>
        l.level === levelNum
          ? {
              ...l,
              waterTdsPpm: stripTds,
              valveLocked: stripTds >= 500 ? true : l.valveLocked,
              waterContaminated: false,
            }
          : l
      )
    );
    spawnPacket({
      category: 'WATER_INTERCEPT',
      fromLevel: levelNum,
      toLevel: Math.min(12, levelNum + 2),
      currentLevel: levelNum,
      transport: 'ACOUSTIC_PIPE',
      summary: `Crowd Strip Alert L${levelNum}: ${stripTds}ppm (${symptom.slice(0, 22)})`,
      hexFrame: '43 4E 02 7F 0A 0C 99 02 57 41 54 45 52 5F 53 54 52 49 50 5F 51 55 4F 52 55 4D',
      verifiedSignature: true,
      progressPct: 15,
    });
    appendLog(
      '#4 WATER',
      stripTds >= 500 ? 'SUCCESS' : 'INFO',
      `L${levelNum.toString().padStart(2, '0')}`,
      `Resident DIY strip logged ${stripTds} ppm ("${symptom}"). ${
        stripTds >= 500 ? 'Quorum met: auto-locked local tap solenoid!' : 'Logged on neighborhood pipe ledger.'
      }`
    );
  };

  // View 3 Action: Send 64B Kin Beacon
  const handleSendKinBeacon = (params: {
    familyId: string;
    senderName: string;
    fromLevel: number;
    toLevel: number;
    bay: string;
    status: KinMember['status'];
    message: string;
  }) => {
    sonic.playBeaconConfirm();
    const encoded = encode64ByteKinFrame({
      fromLevel: params.fromLevel,
      toLevel: params.toLevel,
      bay: params.bay,
      statusCode: 2,
      message: params.message,
      senderName: params.senderName,
    });

    spawnPacket({
      category: 'KIN_HEARTBEAT',
      fromLevel: params.fromLevel,
      toLevel: params.toLevel,
      currentLevel: params.fromLevel,
      transport: 'ACOUSTIC_PIPE',
      summary: `64B Kin Beacon: ${params.senderName} (L${params.fromLevel}) → L${params.toLevel} "${params.message}"`,
      hexFrame: encoded.rawHex,
      verifiedSignature: true,
      progressPct: 12,
    });

    setFamilies((prev) =>
      prev.map((fam) => {
        if (fam.id !== params.familyId) return fam;
        const existingIdx = fam.members.findIndex(
          (m) => m.name.toLowerCase() === params.senderName.toLowerCase()
        );
        const hopTrail = [
          `L${params.fromLevel.toString().padStart(2, '0')} Piezo Clamp`,
          'Steel Main #4 (320bps)',
          `L${params.toLevel.toString().padStart(2, '0')} LoRa Peer`,
        ];

        if (existingIdx >= 0) {
          const updatedMembers = [...fam.members];
          updatedMembers[existingIdx] = {
            ...updatedMembers[existingIdx],
            level: params.fromLevel,
            bay: params.bay,
            status: params.status,
            lastHeartbeatSec: 1,
            hopTrail,
            lastNote: params.message,
          };
          return { ...fam, members: updatedMembers };
        }

        return {
          ...fam,
          members: [
            {
              id: `m-${Date.now()}`,
              name: params.senderName,
              role: 'Kin Member',
              level: params.fromLevel,
              bay: params.bay,
              status: params.status,
              lastHeartbeatSec: 1,
              o2Pct: 18.9,
              deviceBatteryPct: 14,
              hopTrail,
              lastNote: params.message,
            },
            ...fam.members,
          ],
        };
      })
    );

    appendLog(
      '#8 KIN-LINK',
      'SUCCESS',
      `L${params.fromLevel}→L${params.toLevel}`,
      `64B Kin-Beacon (${encoded.crcHex} CRC) delivered from ${params.senderName} via Steel Main #4.`
    );
  };

  // View 4 Actions: Outbreak & Medic Dispatch
  const handleLogLungCluster = (levelNum: number, casesCount: number, spo2: number) => {
    sonic.playPipeChirp();
    setLevels((prev) =>
      prev.map((l) =>
        l.level === levelNum
          ? {
              ...l,
              verifiedLungCases: l.verifiedLungCases + casesCount,
              coughAnomalyIndex: Math.min(100, l.coughAnomalyIndex + casesCount * 2),
            }
          : l
      )
    );
    spawnPacket({
      category: 'LUNG_TELEMETRY',
      fromLevel: levelNum,
      toLevel: 5,
      currentLevel: levelNum,
      transport: 'ACOUSTIC_PIPE',
      summary: `ZK Triage L${levelNum}: +${casesCount} cases (Mean SpO₂ ${spo2}%)`,
      hexFrame: '43 4E 02 79 0B 05 CC 03 5A 4B 5F 4C 55 4E 47 5F 54 52 49 41 47 45',
      verifiedSignature: true,
      progressPct: 15,
    });
    appendLog(
      '#9 LUNG/MED',
      'WARN',
      `L${levelNum.toString().padStart(2, '0')}`,
      `ZK-signed street-medic report added +${casesCount} Hollow-Lung cases (mean SpO₂ ${spo2}%).`
    );
  };

  const handleDispatchSupplyRun = (toLevel: number, cargo: string) => {
    sonic.playBeaconConfirm();
    const newMission: MedicCourierMission = {
      id: `med-${Date.now()}`,
      cargo,
      units: 18,
      fromCache: 'L05 Metro Mutual-Aid Cache',
      fromLevel: 5,
      toLevel,
      targetBay: `Level ${toLevel} Street-Medic Post`,
      courierCallsign: `MULE-${18 + (missions.length % 9)}`,
      routeProtocol: `Bypass Freight Ladder → Acoustic Airlock Sync L${toLevel}`,
      avoidedHazards: [`L${toLevel} Grid Outage`, 'DirNet Checkpoint 7A'],
      progressPct: 16,
      status: 'DISPATCHED',
      etaMinutes: 14,
    };
    setMissions((prev) => [newMission, ...prev.slice(0, 5)]);
    setLevels((prev) =>
      prev.map((l) =>
        l.level === toLevel
          ? { ...l, inhalerStockPct: Math.min(100, l.inhalerStockPct + 24) }
          : l
      )
    );
    appendLog(
      '#9 LUNG/MED',
      'SUCCESS',
      `L05→L${toLevel}`,
      `Dispatched ${newMission.courierCallsign} carrying ${cargo} via blackout-safe service ladder.`
    );
  };

  // Global KPI summary computed live
  const kpis = useMemo(() => {
    const meshNodesTotal = levels.reduce((s, l) => s + l.meshPeers, 0);
    const dirNetDownCount = levels.filter((l) => !l.dirNetOnline).length;
    const blackoutLevels = levels.filter((l) => l.powerState === 'BLACKOUT').length;
    const droopWarnLevels = levels.filter((l) => l.powerState === 'DROOP_WARNING').length;
    const residentsWaterProtectedK = levels
      .filter((l) => !l.waterContaminated)
      .reduce((s, l) => s + l.populationK, 0);
    const totalOfficial = levels.reduce((s, l) => s + l.officialLungCases, 0);
    const totalVerified = levels.reduce((s, l) => s + l.verifiedLungCases, 0);
    const lungGapRatio = (totalVerified / Math.max(1, totalOfficial)).toFixed(1);

    const allMembers = families.flatMap((f) => f.members);
    const kinTotalCount = allMembers.length;
    const kinVerifiedCount = allMembers.filter((m) => m.status !== 'AWAITING_PING').length;

    return {
      meshNodesTotal,
      dirNetDownCount,
      blackoutLevels,
      droopWarnLevels,
      residentsWaterProtectedK,
      lungGapRatio,
      kinVerifiedCount,
      kinTotalCount,
      spoofsBlocked,
    };
  }, [levels, families, spoofsBlocked]);

  return (
    <div className="min-h-screen hollow-grid-bg text-slate-100 flex flex-col">
      <TopCrisisBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isRunning={isRunning}
        simSpeed={simSpeed}
        onToggleRun={() => setIsRunning((r) => !r)}
        onToggleSpeed={() => setSimSpeed((s) => (s === 1 ? 2 : 1))}
        onTriggerScenario={handleTriggerScenario}
        onReset={handleReset}
        activeScenarios={activeScenarios}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(sonic.toggle())}
        handsetOpen={handsetOpen}
        onToggleHandset={() => setHandsetOpen((o) => !o)}
        onOpenBriefing={() => setBriefingOpen(true)}
        kpis={kpis}
      />

      <main className="max-w-[1600px] w-full mx-auto px-3 sm:px-5 py-4 flex-1">
        {activeTab === 'TOPOLOGY' && (
          <HollowCrossSection
            levels={levels}
            selectedLevelNum={selectedLevelNum}
            onSelectLevel={setSelectedLevelNum}
            packets={packets}
            logs={logs}
            onToggleDamper={handleToggleDamper}
            onToggleValve={handleToggleValve}
            onBoostRepeater={handleBoostRepeater}
            onBroadcastSiren={handleBroadcastSiren}
          />
        )}

        {activeTab === 'GRID_WATER' && (
          <GridWaterGuard
            levels={levels}
            history={history}
            waterLoops={waterLoops}
            onArmPreBlackoutProtocol={handleArmPreBlackoutProtocol}
            onIsolateWaterLoop={handleIsolateWaterLoop}
            onSubmitTapReport={handleSubmitTapReport}
          />
        )}

        {activeTab === 'KIN_MESH' && (
          <KinLinkMesh
            families={families}
            spoofsBlocked={spoofsBlocked}
            dirNetDownCount={kpis.dirNetDownCount}
            onSendKinBeacon={handleSendKinBeacon}
          />
        )}

        {activeTab === 'LUNG_WATCH' && (
          <LungWatchDispatch
            levels={levels}
            missions={missions}
            onLogLungCluster={handleLogLungCluster}
            onDispatchSupplyRun={handleDispatchSupplyRun}
          />
        )}

        {activeTab === 'SURFACE_EXODUS' && (
          <SurfaceDaybreak
            probe={surfaceProbe}
            onBroadcastSurfaceProof={handleBroadcastSurfaceProof}
          />
        )}

        {activeTab === 'ACOUSTIC_LAB' && (
          <AcousticModemLab onPacketDecoded={handleAcousticPacketDecoded} />
        )}
      </main>

      {/* Subtle Bottom Status Strip */}
      <footer className="border-t border-slate-800/80 bg-[#080b10] px-4 py-2 text-[11px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <span>
          CONDUIT CRISIS OS // SOLVING #1 (BLACKOUTS) · #2 (FAIR EXODUS) · #4 (WATER) · #7 (MESH) · #8 (FAMILIES) · #9/#10 (OUTBREAK) · #11 (LIGHT) · #13–#15 (SURFACE RETURN)
        </span>
        <span className="text-slate-400">
          Physical Layer: 915MHz LoRa + 24kHz Steel-Pipe Ultrasound + Storm-Riser Surface Witness
        </span>
      </footer>

      {/* Floating L11 Pocket Resident Handset Simulator */}
      <ResidentHandsetDrawer
        open={handsetOpen}
        onClose={() => setHandsetOpen(false)}
        levels={levels}
        onQuickKinSafe={(lvl) =>
          handleSendKinBeacon({
            familyId: families[0].id,
            senderName: `Resident L${lvl}`,
            fromLevel: lvl,
            toLevel: 4,
            bay: `WARD-${lvl}C`,
            status: 'IN_BLACKOUT_SAFE',
            message: 'Safe in dark! O2 ok, holding tight',
          })
        }
        onQuickWaterHazard={(lvl) =>
          handleSubmitTapReport(lvl, 'Handset urgent metallic/foul tap alert', 890)
        }
        onQuickNeedInhaler={(lvl) => {
          handleLogLungCluster(lvl, 2, 89);
          handleDispatchSupplyRun(lvl, 'Emergency Salbutamol Inhaler + Mask');
        }}
        onQuickSealDamper={(lvl) => handleToggleDamper(lvl)}
      />

      {/* Judge Pitch & System Architecture Modal */}
      <JudgeBriefingModal open={briefingOpen} onClose={() => setBriefingOpen(false)} />
    </div>
  );
};

export default App;
