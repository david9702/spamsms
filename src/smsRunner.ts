import { NativeModules, Platform, DeviceEventEmitter } from 'react-native';
import type { SmsDraft, SendProgress } from './types';

export type ProgressCallback = (progress: SendProgress) => void;

let emergencyStop = false;

export function startSafewordListener(safeword: string): () => void {
  emergencyStop = false;
  const sub = DeviceEventEmitter.addListener('onSmsReceived', (event: { body: string; sender: string }) => {
    if (event.body.trim().toLowerCase() === safeword.trim().toLowerCase()) {
      emergencyStop = true;
    }
  });
  return () => { sub.remove(); emergencyStop = false; };
}

const EMOJI_MAP: Record<string, string[]> = {
  'kärlek':['❤️','💕','💖','💗','😍','🥰'],'love':['❤️','💕','💖','💗','😍','🥰'],
  'älskar':['❤️','💕','😍','🥰','💘'],'hjärta':['❤️','💖','💗','💓','💝'],
  'glad':['😊','😄','🥳','✨','🎉'],'happy':['😊','😄','🥳','✨'],
  'ledsen':['😢','😭','💔','🥺'],'gråt':['😭','😢','🥺','💧'],
  'sol':['☀️','🌞','🌅','😎'],'regn':['🌧️','☔','💧'],
  'stjärna':['⭐','✨','🌟','💫'],'himmel':['🌌','☁️','✨','🌙'],
  'natt':['🌙','🌌','✨','💤'],'blomma':['🌸','🌺','🌷','🌹','💐'],
  'hav':['🌊','🏖️','🐚'],'dans':['💃','🕺','🎶','🪩'],
  'musik':['🎵','🎶','🎸','🎤','🎧'],'sjung':['🎤','🎵','🎶','🎼'],
  'kyss':['💋','😘','😗'],'kram':['🤗','🫂','💕'],
  'eld':['🔥','🔥','💥','⚡'],'dröm':['💭','✨','🌙','😴'],
  'aldrig':['❌','🚫','💔'],'alltid':['♾️','💫','✨','💕'],
  'vänta':['⏳','⏰','🕐'],'spring':['🏃','💨','👟'],'hem':['🏠','🏡','🫶'],
};

const FILLER_EMOJIS = ['✨','💫','🫶','😂','💀','🤪','😜','🙈','👀','💅','🤭','😏'];

const LAUGHS = [
  'mohhahaha 😈','MOHHAHAHA 😈😈','mohhahaha 😈🔥','MOHHAHAHAHA 😈💀',
  'mohhahaha hehe 😈','muahahaha 😈','😈😈😈','mohhahaha detta är vad du förtjänar 😈',
];

function addEmojis(sentence: string): string {
  const lower = sentence.toLowerCase();
  let emojis: string[] = [];
  for (const [keyword, emojiList] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(keyword)) {
      const shuffled = [...emojiList].sort(() => Math.random() - 0.5);
      emojis.push(...shuffled.slice(0, Math.random() > 0.5 ? 2 : 1));
    }
  }
  if (emojis.length === 0) {
    const count = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...FILLER_EMOJIS].sort(() => Math.random() - 0.5);
    emojis = shuffled.slice(0, count);
  }
  emojis = emojis.slice(0, 4);
  const style = Math.random();
  if (style < 0.3) return `${emojis.join('')} ${sentence}`;
  if (style < 0.7) return `${sentence} ${emojis.join('')}`;
  const half = Math.ceil(emojis.length / 2);
  return `${emojis.slice(0, half).join('')} ${sentence} ${emojis.slice(half).join('')}`;
}

function randomCaps(sentence: string): string {
  if (Math.random() > 0.2) return sentence;
  return sentence.split('').map(c => (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase())).join('');
}

function addChaos(sentence: string): string {
  let result = sentence;
  if (Math.random() < 0.15 && result.length > 2) {
    const last = result[result.length - 1];
    if (/[a-zåäö]/i.test(last)) result += last.repeat(Math.floor(Math.random() * 4) + 2);
  }
  if (Math.random() < 0.15) {
    result += ' ' + LAUGHS[Math.floor(Math.random() * LAUGHS.length)];
  }
  return result;
}

function maybeInsertLaugh(sentences: string[]): string[] {
  const result: string[] = [];
  for (const s of sentences) {
    result.push(s);
    if (Math.random() < 0.25) result.push(LAUGHS[Math.floor(Math.random() * LAUGHS.length)]);
  }
  return result;
}

function splitIntoSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(s => s.length > 0);
}

function normalizePhoneNumber(value: string): string {
  return value.replace(/[^\d+]/g, '');
}

async function sendSmsDirectly(phoneNumber: string, message: string): Promise<void> {
  if (Platform.OS !== 'android') throw new Error('Direkt SMS stöds bara på Android');
  const { DirectSms } = NativeModules;
  if (!DirectSms) throw new Error('DirectSms native modul saknas');
  await DirectSms.sendSms(phoneNumber, message);
}

export async function sendSmsSequence(
  draft: SmsDraft, delayMs: number, addEmojisEnabled: boolean,
  chaosMode: boolean, safeword: string, onProgress: ProgressCallback
): Promise<void> {
  if (!draft.contacts.length) throw new Error('Välj minst en mottagare.');
  if (!draft.message.trim()) throw new Error('Skriv ett meddelande först.');

  let sentences = splitIntoSentences(draft.message.trim());
  if (sentences.length === 0) throw new Error('Kunde inte dela upp texten.');

  if (addEmojisEnabled) sentences = sentences.map(addEmojis);
  if (chaosMode) sentences = sentences.map(randomCaps).map(addChaos);
  sentences = maybeInsertLaugh(sentences);

  const stopListener = safeword ? startSafewordListener(safeword) : () => {};
  const phoneNumbers = draft.contacts.map(c => normalizePhoneNumber(c.phoneNumber));
  const total = sentences.length * phoneNumbers.length;
  let sent = 0;

  try {
    for (const sentence of sentences) {
      if (emergencyStop) {
        onProgress({ running: false, done: true, statusText: `⚠️ NÖDSTOPP! Safeword mottaget. ${sent}/${total} skickade.` });
        return;
      }
      for (const phone of phoneNumbers) {
        if (emergencyStop) {
          onProgress({ running: false, done: true, statusText: `⚠️ NÖDSTOPP! Safeword mottaget. ${sent}/${total} skickade.` });
          return;
        }
        onProgress({ running: true, done: false, statusText: `😈 Skickar ${sent + 1}/${total}: "${sentence.substring(0, 30)}..."` });
        await sendSmsDirectly(phone, sentence);
        sent++;
        if (sent < total) {
          const jitter = delayMs * (0.5 + Math.random());
          await new Promise(r => setTimeout(r, jitter));
        }
      }
    }
    onProgress({ running: false, done: true, statusText: `💀 Klart! ${sent} meddelanden skickade. mohhahaha 😈` });
  } finally {
    stopListener();
  }
}
