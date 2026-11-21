# CONDUIT // Sub-Surface Acoustic & LoRa Crisis OS

### 🌐 **[Launch Live Interactive Simulator](https://conduitos.vercel.app/)** · 🎬 **[Watch 2m30s Demo Video](https://youtu.be/wF9qHehBF0E)** · 📊 **[View 7-Slide Pitch Deck (PDF)](./CONDUIT_Hackathon_Pitch_Deck.pdf)**

> **Hackathon Track:** *Life Underground — The Hollow (Year 2117)*  
> **Problems Addressed Simultaneously:** **#1** (Blackout & Air Early Warning) · **#2 & #11** (Equitable Exodus & Sunlight Acclimation) · **#4** (Pre-Tap Bad Water Interception) · **#7** (Uncensorable Off-Grid Mesh + Live Audio Modem) · **#8** (Split-Family Proof-of-Life) · **#9 & #10** (Outbreak Truth Ledger & Street-Medic Routing) · **#13, #14 & #15** (Covert Surface Habitability Proof, Zero-RF Outpost Simulator & Staged Return)

---

## 1. The Core Engineering Insight: *"The Pipe Is Both the Wire and the Sensor"*

When blackouts plunge Deep Levels `L08–L12` into multi-day darkness—or when the Directorate flips the kill-switch on `DirNet`—Wi-Fi vanishes and radio waves cannot penetrate 150+ meters of solid bedrock between stacked tunnel levels.

**What still physically connects every single floor of the Hollow—from `L12` (`-1,650m`) all the way up to `+12m` street level—with zero Directorate permission?**  
**Continuous steel water risers, ventilation trunks, and pre-2087 cast-iron storm-drain standpipes.**

**CONDUIT** clips low-cost, scavenged **piezoelectric contact transducers** + **sub-GHz LoRa nodes** onto neighborhood water pipes and air ducts, unlocking a unified underground survival and surface-return stack:

1. **Cross-Level Censorship-Resistant Mesh (#7):** Packets hop horizontally between resident devices via `915 MHz` LoRa/BLE and bridge *vertically across sealed rock strata* via **`320 bps` ultrasonic FSK modulation through steel water mains**, supplemented by delay-tolerant foot-courier (*"Mule"*) syncs across airlocks. Face-to-face QR key-signing forms a neighborhood Web-of-Trust that automatically drops unsigned Directorate propaganda spoofs.
2. **15–35 Minute Pre-Blackout & Air-Cut Early Warning (#1):** Before Directorate load-shedding breakers sever the deep levels, aging geothermal steam turbines lose rotational inertia (`50.00 Hz → 48.50 Hz`) and ventilation fan blade-pass frequencies decay. CONDUIT nodes compute passive FFTs on mains hum and duct acoustics, broadcasting automatic countdowns to seal O₂ bulkhead dampers and buffer medical supercapacitors.
3. **Faster-Than-Flow Bad Water Interception (#4):** Contaminated greywater from failing recyclers flows down pipes at **`~1.8 m/s`**, taking ~14 minutes to travel 1.5 km. CONDUIT's ultrasonic alert races down the *steel pipe wall itself* at **`4,890 m/s` (2,716× faster — arriving in `0.31 seconds`)**, tripping neighborhood tap lockouts and cistern bypasses long before anyone drinks poisoned water.
4. **64-Byte Split-Family Proof-of-Life Beacons (#8):** Families split between Upper/Mid shifts and Deep Sump housing exchange ultra-compact **64-byte `CRC-16-CCITT` + truncated `Ed25519`-signed frames** (`Header 4B | Level/Bay Route 6B | Compressed Note + Vitals 42B | WoT Sig 10B | CRC-16 2B`) that piggyback on pipe heartbeats even in multi-day blackouts.
5. **Zero-Knowledge Outbreak Truth Ledger & Medic Routing (#9 & #10):** Residents and street medics log cryptographically signed SpO₂ and cough-acoustic clusters, exposing the **20×+ discrepancy** between Directorate bulletins and reality while routing volunteer couriers (*Mules*) with inhalers, filters, and water tabs around blacked-out shafts and checkpoints.
6. **Operation Daybreak — Surface Truth & Zero-RF Exodus (#13, #14, #15, #11, #2):** A covert solar witness probe (`DAYBREAK-01`) pushed up an abandoned pre-2087 cast-iron storm standpipe hammers TPM-attested atmospheric proof (`20.84% O₂`, `0.01 ppm` toxins, `642 W/m²` sunlight) directly to all 12 levels. Because rogue surface machines hunt RF radio signals, communicating underground via CONDUIT's zero-RF pipe ultrasound keeps sealed subway-headhouse outposts invisible while staging cohorts through a **14-day UV/lux phototherapy ramp**.
7. **Live Physical Layer 16-MFSK WebAudio Modem (`LIVE AUDIO MODEM` Tab):** Modulates real ASCII payloads + `CRC-8` checksums into audible/ultrasonic `1550–2900 Hz` 16-MFSK tones over device speakers and decodes them live via microphone bandpass FFT (`AnalyserNode`) or simulated steel-pipe loopback.

---

## 2. Interactive Judge Walkthrough (Try It Live at [conduitos.vercel.app](https://conduitos.vercel.app/))

1. **Inspect the 12-Level Hollow (`HOLLOW CROSS-SECTION`):** Click any level `L01–L12` (`-65m` to `-1,650m`) to inspect live `Grid Hz`, `O₂ %`, `Tap TDS`, and `Lung Cases`, and operate neighborhood bulkhead dampers, tap valves, and piezo pipe repeaters. Toggle **`AUDIO`** (top-right) to hear synthesized WebAudio pipe-modem FSK chirps and warning chimes.
2. **Inject Simultaneous Crises (Top Crisis Bar):** Trigger **`Deep Blackout Cascade`**, **`DirNet Kill-Switch + Spoof`**, **`Recycler-8 Toxic Backflow`**, **`Vent-Shaft Lung Surge`**, or **`Surface Daybreak Proof`**—individually or all at once.
3. **Lock Taps Faster Than Water Flows (`EARLY WARNING & WATER`):** Watch the live dual-trace `Hz / RPM` oscilloscope and click **`INTERCEPT & LOCK TAPS NOW`** on Loop C to protect `1,398k` deep-level residents before contaminated water arrives.
4. **Send a Signed 64-Byte Kin Beacon (`KIN-LINK & OFF-GRID` + `L11 HANDSET`):** Compose a message to watch the color-coded **64-byte hex frame + CRC-16 checksum** pack byte-by-byte, or open **`L11 HANDSET`** (top-right) to test the 7%-battery dark-mode pocket communicator a resident in the Sump uses in pitch darkness.
5. **Test Real Sound Transmission (`LIVE AUDIO MODEM`):** Click **`PLAY REAL MFSK SOUND`** or **`PIPE CHANNEL LOOPBACK`** (or arm **`ARM LIVE MIC RX`** on a second laptop/phone) to transmit and decode a real `CRC-8` verified survival packet over sound waves with zero Wi-Fi.

---

## 3. Scavenged Hollow Hardware BOM (~$6 Equivalent)

| Component | Scavenged Source in the Hollow | Role in CONDUIT |
|---|---|---|
| **27mm Brass Piezo Disc + Hose Clamp** | Broken buzzer alarms / industrial gauges | Ultrasonic steel-pipe TX/RX + cavitation & fan FFT pickup |
| **Sub-GHz LoRa + MCU / Old Phone** | Salvaged meter readers / resident handsets | Horizontal tunnel mesh + 1-tap dark-mode resident UI |
| **Dual Stainless Bolt Probe** | Scrap plumbing | Inline tap-water TDS / conductivity spike detector |
| **Peltier TEG Harvester + Supercap** | Broken cooling units | Harvests continuous mW power from the ΔT between 36°C Sump air and 18°C water risers during multi-day blackouts |

---

## 4. Repository Structure

```text
conduit/
├── README.md                              # Project documentation & judge walkthrough
├── CONDUIT_Hackathon_Pitch_Deck.pdf       # 7-slide architecture & pitch presentation
└── conduit-hollow/                        # Web application & live crisis simulator
    ├── index.html                         # Entry HTML shell & vector favicon
    ├── package.json                       # React 19 + TypeScript + Vite 6 + Tailwind v4
    ├── tsconfig.json                      # Strict TypeScript config
    ├── vite.config.ts                     # Vite dev & production bundler config
    ├── LICENSE                            # MIT License
    └── src/
        ├── main.tsx                       # React root mount
        ├── index.css                      # Sub-surface industrial styling & animations
        ├── App.tsx                        # Real-time 12-level crisis physics & packet loop
        ├── types/
        │   └── hollow.ts                  # Domain models for levels, frames, kin & surface probe
        ├── data/
        │   └── initialHollow.ts           # Borehole-07 baseline state + real CRC-16 64B encoder
        ├── utils/
        │   └── sound.ts                   # Pure WebAudio piezo FSK, klaxon & solenoid synthesizer
        └── components/
            ├── TopCrisisBar.tsx           # Global KPIs, crisis injectors & navigation
            ├── HollowCrossSection.tsx     # Tab 1: 12-level vertical schematic & node controls
            ├── GridWaterGuard.tsx         # Tab 2: #1 Hz droop oscilloscope & #4 water lockout
            ├── KinLinkMesh.tsx            # Tab 3: #7/#8 split-family board & 64B hex composer
            ├── LungWatchDispatch.tsx      # Tab 4: #9/#10 outbreak truth gap & courier router
            ├── SurfaceDaybreak.tsx        # Tab 5: #13–#15 storm-pipe surface probe & outpost sim
            ├── AcousticModemLab.tsx       # Tab 6: Real WebAudio 16-MFSK speaker TX + mic FFT RX
            ├── ResidentHandsetDrawer.tsx  # Floating L11 7%-battery dark-mode pocket device
            └── JudgeBriefingModal.tsx     # Architecture & problem-mapping summary modal
```

---

## 5. Running Locally

### Prerequisites
- **Node.js** `v18+` (LTS `v20` or `v22` recommended)

### Clone, Install & Start
```bash
git clone https://github.com/mostafaasef1/conduit.git
cd conduit/conduit-hollow
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 6. License

Released under the [MIT License](./conduit-hollow/LICENSE).
