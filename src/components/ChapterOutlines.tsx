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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Chapter Outlines</h2>
        <p className="text-gray-600">Review and edit your chapter outlines before writing</p>
      </div>

      <div className="space-y-6">
        {outlines.map((chapter, index) => (
          <div key={chapter.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            {editingId === chapter.id ? (
              <div className="space-y-4">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xl font-semibold px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <textarea
                  value={editOutline}
                  onChange={(e) => setEditOutline(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={saveEdit}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{chapter.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(chapter)}
                      className="p-2 text-gray-500 hover:text-orange-500 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {outlines.length > 1 && (
                      <button
                        onClick={() => removeChapter(chapter.id)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
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

        <div className="flex justify-center space-x-4">
          <button
            onClick={addChapter}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Chapter</span>
          </button>

          <button
            onClick={onStartWriting}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
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