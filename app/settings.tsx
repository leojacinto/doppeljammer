import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing } from '@/constants/theme';

const CREDITS = [
  {
    title: 'Concept Origin — Reddit r/PettyRevenge',
    description:
      'Anonymous Redditor who manually Shazammed a song on a bus and played it back on delay. Sodcaster stopped within 20 seconds.',
    url: 'https://twistedsifter.com/2025/09/someone-was-playing-loud-music-on-a-crowded-bus-so-he-downloaded-the-same-song-and-played-it-a-few-seconds-out-of-sync/',
  },
  {
    title: 'Hardware Proof — Subwoofer Delay Loop',
    description:
      'Redditor who rigged a hidden subwoofer with a mic-to-PC-to-speaker delay loop against a noisy neighbor.',
    url: 'https://twistedsifter.com/2025/03/their-neighbor-refused-to-stop-playing-loud-music-at-all-hours-of-the-night-so-they-rigged-up-a-hidden-speaker-and-microphone-to-drive-him-insane/',
  },
  {
    title: 'SpeechJammer — Kurihara & Tsukada (2012)',
    description:
      'Academic paper formalizing delayed auditory feedback as a disruption mechanism. The scientific foundation for Doppeljammer.',
    url: 'https://arxiv.org/abs/1202.6106',
  },
  {
    title: 'Delayed Auditory Feedback Research',
    description:
      'DAF phenomenon studied since the 1950s — a ~200ms delay produces maximum disruption for adults.',
    url: 'https://en.wikipedia.org/wiki/Delayed_auditory_feedback',
  },
  {
    title: 'ACRCloud — Audio Fingerprinting',
    description:
      'Commercial audio recognition API powering the song identification step.',
    url: 'https://www.acrcloud.com',
  },
  {
    title: 'ShazamKit — Apple Audio Recognition',
    description:
      'Alternative fingerprinting engine for iOS devices.',
    url: 'https://www.shazam.com/shazamkit',
  },
  {
    title: '"Sodcasting" — Pascal Wyse',
    description:
      'Term coined in The Guardian for playing music through phone speakers in public.',
    url: 'https://www.theguardian.com',
  },
];

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.card}>
            <Text style={styles.appName}>Doppeljammer</Text>
            <Text style={styles.appVersion}>v1.0.0</Text>
            <Text style={styles.appDescription}>
              Anti-sodcasting audio weapon. Captures nearby music and plays it
              back with a deliberate delay, creating a disorienting phasing
              effect that makes the original unlistenable.
            </Text>
          </View>
        </View>

        {/* How It Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HOW IT WORKS</Text>
          <View style={styles.card}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                Mic captures ambient audio from the sodcaster
              </Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                Audio is buffered with your configured delay (200-500ms is the
                sweet spot for maximum disruption)
              </Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                Delayed audio plays through your speaker, creating destructive
                interference with the original
              </Text>
            </View>
          </View>
        </View>

        {/* Credits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CREDITS & PRIOR ART</Text>
          {CREDITS.map((credit, index) => (
            <TouchableOpacity
              key={index}
              style={styles.creditCard}
              onPress={() => Linking.openURL(credit.url)}
              activeOpacity={0.7}
            >
              <Text style={styles.creditTitle}>{credit.title}</Text>
              <Text style={styles.creditDescription}>{credit.description}</Text>
              <View style={styles.creditLink}>
                <Ionicons
                  name="open-outline"
                  size={14}
                  color={Colors.primary}
                />
                <Text style={styles.creditUrl} numberOfLines={1}>
                  {credit.url}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DISCLAIMER</Text>
          <View style={styles.card}>
            <Text style={styles.disclaimer}>
              Doppeljammer is a proof of concept exploring delayed auditory
              feedback. Use responsibly and be aware that deploying this in
              public makes you a sodcaster too — just a self-righteous one.
              Consider talking to people before escalating to audio warfare.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  appVersion: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  appDescription: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepNumber: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.primary,
    width: 24,
  },
  stepText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  creditCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  creditTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  creditDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  creditLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  creditUrl: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    flex: 1,
  },
  disclaimer: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 40,
  },
});
