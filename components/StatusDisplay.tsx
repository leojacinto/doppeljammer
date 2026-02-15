import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import type { JammerState } from '@/hooks/useAudioJammer';

interface StatusDisplayProps {
  state: JammerState;
  durationMs: number;
  error: string | null;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const stateConfig: Record<
  JammerState,
  { label: string; sublabel: string; color: string }
> = {
  idle: {
    label: 'READY',
    sublabel: 'Tap to start jamming',
    color: Colors.textSecondary,
  },
  listening: {
    label: 'LISTENING',
    sublabel: 'Capturing audio...',
    color: Colors.warning,
  },
  jamming: {
    label: 'JAMMING',
    sublabel: 'Playing back with delay',
    color: Colors.accent,
  },
  error: {
    label: 'ERROR',
    sublabel: 'Something went wrong',
    color: Colors.primary,
  },
};

export function StatusDisplay({ state, durationMs, error }: StatusDisplayProps) {
  const config = stateConfig[state];
  const isActive = state === 'listening' || state === 'jamming';

  return (
    <View style={styles.container}>
      <Text style={[styles.state, { color: config.color }]}>{config.label}</Text>
      {isActive && (
        <Text style={styles.duration}>{formatDuration(durationMs)}</Text>
      )}
      <Text style={styles.sublabel}>
        {error || config.sublabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  state: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  duration: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  sublabel: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
});
