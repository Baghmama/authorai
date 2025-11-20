import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Send, Loader, BookOpen, Edit3, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateDirectorContent } from '../utils/directorApi';
import RichTextEditor from './RichTextEditor';
import { ChatMessage } from '../types';

interface DirectorChapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  messages: ChatMessage[];
}

interface DirectorProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export function DirectorProjectDetail({ projectId, onBack }: DirectorProjectDetailProps) {
  const [project, setProject] = useState<{ id: string; title: string } | null>(null);
  const [chapters, setChapters] = useState<DirectorChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<DirectorChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPrompt, setUserPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    loadProject();
  }, [projectId]);

  async function loadProject() {
    try {
      setLoading(true);

      const { data: projectData, error: projectError } = await supabase
        .from('director_projects')
        .select('id, title')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      const { data: chaptersData, error: chaptersError } = await supabase
        .from('director_chapters')
        .select('id, chapter_number, title, content')
        .eq('project_id', projectId)
        .order('chapter_number', { ascending: true });

      if (chaptersError) throw chaptersError;

      const chaptersWithMessages = await Promise.all(
        (chaptersData || []).map(async (chapter) => {
          const { data: conversationData } = await supabase
            .from('director_conversations')
            .select('messages')
            .eq('chapter_id', chapter.id)
            .maybeSingle();

          return {
            ...chapter,
            messages: conversationData?.messages || []
          };
        })
      );

      setChapters(chaptersWithMessages);

      if (chaptersWithMessages.length > 0 && !selectedChapter) {
        setSelectedChapter(chaptersWithMessages[0]);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Failed to load project. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function createNewChapter() {
    try {
      const nextChapterNumber = chapters.length + 1;

      const { data: chapter, error: chapterError } = await supabase
        .from('director_chapters')
        .insert({
          project_id: projectId,
          chapter_number: nextChapterNumber,
          title: `Chapter ${nextChapterNumber}`,
          content: ''
        })
        .select()
        .single();

      if (chapterError) throw chapterError;

      const { error: conversationError } = await supabase
        .from('director_conversations')
        .insert({
          chapter_id: chapter.id,
          messages: []
        });

      if (conversationError) throw conversationError;

      await loadProject();
    } catch (error) {
      console.error('Error creating chapter:', error);
      alert('Failed to create chapter. Please try again.');
    }
  }

  async function updateChapterTitle(chapterId: string, newTitle: string) {
    try {
      const { error } = await supabase
        .from('director_chapters')
        .update({ title: newTitle })
        .eq('id', chapterId);

      if (error) throw error;

      await loadProject();
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error updating chapter title:', error);
      alert('Failed to update chapter title.');
    }
  }

  async function handleSendPrompt() {
    if (!userPrompt.trim() || !selectedChapter || isGenerating) return;

    try {
      setIsGenerating(true);

      const newUserMessage: ChatMessage = {
        role: 'user',
        content: userPrompt,
        timestamp: new Date()
      };

      const updatedMessages = [...selectedChapter.messages, newUserMessage];

      let generatedContent = '';
      await generateDirectorContent(
        userPrompt,
        selectedChapter.messages,
        selectedChapter.content,
        (chunk) => {
          generatedContent += chunk;
        }
      );

      const newAssistantMessage: ChatMessage = {
        role: 'assistant',
        content: generatedContent,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, newAssistantMessage];

      let newContent = selectedChapter.content;
      if (newContent.trim()) {
        newContent += '\n\n' + generatedContent;
      } else {
        newContent = generatedContent;
      }

      const { error: contentError } = await supabase
        .from('director_chapters')
        .update({ content: newContent })
        .eq('id', selectedChapter.id);

      if (contentError) throw contentError;

      const { data: conversationData } = await supabase
        .from('director_conversations')
        .select('id')
        .eq('chapter_id', selectedChapter.id)
        .maybeSingle();

      if (conversationData) {
        const { error: conversationError } = await supabase
          .from('director_conversations')
          .update({ messages: finalMessages })
          .eq('id', conversationData.id);

        if (conversationError) throw conversationError;
      } else {
        const { error: conversationError } = await supabase
          .from('director_conversations')
          .insert({
            chapter_id: selectedChapter.id,
            messages: finalMessages
          });

        if (conversationError) throw conversationError;
      }

      setUserPrompt('');
      await loadProject();
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleContentChange(newContent: string) {
    if (!selectedChapter) return;

    try {
      const { error } = await supabase
        .from('director_chapters')
        .update({ content: newContent })
        .eq('id', selectedChapter.id);

      if (error) throw error;

      setSelectedChapter({
        ...selectedChapter,
        content: newContent
      });

      setChapters(chapters.map(ch =>
        ch.id === selectedChapter.id ? { ...ch, content: newContent } : ch
      ));
    } catch (error) {
      console.error('Error updating content:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex h-screen">
        <div className="w-64 bg-black/30 backdrop-blur-lg border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Projects
            </button>
            <h2 className="text-xl font-bold text-white">{project.title}</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => setSelectedChapter(chapter)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedChapter?.id === chapter.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-purple-200 hover:bg-white/15'
                  }`}
                >
                  <div className="font-medium truncate">{chapter.title}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {chapter.messages.length} messages
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={createNewChapter}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Chapter
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedChapter ? (
            <>
              <div className="bg-black/30 backdrop-blur-lg border-b border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateChapterTitle(selectedChapter.id, editedTitle);
                            }
                          }}
                        />
                        <button
                          onClick={() => updateChapterTitle(selectedChapter.id, editedTitle)}
                          className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsEditingTitle(false)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-white">{selectedChapter.title}</h3>
                        <button
                          onClick={() => {
                            setIsEditingTitle(true);
                            setEditedTitle(selectedChapter.title);
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-purple-300" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                  <RichTextEditor
                    value={selectedChapter.content}
                    onChange={handleContentChange}
                  />
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-lg border-t border-white/10 p-4">
                <div className="max-w-4xl mx-auto">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="Tell the AI what to write... (e.g., 'Write an opening scene in a dark forest')"
                      className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendPrompt()}
                      disabled={isGenerating}
                    />
                    <button
                      onClick={handleSendPrompt}
                      disabled={isGenerating || !userPrompt.trim()}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send
                        </>
                      )}
                    </button>
                  </div>

                  {selectedChapter.messages.length > 0 && (
                    <div className="mt-4 max-h-48 overflow-y-auto space-y-2">
                      {selectedChapter.messages.slice(-3).map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-purple-600/30 ml-12'
                              : 'bg-white/10 mr-12'
                          }`}
                        >
                          <div className="text-xs text-purple-300 mb-1">
                            {msg.role === 'user' ? 'You' : 'AI'}
                          </div>
                          <div className="text-white text-sm line-clamp-2">{msg.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Chapter Selected</h3>
                <p className="text-purple-200">Select a chapter or create a new one to start writing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
