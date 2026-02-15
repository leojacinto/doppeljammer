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

### iOS audio modes tested

| Mode | Routes to speaker? | Audio output? | Feedback? |
|------|-------------------|---------------|-----------|
| `default` + `defaultToSpeaker` | ✅ Yes | ✅ Loud | ❌ Squeal at any gain (0.15–1.0) |
| `spokenAudio` + `defaultToSpeaker` | ✅ Yes | ✅ Yes | ⚠️ Squeal present but music audible underneath **← current config** |
| `voiceChat` + `defaultToSpeaker` | ❌ Forces earpiece | Faint | N/A |
| `voiceChat` + 1500ms delay | ❌ Forces earpiece | Faint | N/A |
| `videoChat` + `defaultToSpeaker` | ❌ Forces earpiece | Faint | N/A |
| `measurement` + `defaultToSpeaker` | ❌ Forces earpiece | Faint/none | N/A |
| `default` + earpiece (no `defaultToSpeaker`) | ❌ Earpiece | ✅ Perfect | ✅ None — but too quiet |

### Other approaches tried

| Approach | Result |
|----------|--------|
| High-pass filter (300Hz) | Feedback still builds up |
| 4th-order band-pass (300–2500Hz) | Reduces squeal frequency range but doesn't eliminate it |
| Gain reduction (down to 0.15) | Feedback still builds — iOS AGC boosts mic input |
| Alternate mic selection | Only one mic exposed by iOS (`Built-In Microphone`) |
| WorkletProcessingNode (adaptive gain/limiter) | Crashes — `react-native-worklets` 0.7.x incompatible with current Expo/RN JS runtime |

### Root cause

The iPhone's speaker and mic are physically close together. iOS AGC amplifies the mic signal, keeping the feedback loop gain above 1.0 regardless of software gain settings. All iOS modes with echo cancellation (`voiceChat`, `videoChat`) force earpiece routing, defeating the purpose.

### What works

- **Earpiece output** — real-time DAF with zero feedback, but only audible to the user
- **`spokenAudio` mode + speaker** — music comes through but squeal is still present. Best speaker result so far.
- **Bluetooth speaker** — mic on phone, output on separate device. No feedback, full volume.

### Still to explore

- `gameChat` and `moviePlayback` iOS audio modes (untested)
- Custom native iOS module for echo cancellation (bypasses JS worklet crash)
- Real-world test with loud external music (feedback may be less dominant when sodcaster's music overwhelms the mic)

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
