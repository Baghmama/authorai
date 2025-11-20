import { useState, useEffect, useRef } from 'react';
import { Send, Plus, ChevronLeft, ChevronRight, Trash2, Edit2, Check, X, FileText, Download } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { DirectorProject, DirectorChapter, ChatMessage } from '../types';
import { generateDirectorContent } from '../utils/directorApi';
import {
  createDirectorProject,
  getDirectorProject,
  updateChapterContent,
  updateChapterTitle,
  addMessageToConversation,
  createNewChapter,
  deleteChapter,
  updateProjectTitle
} from '../utils/directorManager';
import { checkAndDeductCredits } from '../utils/creditManager';
import { exportToDocx, exportToPdf } from '../utils/bookGenerator';

interface DirectorModeProps {
  userId: string;
  projectId?: string;
  onExit: () => void;
  onCreditUpdate: () => void;
}

const DIRECTOR_MODE_CREDIT_COST = 1;

export default function DirectorMode({ userId, projectId, onExit, onCreditUpdate }: DirectorModeProps) {
  const [project, setProject] = useState<DirectorProject | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingProjectTitle, setEditingProjectTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [tempProjectTitle, setTempProjectTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showChapterList, setShowChapterList] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const editorContentRef = useRef<string>('');

  useEffect(() => {
    loadProject();
  }, [projectId, userId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [project?.chapters[currentChapterIndex]?.conversation_history, streamingMessage]);

  const loadProject = async () => {
    try {
      if (projectId) {
        const loadedProject = await getDirectorProject(projectId);
        if (loadedProject) {
          setProject(loadedProject);
          editorContentRef.current = loadedProject.chapters[0]?.content || '';
        }
      } else {
        const newProject = await createDirectorProject(userId, 'Untitled Project');
        setProject(newProject);
        editorContentRef.current = '';
      }
    } catch (err) {
      setError('Failed to load project. Please try again.');
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !project || isGenerating) return;

    const currentChapter = project.chapters[currentChapterIndex];
    if (!currentChapter) return;

    setError(null);

    const hasCredits = await checkAndDeductCredits(userId, DIRECTOR_MODE_CREDIT_COST);
    if (!hasCredits) {
      setError('Insufficient credits. Please purchase more credits to continue.');
      onCreditUpdate();
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    const updatedConversation = [...currentChapter.conversation_history, userMessage];
    setProject({
      ...project,
      chapters: project.chapters.map((ch, idx) =>
        idx === currentChapterIndex
          ? { ...ch, conversation_history: updatedConversation }
          : ch
      )
    });

    await addMessageToConversation(currentChapter.id, userMessage);

    setUserInput('');
    setIsGenerating(true);
    setStreamingMessage('');

    try {
      const generatedContent = await generateDirectorContent(
        userInput,
        currentChapter.conversation_history,
        editorContentRef.current,
        (chunk) => {
          setStreamingMessage((prev) => prev + chunk);
        }
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: generatedContent,
        timestamp: new Date()
      };

      const finalConversation = [...updatedConversation, assistantMessage];
      setProject({
        ...project,
        chapters: project.chapters.map((ch, idx) =>
          idx === currentChapterIndex
            ? { ...ch, conversation_history: finalConversation }
            : ch
        )
      });

      await addMessageToConversation(currentChapter.id, assistantMessage);

      onCreditUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      console.error(err);
    } finally {
      setIsGenerating(false);
      setStreamingMessage('');
    }
  };

  const handleContentChange = async (newContent: string) => {
    editorContentRef.current = newContent;
    if (!project) return;

    const currentChapter = project.chapters[currentChapterIndex];
    if (!currentChapter) return;

    setProject({
      ...project,
      chapters: project.chapters.map((ch, idx) =>
        idx === currentChapterIndex ? { ...ch, content: newContent } : ch
      )
    });

    try {
      await updateChapterContent(currentChapter.id, newContent);
    } catch (err) {
      console.error('Failed to save content:', err);
    }
  };

  const handleNewChapter = async () => {
    if (!project) return;

    try {
      const newChapterNumber = project.chapters.length + 1;
      const newChapter = await createNewChapter(project.id, newChapterNumber);

      setProject({
        ...project,
        chapters: [...project.chapters, newChapter]
      });

      setCurrentChapterIndex(project.chapters.length);
      editorContentRef.current = '';
    } catch (err) {
      setError('Failed to create new chapter');
      console.error(err);
    }
  };

  const handleDeleteChapter = async () => {
    if (!project || project.chapters.length <= 1) {
      setError('Cannot delete the last chapter');
      return;
    }

    const currentChapter = project.chapters[currentChapterIndex];
    if (!currentChapter) return;

    if (!confirm('Are you sure you want to delete this chapter?')) return;

    try {
      await deleteChapter(currentChapter.id);

      const updatedChapters = project.chapters.filter((_, idx) => idx !== currentChapterIndex);
      setProject({
        ...project,
        chapters: updatedChapters
      });

      setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1));
      editorContentRef.current = updatedChapters[Math.max(0, currentChapterIndex - 1)]?.content || '';
    } catch (err) {
      setError('Failed to delete chapter');
      console.error(err);
    }
  };

  const handleSaveChapterTitle = async () => {
    if (!project || !tempTitle.trim()) {
      setEditingTitle(false);
      return;
    }

    const currentChapter = project.chapters[currentChapterIndex];
    if (!currentChapter) return;

    try {
      await updateChapterTitle(currentChapter.id, tempTitle);

      setProject({
        ...project,
        chapters: project.chapters.map((ch, idx) =>
          idx === currentChapterIndex ? { ...ch, title: tempTitle } : ch
        )
      });

      setEditingTitle(false);
    } catch (err) {
      setError('Failed to update chapter title');
      console.error(err);
    }
  };

  const handleSaveProjectTitle = async () => {
    if (!project || !tempProjectTitle.trim()) {
      setEditingProjectTitle(false);
      return;
    }

    try {
      await updateProjectTitle(project.id, tempProjectTitle);
      setProject({ ...project, title: tempProjectTitle });
      setEditingProjectTitle(false);
    } catch (err) {
      setError('Failed to update project title');
      console.error(err);
    }
  };

  const handleExportDocx = async () => {
    if (!project) return;

    const chaptersData = project.chapters.map(ch => ({
      title: ch.title,
      content: ch.content
    }));

    await exportToDocx(chaptersData, project.title);
  };

  const handleExportPdf = async () => {
    if (!project) return;

    const chaptersData = project.chapters.map(ch => ({
      title: ch.title,
      content: ch.content
    }));

    await exportToPdf(chaptersData, project.title);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  const currentChapter = project.chapters[currentChapterIndex];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {editingProjectTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempProjectTitle}
                  onChange={(e) => setTempProjectTitle(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <button onClick={handleSaveProjectTitle} className="text-green-600 hover:text-green-700">
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={() => setEditingProjectTitle(false)} className="text-red-600 hover:text-red-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <button
                  onClick={() => {
                    setTempProjectTitle(project.title);
                    setEditingProjectTitle(true);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChapterList(!showChapterList)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Chapters ({project.chapters.length})
            </button>
            <button
              onClick={handleExportDocx}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export DOCX
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {showChapterList && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto p-4">
            <h3 className="font-semibold text-gray-900 mb-4">All Chapters</h3>
            <div className="space-y-2">
              {project.chapters.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    setCurrentChapterIndex(idx);
                    editorContentRef.current = chapter.content;
                    setShowChapterList(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    idx === currentChapterIndex
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{chapter.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {chapter.content ? `${chapter.content.substring(0, 50)}...` : 'Empty'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 flex">
          <div className="w-1/2 border-r border-gray-200 flex flex-col bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Chat with AI</h2>
              <p className="text-sm text-gray-500">Give instructions to write your chapter</p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {currentChapter?.conversation_history.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {streamingMessage && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] px-4 py-3 rounded-lg bg-gray-100 text-gray-900">
                    <p className="whitespace-pre-wrap">{streamingMessage}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type your instruction here..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isGenerating}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isGenerating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send • Costs {DIRECTOR_MODE_CREDIT_COST} credit per message
              </p>
            </div>
          </div>

          <div className="w-1/2 flex flex-col bg-white">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (currentChapterIndex > 0) {
                      setCurrentChapterIndex(currentChapterIndex - 1);
                      editorContentRef.current = project.chapters[currentChapterIndex - 1].content;
                    }
                  }}
                  disabled={currentChapterIndex === 0}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {editingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <button onClick={handleSaveChapterTitle} className="text-green-600 hover:text-green-700">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => setEditingTitle(false)} className="text-red-600 hover:text-red-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{currentChapter?.title}</h2>
                    <button
                      onClick={() => {
                        setTempTitle(currentChapter?.title || '');
                        setEditingTitle(true);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (currentChapterIndex < project.chapters.length - 1) {
                      setCurrentChapterIndex(currentChapterIndex + 1);
                      editorContentRef.current = project.chapters[currentChapterIndex + 1].content;
                    }
                  }}
                  disabled={currentChapterIndex === project.chapters.length - 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <span className="text-sm text-gray-500">
                  Chapter {currentChapterIndex + 1} of {project.chapters.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleNewChapter}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Chapter
                </button>
                <button
                  onClick={handleDeleteChapter}
                  disabled={project.chapters.length <= 1}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-6">
              <RichTextEditor
                value={currentChapter?.content || ''}
                onChange={handleContentChange}
                placeholder="Your chapter content will appear here. Use the chat to instruct the AI what to write..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
