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

const CHUNK_MS = 1500;

export function useAudioJammer({
  delayMs,
  volume,
}: UseAudioJammerOptions): UseAudioJammerReturn {
  const [state, setState] = useState<JammerState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);

  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, []);

  const loop = async () => {
    while (isActiveRef.current) {
      let recording: Audio.Recording | undefined;
      let sound: Audio.Sound | undefined;

      try {
        // 1. Enable recording mode
        console.log('[DJ] Setting audio mode for recording...');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        // 2. Record a chunk
        console.log('[DJ] Starting recording...');
        const result = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        recording = result.recording;

        if (!isActiveRef.current) break;
        setState('listening');

        await new Promise((r) => setTimeout(r, CHUNK_MS));
        if (!isActiveRef.current) break;

        // 3. Stop recording, get URI
        console.log('[DJ] Stopping recording...');
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        recording = undefined;
        console.log('[DJ] Recorded URI:', uri);

        if (!uri || !isActiveRef.current) break;

        // 4. Wait for delay offset
        console.log(`[DJ] Waiting ${delayMs}ms delay...`);
        await new Promise((r) => setTimeout(r, delayMs));
        if (!isActiveRef.current) break;

        // 5. Switch to playback mode (speaker, not earpiece)
        console.log('[DJ] Switching to playback mode...');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        // 6. Play it back
        console.log('[DJ] Playing back...');
        setState('jamming');
        const { sound: s } = await Audio.Sound.createAsync(
          { uri },
          { volume, shouldPlay: true }
        );
        sound = s;

        // 7. Wait for playback to finish (with timeout fallback)
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            console.log('[DJ] Playback timeout - moving on');
            resolve();
          }, CHUNK_MS + 2000);

          sound!.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              console.log('[DJ] Playback finished');
              clearTimeout(timeout);
              resolve();
            }
          });
        });

        // 8. Cleanup sound
        await sound.unloadAsync();
        sound = undefined;
        console.log('[DJ] Chunk cycle complete, looping...');

      } catch (err) {
        console.error('[DJ] Error in loop:', err);
        setError(String(err));
        // Cleanup on error
        if (recording) {
          try { await recording.stopAndUnloadAsync(); } catch {}
        }
        if (sound) {
          try { await sound.unloadAsync(); } catch {}
        }
        // Brief pause before retrying
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    console.log('[DJ] Loop exited');
  };

  const startListening = useCallback(async () => {
    setError(null);

    if (Platform.OS === 'web') {
      setError('Audio jamming requires a real device. Use Expo Go on your phone.');
      setState('error');
      return;
    }

    console.log('[DJ] Requesting permissions...');
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      setError('Microphone permission is required');
      setState('error');
      return;
    }
    console.log('[DJ] Permission granted');

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
    console.log('[DJ] Stopping...');
    isActiveRef.current = false;
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
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
