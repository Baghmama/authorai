import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChapterOutline } from '../types';
import { Edit3, Plus, Trash2, FileText } from 'lucide-react';

interface ChapterOutlinesProps {
  outlines: ChapterOutline[];
  onUpdateOutlines: (outlines: ChapterOutline[]) => void;
  onStartWriting: () => void;
}

const ChapterOutlines: React.FC<ChapterOutlinesProps> = ({
  outlines,
  onUpdateOutlines,
  onStartWriting
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editOutline, setEditOutline] = useState('');

  const startEdit = (chapter: ChapterOutline) => {
    setEditingId(chapter.id);
    setEditTitle(chapter.title);
    setEditOutline(chapter.outline);
  };

  const saveEdit = () => {
    if (editingId) {
      const updatedOutlines = outlines.map(chapter =>
        chapter.id === editingId
          ? { ...chapter, title: editTitle, outline: editOutline }
          : chapter
      );
      onUpdateOutlines(updatedOutlines);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditOutline('');
  };

  const addChapter = () => {
    const newChapter: ChapterOutline = {
      id: `chapter-${Date.now()}`,
      title: `Chapter ${outlines.length + 1}: New Chapter`,
      outline: 'Add your chapter outline here...',
      isWritten: false
    };
    onUpdateOutlines([...outlines, newChapter]);
  };

  const removeChapter = (id: string) => {
    const updatedOutlines = outlines.filter(chapter => chapter.id !== id);
    onUpdateOutlines(updatedOutlines);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0 animate-fade-in">
      <div className="text-center mb-8 animate-slide-up">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Chapter Outlines</h2>
        <p className="text-gray-600">Review and edit your chapter outlines before writing</p>
      </div>

      <div className="space-y-4">
        {outlines.map((chapter, index) => (
          <div key={chapter.id} className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-card border border-white/20 p-4 sm:p-6 hover:shadow-premium hover:bg-white/95 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            {editingId === chapter.id ? (
              <div className="space-y-4">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-lg sm:text-xl font-semibold px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
                />
                <textarea
                  value={editOutline}
                  onChange={(e) => setEditOutline(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm transition-all"
                />
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={saveEdit}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-card hover:shadow-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="w-full sm:w-auto bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all duration-200 font-medium shadow-card hover:shadow-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex-1 mr-2">{chapter.title}</h3>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => startEdit(chapter)}
                      className="p-2 text-gray-400 hover:text-orange-500 transition-colors duration-200"
                    >
                      <Edit3 className="h-5 w-5" />
                    </button>
                    {outlines.length > 1 && (
                      <button
                        onClick={() => removeChapter(chapter.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                  <ReactMarkdown>{chapter.outline}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-8 animate-slide-up" style={{ animationDelay: `${outlines.length * 0.1}s` }}>
          <button
            onClick={addChapter}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-xl hover:bg-white/95 transition-all duration-200 border border-white/20 shadow-card hover:shadow-premium font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>Add Chapter</span>
          </button>

          <button
            onClick={onStartWriting}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-glow font-medium hover:scale-105"
          >
            <FileText className="h-5 w-5" />
            <span>Start Writing Chapters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterOutlines;