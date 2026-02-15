import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type JammerState = 'idle' | 'listening' | 'jamming' | 'error';

interface UseAudioJammerOptions {
  delayMs: number;
  volume: number;
}

interface UseAudioJammerReturn {
  state: JammerState;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  recordingDurationMs: number;
}

export function useAudioJammer({
  delayMs,
  volume,
}: UseAudioJammerOptions): UseAudioJammerReturn {
  const [state, setState] = useState<JammerState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);

  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(false);
  const soundsRef = useRef<Audio.Sound[]>([]);

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, []);

  const cleanupSounds = async () => {
    for (const s of soundsRef.current) {
      try { await s.unloadAsync(); } catch {}
    }
    soundsRef.current = [];
  };

  // Optimized loop with FULL speaker volume:
  // 1. Record in playAndRecord mode
  // 2. Stop recording, pre-load the sound (still in record mode — fast)
  // 3. Switch to playback-only mode (routes to LOUD main speaker)
  // 4. Play immediately (sound already loaded — near-instant)
  // 5. While playing, we can't record — but playback is LOUD
  // 6. When done, switch back to record mode for next chunk
  // Gap between chunks: ~100-150ms (mode switch overhead only)
  const loop = async () => {
    const chunkMs = Math.max(delayMs, 500);

    while (isActiveRef.current) {
      let recording: Audio.Recording | undefined;
      let sound: Audio.Sound | undefined;

      try {
        // === RECORD PHASE ===
        setState('listening');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        const result = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        recording = result.recording;
        if (!isActiveRef.current) break;

        await new Promise((r) => setTimeout(r, chunkMs));
        if (!isActiveRef.current) break;

        // Stop recording + get URI
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        recording = undefined;
        if (!uri || !isActiveRef.current) break;

        // Pre-load sound while still in record mode (fast — no playback yet)
        const { sound: s } = await Audio.Sound.createAsync(
          { uri },
          { volume: 1.0, shouldPlay: false }
        );
        sound = s;
        soundsRef.current.push(sound);

        // === PLAYBACK PHASE ===
        setState('jamming');
        // Switch to playback-only: routes audio to MAIN SPEAKER (loud!)
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        // Play immediately — sound is pre-loaded so this is near-instant
        await sound.playAsync();

        // Wait for playback to finish
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => resolve(), chunkMs + 1000);
          sound!.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              clearTimeout(timeout);
              resolve();
            }
          });
        });

        // Cleanup this sound
        await sound.unloadAsync();
        soundsRef.current = soundsRef.current.filter((x) => x !== sound);
        sound = undefined;

        // Loop continues immediately to next record cycle

      } catch (err) {
        console.error('[DJ] Error:', err);
        if (recording) {
          try { await recording.stopAndUnloadAsync(); } catch {}
        }
        if (sound) {
          try { await sound.unloadAsync(); } catch {}
          soundsRef.current = soundsRef.current.filter((x) => x !== sound);
        }
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    await cleanupSounds();
    console.log('[DJ] Loop exited');
  };

  const startListening = useCallback(async () => {
    setError(null);

    if (Platform.OS === 'web') {
      setError('Audio jamming requires a real device. Use Expo Go on your phone.');
      setState('error');
      return;
    }

    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      setError('Microphone permission is required');
      setState('error');
      return;
    }

    isActiveRef.current = true;
    setState('listening');
    setRecordingDurationMs(0);

    const startTime = Date.now();
    durationIntervalRef.current = setInterval(() => {
      setRecordingDurationMs(Date.now() - startTime);
    }, 100);

    loop();
  }, [delayMs, volume]);

  const stopListening = useCallback(async () => {
    isActiveRef.current = false;
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    await cleanupSounds();
    setState('idle');
    setRecordingDurationMs(0);
  }, []);

  return {
    state,
    error,
    startListening,
    stopListening,
    recordingDurationMs,
  };
}
