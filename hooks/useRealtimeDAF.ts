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
    return () => {
      cleanup();
    };
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

  // Live-update delay without restarting the pipeline
  const setDelay = useCallback((ms: number) => {
    if (delayNodeRef.current) {
      delayNodeRef.current.delayTime.value = ms / 1000;
    }
  }, []);

  // Live-update volume without restarting the pipeline
  const setVolume = useCallback((vol: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = vol;
    }
  }, []);

  const startListening = useCallback(async () => {
    setError(null);

    if (Platform.OS === 'web') {
      setError('Audio jamming requires a real device.');
      setState('error');
      return;
    }

    try {
      // 1. Request mic permission
      const permStatus = await AudioManager.requestRecordingPermissions();
      if (permStatus !== 'Granted') {
        setError('Microphone permission is required');
        setState('error');
        return;
      }

      // 2. Configure audio session: playAndRecord with speaker output
      AudioManager.setAudioSessionOptions({
        iosCategory: 'playAndRecord',
        iosMode: 'default',
        iosOptions: ['defaultToSpeaker', 'allowBluetoothA2DP'],
      });

      // 3. Create audio context
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      // 4. Create the audio graph nodes
      const adapter = ctx.createRecorderAdapter();
      adapterRef.current = adapter;

      // DelayNode: maxDelayTime in seconds (up to 5s for flexibility)
      const delay = ctx.createDelay(5.0);
      delay.delayTime.value = initialDelayMs / 1000;
      delayNodeRef.current = delay;

      const gain = ctx.createGain();
      gain.gain.value = initialVolume;
      gainNodeRef.current = gain;

      // 5. Connect the graph: adapter → delay → gain → speaker
      adapter.connect(delay);
      delay.connect(gain);
      gain.connect(ctx.destination);

      // 6. Create recorder and connect to adapter
      const recorder = new AudioRecorder();
      recorderRef.current = recorder;
      recorder.connect(adapter);

      // 7. Start recording (mic input flows through the graph in real-time)
      recorder.start();

      await ctx.resume();

      setState('jamming');
      setRecordingDurationMs(0);

      const startTime = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setRecordingDurationMs(Date.now() - startTime);
      }, 100);

      console.log('[DAF] Real-time pipeline started:', initialDelayMs, 'ms delay');

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
    console.log('[DAF] Pipeline stopped');
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
