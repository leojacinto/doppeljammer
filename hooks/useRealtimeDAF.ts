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

      AudioManager.setAudioSessionOptions({
        iosCategory: 'playAndRecord',
        iosMode: 'spokenAudio',
        iosOptions: ['defaultToSpeaker', 'allowBluetoothA2DP'],
      });
      await AudioManager.setAudioSessionActivity(true);

      const ctx = new AudioContext();
      ctxRef.current = ctx;
      await ctx.resume();

      const adapter = ctx.createRecorderAdapter();
      adapterRef.current = adapter;

      // Aggressive band-pass + notch filters to reduce feedback
      const hpFilter = ctx.createBiquadFilter();
      hpFilter.type = 'highpass';
      hpFilter.frequency.value = 300;
      hpFilter.Q.value = 1.0;

      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.value = 2500;
      lpFilter.Q.value = 1.0;

      // Second-order HP to steepen the rolloff
      const hp2 = ctx.createBiquadFilter();
      hp2.type = 'highpass';
      hp2.frequency.value = 300;
      hp2.Q.value = 1.0;

      // Second-order LP to steepen the rolloff
      const lp2 = ctx.createBiquadFilter();
      lp2.type = 'lowpass';
      lp2.frequency.value = 2500;
      lp2.Q.value = 1.0;

      const delay = ctx.createDelay(5.0);
      delay.delayTime.value = initialDelayMs / 1000;
      delayNodeRef.current = delay;

      const gain = ctx.createGain();
      gain.gain.value = 0.15;
      gainNodeRef.current = gain;

      // adapter → HP → HP2 → LP → LP2 → delay → gain → speaker
      adapter.connect(hpFilter);
      hpFilter.connect(hp2);
      hp2.connect(lpFilter);
      lpFilter.connect(lp2);
      lp2.connect(delay);
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
