# Doppeljammer

Anti-sodcasting audio weapon. Captures nearby music and plays it back with a deliberate delay, creating a disorienting phasing effect that makes the original unlistenable.

## How It Works

1. **Listen** — Mic captures ambient audio from the sodcaster
2. **Buffer** — Audio is held for a configurable delay (200–500ms is the sweet spot)
3. **Jam** — Delayed audio plays through your speaker, creating destructive interference

Based on the Delayed Auditory Feedback (DAF) phenomenon studied since the 1950s. A ~200ms delay produces maximum disruption for adults.

## Tech Stack

- **Expo** (React Native) — iOS + Android from a single codebase
- **expo-av** — Audio recording and playback
- **expo-haptics** — Tactile feedback
- **expo-router** — File-based navigation

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## Credits & Prior Art

- **Reddit r/PettyRevenge** — Anonymous user who manually Shazammed a song on a bus and played it back on delay
- **SpeechJammer (2012)** — Kurihara & Tsukada's paper on delayed auditory feedback as disruption
- **DAF Research** — Studied since the 1950s in speech perception
- **ACRCloud** — Audio fingerprinting API (future integration)
- **"Sodcasting"** — Term coined by Pascal Wyse in The Guardian

## Disclaimer

Proof of concept. Use responsibly.
