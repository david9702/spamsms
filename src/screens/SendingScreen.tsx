import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import { openSmsComposer } from '../smsRunner';
import type { RootStackParamList } from '../navigation/types';
import type { SendProgress } from '../types';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { palette, radius } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Sending'>;

export function SendingScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { selectedContacts, messageText } = useApp();
  const lines = useMemo(
    () =>
      messageText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    [messageText]
  );
  const [progress, setProgress] = useState<SendProgress>({
    running: false,
    done: lines.length === 0,
    statusText: lines.length > 0
      ? 'Redo att öppna första raden i meddelandeappen.'
      : 'Ingen rad att skicka.',
  });
  const [error, setError] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [openedCount, setOpenedCount] = useState(0);

  const hasMoreLines = currentLineIndex < lines.length;
  const currentLine = hasMoreLines ? lines[currentLineIndex] : '';

  async function handleOpenNextLine() {
    if (!hasMoreLines) return;
    setError('');

    try {
      await openSmsComposer(
        {
          contacts: selectedContacts,
          message: currentLine,
        },
        setProgress
      );

      const nextOpenedCount = openedCount + 1;
      const nextIndex = currentLineIndex + 1;
      const done = nextIndex >= lines.length;

      setOpenedCount(nextOpenedCount);
      setCurrentLineIndex(nextIndex);
      setProgress({
        running: false,
        done,
        statusText: done
          ? 'Alla rader är öppnade i meddelandeappen.'
          : `Redo för nästa rad (${nextIndex + 1}/${lines.length}).`,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Okänt fel');
    }
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(20, insets.bottom + 12) }]}>
      <DecorativeBackground />
      <Text style={styles.icon}>{error ? '⚠️' : progress.running ? '💬' : '✅'}</Text>
      <Text variant="headlineSmall" style={styles.title}>
        {error ? 'Fel uppstod' : progress.running ? 'Öppnar...' : progress.done ? 'Klart' : 'Skicka radvis'}
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.body}>
            {error || progress.statusText}
          </Text>
          {!error && hasMoreLines && (
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>
                Nästa rad ({currentLineIndex + 1}/{lines.length})
              </Text>
              <Text style={styles.previewText}>{currentLine}</Text>
            </View>
          )}
          {!error && (
            <Text style={styles.helper}>
              Meddelandeappen försöker normalt RCS först om det stöds, annars SMS.
            </Text>
          )}
          {!error && (
            <Text style={styles.helperSecondary}>
              Öppnade rader: {openedCount}/{lines.length}
            </Text>
          )}
        </Card.Content>
      </Card>

      {hasMoreLines ? (
        <Button
          mode="contained"
          buttonColor={palette.primary}
          onPress={handleOpenNextLine}
        >
          Öppna rad {currentLineIndex + 1} i meddelandeapp
        </Button>
      ) : (
        <Button
          mode="contained"
          buttonColor={palette.primary}
          onPress={() => navigation.popToTop()}
        >
          Tillbaka till start
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 20,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    color: palette.textPrimary,
    marginBottom: 14,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  card: {
    backgroundColor: palette.surface,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
  },
  body: {
    color: palette.textPrimary,
    marginBottom: 6,
  },
  helper: {
    color: palette.textSecondary,
    marginTop: 8,
  },
  helperSecondary: {
    color: palette.textSecondary,
    marginTop: 6,
    fontSize: 12,
  },
  previewBox: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    padding: 10,
  },
  previewLabel: {
    color: palette.textSecondary,
    marginBottom: 4,
    fontSize: 12,
  },
  previewText: {
    color: palette.textPrimary,
  },
});
