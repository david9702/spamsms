/**
 * SMS compose utility.
 *
 * Opens the native SMS composer with prefilled recipients/message.
 * No background or automatic sending is implemented.
 */
import { Linking, Platform } from 'react-native';
import type { SmsDraft, SendProgress } from './types';

export type ProgressCallback = (progress: SendProgress) => void;

function normalizePhoneNumber(value: string): string {
  return value.replace(/[^\d+]/g, '');
}

function buildSmsUrl(
  scheme: 'sms' | 'smsto',
  phoneNumbers: string[],
  body: string
): string {
  const separator = Platform.OS === 'android' ? ';' : ',';
  const recipients = phoneNumbers.map(normalizePhoneNumber).join(separator);
  const querySeparator = Platform.OS === 'ios' ? '&' : '?';
  return `${scheme}:${recipients}${querySeparator}body=${encodeURIComponent(body)}`;
}

function buildCandidateUrls(phoneNumbers: string[], body: string): string[] {
  if (Platform.OS === 'android') {
    return [
      buildSmsUrl('smsto', phoneNumbers, body),
      buildSmsUrl('sms', phoneNumbers, body),
    ];
  }

  return [buildSmsUrl('sms', phoneNumbers, body)];
}

export async function openSmsComposer(
  draft: SmsDraft,
  onProgress: ProgressCallback
): Promise<void> {
  if (!draft.contacts.length) {
    throw new Error('Välj minst en mottagare.');
  }
  if (!draft.message.trim()) {
    throw new Error('Skriv ett meddelande först.');
  }

  onProgress({
    running: true,
    done: false,
    statusText: 'Öppnar SMS-appen...',
  });

  const phoneNumbers = draft.contacts.map((c) => c.phoneNumber);
  const urls = buildCandidateUrls(phoneNumbers, draft.message.trim());
  let opened = false;
  let lastError: unknown = null;

  for (const url of urls) {
    try {
      await Linking.openURL(url);
      opened = true;
      break;
    } catch (e: unknown) {
      lastError = e;
    }
  }

  if (!opened) {
    throw new Error(
      lastError instanceof Error
        ? `Kunde inte öppna SMS-appen: ${lastError.message}`
        : 'SMS är inte tillgängligt på den här enheten.'
    );
  }

  onProgress({
    running: false,
    done: true,
    statusText: 'SMS-appen öppnad. Bekräfta skickning i din meddelandeapp.',
  });
}
