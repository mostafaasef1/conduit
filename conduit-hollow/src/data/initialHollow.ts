import {
  Encoded64ByteFrame,
  EventLogEntry,
  KinFamilyGroup,
  LevelState,
  LivePacket,
  MedicCourierMission,
  SurfaceProbeState,
  TelemetryHistoryPoint,
  WaterLoopSegment,
} from '../types/hollow';

// Real CRC-16-CCITT (0x1021) calculator for authentic 64-byte CONDUIT frames
export function computeCrc16(bytes: number[]): number {
  let crc = 0xffff;
  for (const b of bytes) {
    crc ^= (b & 0xff) << 8;
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc & 0xffff;
}

function toHex(bytes: number[]): string {
  return bytes.map((b) => (b & 0xff).toString(16).padStart(2, '0').toUpperCase()).join(' ');
}

function deterministicHashBytes(seed: string, length: number): number[] {
  let h1 = 0x811c9dc5;
  const out: number[] = [];
  for (let i = 0; i < seed.length; i++) {
    h1 ^= seed.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
  }
  for (let j = 0; j < length; j++) {
    h1 ^= (j + 1) * 0x9e3779b9;
    h1 = Math.imul(h1 ^ (h1 >>> 15), 0x2c1b3c6d) >>> 0;
    out.push(h1 & 0xff);
  }
  return out;
}

/**
 * Packs a family heartbeat / emergency alert into an exact 64-byte CONDUIT frame:
 * [0..3]   4B Header: Magic 0x43 0x4E ("CN"), Proto v2 (0x02), Flags/TTL (0x7C)
 * [4..9]   6B Routing: SrcLevel, DestLevel, BayHash(2B), StatusCode, HopCount
 * [10..51] 42B Payload: UTF-8 truncated/zero-padded compact message + vitals byte
 * [52..61] 10B Truncated Ed25519 Neighborhood Web-of-Trust Signature
 * [62..63] 2B CRC-16-CCITT Checksum
 */
export function encode64ByteKinFrame(params: {
  fromLevel: number;
  toLevel: number;
  bay: string;
  statusCode: number;
  message: string;
  senderName: string;
}): Encoded64ByteFrame {
  const header = [0x43, 0x4e, 0x02, 0x7c]; // "CN", v2, TTL=12 hops
  const bayBytes = deterministicHashBytes(params.bay || 'BAY-11C', 2);
  const routing = [
    params.fromLevel & 0xff,
    params.toLevel & 0xff,
    bayBytes[0],
    bayBytes[1],
    params.statusCode & 0xff,
    Math.abs(params.toLevel - params.fromLevel) & 0xff,
  ];

  const cleanText = `${params.senderName.slice(0, 8)}:${params.message}`.slice(0, 42);
  const payload: number[] = new Array(42).fill(0x00);
  for (let i = 0; i < cleanText.length && i < 42; i++) {
    payload[i] = cleanText.charCodeAt(i) & 0x7f;
  }

  const sig = deterministicHashBytes(
    `WOT_SIG:${params.fromLevel}:${params.toLevel}:${params.bay}:${cleanText}`,
    10
  );

  const first62 = [...header, ...routing, ...payload, ...sig];
  const crc = computeCrc16(first62);
  const crcBytes = [(crc >> 8) & 0xff, crc & 0xff];
  const all64 = [...first62, ...crcBytes];

  return {
    rawHex: toHex(all64),
    headerHex: toHex(header),
    routingHex: toHex(routing),
    payloadHex: toHex(payload),
    sigHex: toHex(sig),
    crcHex: toHex(crcBytes),
    byteCount: all64.length,
    // 64 bytes = 512 bits -> at 320 bps ultrasonic FSK on steel pipe = 1,600 ms
    airtimeAcousticMs: Math.round((all64.length * 8 * 1000) / 320),
    // LoRa SF9 BW125 ~ 185 ms
    airtimeLoraMs: 185,
  };
}

export function createInitialLevels(): LevelState[] {
  return [
    {
      level: 1,
      code: 'L01',
      name: 'Blast-Seal & Scrubbers',
      subtitle: 'Sealed Surface Threshold · High O2 Scrubbing',
      tier: 'UPPER_DIRECTORATE',
      depthMeters: 65,
      populationK: 42,
      powerState: 'ONLINE',
      gridHz: 50.0,
      fanRpm: 1620,
      predictedBlackoutSec: null,
      o2Pct: 20.9,
      tempC: 20.4,
      damperSealed: false,
      waterTdsPpm: 92,
      waterContaminated: false,
      waterSlugEtaSec: null,
      valveLocked: false,
      dirNetOnline: true,
      meshPeers: 64,
      pipeRepeaterInstalled: true,
      acousticSnrDb: 28,
      officialLungCases: 1,
      verifiedLungCases: 2,
      coughAnomalyIndex: 4,
      inhalerStockPct: 98,
    },
    {
      level: 2,
      code: 'L02',
      name: 'Directorate Citadel',
      subtitle: 'Air-Lock Governance · DirNet Fiber Core',
      tier: 'UPPER_DIRECTORATE',
      depthMeters: 145,
      populationK: 68,
      powerState: 'ONLINE',
      gridHz: 50.0,
      fanRpm: 1600,
      predictedBlackoutSec: null,
      o2Pct: 20.8,
      tempC: 21.1,
      damperSealed: false,
      waterTdsPpm: 105,
      waterContaminated: false,
      waterSlugEtaSec: null,
      valveLocked: false,
      dirNetOnline: true,
      meshPeers: 88,
      pipeRepeaterInstalled: true,
      acousticSnrDb: 29,
      officialLungCases: 2,
      verifiedLungCases: 3,
      coughAnomalyIndex: 5,
      inhalerStockPct: 96,
    },
    {
      level: 3,
      code: 'L03',
      name: 'Sun-Lamp Terraces',
      subtitle: 'Paid-Light Plaza · Upper Medical Center',
      tier: 'UPPER_DIRECTORATE',
      depthMeters: 235,
      populationK: 115,
      powerState: 'ONLINE',
      gridHz: 49.99,
      fanRpm: 1560,
      predictedBlackoutSec: null,
      o2Pct: 20.7,
      tempC: 22.0,
      damperSealed: false,
      waterTdsPpm: 118,
      waterContaminated: false,
      waterSlugEtaSec: null,
      valveLocked: false,
      dirNetOnline: true,
      meshPeers: 142,
      pipeRepeaterInstalled: true,
      acousticSnrDb: 27,
      officialLungCases: 2,
      verifiedLungCases: 5,
      coughAnomalyIndex: 7,
      inhalerStockPct: 92,
    },
    {
      level: 4,
      code: 'L04',
      name: 'Hydro-Lamp Farms Alpha',
      subtitle: 'Communal Calorie Vats · Rationed UV Banks',
      tier: 'MID_COMMONS',
      depthMeters: 350,
      populationK: 174,
      powerState: 'ONLINE',
      gridHz: 49.96,
      fanRpm: 1440,
      predictedBlackoutSec: null,
      o2Pct: 20.4,
      tempC: 24.2,
      damperSealed: false,
      waterTdsPpm: 158,
      waterContaminated: false,
      waterSlugEtaSec: null,
      valveLocked: false,
      dirNetOnline: true,
      meshPeers: 310,
      pipeRepeaterInstalled: true,
      acousticSnrDb: 26,
      officialLungCases: 3,
      verifiedLungCases: 11,
      coughAnomalyIndex: 14,
      inhalerStockPct: 74,
    },
    {
      level: 5,
      code: 'L05',
      name: 'Old Metro Concourse',
      subtitle: 'Subway Hub · Courier Mule Exchange Point',
      tier: 'MID_COMMONS',
      depthMeters: 470,
      populationK: 228,
      powerState: 'ONLINE',
      gridHz: 49.93,
      fanRpm: 1390,
      predictedBlackoutSec: null,
      o2Pct: 20.1,
      tempC: 25.6,
      damperSealed: false,
      waterTdsPpm: 176,
      waterContaminated: false,
      waterSlugEtaSec: null,
      valveLocked: false,
      dirNetOnline: true,
      meshPeers: 465,
      pipeRepeaterInstalled: true,
      acousticSnrDb: 25,
      officialLungCases: 4,
      verifiedLungCases: 19,
      coughAnomalyIndex: 18,
      inhalerStockPct: 66,
    },
    {
      level: 6,
      code: 'L06',
      name: 'Central Membrane Works',
      subtitle: 'Primary Water Filtration & Pump Risers',
      tier: 'MID_COMMONS',
      depthMeters: 590,
      populationK: 196,
      powerState: 'ONLINE',
      gridHz: 49.89,
      fanRpm: 1330,
      predictedBlackoutSec: null,
      o2Pct: 19.9,
      tempC: 26.8,
      damperSealed: false,
      waterTdsPpm: 194,
      waterContaminated: false,
      waterSlugEtaSec: null,
      valveLocked: false,
      dirNetOnline: true,
      meshPeers: 390,
      pipeRepeaterInstalled: true,
      acousticSnrDb: 27,
      officialLungCases: 3,
      verifiedLungCases: 24,
      coughAnomalyIndex: 22,
      inhalerStockPct: 58,
    },
    {
      level: 7,
      code: 'L07',
      name: 'Foundry & Bulkhead Gate',
      subtitle: 'Checkpoints Separating Commons & Deep Sump',
      tier: 'MID_COMMONS',
      depthMeters: 730,
      populationK: 245,
      powerState: 'ONLINE',
      gridHz: 49.82,
      fanRpm: 1260,
      predictedBlackoutSec: null,
      o2Pct: 19.7,
      tempC: 28.5,
      damperSealed: false,
      waterTdsPpm: 224,
      waterContaminated: false,
      waterSlugEtaSec: null,
      valveLocked: false,
      dirNetOnline: true,
      meshPeers: 512,
      pipeRepeaterInstalled: true,
      acousticSnrDb: 24,
      officialLungCases: 4,
      verifiedLungCases: 38,
      coughAnomalyIndex: 31,
      inhalerStockPct: 49,
    },
    {
      level: 8,
      code: 'L08',
      name: 'Recycler-8 & Pipe Gallery',
      subtitle: 'Aging Greywater Loop · Heavy Tenement Density',
      tier: 'DEEP_SUMP',
      depthMeters: 895,
      populationK: 284,
      powerState: 'ONLINE',
      gridHz: 49.58,
      fanRpm: 1140,
      predictedBlackoutSec: null,
      o2Pct: 19.3,
      tempC: 30.8,
      damperSealed: false,
      waterTdsPpm: 318,
      waterContaminated: false,
      waterSlugEtaSec: null,
      valveLocked: false,
      dirNetOnline: true,
      meshPeers: 620,
      pipeRepeaterInstalled: true,
      acousticSnrDb: 23,
      officialLungCases: 3,
      verifiedLungCases: 64,
      coughAnomalyIndex: 47,
      inhalerStockPct: 31,
    },
    {
      level: 9,
      code: 'L09',
      name: 'Anthracite Hab-Stacks',
      subtitle: 'Carved Coal Seams · Vent Trunk B Baffle',
      tier: 'DEEP_SUMP',
      depthMeters: 1065,
      populationK: 318,
      powerState: 'DROOP_WARNING',
      gridHz: 49.18,
      fanRpm: 980,
      predictedBlackoutSec: 1380,
      o2Pct: 19.0,
      tempC: 32.4,
      damperSealed: false,
      waterTdsPpm: 342,
      waterContaminated: false,
      waterSlugEtaSec: null,
      valveLocked: false,
      dirNetOnline: true,
      meshPeers: 710,
      pipeRepeaterInstalled: true,
      acousticSnrDb: 22,
      officialLungCases: 2,
      verifiedLungCases: 92,
      coughAnomalyIndex: 63,
      inhalerStockPct: 22,
    },
    {
      level: 10,
      code: 'L10',
      name: 'Borehole-7 Bunkrooms',
      subtitle: '6 Residents per Single-Room Cell · High Heat',
      tier: 'DEEP_SUMP',
      depthMeters: 1245,
      populationK: 356,
      powerState: 'DROOP_WARNING',
      gridHz: 49.08,
      fanRpm: 910,
      predictedBlackoutSec: 1040,
      o2Pct: 18.8,
      tempC: 33.9,
      damperSealed: false,
      waterTdsPpm: 385,
      waterContaminated: false,
      waterSlugEtaSec: null,
      valveLocked: false,
      dirNetOnline: true,
      meshPeers: 804,
      pipeRepeaterInstalled: true,
      acousticSnrDb: 21,
      officialLungCases: 2,
      verifiedLungCases: 118,
      coughAnomalyIndex: 74,
      inhalerStockPct: 14,
    },
    {
      level: 11,
      code: 'L11',
      name: 'Condensate Sump Wards',
      subtitle: 'Frequent Sewage Backups · Street-Medic Post',
      tier: 'DEEP_SUMP',
      depthMeters: 1435,
      populationK: 292,
      powerState: 'BLACKOUT',
      gridHz: 0.0,
      fanRpm: 340,
      predictedBlackoutSec: 0,
      o2Pct: 18.5,
      tempC: 35.2,
      damperSealed: true,
      waterTdsPpm: 412,
      waterContaminated: false,
      waterSlugEtaSec: null,
      valveLocked: false,
      dirNetOnline: false,
      meshPeers: 688,
      pipeRepeaterInstalled: true,
      acousticSnrDb: 24,
      officialLungCases: 1,
      verifiedLungCases: 134,
      coughAnomalyIndex: 82,
      inhalerStockPct: 9,
    },
    {
      level: 12,
      code: 'L12',
      name: 'Geothermal Wellhead #4',
      subtitle: 'Scaling Steam Turbines · Extreme Heat Zone',
      tier: 'DEEP_SUMP',
      depthMeters: 1650,
      populationK: 148,
      powerState: 'DROOP_WARNING',
      gridHz: 48.96,
      fanRpm: 860,
      predictedBlackoutSec: 790,
      o2Pct: 18.4,
      tempC: 37.1,
      damperSealed: false,
      waterTdsPpm: 398,
      waterContaminated: false,
      waterSlugEtaSec: null,
      valveLocked: false,
      dirNetOnline: false,
      meshPeers: 342,
      pipeRepeaterInstalled: true,
      acousticSnrDb: 25,
      officialLungCases: 0,
      verifiedLungCases: 76,
      coughAnomalyIndex: 69,
      inhalerStockPct: 12,
    },
  ];
}

export function createInitialFamilies(): KinFamilyGroup[] {
  return [
    {
      id: 'fam-okafor',
      familyName: 'Okafor-Mensah Kin',
      kinHash: '0x9F4A·B21C',
      homeLevels: 'L04 Hydro-Farms ↔ L11 Sump Wards',
      members: [
        {
          id: 'm-ada',
          name: 'Adaeze Okafor',
          role: 'UV Lamp Technician (Shift)',
          level: 4,
          bay: 'FARM-4B',
          status: 'SAFE',
          lastHeartbeatSec: 18,
          o2Pct: 20.4,
          deviceBatteryPct: 78,
          hopTrail: ['L04 LoRa Local'],
          lastNote: 'On shift at Vat 4B. Ration pack secured for kids.',
        },
        {
          id: 'm-kojo',
          name: 'Kojo Mensah',
          role: 'Elder / Childcare',
          level: 11,
          bay: 'WARD-11C',
          status: 'IN_BLACKOUT_SAFE',
          lastHeartbeatSec: 44,
          o2Pct: 18.6,
          deviceBatteryPct: 11,
          hopTrail: ['L11 Piezo Clamp', 'Steel Main #4', 'L07 Repeater', 'L04 LoRa'],
          lastNote: 'Grid dead 9h. Damper sealed, emergency LED lit, twins asleep.',
        },
        {
          id: 'm-efua',
          name: 'Efua Okafor (Age 9)',
          role: 'Dependent',
          level: 11,
          bay: 'WARD-11C',
          status: 'NEEDS_INHALER',
          lastHeartbeatSec: 44,
          o2Pct: 18.6,
          deviceBatteryPct: 11,
          hopTrail: ['L11 Piezo Clamp', 'Steel Main #4', 'L07 Repeater', 'L04 LoRa'],
          lastNote: 'Dry silica cough tonight; 2 puffs left on salbutamol.',
        },
      ],
    },
    {
      id: 'fam-vance',
      familyName: 'Vance-Kowalski Household',
      kinHash: '0x3D82·77E0',
      homeLevels: 'L06 Membrane Works ↔ L10 Bunkrooms',
      members: [
        {
          id: 'm-tomas',
          name: 'Tomas Kowalski',
          role: 'Pipefitter',
          level: 6,
          bay: 'PUMP-6A',
          status: 'SAFE',
          lastHeartbeatSec: 12,
          o2Pct: 19.9,
          deviceBatteryPct: 64,
          hopTrail: ['L06 LoRa Mesh'],
          lastNote: 'Watching Recycler-8 pressure gauge closely. Boil water!',
        },
        {
          id: 'm-mara',
          name: 'Mara Vance',
          role: 'Street Medic',
          level: 10,
          bay: 'BUNK-10F',
          status: 'SAFE',
          lastHeartbeatSec: 29,
          o2Pct: 18.8,
          deviceBatteryPct: 33,
          hopTrail: ['L10 LoRa', 'L08 Acoustic Riser', 'L06 LoRa'],
          lastNote: 'Triaging 14 cough cases in Corridor F. Grid humming low.',
        },
      ],
    },
    {
      id: 'fam-chen',
      familyName: 'Chen-Solis Collective',
      kinHash: '0x71C0·E904',
      homeLevels: 'L05 Concourse ↔ L09 Coal Stacks ↔ L12 Wellhead',
      members: [
        {
          id: 'm-mateo',
          name: 'Mateo Solis',
          role: 'Turbine Descaler',
          level: 12,
          bay: 'WELL-12A',
          status: 'IN_BLACKOUT_SAFE',
          lastHeartbeatSec: 63,
          o2Pct: 18.4,
          deviceBatteryPct: 19,
          hopTrail: ['L12 Pipe Clamp', 'Steel Main #4', 'L09 Mule Sync', 'L05 LoRa'],
          lastNote: 'DirNet cut down here. Bearing #2 overheating—expect shed!',
        },
        {
          id: 'm-lin',
          name: 'Lin Chen',
          role: 'Mesh Courier ("Mule-7")',
          level: 9,
          bay: 'SHAFT-9B',
          status: 'SAFE',
          lastHeartbeatSec: 21,
          o2Pct: 19.0,
          deviceBatteryPct: 82,
          hopTrail: ['L09 LoRa', 'L07 Airlock Sync', 'L05 LoRa'],
          lastNote: 'Carrying 38 cached family beacons + 6 filter packs down.',
        },
        {
          id: 'm-rosa',
          name: 'Rosa Solis',
          role: 'Seed-Bank Steward',
          level: 5,
          bay: 'METRO-5D',
          status: 'SAFE',
          lastHeartbeatSec: 9,
          o2Pct: 20.1,
          deviceBatteryPct: 91,
          hopTrail: ['L05 Local Mesh'],
          lastNote: 'Received Mateo pipe ping! Holding clean water jugs at 5D.',
        },
      ],
    },
  ];
}

export function createInitialWaterSegments(): WaterLoopSegment[] {
  return [
    {
      id: 'loop-upper',
      name: 'Loop A · Citadel & Terrace Riser',
      recyclerOrigin: 'L02 UV-RO Plant',
      levelsServed: [1, 2, 3],
      flowVelocityMs: 1.5,
      pipeAcousticMs: 4940,
      turbidityNtu: 0.4,
      heavyMetalsPpb: 3,
      conductivityUs: 180,
      crowdReports: 0,
      status: 'POTABLE',
      slugDistanceMeters: 0,
      residentsProtected: 0,
    },
    {
      id: 'loop-commons',
      name: 'Loop B · Commons & Hydro-Farm Main',
      recyclerOrigin: 'L06 Central Membrane Works',
      levelsServed: [4, 5, 6, 7],
      flowVelocityMs: 1.7,
      pipeAcousticMs: 4920,
      turbidityNtu: 1.3,
      heavyMetalsPpb: 9,
      conductivityUs: 340,
      crowdReports: 1,
      status: 'POTABLE',
      slugDistanceMeters: 0,
      residentsProtected: 0,
    },
    {
      id: 'loop-deep-8',
      name: 'Loop C · Sub-Recycler 8 Deep Gravity Feed',
      recyclerOrigin: 'L08 Aging Greywater Bio-Bed',
      levelsServed: [8, 9, 10, 11, 12],
      flowVelocityMs: 1.8,
      pipeAcousticMs: 4890,
      turbidityNtu: 3.8,
      heavyMetalsPpb: 22,
      conductivityUs: 610,
      crowdReports: 4,
      status: 'POTABLE',
      slugDistanceMeters: 0,
      residentsProtected: 1398,
    },
  ];
}

export function createInitialMissions(): MedicCourierMission[] {
  return [
    {
      id: 'med-101',
      cargo: 'Salbutamol Nebulizers + N99 Cartridges',
      units: 24,
      fromCache: 'L05 Metro Mutual-Aid Locker',
      fromLevel: 5,
      toLevel: 11,
      targetBay: 'Ward 11C Street-Medic Post',
      courierCallsign: 'MULE-07 (Lin C.)',
      routeProtocol: 'Service Ladder 4B → Bypass Dark Shaft 10A',
      avoidedHazards: ['L11 Grid Blackout', 'DirNet Checkpoint 7A'],
      progressPct: 68,
      status: 'CLIMBING_SHAFT',
      etaMinutes: 9,
    },
    {
      id: 'med-102',
      cargo: 'Ferrate Water Purifier Tabs (2,000L cap)',
      units: 400,
      fromCache: 'L06 Pipefitter Co-op Stash',
      fromLevel: 6,
      toLevel: 10,
      targetBay: 'Borehole-7 Bunkroom Kitchens',
      courierCallsign: 'MULE-14 (Darius V.)',
      routeProtocol: 'Freight Conduit C → Acoustic Gate Sync',
      avoidedHazards: ['High Heat Corridor 9E'],
      progressPct: 42,
      status: 'DISPATCHED',
      etaMinutes: 16,
    },
    {
      id: 'med-103',
      cargo: 'Pediatric O2 Zeolite Canisters',
      units: 12,
      fromCache: 'L04 Hydro-Farm O2 Surplus',
      fromLevel: 4,
      toLevel: 9,
      targetBay: 'Coal-Stack Nursery Bay 9D',
      courierCallsign: 'MULE-03 (Sora K.)',
      routeProtocol: 'Drainage Gallery West',
      avoidedHazards: ['Vent Trunk B Spore Plume'],
      progressPct: 100,
      status: 'DELIVERED',
      etaMinutes: 0,
    },
  ];
}

export function createInitialTelemetryHistory(): TelemetryHistoryPoint[] {
  const pts: TelemetryHistoryPoint[] = [];
  for (let i = 0; i < 40; i++) {
    const t = i - 39;
    const droop = i > 26 ? (i - 26) * 0.045 : 0;
    pts.push({
      tick: i,
      label: `${t * 5}s`,
      deepGridHz: Number((49.68 - droop + Math.sin(i * 0.5) * 0.04).toFixed(2)),
      deepFanRpm: Math.round(1080 - droop * 260 + Math.cos(i * 0.6) * 14),
      acousticTrafficBps: Math.round(190 + (i > 24 ? 95 : 20) + Math.sin(i) * 18),
      waterPeakTds: Math.round(385 + Math.sin(i * 0.35) * 12),
    });
  }
  return pts;
}

export function createInitialPackets(): LivePacket[] {
  const sample = encode64ByteKinFrame({
    fromLevel: 11,
    toLevel: 4,
    bay: 'WARD-11C',
    statusCode: 1,
    message: 'Damper sealed, kids safe',
    senderName: 'Kojo',
  });
  return [
    {
      id: 'pkt-init-1',
      category: 'KIN_HEARTBEAT',
      fromLevel: 11,
      toLevel: 4,
      currentLevel: 7,
      transport: 'ACOUSTIC_PIPE',
      summary: '64B Kin Proof-of-Life: Kojo (L11) → Adaeze (L04)',
      hexFrame: sample.rawHex,
      verifiedSignature: true,
      progressPct: 58,
      createdAt: '00:04s ago',
    },
    {
      id: 'pkt-init-2',
      category: 'GRID_EARLY_WARN',
      fromLevel: 12,
      toLevel: 9,
      currentLevel: 10,
      transport: 'ACOUSTIC_PIPE',
      summary: 'Turbine #4 Mains Harmonics 48.96 Hz — Shed Risk 13m',
      hexFrame: '43 4E 02 7F 0C 09 A1 04 F1 03 47 52 49 44 5F 44 52 4F 4F 50 5F 34 38 2E 39 36 48 5A',
      verifiedSignature: true,
      progressPct: 45,
      createdAt: '00:09s ago',
    },
    {
      id: 'pkt-init-3',
      category: 'LUNG_TELEMETRY',
      fromLevel: 10,
      toLevel: 5,
      currentLevel: 8,
      transport: 'LORA_SUBGHZ',
      summary: 'ZK-Signed Medic Tally: +6 Acute Cough Cluster (Corridor 10F)',
      hexFrame: '43 4E 02 64 0A 05 88 2B C4 02 4C 55 4E 47 5F 43 4C 55 53 54 45 52 5F 31 30 46 5F 5A 4B',
      verifiedSignature: true,
      progressPct: 35,
      createdAt: '00:14s ago',
    },
  ];
}

export function createInitialLogs(): EventLogEntry[] {
  return [
    {
      id: 'log-1',
      timestamp: '21:14:02',
      problemTag: '#1 GRID/AIR',
      severity: 'WARN',
      levelCode: 'L10',
      message: 'Piezo clamp detected 49.08 Hz turbine droop + duct ΔP drop. 17m pre-blackout warning issued.',
    },
    {
      id: 'log-2',
      timestamp: '21:14:08',
      problemTag: '#8 KIN-LINK',
      severity: 'SUCCESS',
      levelCode: 'L11→L04',
      message: 'Okafor-Mensah 64B heartbeat bridged across dead L11 grid via Steel Water Main #4 (24 dB SNR).',
    },
    {
      id: 'log-3',
      timestamp: '21:14:15',
      problemTag: '#9 LUNG/MED',
      severity: 'CRITICAL',
      levelCode: 'L09-L11',
      message: 'Discrepancy alert: Directorate claims 28 total Hollow-Lung cases; 686 ZK-signed cases verified on mesh.',
    },
    {
      id: 'log-4',
      timestamp: '21:14:22',
      problemTag: '#7 MESH',
      severity: 'INFO',
      levelCode: 'ALL',
      message: 'CONDUIT Web-of-Trust active across 5,135 resident nodes + 12 ultrasonic pipe repeaters.',
    },
    {
      id: 'log-5',
      timestamp: '21:14:29',
      problemTag: '#13-#15 SURFACE',
      severity: 'SUCCESS',
      levelCode: '+12m→L09',
      message: 'Covert Storm-Riser Probe DAYBREAK-01 verified 20.84% breathable O₂ & 0.01ppm toxins above blast doors!',
    },
  ];
}

export function createInitialSurfaceProbe(): SurfaceProbeState {
  return {
    probeId: 'DAYBREAK-01 (TPM-Signed)',
    standpipeRiser: 'Pre-2087 Storm Standpipe #19 (Bypasses L01–L02)',
    surfaceO2Pct: 20.84,
    toxinsPpm: 0.01,
    pm25Ug: 7.4,
    solarWm2: 642,
    surfaceTempC: 16.8,
    sporeFloraRecoveryPct: 86,
    nearestMachineKm: 1.85,
    quietWindowActive: true,
    truthVerifiedLevels: 7,
    proofBroadcastCount: 3,
  };
}
