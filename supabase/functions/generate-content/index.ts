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

  console.log(`Total API keys available: ${GEMINI_API_KEYS.length}`);
  console.log(`Current retry attempt: ${retryCount + 1}/${maxRetries}`);

  if (retryCount >= maxRetries) {
    throw new Error(`All ${maxRetries} API keys have been exhausted. Please check your API keys in Supabase Dashboard.`);
  }

  const apiKey = getNextApiKey();
  const maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
  console.log(`Attempting with API key: ${maskedKey}`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

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

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);

      if (response.status === 429 || response.status === 403) {
        console.warn(`Key ${maskedKey} rate limited or quota exceeded. Trying next key...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return makeGeminiRequest(prompt, retryCount + 1);
      }

      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid response format:', JSON.stringify(data));
      throw new Error('Invalid response format from Gemini API');
    }

    console.log(`Successfully generated content with key ${maskedKey}`);
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error(`Error with key ${maskedKey}:`, error);

    if (retryCount < maxRetries - 1) {
      console.warn(`Retrying with next key...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
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