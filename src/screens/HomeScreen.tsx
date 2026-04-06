import { View, StyleSheet } from 'react-native';
import { Text, Button, Chip, Card } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import type { RootStackParamList } from '../navigation/types';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { palette, radius } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { selectedContacts } = useApp();

  const canContinue = selectedContacts.length > 0;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(20, insets.bottom + 12) }]}>
      <DecorativeBackground />
      <Card style={styles.heroCard}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Snabb SMS-kompositor
          </Text>
          <Text style={styles.subtitle}>
            Välj mottagare och skriv ett meddelande. Appen öppnar sedan telefonens SMS-app med allt förifyllt.
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Contacts')}
        textColor={palette.primaryDark}
        style={styles.contactsButton}
      >
        {selectedContacts.length > 0
          ? `Ändra mottagare (${selectedContacts.length})`
          : 'Välj mottagare'}
      </Button>

      <Card style={styles.contactsCard}>
        <Card.Content>
          <Text style={styles.contactsTitle}>Valda kontakter</Text>
          <View style={styles.chips}>
            {selectedContacts.length === 0 ? (
              <Text style={styles.emptyText}>Inga kontakter valda ännu.</Text>
            ) : (
              selectedContacts.map((c) => (
                <Chip key={c.id} style={styles.chip} textStyle={styles.chipText}>
                  {c.name}
                </Chip>
              ))
            )}
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        disabled={!canContinue}
        onPress={() => navigation.navigate('Message')}
        buttonColor={palette.primary}
        style={styles.continueButton}
      >
        {canContinue ? 'Fortsätt' : 'Välj mottagare först'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 20,
    gap: 12,
  },
  heroCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    elevation: 1,
  },
  title: {
    color: palette.textPrimary,
    marginBottom: 8,
    fontFamily: 'serif',
  },
  subtitle: {
    color: palette.textSecondary,
    lineHeight: 22,
  },
  contactsButton: {
    borderColor: palette.primary,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFFB3',
  },
  contactsCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    elevation: 0,
  },
  contactsTitle: {
    color: palette.textPrimary,
    marginBottom: 8,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 48,
  },
  emptyText: {
    color: palette.textSecondary,
    fontStyle: 'italic',
  },
  chip: {
    backgroundColor: palette.chipBg,
  },
  chipText: {
    color: palette.chipText,
    fontWeight: '600',
  },
  continueButton: {
    borderRadius: radius.md,
    marginTop: 'auto',
  },
});
