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

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || '';
const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY') || '';

let currentKeyIndex = 0;

function getNextApiKey(): string {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('No valid Gemini API keys available');
  }

  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
}

async function tryGroq(prompt: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('Groq API key not available');

  console.log('Trying Groq API...');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
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
    throw new Error(`Groq failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  console.log('Groq API success!');
  return data.choices[0].message.content;
}

async function tryHuggingFace(prompt: string): Promise<string> {
  if (!HUGGINGFACE_API_KEY) throw new Error('HuggingFace API key not available');

  console.log('Trying HuggingFace API...');
  const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 4000,
        temperature: 0.7,
        return_full_text: false
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HuggingFace failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  console.log('HuggingFace API success!');
  return data[0].generated_text;
}

async function tryGemini(prompt: string, retryCount = 0): Promise<string> {
  const maxRetries = GEMINI_API_KEYS.length;

  if (retryCount >= maxRetries) {
    throw new Error('All Gemini API keys exhausted');
  }

  const apiKey = getNextApiKey();
  const maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
  console.log(`Trying Gemini with key: ${maskedKey}`);

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
    if (response.status === 429 || response.status === 403) {
      console.warn(`Gemini key ${maskedKey} exhausted, trying next...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return tryGemini(prompt, retryCount + 1);
    }
    throw new Error(`Gemini failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('Gemini API success!');
  return data.candidates[0].content.parts[0].text;
}

async function generateContent(prompt: string): Promise<string> {
  const providers = [
    { name: 'Groq', fn: () => tryGroq(prompt) },
    { name: 'HuggingFace', fn: () => tryHuggingFace(prompt) },
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
    const { type, idea, language, chapters, title, outline, bookType } = await req.json();

    let prompt = '';
    
    if (type === 'outlines') {
      prompt = `Create ${chapters} chapter outlines for a ${bookType} book about: "${idea}". 
  The response should be in ${language} language.
  
  Format the response as follows:
  Chapter 1: [Title]
  [Detailed outline for chapter 1]
  
  Chapter 2: [Title]
  [Detailed outline for chapter 2]
  
  Continue this pattern for all ${chapters} chapters. Each outline should be detailed and provide clear direction for writing the chapter.`;
    } else if (type === 'chapter') {
      prompt = `Write a complete chapter for a ${bookType} book with the following details:
  
  Chapter Title: ${title}
  Chapter Outline: ${outline}
  Language: ${language}
  
  Please write a full, detailed chapter that expands on the outline. The chapter should be well-structured with proper paragraphs, engaging content, and appropriate length for a book chapter. Make it compelling and well-written.`;
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