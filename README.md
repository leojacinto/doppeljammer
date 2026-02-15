# Doppeljammer

Anti-sodcasting audio weapon. Captures nearby music and plays it back with a deliberate delay, creating a disorienting phasing effect that makes the original unlistenable.

## How It Works

1. **Listen** — Mic captures ambient audio from the sodcaster
2. **Buffer** — Audio is held for a configurable delay (200–500ms is the sweet spot)
3. **Jam** — Delayed audio plays through your speaker, creating destructive interference

Based on the Delayed Auditory Feedback (DAF) phenomenon studied since the 1950s. A ~200ms delay produces maximum disruption for adults.

## Tech Stack

- **Expo SDK 54** (React Native 0.81) — iOS + Android from a single codebase
- **react-native-audio-api** — Native real-time audio engine (Web Audio API spec)
- **expo-dev-client** — Custom dev build (required for native audio module)
- **expo-router** — File-based navigation

## Getting Started

```bash
npm install
npx expo prebuild --platform ios
cd ios && pod install && cd ..
npx expo run:ios --device
```

Requires Xcode and a physical iOS device (no Expo Go — native module needs a custom build).

## Known Constraint: Speaker Feedback

The core goal of Doppeljammer is to capture nearby music via the phone's mic and play it back through the speaker with a delay. On a single iPhone, this creates an unavoidable **acoustic feedback loop** — the speaker output feeds back into the mic, which gets delayed and played again, building to a high-pitched squeal.

### What was tried

| Approach | Result |
|----------|--------|
| `default` mode + main speaker | Loud output, but feedback builds to squeal at any gain level (tested 0.15–1.0) |
| `voiceChat` mode + speaker | iOS forces earpiece routing — AEC requires it. No loud output possible |
| `voiceChat` mode + 1500ms delay | Same — still forces earpiece regardless of delay length |
| `measurement` mode + speaker | No audio output at all |
| High-pass filter (300Hz) on output | Feedback still builds up |
| Gain reduction (down to 0.15) | Feedback still builds up — iOS AGC boosts mic input, compensating |
| Alternate mic selection | Only one mic exposed by iOS (`Built-In Microphone`) |
| `default` mode + earpiece | **Works perfectly** — no feedback, continuous real-time DAF. But too quiet to be effective. |

### Root cause

The iPhone's speaker and mic are physically close together on the same device. iOS Automatic Gain Control amplifies the mic signal, ensuring the feedback loop gain stays above 1.0 regardless of software gain settings. Apple's echo cancellation (`voiceChat` mode) solves feedback but forces earpiece routing, defeating the purpose.

### What works

- **Earpiece output** — real-time DAF with zero feedback, but only audible to the user
- **Bluetooth speaker** — mic on phone, output on separate device. No feedback, full volume. Ideal but requires carrying a speaker.

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
