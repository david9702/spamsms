import { useEffect, useMemo, useState } from 'react';
import { FlatList, PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';
import Contacts from 'react-native-contacts';
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Card,
  List,
  Searchbar,
  Text,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import type { Contact } from '../types';
import type { RootStackParamList } from '../navigation/types';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { palette, radius } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Contacts'>;

async function requestContactsPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'Kontaktbehörighet',
        message: 'Appen behöver läsa kontakter för att välja mottagare.',
        buttonPositive: 'Tillåt',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  const status = await Contacts.requestPermission();
  return status === 'authorized';
}

export function ContactsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { selectedContacts, setSelectedContacts } = useApp();
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(
    new Set(selectedContacts.map((c) => c.id))
  );

  useEffect(() => {
    (async () => {
      try {
        const hasPermission = await requestContactsPermission();
        if (!hasPermission) {
          setError('Kontakttillstånd nekades.');
          setLoading(false);
          return;
        }

        const rows = await Contacts.getAll();
        const parsed: Contact[] = rows
          .map((c) => {
            const phone = c.phoneNumbers?.[0]?.number?.trim() ?? '';
            const name =
              c.displayName?.trim() ||
              `${c.givenName ?? ''} ${c.familyName ?? ''}`.trim() ||
              phone;
            return {
              id: c.recordID,
              name,
              phoneNumber: phone,
            };
          })
          .filter((c) => c.phoneNumber.length > 0)
          .sort((a, b) => a.name.localeCompare(b.name, 'sv'));

        setAllContacts(parsed);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Kunde inte läsa kontakter.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allContacts;
    const q = query.toLowerCase();
    return allContacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phoneNumber.includes(q)
    );
  }, [allContacts, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirm() {
    setSelectedContacts(allContacts.filter((c) => selected.has(c.id)));
    navigation.goBack();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <DecorativeBackground />
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Laddar kontakter...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <DecorativeBackground />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DecorativeBackground />
      <Searchbar
        placeholder="Sök namn eller nummer..."
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        inputStyle={{ color: palette.textPrimary }}
        iconColor={palette.primary}
        placeholderTextColor={palette.textSecondary}
      />

      <Text style={styles.hint}>
        {selected.size > 0 ? `${selected.size} valda` : 'Tryck för att välja'}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={[styles.itemCard, selected.has(item.id) && styles.itemCardSelected]}>
            <List.Item
              title={item.name}
              description={item.phoneNumber}
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              onPress={() => toggle(item.id)}
              left={() => (
                <Checkbox
                  status={selected.has(item.id) ? 'checked' : 'unchecked'}
                  color={palette.primary}
                  uncheckedColor="#8A948F"
                  onPress={() => toggle(item.id)}
                />
              )}
              style={styles.item}
            />
          </Card>
        )}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
        <Button
          mode="contained"
          onPress={confirm}
          buttonColor={palette.primary}
          disabled={selected.size === 0}
        >
          Bekräfta ({selected.size})
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
  },
  loadingText: {
    color: palette.textSecondary,
    marginTop: 10,
  },
  errorText: {
    color: palette.danger,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  search: {
    margin: 12,
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  hint: {
    color: palette.textSecondary,
    paddingHorizontal: 16,
    paddingBottom: 4,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  itemCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    elevation: 0,
  },
  itemCardSelected: {
    backgroundColor: palette.chipBg,
    borderColor: '#A8D8D3',
  },
  item: {
    backgroundColor: 'transparent',
  },
  itemTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  itemDescription: {
    color: palette.textSecondary,
  },
  footer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F6F2EAF2',
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
});
