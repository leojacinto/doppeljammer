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

- **Concept Origin — Reddit r/PettyRevenge** — Anonymous Redditor who manually Shazammed a song on a bus and played it back on delay. Sodcaster stopped within 20 seconds.
  [TwistedSifter](https://twistedsifter.com/2025/09/someone-was-playing-loud-music-on-a-crowded-bus-so-he-downloaded-the-same-song-and-played-it-a-few-seconds-out-of-sync/)

- **Hardware Proof — Subwoofer Delay Loop** — Redditor who rigged a hidden subwoofer with a mic-to-PC-to-speaker delay loop against a noisy neighbor.
  [TwistedSifter](https://twistedsifter.com/2025/03/their-neighbor-refused-to-stop-playing-loud-music-at-all-hours-of-the-night-so-they-rigged-up-a-hidden-speaker-and-microphone-to-drive-him-insane/)

- **SpeechJammer — Kurihara & Tsukada (2012)** — Academic paper formalizing delayed auditory feedback as a disruption mechanism. The scientific foundation for Doppeljammer.
  [arXiv](https://arxiv.org/abs/1202.6106)

- **Delayed Auditory Feedback Research** — DAF phenomenon studied since the 1950s — a ~200ms delay produces maximum disruption for adults.
  [Wikipedia](https://en.wikipedia.org/wiki/Delayed_auditory_feedback)

- **ACRCloud — Audio Fingerprinting** — Commercial audio recognition API powering the song identification step.
  [acrcloud.com](https://www.acrcloud.com)

- **ShazamKit — Apple Audio Recognition** — Alternative fingerprinting engine for iOS devices.
  [shazam.com](https://www.shazam.com/shazamkit)

- **"Sodcasting" — Pascal Wyse** — Term coined in The Guardian for playing music through phone speakers in public.
  [The Guardian](https://www.theguardian.com)

## Disclaimer

Proof of concept. Use responsibly.
