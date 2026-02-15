import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useRealtimeDAF } from '@/hooks/useRealtimeDAF';

export default function HomeScreen() {
  const router = useRouter();
  const [delayMs] = useState(500);
  const [volume] = useState(1.0);

  const { state, error, startListening, stopListening, recordingDurationMs } =
    useRealtimeDAF({ delayMs, volume });

  const isActive = state === 'listening' || state === 'jamming';

  const handlePress = useCallback(async () => {
    if (state === 'idle' || state === 'error') {
      await startListening();
    } else {
      await stopListening();
    }
  }, [state, startListening, stopListening]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  const statusLabel = state === 'idle' ? 'READY' : state === 'listening' ? 'LISTENING' : state === 'jamming' ? 'JAMMING' : 'ERROR';
  const statusColor = state === 'idle' ? '#8e8e93' : state === 'listening' ? '#ff9500' : state === 'jamming' ? '#ff2d55' : '#ff3b30';
  const borderColor = isActive ? '#ff2d55' : '#ff3b30';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>DOPPEL</Text>
          <Text style={styles.titleAccent}>JAMMER</Text>
        </View>
        <Pressable onPress={() => router.push('/settings')} style={styles.settingsBtn}>
          <Text style={styles.settingsText}>Credits</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={[styles.status, { color: statusColor }]}>{statusLabel}</Text>

        {isActive && (
          <Text style={styles.timer}>{formatTime(recordingDurationMs)}</Text>
        )}

        <Pressable
          style={[styles.button, { borderColor }]}
          onPress={handlePress}
        >
          <Text style={[styles.buttonText, { color: borderColor }]}>
            {isActive ? 'STOP' : 'JAM'}
          </Text>
        </Pressable>

        {error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.hint}>
          {isActive ? 'Tap to stop' : 'Point at the noise source and tap'}
        </Text>

        <Text style={styles.delayInfo}>Delay: {delayMs}ms</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
  },
  settingsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  settingsText: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 2,
  },
  titleAccent: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ff3b30',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
  },
  timer: {
    fontSize: 36,
    fontWeight: '200',
    color: '#ffffff',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 4,
  },
  error: {
    fontSize: 13,
    color: '#ff3b30',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  hint: {
    fontSize: 14,
    color: '#636366',
  },
  delayInfo: {
    fontSize: 12,
    color: '#636366',
    fontVariant: ['tabular-nums'],
  },
});
