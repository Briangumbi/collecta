import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useOnboarding } from '@/hooks/use-onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    glyph: '👋',
    title: 'Welcome to Ledger',
    body: 'Manage clients, projects, and invoices from one place — everything in sync, in real time.',
  },
  {
    glyph: '💳',
    title: 'Get paid, stay organized',
    body: 'Send invoices, track who owes what, and see your whole balance sheet at a glance.',
  },
  {
    glyph: '🔒',
    title: 'Your data stays yours',
    body: 'Every account is protected by row-level security — nobody sees data that isn’t theirs.',
  },
];

export default function OnboardingScreen() {
  const { session } = useAuth();
  const { markOnboardingSeen } = useOnboarding();
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  if (!session) return <Redirect href="/(auth)/login" />;

  const isLast = page === SLIDES.length - 1;

  const finish = async () => {
    await markOnboardingSeen();
    router.replace('/');
  };

  const goNext = () => {
    if (isLast) {
      finish();
      return;
    }
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * (page + 1), animated: true });
    setPage((p) => p + 1);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setPage(next);
  };

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.skipRow}>
          <Pressable onPress={finish} hitSlop={10}>
            <ThemedText type="small" themeColor="textSecondary">
              Skip
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          style={styles.flex}
        >
          {SLIDES.map((slide) => (
            <View key={slide.title} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              <View style={[styles.iconCircle, { backgroundColor: theme.backgroundSelected }]}>
                <ThemedText style={styles.iconGlyph}>{slide.glyph}</ThemedText>
              </View>
              <ThemedText type="title" style={styles.title}>
                {slide.title}
              </ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.subtitle}>
                {slide.body}
              </ThemedText>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.title}
              style={[styles.dot, { backgroundColor: i === page ? theme.primary : theme.border, width: i === page ? 18 : 6 }]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          <PrimaryButton label={isLast ? 'Get Started' : 'Next'} onPress={goNext} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconGlyph: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  buttons: {
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
});
