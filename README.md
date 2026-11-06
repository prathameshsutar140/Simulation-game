# MetroLife: Open World City Simulator 🏙️🏎️

An interactive, playable, ultra-realistic 3D open-world city driving and exploration simulator built with **Three.js**, **WebGL**, **TypeScript**, **React**, and **Web Audio API**.

Designed for high performance across **Mobile phones (Android & iOS)**, **Tablets**, and **Desktop PCs**.

---

## 🌟 Key Features

### 1. 3D Open World City
- **Downtown Skyscrapers**: High-rise commercial glass towers with illuminated window grids, architectural spires, and rooftop helipads.
- **Ocean Coastal Highway (Ocean Drive)**: 4-lane wide seaside boulevard with palm trees, waterfront metal railings, warm streetlights, and sidewalk promenades (matches golden-hour concept reference).
- **City Mall Complex**: Massive retail shopping center facade with glowing neon `"CITY MALL"` signage, large animated billboards (`"DREAM BIG LIVE BETTER"`), and glass canopies.
- **Amusement Pier & Ferris Wheel**: Illuminated wooden pier extending into the ocean with a rotating multicolored neon Ferris wheel and passenger pods.
- **Overhead Patrol Helicopter**: Rotating rotors and searchlight circling the downtown towers.
- **Animated Ocean Waves**: Realtime reflective water plane adjacent to the highway.

### 2. Realistic Vehicle Physics & Custom Fleet
- **5 Playable Vehicles**:
  1. **Apex GT (Supercar)**: Sleek aerodynamic body, rear spoiler, quad exhaust, glowing LED taillight strip, sports rims.
  2. **Viper GTS (Sports Car)**: Muscular front hood vents, dual racing stance, high agility.
  3. **Phantom Executive (Luxury Sedan)**: Elongated luxury wheelbase, stately grille, smooth cruising.
  4. **Titan 4x4 (Rugged SUV)**: High ground clearance, flared wheel arches, oversized offroad tires.
  5. **Metro Cab (City Taxi)**: Yellow livery with checkerboard strips and illuminated rooftop taxi beacon.
- **Physics Engine**:
  - Realistic acceleration, automatic transmission (6 forward gears, Reverse, Neutral, Drive).
  - Accurate RPM calculations with gear upshift drops and throttle roar.
  - Speed-dependent steering rate damping for high-speed stability.
  - Handbrake drifting with dynamic tire slip ratio and lateral friction.
  - Suspension pitch (nose dip on hard braking / rear squat on launch) and body roll on high-G turns.
  - Active wheel spinning & front-wheel steering.
  - Dual headlight projectors and interactive brake light intensification.

### 3. Traffic & Pedestrian AI
- **Living Traffic**: AI buses (`"22 Central Station"`), yellow city taxis, and civilian sedans/SUVs driving along designated highway lanes, keeping safe distance and yielding to the player.
- **Sidewalk Pedestrians**: Animated humanoid NPCs with walking cycles walking along the sidewalk by the mall and beachfront.

### 4. Third-Person On-Foot Mode
- Press `E` (or tap the **Exit/Enter Vehicle** HUD button) to step out of the car.
- Walk, run (`Shift`), jump (`Space`), and explore the sidewalks and waterfront. Step back to any car and press `E` to enter.

### 5. Multi-Mode Dynamic Camera
- **Chase View**: Dynamic follow camera with spring damping, speed rush FOV dilation, and drift camera tilt.
- **Hood / Cockpit View**: First-person perspective looking right over the vehicle bonnet.
- **Cinematic View**: Low-angle dramatic wide shot.
- **Free Orbit Drone View**: 360-degree pan around the vehicle.

### 6. Missions & Objectives
1. **Reach the City Mall** (1.2 km coastal highway cruise to the shopping center plaza).
2. **Coastal Checkpoint Sprint** (High-speed 4-checkpoint race against the clock).
3. **Explore Coastal Pier & Ferris Wheel** (Drive out to the illuminated boardwalk).
4. **Downtown Financial Rush** (Navigate skyscraper canyons through 3 checkpoints).
5. **Mall VIP Parking Challenge** (Precision parking challenge into marked bays).
- 3D glowing checkpoint rings in world with skyward beams, countdown timers, and cash rewards with confetti effects.

### 7. Garage & Tuning Customization
- Instant vehicle switching between all 5 fleet vehicles.
- Custom lacquer paint selection (Crimson Red, Onyx Black, Electric Cyan, Sunset Amber, Velocity Blue, Racing Yellow, etc.).
- Performance tuning upgrades:
  - **Engine Stage I / II / III** (increases top speed and acceleration).
  - **Carbon Brakes Stage I / II / III** (reduces braking distance).
  - **Track Suspension Stage I / II / III** (improves cornering grip and drift control).

### 8. Web Audio API Procedural Synthesizer (Zero External 404s)
- Realtime engine audio tracking throttle, speed, and RPM with waveform distortion and lowpass filter sweep.
- Tire screech / drift audio on handbrake slides.
- Gear shift backfire pop.
- Harmonized dual-tone vehicle horn (`H` key).
- Collision impact crunch.
- Ambient rain and city audio.
- UI clicks and mission fanfare chimes.

### 9. LocalStorage Save System
- Automatically persists cash balance (starts at `$125,750`), unlocked fleet, custom colors, performance upgrades, and settings.

---

## 🎮 Controls

### Desktop / Keyboard
| Action | Key |
|---|---|
| **Accelerate / Throttle** | `W` or `Arrow Up` |
| **Brake / Reverse** | `S` or `Arrow Down` |
| **Steer Left** | `A` or `Arrow Left` |
| **Steer Right** | `D` or `Arrow Right` |
| **Handbrake Drift** | `Spacebar` |
| **Enter / Exit Vehicle** | `E` |
| **Horn** | `H` |
| **Switch Camera Mode** | `C` |
| **Run (On-Foot)** | `Shift` |
| **Jump (On-Foot)** | `Spacebar` |
| **Pause Game** | `Escape` |

### Mobile / Tablet Touch Controls
- **Bottom-Left**: Large `<` and `>` thumb steering buttons.
- **Bottom-Right**: Ribbed metal accelerator pedal, brake pedal, handbrake circle button `(P)`, and enter/exit round vehicle button.
- **Top Bar**: Weather cycle, mute, camera toggle, settings, and pause.
- **Left Side Chips**: Garage, Missions, Navigation Map, and Rewards.

---

## 🚀 Development & Local Run

To run the project locally:
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Build & Deployment

```bash
# Build the optimized production bundle
npm run build

# Preview production build locally
npm run preview
```
The compiled output will be generated in `dist/` ready to be hosted on Vercel, Netlify, Cloud Run, or GitHub Pages.
