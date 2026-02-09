import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEYS = [
  Deno.env.get('GEMINI_API_KEY_1'),
  Deno.env.get('GEMINI_API_KEY_2'),
  Deno.env.get('GEMINI_API_KEY_3'),
  Deno.env.get('GEMINI_API_KEY_4'),
  Deno.env.get('GEMINI_API_KEY_5'),
  Deno.env.get('GEMINI_API_KEY_6')
].filter(key => key && key.trim() !== '');

const GROQ_API_KEYS = [
  Deno.env.get('GROQ_API_KEY_1'),
  Deno.env.get('GROQ_API_KEY_2'),
  Deno.env.get('GROQ_API_KEY_3')
].filter(key => key && key.trim() !== '');

let groqKeyIndex = 0;
let geminiKeyIndex = 0;

function getNextGroqKey(): string {
  if (GROQ_API_KEYS.length === 0) throw new Error('No Groq keys available');
  const key = GROQ_API_KEYS[groqKeyIndex];
  groqKeyIndex = (groqKeyIndex + 1) % GROQ_API_KEYS.length;
  return key;
}

function getNextGeminiKey(): string {
  if (GEMINI_API_KEYS.length === 0) throw new Error('No Gemini keys available');
  const key = GEMINI_API_KEYS[geminiKeyIndex];
  geminiKeyIndex = (geminiKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
}

async function tryGroq(prompt: string, retryCount = 0): Promise<string> {
  if (GROQ_API_KEYS.length === 0) throw new Error('No Groq API keys available');
  if (retryCount >= GROQ_API_KEYS.length) throw new Error('All Groq keys exhausted');

  const apiKey = getNextGroqKey();
  const maskedKey = apiKey.substring(0, 6) + '...' + apiKey.substring(apiKey.length - 4);
  console.log(`Trying Groq with key: ${maskedKey} (attempt ${retryCount + 1}/${GROQ_API_KEYS.length})`);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8000,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Groq key ${maskedKey} failed: ${response.status}`);
    if (response.status === 429 || response.status === 403) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return tryGroq(prompt, retryCount + 1);
    }
    throw new Error(`Groq failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  console.log(`Groq API success with key ${maskedKey}!`);
  return data.choices[0].message.content;
}

async function tryGemini(prompt: string, retryCount = 0): Promise<string> {
  if (GEMINI_API_KEYS.length === 0) throw new Error('No Gemini API keys available');
  if (retryCount >= GEMINI_API_KEYS.length) throw new Error('All Gemini keys exhausted');

  const apiKey = getNextGeminiKey();
  const maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
  console.log(`Trying Gemini with key: ${maskedKey} (attempt ${retryCount + 1}/${GEMINI_API_KEYS.length})`);

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini key ${maskedKey} failed: ${response.status}`);
    if (response.status === 429 || response.status === 403 || response.status === 404) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return tryGemini(prompt, retryCount + 1);
    }
    throw new Error(`Gemini failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log(`Gemini API success with key ${maskedKey}!`);
  return data.candidates[0].content.parts[0].text;
}

async function generateContent(prompt: string): Promise<string> {
  const providers = [
    { name: 'Groq', fn: () => tryGroq(prompt) },
    { name: 'Gemini', fn: () => tryGemini(prompt) }
  ];

  for (const provider of providers) {
    try {
      console.log(`\n=== Attempting ${provider.name} ===`);
      const result = await provider.fn();
      return result;
    } catch (error) {
      console.error(`${provider.name} failed:`, error instanceof Error ? error.message : error);
      console.log(`Falling back to next provider...\n`);
    }
  }

  throw new Error('All AI providers exhausted. Please try again later.');
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
      prompt = `Create ${chapters} chapter outlines for a ${bookType} book about: "${idea}".
  The response should be in ${language} language.

  Writing Style: ${writingStyle || 'formal'}
  ${styleInstruction}

  Format the response as follows:
  Chapter 1: [Title]
  [Detailed outline for chapter 1]

  Chapter 2: [Title]
  [Detailed outline for chapter 2]

  Continue this pattern for all ${chapters} chapters. Each outline should be detailed and provide clear direction for writing the chapter. Ensure the chapter titles and outline tone reflect the chosen writing style.`;
    } else if (type === 'chapter') {
      prompt = `Write a complete chapter for a ${bookType} book with the following details:

  Chapter Title: ${title}
  Chapter Outline: ${outline}
  Language: ${language}

  Writing Style: ${writingStyle || 'formal'}
  ${styleInstruction}

  Please write a full, detailed chapter that expands on the outline. The chapter should be well-structured with proper paragraphs, engaging content, and appropriate length for a book chapter. Maintain the specified writing style consistently throughout the entire chapter.`;
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