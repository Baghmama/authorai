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

let currentKeyIndex = 0;

function getNextApiKey(): string {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('No valid Gemini API keys available');
  }
  
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
}

async function makeGeminiRequest(prompt: string, retryCount = 0): Promise<string> {
  const maxRetries = GEMINI_API_KEYS.length;
  
  if (retryCount >= maxRetries) {
    throw new Error('All API keys have been exhausted. Please try again later.');
  }
  
  const apiKey = getNextApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      if (response.status === 429 || response.status === 403) {
        console.warn(`API key rate limited or quota exceeded. Trying next key...`);
        return makeGeminiRequest(prompt, retryCount + 1);
      }
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    if (retryCount < maxRetries - 1) {
      console.warn(`Error with API key:`, error);
      return makeGeminiRequest(prompt, retryCount + 1);
    }
    throw error;
  }
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

    const result = await makeGeminiRequest(prompt);

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