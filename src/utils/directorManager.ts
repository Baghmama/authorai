import { supabase } from '../lib/supabase';
import { DirectorProject, DirectorChapter, ChatMessage } from '../types';

export async function createDirectorProject(userId: string, title: string): Promise<DirectorProject> {
  const { data: project, error: projectError } = await supabase
    .from('director_projects')
    .insert({
      user_id: userId,
      title: title
    })
    .select()
    .single();

  if (projectError) throw projectError;

  const { data: chapter, error: chapterError } = await supabase
    .from('director_chapters')
    .insert({
      project_id: project.id,
      chapter_number: 1,
      title: 'Chapter 1',
      content: ''
    })
    .select()
    .single();

  if (chapterError) throw chapterError;

  const { data: conversation, error: convError } = await supabase
    .from('director_conversations')
    .insert({
      chapter_id: chapter.id,
      messages: []
    })
    .select()
    .single();

  if (convError) throw convError;

  return {
    ...project,
    chapters: [{
      ...chapter,
      conversation_history: []
    }]
  };
}

export async function getDirectorProjects(userId: string): Promise<DirectorProject[]> {
  const { data: projects, error: projectsError } = await supabase
    .from('director_projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (projectsError) throw projectsError;

  const projectsWithChapters = await Promise.all(
    projects.map(async (project) => {
      const { data: chapters, error: chaptersError } = await supabase
        .from('director_chapters')
        .select('*')
        .eq('project_id', project.id)
        .order('chapter_number', { ascending: true });

      if (chaptersError) throw chaptersError;

      const chaptersWithConversations = await Promise.all(
        chapters.map(async (chapter) => {
          const { data: conversation } = await supabase
            .from('director_conversations')
            .select('messages')
            .eq('chapter_id', chapter.id)
            .maybeSingle();

          return {
            ...chapter,
            conversation_history: conversation?.messages || []
          };
        })
      );

      return {
        ...project,
        chapters: chaptersWithConversations
      };
    })
  );

  return projectsWithChapters;
}

export async function getDirectorProject(projectId: string): Promise<DirectorProject | null> {
  const { data: project, error: projectError } = await supabase
    .from('director_projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (projectError) throw projectError;
  if (!project) return null;

  const { data: chapters, error: chaptersError } = await supabase
    .from('director_chapters')
    .select('*')
    .eq('project_id', project.id)
    .order('chapter_number', { ascending: true });

  if (chaptersError) throw chaptersError;

  const chaptersWithConversations = await Promise.all(
    chapters.map(async (chapter) => {
      const { data: conversation } = await supabase
        .from('director_conversations')
        .select('messages')
        .eq('chapter_id', chapter.id)
        .maybeSingle();

      return {
        ...chapter,
        conversation_history: conversation?.messages || []
      };
    })
  );

  return {
    ...project,
    chapters: chaptersWithConversations
  };
}

export async function updateChapterContent(chapterId: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('director_chapters')
    .update({ content })
    .eq('id', chapterId);

  if (error) throw error;
}

export async function updateChapterTitle(chapterId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('director_chapters')
    .update({ title })
    .eq('id', chapterId);

  if (error) throw error;
}

export async function addMessageToConversation(
  chapterId: string,
  message: ChatMessage
): Promise<void> {
  const { data: conversation } = await supabase
    .from('director_conversations')
    .select('id, messages')
    .eq('chapter_id', chapterId)
    .maybeSingle();

  if (conversation) {
    const messages = [...(conversation.messages || []), message];
    const { error } = await supabase
      .from('director_conversations')
      .update({ messages })
      .eq('id', conversation.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('director_conversations')
      .insert({
        chapter_id: chapterId,
        messages: [message]
      });

    if (error) throw error;
  }
}

export async function createNewChapter(projectId: string, chapterNumber: number): Promise<DirectorChapter> {
  const { data: chapter, error: chapterError } = await supabase
    .from('director_chapters')
    .insert({
      project_id: projectId,
      chapter_number: chapterNumber,
      title: `Chapter ${chapterNumber}`,
      content: ''
    })
    .select()
    .single();

  if (chapterError) throw chapterError;

  const { error: convError } = await supabase
    .from('director_conversations')
    .insert({
      chapter_id: chapter.id,
      messages: []
    });

  if (convError) throw convError;

  return {
    ...chapter,
    conversation_history: []
  };
}

export async function deleteChapter(chapterId: string): Promise<void> {
  const { error } = await supabase
    .from('director_chapters')
    .delete()
    .eq('id', chapterId);

  if (error) throw error;
}

export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase
    .from('director_projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
}

export async function updateProjectTitle(projectId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('director_projects')
    .update({ title })
    .eq('id', projectId);

  if (error) throw error;
}
