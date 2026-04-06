import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../AppContext';
import type { RootStackParamList } from '../navigation/types';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { palette, radius } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Message'>;

export function MessageScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { selectedContacts, messageText, setMessageText } = useApp();
  const [inputHeight, setInputHeight] = useState(180);

  const lineCount = useMemo(
    () =>
      messageText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0).length,
    [messageText]
  );

  return (
    <View style={[styles.container, { paddingBottom: Math.max(20, insets.bottom + 12) }]}>
      <DecorativeBackground />
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.label}>
            Mottagare: {selectedContacts.map((c) => c.name).join(', ')}
          </Text>
          <Text style={styles.helper}>
            Varje rad skickas som ett separat meddelande, ett i taget.
          </Text>
          <Text style={styles.subHelper}>
            Standard-appen för meddelanden avgör RCS/SMS beroende på stöd.
          </Text>
        </Card.Content>
      </Card>

      <TextInput
        mode="outlined"
        value={messageText}
        onChangeText={setMessageText}
        multiline
        numberOfLines={5}
        placeholder="Skriv ditt meddelande..."
        placeholderTextColor="#7A8893"
        style={[styles.input, { minHeight: Math.max(180, inputHeight) }]}
        outlineColor={palette.border}
        activeOutlineColor={palette.primary}
        textColor={palette.textPrimary}
        onContentSizeChange={(e) => {
          const nextHeight = Math.ceil(e.nativeEvent.contentSize.height + 36);
          setInputHeight(Math.max(180, Math.min(nextHeight, 420)));
        }}
      />

      <Text style={styles.count}>
        {messageText.length} tecken · {lineCount} rad{lineCount === 1 ? '' : 'er'}
      </Text>

      <Button
        mode="contained"
        buttonColor={palette.primary}
        disabled={!messageText.trim() || selectedContacts.length === 0}
        onPress={() => navigation.navigate('Sending')}
        style={styles.sendButton}
      >
        Öppna SMS-app
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    padding: 20,
    gap: 10,
  },
  headerCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    elevation: 1,
  },
  label: {
    color: palette.textPrimary,
    marginBottom: 6,
    fontWeight: '700',
  },
  helper: {
    color: palette.textSecondary,
    marginBottom: 4,
  },
  subHelper: {
    color: palette.textSecondary,
    fontSize: 12,
    opacity: 0.9,
  },
  input: {
    backgroundColor: palette.surface,
  },
  count: {
    color: palette.textSecondary,
    textAlign: 'right',
    marginTop: 6,
  },
  sendButton: {
    marginTop: 16,
    borderRadius: radius.md,
  },
});
