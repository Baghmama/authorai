import { ChatMessage } from '../types';

const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY,
  'AIzaSyDRXcQZUCV1-B2_L11seSLjSs4T6DyjDQw',
  'AIzaSyBixinCaQ1Y5qpHqmEuuCn5o5RkXgxbRJA'
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

export async function generateDirectorContent(
  userPrompt: string,
  conversationHistory: ChatMessage[],
  currentContent: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const apiKey = getNextApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${apiKey}&alt=sse`;

  const systemPrompt = `You are a creative writing assistant helping an author write their book in "Director Mode".
The author will give you instructions on what to write, and you should generate engaging, well-written content based on their direction.

Current chapter content:
${currentContent || '(Empty - this is a new chapter)'}

Follow these guidelines:
- Write in a clear, engaging style appropriate for the author's vision
- Maintain consistency with existing content
- Be creative but follow the author's specific instructions
- If asked to revise, focus on the specific aspects mentioned
- Generate substantial content (aim for at least a few paragraphs unless instructed otherwise)
- Do not add meta-commentary or explanations unless asked`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemPrompt }]
    },
    ...conversationHistory.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })),
    {
      role: 'user',
      parts: [{ text: userPrompt }]
    }
  ];

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents.filter(c => c.parts[0].text.trim() !== '')
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6);
            const data = JSON.parse(jsonStr);

            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
              const text = data.candidates[0].content.parts[0].text;
              fullText += text;
              if (onChunk) {
                onChunk(text);
              }
            }
          } catch (e) {
            console.warn('Failed to parse SSE line:', e);
          }
        }
      }
    }

    if (!fullText) {
      throw new Error('No content generated');
    }

    return fullText;
  } catch (error) {
    console.error('Error generating director content:', error);
    throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
