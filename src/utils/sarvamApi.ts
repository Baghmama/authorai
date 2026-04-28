/**
 * Sarvam AI Text-to-Speech — calls via Supabase Edge Function (secure proxy).
 * The actual Sarvam API key lives in Supabase secrets, never in the browser.
 */

import { supabase } from '../lib/supabase';

export type AudioQuality = 'regular' | 'pro';

/** Model/voice config per quality tier */
const MODEL_CONFIG: Record<AudioQuality, { model: string; speaker: string; chunkSize: number }> = {
  regular: {
    model: 'bulbul:v2',
    speaker: 'anushka', // natural female voice for v2
    chunkSize: 1400,    // v2 max 1500 — keep buffer
  },
  pro: {
    model: 'bulbul:v3',
    speaker: 'priya',  // warm female voice for v3
    chunkSize: 2400,   // v3 max 2500 — keep buffer
  },
};

/** Credits required per quality tier */
export const AUDIO_CREDITS: Record<AudioQuality, number> = {
  regular: 4,
  pro: 7,
};

/**
 * Splits text into chunks at sentence or word boundaries.
 */
function chunkText(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    const window = remaining.slice(0, maxLen);
    const lastSentence = Math.max(
      window.lastIndexOf('. '),
      window.lastIndexOf('! '),
      window.lastIndexOf('? '),
      window.lastIndexOf('.\n'),
      window.lastIndexOf('!\n'),
      window.lastIndexOf('?\n'),
    );

    if (lastSentence > maxLen * 0.5) {
      chunks.push(remaining.slice(0, lastSentence + 1).trim());
      remaining = remaining.slice(lastSentence + 1).trim();
    } else {
      const lastSpace = window.lastIndexOf(' ');
      if (lastSpace > 0) {
        chunks.push(remaining.slice(0, lastSpace).trim());
        remaining = remaining.slice(lastSpace + 1).trim();
      } else {
        chunks.push(remaining.slice(0, maxLen));
        remaining = remaining.slice(maxLen);
      }
    }
  }

  return chunks.filter((c) => c.length > 0);
}

/** Strips markdown formatting and excludes chapter titles before sending to TTS */
function stripMarkdown(text: string): string {
  // Split into lines to identify and remove the title
  const lines = text.split('\n');
  let contentLines = lines;

  // Pattern to match common chapter title starts, ignoring leading markdown symbols like **, #, etc.
  const titlePattern = /^[*#\s-]*(?:Chapter|Capítulo|Chapitre|अध्याय|Capitolo|Kapitel|Kapittel|Kapitel)\s*\d*[:.]?/i;

  // If the first non-empty line looks like a title, remove it
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const trimmedLine = lines[i].trim();
    if (trimmedLine && titlePattern.test(trimmedLine)) {
      contentLines = lines.slice(i + 1);
      break;
    }
  }

  return contentLines.join('\n')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/>\s*/g, '')
    .replace(/[-*+]\s+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Decodes base64 string → Uint8Array */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Merges multiple WAV Uint8Arrays (keeping first header, concatenating PCM data) */
function mergeWavChunks(chunks: Uint8Array[]): Blob {
  if (chunks.length === 1) return new Blob([chunks[0]], { type: 'audio/wav' });

  const pcmParts = chunks.map((c, i) => (i === 0 ? c.slice(44) : c.slice(44)));
  const totalPcm = pcmParts.reduce((acc, p) => acc + p.length, 0);
  const header = new Uint8Array(chunks[0].slice(0, 44));

  const fileSize = 36 + totalPcm;
  header[4] = fileSize & 0xff;         header[5] = (fileSize >> 8) & 0xff;
  header[6] = (fileSize >> 16) & 0xff; header[7] = (fileSize >> 24) & 0xff;
  header[40] = totalPcm & 0xff;        header[41] = (totalPcm >> 8) & 0xff;
  header[42] = (totalPcm >> 16) & 0xff; header[43] = (totalPcm >> 24) & 0xff;

  return new Blob([header, ...pcmParts], { type: 'audio/wav' });
}

/**
 * Generates an audio episode from chapter text via the Supabase Edge Function.
 * Returns a WAV Blob ready for playback or download.
 *
 * @param text - Chapter content (markdown is automatically stripped)
 * @param quality - 'regular' (bulbul:v2, 4 credits) or 'pro' (bulbul:v3, 7 credits)
 * @param speaker - The selected voice ID (e.g., 'shubh', 'anushka')
 * @param pace - Speed of speech (0.5 to 2.0)
 * @param onProgress - Optional progress callback 0–1
 */
export async function generateAudioEpisode(
  text: string,
  quality: AudioQuality,
  speaker: string,
  pace: number = 1.0,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  // Get the current user's session token to authenticate the edge function call
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('You must be logged in to generate audio.');

  const config = MODEL_CONFIG[quality];
  const cleanText = stripMarkdown(text);
  const chunks = chunkText(cleanText, config.chunkSize);

  if (chunks.length === 0) throw new Error('No text content to convert to audio.');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-audio`;

  const wavChunks: Uint8Array[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        text: chunks[i],
        model: config.model,
        speaker: speaker,
        pace: pace, // Use the selected pace
        sample_rate: 22050,
        ...(quality === 'pro' ? { temperature: 0.6 } : {}),
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(err.error ?? `Edge function error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !data.audio) {
      throw new Error(data.error ?? 'Edge function returned no audio.');
    }

    wavChunks.push(base64ToUint8Array(data.audio));
    onProgress?.((i + 1) / chunks.length);
  }

  return mergeWavChunks(wavChunks);
}
