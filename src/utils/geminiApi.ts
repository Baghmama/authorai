const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callEdgeFunction(payload: Record<string, unknown>): Promise<string> {
  const apiUrl = `${SUPABASE_URL}/functions/v1/generate-content`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Edge function request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Unknown error from edge function');
  }

  return data.content;
}
export async function generateChapterOutlines(idea: string, language: string, chapters: number, type: string, writingStyle?: string): Promise<string> {
  try {
    return await callEdgeFunction({
      type: 'outlines',
      idea,
      language,
      chapters,
      bookType: type,
      writingStyle: writingStyle || 'formal'
    });
  } catch (error) {
    console.error('Error generating chapter outlines:', error);
    throw new Error(`Failed to generate chapter outlines: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function writeChapter(title: string, outline: string, language: string, type: string, writingStyle?: string): Promise<string> {
  try {
    return await callEdgeFunction({
      type: 'chapter',
      title,
      outline,
      language,
      bookType: type,
      writingStyle: writingStyle || 'formal'
    });
  } catch (error) {
    console.error('Error writing chapter:', error);
    throw new Error(`Failed to write chapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}