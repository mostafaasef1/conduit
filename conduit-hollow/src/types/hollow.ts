export type HollowTier = 'UPPER_DIRECTORATE' | 'MID_COMMONS' | 'DEEP_SUMP';

export type PowerState = 'ONLINE' | 'DROOP_WARNING' | 'BLACKOUT' | 'SUPERCAP_RESERVE';

export type TransportMedium = 'LORA_SUBGHZ' | 'ACOUSTIC_PIPE' | 'MULE_COURIER';

export type PacketCategory =
  | 'GRID_EARLY_WARN'
  | 'WATER_INTERCEPT'
  | 'KIN_HEARTBEAT'
  | 'LUNG_TELEMETRY'
  | 'SPOOF_REJECTED'
  | 'MEDIC_DISPATCH';

export type ActiveTab =
  | 'TOPOLOGY'
  | 'GRID_WATER'
  | 'KIN_MESH'
  | 'LUNG_WATCH'
  | 'SURFACE_EXODUS'
  | 'ACOUSTIC_LAB';

export type CrisisScenarioId =
  | 'BLACKOUT_CASCADE'
  | 'DIRECTORATE_SHUTDOWN'
  | 'TOXIC_WATER_SLUG'
  | 'LUNG_SURGE'
  | 'DAYBREAK_PROOF';

export interface LevelState {
  level: number; // 1 (Top) .. 12 (Deepest Sump)
  code: string; // e.g., "L01" .. "L12"
  name: string;
  subtitle: string;
  tier: HollowTier;
  depthMeters: number;
  populationK: number; // thousands of residents

  // #1 Power & Air Telemetry
  powerState: PowerState;
  gridHz: number; // 50.00 Hz nominal; < 49.25 = droop warning; 0.00 = blackout
  fanRpm: number; // nominal ~1200..1600 RPM
  predictedBlackoutSec: number | null; // seconds remaining before cutout
  o2Pct: number; // 20.9% upper -> 18.4% deep
  tempC: number; // 21C upper -> 36C deep
  damperSealed: boolean; // preserves breathable pocket during air stall / spore plume

  // #4 Tap Water Telemetry
  waterTdsPpm: number; // < 250 safe, > 550 toxic
  waterContaminated: boolean;
  waterSlugEtaSec: number | null; // faster-than-flow warning window!
  valveLocked: boolean; // neighborhood solenoid/manual shutoff engaged

  // #7 Off-Grid Mesh vs Directorate Net
  dirNetOnline: boolean;
  meshPeers: number;
  pipeRepeaterInstalled: boolean;
  acousticSnrDb: number;

  // #9 & #10 Outbreak & Clinic Telemetry
  officialLungCases: number; // Directorate propaganda figure
  verifiedLungCases: number; // Cryptographically signed crowd + street-medic tally
  coughAnomalyIndex: number; // 0..100
  inhalerStockPct: number; // 0..100
}

export interface LivePacket {
  id: string;
  category: PacketCategory;
  fromLevel: number;
  toLevel: number;
  currentLevel: number;
  transport: TransportMedium;
  summary: string;
  hexFrame: string;
  verifiedSignature: boolean;
  progressPct: number; // 0..100
  createdAt: string;
}

export interface KinMember {
  id: string;
  name: string;
  role: string;
  level: number;
  bay: string;
  status: 'SAFE' | 'IN_BLACKOUT_SAFE' | 'NEEDS_INHALER' | 'AWAITING_PING';
  lastHeartbeatSec: number;
  o2Pct: number;
  deviceBatteryPct: number;
  hopTrail: string[];
  lastNote: string;
}

export interface KinFamilyGroup {
  id: string;
  familyName: string;
  kinHash: string;
  homeLevels: string;
  members: KinMember[];
}

export interface WaterLoopSegment {
  id: string;
  name: string;
  recyclerOrigin: string;
  levelsServed: number[];
  flowVelocityMs: number; // ~1.6 m/s water flow
  pipeAcousticMs: number; // ~4920 m/s ultrasonic wave in steel pipe!
  turbidityNtu: number;
  heavyMetalsPpb: number;
  conductivityUs: number;
  crowdReports: number;
  status: 'POTABLE' | 'SLUG_DETECTED' | 'LOCKED_PROTECTED' | 'CONTAMINATED';
  slugDistanceMeters: number;
  residentsProtected: number;
}

export interface MedicCourierMission {
  id: string;
  cargo: string;
  units: number;
  fromCache: string;
  fromLevel: number;
  toLevel: number;
  targetBay: string;
  courierCallsign: string;
  routeProtocol: string;
  avoidedHazards: string[];
  progressPct: number;
  status: 'DISPATCHED' | 'CLIMBING_SHAFT' | 'DELIVERED';
  etaMinutes: number;
}

export interface TelemetryHistoryPoint {
  tick: number;
  label: string;
  deepGridHz: number; // L10-L11 grid Hz
  deepFanRpm: number; // L10-L11 fan RPM
  acousticTrafficBps: number;
  waterPeakTds: number;
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  problemTag:
    | '#1 GRID/AIR'
    | '#4 WATER'
    | '#7 MESH'
    | '#8 KIN-LINK'
    | '#9 LUNG/MED'
    | '#13-#15 SURFACE';
  severity: 'INFO' | 'WARN' | 'CRITICAL' | 'SUCCESS';
  levelCode: string;
  message: string;
}

export interface SurfaceProbeState {
  probeId: string;
  standpipeRiser: string;
  surfaceO2Pct: number;
  toxinsPpm: number;
  pm25Ug: number;
  solarWm2: number;
  surfaceTempC: number;
  sporeFloraRecoveryPct: number;
  nearestMachineKm: number;
  quietWindowActive: boolean;
  truthVerifiedLevels: number; // how many of the 12 levels have received cryptographic surface proof
  proofBroadcastCount: number;
}

export interface Encoded64ByteFrame {
  rawHex: string;
  headerHex: string;
  routingHex: string;
  payloadHex: string;
  sigHex: string;
  crcHex: string;
  byteCount: number;
  airtimeAcousticMs: number;
  airtimeLoraMs: number;
}
