import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ── Key Sanitization & Deduplication ──
function cleanKeys(rawKeys: (string | undefined)[]): string[] {
  const cleaned = rawKeys
    .map(k => (k || '').trim().replace(/^["']|["']$/g, ''))
    .filter(k => k.length > 0);
  return Array.from(new Set(cleaned)); // Deduplicate
}

function maskKey(key: string): string {
  if (!key) return '(empty)';
  if (key.length <= 10) return key.substring(0, 3) + '...';
  return key.substring(0, 6) + '...' + key.substring(key.length - 4);
}

// ── Load & Clean Provider Keys from Supabase Secrets ──
const OPENROUTER_API_KEYS = cleanKeys([
  Deno.env.get('OPENROUTER_API_KEY'),
  Deno.env.get('OPENROUTER_API_KEY_1'),
  Deno.env.get('OPENROUTER_API_KEY_2'),
  Deno.env.get('OPENROUTER_API_KEY_3'),
  Deno.env.get('OPENROUTER_API_KEY_4'),
  Deno.env.get('OPENROUTER_API_KEY_5'),
  Deno.env.get('OPENROUTER_API_KEY_6')
]);

// Exclude accidental HuggingFace tokens (hf_...) from Groq keys
const GROQ_API_KEYS = cleanKeys([
  Deno.env.get('GROQ_API_KEY'),
  Deno.env.get('GROQ_API_KEY_1'),
  Deno.env.get('GROQ_API_KEY_2'),
  Deno.env.get('GROQ_API_KEY_3'),
  Deno.env.get('GROQ_API_KEY_4'),
  Deno.env.get('GROQ_API_KEY_5'),
  Deno.env.get('GROQ_API_KEY_6')
]).filter(k => !k.startsWith('hf_'));

const GEMINI_API_KEYS = cleanKeys([
  Deno.env.get('GEMINI_API_KEY'),
  Deno.env.get('GEMINI_API_KEY_1'),
  Deno.env.get('GEMINI_API_KEY_2'),
  Deno.env.get('GEMINI_API_KEY_3'),
  Deno.env.get('GEMINI_API_KEY_4'),
  Deno.env.get('GEMINI_API_KEY_5'),
  Deno.env.get('GEMINI_API_KEY_6')
]);

console.log(`[Init] Loaded keys: ${GROQ_API_KEYS.length} valid Groq, ${GEMINI_API_KEYS.length} Gemini, ${OPENROUTER_API_KEYS.length} OpenRouter.`);

// ── OpenRouter Provider (Priority #1 if keys present) ──
async function tryOpenRouter(prompt: string, errors: string[]): Promise<string> {
  if (OPENROUTER_API_KEYS.length === 0) return '';

  const startOffset = Math.floor(Math.random() * OPENROUTER_API_KEYS.length);
  const openRouterModels = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'mistralai/mistral-7b-instruct:free'
  ];

  for (let i = 0; i < OPENROUTER_API_KEYS.length; i++) {
    const keyIndex = (startOffset + i) % OPENROUTER_API_KEYS.length;
    const apiKey = OPENROUTER_API_KEYS[keyIndex];
    const masked = maskKey(apiKey);

    for (const model of openRouterModels) {
      try {
        console.log(`[OpenRouter] Trying ${model} with key ${masked}...`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://authorai.site',
            'X-Title': 'Author AI Platform',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 8000,
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          const summary = `HTTP ${response.status}: ${errText.substring(0, 80)}`;
          console.warn(`[OpenRouter] Key ${masked} failed: ${summary}`);
          errors.push(`OpenRouter [${masked}]: ${summary}`);
          continue;
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== 'string') {
          throw new Error('Empty response from OpenRouter');
        }

        console.log(`[OpenRouter] Success with key ${masked}!`);
        return content;
      } catch (fetchErr) {
        const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        console.error(`[OpenRouter] Key ${masked} error: ${msg}`);
        errors.push(`OpenRouter [${masked}]: ${msg}`);
      }
    }
  }

  throw new Error("All OpenRouter attempts failed");
}

// ── Discover active models from Groq API ──
async function getGroqModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      const allIds: string[] = (data.data || []).map((m: any) => m.id);
      console.log(`[Groq] Live available models (${allIds.length}): ${allIds.join(', ')}`);

      // Preferred priority order
      const preferred = [
        'llama-3.1-8b-instant',
        'llama-3.3-70b-versatile',
        'llama-3.2-11b-vision-preview',
        'llama-3.2-3b-preview',
        'llama-3.2-1b-preview',
        'llama3-70b-8192',
        'llama3-8b-8192',
        'mixtral-8x7b-32768',
        'gemma2-9b-it'
      ];
      const matching = preferred.filter(p => allIds.includes(p));
      if (matching.length > 0) return matching;

      const chatOnly = allIds.filter(id => !id.includes('whisper') && !id.includes('guard'));
      if (chatOnly.length > 0) return chatOnly;
    } else {
      const txt = await res.text();
      console.warn(`[Groq] Failed to fetch models: HTTP ${res.status}: ${txt.substring(0, 100)}`);
    }
  } catch (e) {
    console.warn(`[Groq] Model discovery error:`, e);
  }
  return ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'llama3-70b-8192', 'llama3-8b-8192'];
}

// ── Groq Provider with dynamic model discovery and cascade ──
async function tryGroq(prompt: string, errors: string[]): Promise<string> {
  if (GROQ_API_KEYS.length === 0) {
    errors.push("Groq: No valid Groq keys found (or only HF keys)");
    throw new Error("No Groq keys available");
  }

  const startOffset = Math.floor(Math.random() * GROQ_API_KEYS.length);

  // Discover live models from the first responsive key
  let candidateModels: string[] = [];
  for (let i = 0; i < GROQ_API_KEYS.length; i++) {
    const key = GROQ_API_KEYS[(startOffset + i) % GROQ_API_KEYS.length];
    const live = await getGroqModels(key);
    if (live && live.length > 0) {
      candidateModels = live;
      break;
    }
  }

  if (candidateModels.length === 0) {
    candidateModels = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'llama3-70b-8192'];
  }

  console.log(`[Groq] Attempting models in priority: ${candidateModels.join(' -> ')}`);

  // Try each model across all keys. If a model returns 404 or 429, smoothly cascade to next model!
  for (const model of candidateModels) {
    for (let i = 0; i < GROQ_API_KEYS.length; i++) {
      const keyIndex = (startOffset + i) % GROQ_API_KEYS.length;
      const apiKey = GROQ_API_KEYS[keyIndex];
      const masked = maskKey(apiKey);

      try {
        console.log(`[Groq] Trying ${model} with key ${masked} (${i + 1}/${GROQ_API_KEYS.length})...`);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 8000,
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          let summary = `HTTP ${response.status}`;
          if (response.status === 429) {
            summary += ' (Rate Limit / TPM)';
          } else if (response.status === 401) {
            summary += ' (Invalid Key)';
          } else {
            summary += `: ${errText.substring(0, 100)}`;
          }
          console.warn(`[Groq] Key ${masked} failed for ${model}: ${summary}`);
          errors.push(`Groq [${masked} | ${model}]: ${summary}`);
          continue;
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (!content || typeof content !== 'string') {
          throw new Error('Empty response from Groq');
        }

        console.log(`[Groq] Success with key ${masked} using ${model}!`);
        return content;
      } catch (fetchErr) {
        const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        console.error(`[Groq] Key ${masked} error: ${msg}`);
        errors.push(`Groq [${masked} | ${model}]: ${msg}`);
      }
    }
  }

  throw new Error("All Groq attempts failed");
}

// ── Discover active models from Gemini API ──
async function getGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      const models = data.models || [];
      const supported = models
        .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map((m: any) => (m.name || '').replace(/^models\//, ''))
        .filter((name: string) => name.length > 0);
      console.log(`[Gemini] Live available models (${supported.length}): ${supported.join(', ')}`);

      const preferred = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-8b',
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-pro'
      ];
      const matching = preferred.filter(p => supported.includes(p));
      if (matching.length > 0) return matching;
      if (supported.length > 0) return supported;
    } else {
      const txt = await res.text();
      console.warn(`[Gemini] Failed to fetch models: HTTP ${res.status}: ${txt.substring(0, 100)}`);
    }
  } catch (e) {
    console.warn(`[Gemini] Model discovery error:`, e);
  }
  return ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-pro'];
}

// ── Gemini Provider with dynamic discovery and fallback ──
async function tryGemini(prompt: string, errors: string[]): Promise<string> {
  if (GEMINI_API_KEYS.length === 0) {
    errors.push("Gemini: No keys configured in Supabase secrets");
    throw new Error("No Gemini keys available");
  }

  const startOffset = Math.floor(Math.random() * GEMINI_API_KEYS.length);

  // Discover live models from the first responsive key
  let candidateModels: string[] = [];
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const key = GEMINI_API_KEYS[(startOffset + i) % GEMINI_API_KEYS.length];
    const live = await getGeminiModels(key);
    if (live && live.length > 0) {
      candidateModels = live;
      break;
    }
  }

  if (candidateModels.length === 0) {
    candidateModels = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash', 'gemini-pro'];
  }

  console.log(`[Gemini] Attempting models in priority: ${candidateModels.join(' -> ')}`);

  for (const model of candidateModels) {
    for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
      const keyIndex = (startOffset + i) % GEMINI_API_KEYS.length;
      const apiKey = GEMINI_API_KEYS[keyIndex];
      const masked = maskKey(apiKey);

      try {
        console.log(`[Gemini] Trying ${model} with key ${masked} (${i + 1}/${GEMINI_API_KEYS.length})...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          let summary = `HTTP ${response.status}`;
          if (response.status === 429) {
            summary += ' (Quota / Rate Limit)';
          } else if (response.status === 400 || response.status === 403) {
            summary += ` (Auth/Permissions: ${errText.substring(0, 60)})`;
          } else {
            summary += `: ${errText.substring(0, 100)}`;
          }
          console.warn(`[Gemini] Key ${masked} failed for ${model}: ${summary}`);
          errors.push(`Gemini [${masked} | ${model}]: ${summary}`);
          continue;
        }

        const data = await response.json();
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content || typeof content !== 'string') {
          throw new Error('Empty response from Gemini');
        }

        console.log(`[Gemini] Success with key ${masked} using ${model}!`);
        return content;
      } catch (fetchErr) {
        const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        console.error(`[Gemini] Key ${masked} error: ${msg}`);
        errors.push(`Gemini [${masked} | ${model}]: ${msg}`);
      }
    }
  }

  throw new Error("All Gemini attempts failed");
}

// ── Orchestrator ──
async function generateContent(prompt: string): Promise<string> {
  const totalKeys = OPENROUTER_API_KEYS.length + GROQ_API_KEYS.length + GEMINI_API_KEYS.length;
  if (totalKeys === 0) {
    throw new Error('No AI API keys found in Supabase Environment. Please check project secrets.');
  }

  const allErrors: string[] = [];
  const providers = [];

  if (OPENROUTER_API_KEYS.length > 0) {
    providers.push({ name: 'OpenRouter', fn: () => tryOpenRouter(prompt, allErrors) });
  }
  if (GROQ_API_KEYS.length > 0) {
    providers.push({ name: 'Groq', fn: () => tryGroq(prompt, allErrors) });
  }
  if (GEMINI_API_KEYS.length > 0) {
    providers.push({ name: 'Gemini', fn: () => tryGemini(prompt, allErrors) });
  }

  for (const provider of providers) {
    try {
      console.log(`\n=== Attempting ${provider.name} ===`);
      const result = await provider.fn();
      return result;
    } catch (error) {
      console.warn(`${provider.name} failed:`, error instanceof Error ? error.message : error);
      console.log(`Falling back to next provider...\n`);
    }
  }

  const errorSummary = allErrors.length > 0 
    ? allErrors.join('; ') 
    : 'All keys exhausted without specific error';

  throw new Error(
    `All AI providers exhausted. [Keys loaded: ${GROQ_API_KEYS.length} Groq, ${GEMINI_API_KEYS.length} Gemini, ${OPENROUTER_API_KEYS.length} OpenRouter]. Details: ${errorSummary}`
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { type, idea, language, chapters, title, outline, bookType, writingStyle } = await req.json();

    const styleGuides: Record<string, string> = {
      formal: 'Use a polished, professional tone with precise vocabulary and structured sentences. Maintain an authoritative yet accessible voice.',
      casual: 'Write in a relaxed, conversational tone. Use everyday language, contractions, and a friendly, approachable voice.',
      academic: 'Employ scholarly language, rigorous analysis, and formal academic structure. Include theoretical frameworks and citations where appropriate.',
      creative: 'Use evocative imagery, rich metaphors, and expressive language. Focus on atmosphere, emotion, and sensory details.',
      humorous: 'Incorporate wit, clever observations, and playful language. Use comedic timing and lighthearted analogies to entertain while informing.',
      dramatic: 'Build tension, emotional intensity, and compelling narratives. Use powerful verbs and dynamic pacing to create impact.',
      persuasive: 'Construct compelling arguments using rhetoric, evidence, and emotional resonance. Address counterarguments and call the reader to action.',
      minimalist: 'Write concisely and directly. Eliminate unnecessary adjectives and adverbs. Focus on clear, punchy sentences and essential information.',
      lyrical: 'Craft poetic, musical prose with careful attention to rhythm and cadence. Use literary devices and beautiful phrasing.',
      investigative: 'Adopt the tone of an investigative journalist: skeptical, thorough, and evidence-focused. Uncover hidden connections and detail findings systematically.'
    };

    const styleInstruction = writingStyle && styleGuides[writingStyle] 
      ? `\nWRITING STYLE GUIDANCE (${writingStyle.toUpperCase()}): ${styleGuides[writingStyle]}\n`
      : '';

    let prompt = '';

    if (type === 'outline') {
      prompt = `Generate a detailed chapter-by-chapter outline for a ${bookType} book with the following details:

Book Idea: ${idea}
Total Chapters: ${chapters}
Language: ${language}
${styleInstruction}

Requirements:
1. Provide a book title
2. Provide exactly ${chapters} chapters
3. Each chapter should have:
   - A descriptive chapter title
   - 2-3 sentence summary of what happens in the chapter
4. Respond in ${language}

Format the response as:
Title: [Book Title]

Chapter 1: [Chapter Title]
[2-3 sentence outline/summary]

Chapter 2: [Chapter Title]
[2-3 sentence outline/summary]

Continue this pattern for all ${chapters} chapters.

Ensure the chapter titles and outline tone reflect the chosen writing style.`;
    } else if (type === 'chapter') {
      prompt = `Write a complete chapter for a ${bookType} book with the following details:

Chapter Title: ${title}
Chapter Outline: ${outline}
Language: ${language}

Writing Style: ${writingStyle || 'formal'}
${styleInstruction}

CRITICAL INSTRUCTIONS:
1. START WRITING THE STORY CONTENT IMMEDIATELY.
2. DO NOT include the Chapter Title ("${title}") in your response.
3. DO NOT include "Chapter 1", "Introduction", or any other header.
4. DO NOT include any introductory or concluding remarks.
5. Provide ONLY the body text of the story. If you include the title, the system will fail.

Please write a full, detailed chapter that expands on the outline. The chapter should be well-structured with proper paragraphs, engaging content, and appropriate length for a book chapter.`;
    } else {
      throw new Error('Invalid request type');
    }

    const result = await generateContent(prompt);

    return new Response(
      JSON.stringify({ success: true, content: result }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
