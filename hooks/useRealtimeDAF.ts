import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  AudioContext,
  AudioRecorder,
  AudioManager,
  type GainNode,
  type DelayNode,
  type RecorderAdapterNode,
} from 'react-native-audio-api';

export type JammerState = 'idle' | 'listening' | 'jamming' | 'error';

interface UseRealtimeDAFOptions {
  delayMs: number;
  volume: number;
}

interface UseRealtimeDAFReturn {
  state: JammerState;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  recordingDurationMs: number;
  setDelay: (ms: number) => void;
  setVolume: (vol: number) => void;
}

// Real-time DAF using native audio graph:
// AudioRecorder → RecorderAdapterNode → DelayNode → GainNode → destination
//
// Output defaults to earpiece (no feedback). If a Bluetooth speaker is
// connected it routes there automatically via allowBluetoothA2DP.
// See README "Known Constraint: Speaker Feedback" for why the built-in
// speaker cannot be used.
export function useRealtimeDAF({
  delayMs: initialDelayMs,
  volume: initialVolume,
}: UseRealtimeDAFOptions): UseRealtimeDAFReturn {
  const [state, setState] = useState<JammerState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const adapterRef = useRef<RecorderAdapterNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { cleanup(); };
  }, []);

  const cleanup = async () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (recorderRef.current) {
      try {
        recorderRef.current.stop();
        recorderRef.current.disconnect();
      } catch {}
      recorderRef.current = null;
    }
    if (ctxRef.current) {
      try { await ctxRef.current.close(); } catch {}
      ctxRef.current = null;
    }
    adapterRef.current = null;
    delayNodeRef.current = null;
    gainNodeRef.current = null;
  };

  const setDelay = useCallback((ms: number) => {
    if (delayNodeRef.current) {
      delayNodeRef.current.delayTime.value = ms / 1000;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = vol;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (ctxRef.current) return;
    setError(null);

    if (Platform.OS === 'web') {
      setError('Audio jamming requires a real device.');
      setState('error');
      return;
    }

    try {
      const permStatus = await AudioManager.requestRecordingPermissions();
      if (permStatus !== 'Granted') {
        setError('Microphone permission is required');
        setState('error');
        return;
      }

      // Earpiece output by default; Bluetooth speaker if connected
      AudioManager.setAudioSessionOptions({
        iosCategory: 'playAndRecord',
        iosMode: 'default',
        iosOptions: ['allowBluetoothA2DP'],
      });
      await AudioManager.setAudioSessionActivity(true);

      const ctx = new AudioContext();
      ctxRef.current = ctx;
      await ctx.resume();

      const adapter = ctx.createRecorderAdapter();
      adapterRef.current = adapter;

      const delay = ctx.createDelay(5.0);
      delay.delayTime.value = initialDelayMs / 1000;
      delayNodeRef.current = delay;

      const gain = ctx.createGain();
      gain.gain.value = initialVolume;
      gainNodeRef.current = gain;

      adapter.connect(delay);
      delay.connect(gain);
      gain.connect(ctx.destination);

      const recorder = new AudioRecorder();
      recorderRef.current = recorder;
      recorder.connect(adapter);
      recorder.start();

      setState('jamming');
      setRecordingDurationMs(0);

      const startTime = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setRecordingDurationMs(Date.now() - startTime);
      }, 100);

    } catch (err) {
      console.error('[DAF] Start error:', err);
      setError(String(err));
      setState('error');
      await cleanup();
    }
  }, [initialDelayMs, initialVolume]);

  const stopListening = useCallback(async () => {
    await cleanup();
    setState('idle');
    setRecordingDurationMs(0);
  }, []);

  return {
    state,
    error,
    startListening,
    stopListening,
    recordingDurationMs,
    setDelay,
    setVolume,
  };
}
