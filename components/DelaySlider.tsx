import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, FontSize, Spacing } from '@/constants/theme';

interface DelaySliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  label: string;
  unit: string;
  step?: number;
}

export function DelaySlider({
  value,
  onValueChange,
  minimumValue = 100,
  maximumValue = 2000,
  label,
  unit,
  step = 50,
}: DelaySliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {Math.round(value)}
          <Text style={styles.unit}>{unit}</Text>
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        value={value}
        onValueChange={onValueChange}
        step={step}
        minimumTrackTintColor={Colors.primary}
        maximumTrackTintColor={Colors.surfaceLight}
        thumbTintColor={Colors.primary}
      />
      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>
          {minimumValue}
          {unit}
        </Text>
        <Text style={styles.rangeText}>
          {maximumValue}
          {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '400',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
});
