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

const GROQ_API_KEYS = cleanKeys([
  Deno.env.get('GROQ_API_KEY'),
  Deno.env.get('GROQ_API_KEY_1'),
  Deno.env.get('GROQ_API_KEY_2'),
  Deno.env.get('GROQ_API_KEY_3'),
  Deno.env.get('GROQ_API_KEY_4'),
  Deno.env.get('GROQ_API_KEY_5'),
  Deno.env.get('GROQ_API_KEY_6')
]);

const GEMINI_API_KEYS = cleanKeys([
  Deno.env.get('GEMINI_API_KEY'),
  Deno.env.get('GEMINI_API_KEY_1'),
  Deno.env.get('GEMINI_API_KEY_2'),
  Deno.env.get('GEMINI_API_KEY_3'),
  Deno.env.get('GEMINI_API_KEY_4'),
  Deno.env.get('GEMINI_API_KEY_5'),
  Deno.env.get('GEMINI_API_KEY_6')
]);

console.log(`[Init] Loaded keys: ${GROQ_API_KEYS.length} unique Groq, ${GEMINI_API_KEYS.length} unique Gemini, ${OPENROUTER_API_KEYS.length} unique OpenRouter.`);

// ── OpenRouter Provider (Priority #1 if keys configured) ──
async function tryOpenRouter(prompt: string, errors: string[]): Promise<string> {
  if (OPENROUTER_API_KEYS.length === 0) {
    return Promise.reject(new Error("No OpenRouter keys configured"));
  }

  const startOffset = Math.floor(Math.random() * OPENROUTER_API_KEYS.length);
  const model = Deno.env.get('OPENROUTER_MODEL') || 'meta-llama/llama-3.3-70b-instruct';

  for (let i = 0; i < OPENROUTER_API_KEYS.length; i++) {
    const keyIndex = (startOffset + i) % OPENROUTER_API_KEYS.length;
    const apiKey = OPENROUTER_API_KEYS[keyIndex];
    const masked = maskKey(apiKey);

    try {
      console.log(`[OpenRouter] Trying ${model} with key ${masked} (${i + 1}/${OPENROUTER_API_KEYS.length})...`);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://authorai.site',
          'X-Title': 'Author AI',
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

  throw new Error("All OpenRouter attempts failed");
}

// ── Groq Provider with 70B -> 8B Quota Resilience ──
async function tryGroq(prompt: string, errors: string[]): Promise<string> {
  if (GROQ_API_KEYS.length === 0) {
    errors.push("Groq: No keys configured in Supabase secrets");
    throw new Error("No Groq keys available");
  }

  const startOffset = Math.floor(Math.random() * GROQ_API_KEYS.length);
  // Try llama-3.3-70b first; if rate-limited (6k TPM limit), fallback to llama-3.1-8b-instant (30k TPM limit)
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

  for (const model of models) {
    let hitRateLimit = false;

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
            hitRateLimit = true;
            summary += ' (Rate Limit / TPM)';
          } else if (response.status === 401) {
            summary += ' (Invalid Key)';
          } else {
            summary += `: ${errText.substring(0, 60)}`;
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

    // If the failure was not a 429 rate limit (e.g. invalid keys), don't retry same invalid keys on 8B
    if (!hitRateLimit && models.indexOf(model) === 0) {
      break;
    }
  }

  throw new Error("All Groq attempts failed");
}

// ── Gemini Provider (v1beta with 1.5-flash & 2.0-flash fallback) ──
async function tryGemini(prompt: string, errors: string[]): Promise<string> {
  if (GEMINI_API_KEYS.length === 0) {
    errors.push("Gemini: No keys configured in Supabase secrets");
    throw new Error("No Gemini keys available");
  }

  const startOffset = Math.floor(Math.random() * GEMINI_API_KEYS.length);
  const geminiModels = ['gemini-1.5-flash', 'gemini-2.0-flash'];

  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const keyIndex = (startOffset + i) % GEMINI_API_KEYS.length;
    const apiKey = GEMINI_API_KEYS[keyIndex];
    const masked = maskKey(apiKey);

    for (const model of geminiModels) {
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
            summary += ' (Invalid Key)';
          } else {
            summary += `: ${errText.substring(0, 60)}`;
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
      conversational: 'Write in a warm, friendly, and approachable tone as if speaking directly to the reader. Use natural language, contractions, and a relaxed flow.',
      literary: 'Employ rich, artistic prose with vivid imagery, metaphors, and carefully crafted sentences. Focus on beauty of language and emotional depth.',
      humorous: 'Infuse the writing with wit, clever observations, and entertaining moments. Use comedic timing, playful language, and lighthearted tone throughout.',
      academic: 'Write in a scholarly, research-oriented tone with well-reasoned arguments, precise terminology, and structured analysis. Maintain intellectual rigor.',
      descriptive: 'Create immersive, sensory-rich writing with vivid details that paint pictures in the reader\'s mind. Focus on atmosphere, setting, and tangible experience.',
    };

    const styleInstruction = styleGuides[writingStyle] || styleGuides['formal'];

    let prompt = '';

    if (type === 'outlines') {
      const isSingleChapter = Number(chapters) === 1;
      prompt = `Create ${chapters} ${isSingleChapter ? 'complete standalone' : 'chapter'} outline${isSingleChapter ? '' : 's'} for a ${bookType} book about: "${idea}".
  The response should be in ${language} language.

  Writing Style: ${writingStyle || 'formal'}
  ${styleInstruction}

  ${isSingleChapter 
    ? 'IMPORTANT: This is a single-chapter standalone book. The outline MUST represent the entire complete story or content from beginning to end. Do not treat it as a series or an introduction; it is the whole book.' 
    : `This is a multi-chapter book. Create a logical progression across all ${chapters} chapters.`}

  IMPORTANT: Even though the book is in ${language}, you MUST use the English word "Chapter" followed by the number and a colon as the delimiter for each section.
  
  Format the response EXACTLY as follows:
  Chapter 1: [Title in ${language}]
  [Detailed outline for chapter 1 in ${language}]

  ${isSingleChapter ? '' : `Chapter 2: [Title in ${language}]
  [Detailed outline for chapter 2 in ${language}]

  Continue this pattern for all ${chapters} chapters.`}
  
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
