import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChapterOutline } from '../types';
import { Edit3, Plus, Trash2, FileText, Check, X } from 'lucide-react';

interface ChapterOutlinesProps {
  outlines: ChapterOutline[];
  onUpdateOutlines: (outlines: ChapterOutline[]) => void;
  onStartWriting: () => void;
}

const ChapterOutlines: React.FC<ChapterOutlinesProps> = ({
  outlines,
  onUpdateOutlines,
  onStartWriting,
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
      const updatedOutlines = outlines.map((chapter) =>
        chapter.id === editingId
          ? { ...chapter, title: editTitle, outline: editOutline }
          : chapter,
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
      isWritten: false,
    };
    onUpdateOutlines([...outlines, newChapter]);
  };

  const removeChapter = (id: string) => {
    const updatedOutlines = outlines.filter((chapter) => chapter.id !== id);
    onUpdateOutlines(updatedOutlines);
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Chapter Outlines</h2>
        <p className="text-slate-500">Review and edit your chapter outlines before writing</p>
      </div>

      <div className="space-y-4">
        {outlines.map((chapter, index) => (
          <div
            key={chapter.id}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {editingId === chapter.id ? (
              <div className="p-5 sm:p-6 space-y-4">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-lg font-semibold px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
                />
                <textarea
                  value={editOutline}
                  onChange={(e) => setEditOutline(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 resize-none transition-all text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={saveEdit}
                    className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium"
                  >
                    <Check className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 sm:p-6">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                      {chapter.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(chapter)}
                      className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {outlines.length > 1 && (
                      <button
                        onClick={() => removeChapter(chapter.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-slate-600 leading-relaxed prose prose-sm max-w-none pl-10">
                  <ReactMarkdown>{chapter.outline}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <button
            onClick={addChapter}
            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Chapter</span>
          </button>

          <button
            onClick={onStartWriting}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 font-semibold shadow-lg shadow-orange-500/20 text-sm"
          >
            <FileText className="h-4 w-4" />
            <span>Start Writing Chapters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterOutlines;
