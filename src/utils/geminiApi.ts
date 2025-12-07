// Multiple API keys for load balancing
const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  'AIzaSyDRXcQZUCV1-B2_L11seSLjSs4T6DyjDQw',
  'AIzaSyBixinCaQ1Y5qpHqmEuuCn5o5RkXgxbRJA',
  'AIzaSyDzAGh8wdDUiEGtuQfxPKw2DLWdmvU3-JE',
  'AIzaSyDMoVHNs7PI75XnT_qG_xTUDJy07XgrSOI',
  'AIzaSyCLr5xzHn6AaVBDZUApyd1bRR-np3JLaLg'
].filter(key => key && key.trim() !== ''); // Remove empty keys

let currentKeyIndex = 0;

// Function to get the next API key in rotation
function getNextApiKey(): string {
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('No valid Gemini API keys available');
  }
  
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
}

// Function to make API request with retry logic
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
      // If rate limited or quota exceeded, try next API key
      if (response.status === 429 || response.status === 403) {
        console.warn(`API key ${apiKey.substring(0, 10)}... rate limited or quota exceeded. Trying next key...`);
        return makeGeminiRequest(prompt, retryCount + 1);
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    // If it's a network error or other non-rate-limit error, try next key
    if (retryCount < maxRetries - 1) {
      console.warn(`Error with API key ${apiKey.substring(0, 10)}...:`, error);
      return makeGeminiRequest(prompt, retryCount + 1);
    }
    throw error;
  }
}
export async function generateChapterOutlines(idea: string, language: string, chapters: number, type: string): Promise<string> {
  const prompt = `Create ${chapters} chapter outlines for a ${type} book about: "${idea}". 
  The response should be in ${language} language.
  
  Format the response as follows:
  Chapter 1: [Title]
  [Detailed outline for chapter 1]
  
  Chapter 2: [Title]
  [Detailed outline for chapter 2]
  
  Continue this pattern for all ${chapters} chapters. Each outline should be detailed and provide clear direction for writing the chapter.`;

  try {
    return await makeGeminiRequest(prompt);
  } catch (error) {
    console.error('Error generating chapter outlines:', error);
    throw new Error(`Failed to generate chapter outlines: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function writeChapter(title: string, outline: string, language: string, type: string): Promise<string> {
  const prompt = `Write a complete chapter for a ${type} book with the following details:
  
  Chapter Title: ${title}
  Chapter Outline: ${outline}
  Language: ${language}
  
  Please write a full, detailed chapter that expands on the outline. The chapter should be well-structured with proper paragraphs, engaging content, and appropriate length for a book chapter. Make it compelling and well-written.`;

  try {
    return await makeGeminiRequest(prompt);
  } catch (error) {
    console.error('Error writing chapter:', error);
    throw new Error(`Failed to write chapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}