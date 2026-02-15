import React, { useEffect } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import type { JammerState } from '@/hooks/useAudioJammer';

interface JamButtonProps {
  state: JammerState;
  onPress: () => void;
  size?: number;
}

export function JamButton({ state, onPress, size = 200 }: JamButtonProps) {
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0);
  const rotate = useSharedValue(0);

  const isActive = state === 'listening' || state === 'jamming';

  useEffect(() => {
    if (isActive) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
      glow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      );
    } else {
      cancelAnimation(pulse);
      cancelAnimation(glow);
      pulse.value = withTiming(1, { duration: 200 });
      glow.value = withTiming(0, { duration: 200 });
    }
  }, [isActive]);

  useEffect(() => {
    if (state === 'jamming') {
      rotate.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1
      );
    } else {
      cancelAnimation(rotate);
      rotate.value = withTiming(0, { duration: 300 });
    }
  }, [state]);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulse.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const glowRing1Style = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const glowRing2Style = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0, 0.5]),
  }));

  const barAnimStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  const buttonColor =
    state === 'idle'
      ? Colors.primary
      : state === 'listening'
      ? Colors.warning
      : state === 'jamming'
      ? Colors.accent
      : Colors.textMuted;

  return (
    <View style={[styles.container, { width: size * 1.4, height: size * 1.4 }]}>
      {/* Outer glow rings */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size * 1.35,
            height: size * 1.35,
            borderRadius: size * 0.675,
            borderColor: buttonColor,
          },
          glowRing1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: size * 0.6,
            borderColor: buttonColor,
          },
          glowRing2Style,
        ]}
      />

      {/* Main button */}
      <Animated.View style={buttonAnimStyle}>
        <Pressable
          onPress={onPress}
          style={[
            styles.button,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: Colors.surface,
              borderColor: buttonColor,
            },
          ]}
        >
          {/* Inner icon - sound wave visualization */}
          <View style={styles.iconContainer}>
            {state === 'idle' ? (
              <View style={styles.barsContainer}>
                {[0.4, 0.7, 1, 0.7, 0.4].map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bar,
                      {
                        height: size * 0.15 * h,
                        backgroundColor: buttonColor,
                      },
                    ]}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.barsContainer}>
                {[0.3, 0.6, 1, 0.8, 0.5, 0.9, 0.4].map((h, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.bar,
                      {
                        height: size * 0.15 * h,
                        backgroundColor: buttonColor,
                      },
                      barAnimStyle,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    elevation: 10,
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
});
