import React, { useState } from 'react';
import { BookProject } from '../types';
import { generatePDF, generateWord } from '../utils/bookGenerator';
import { Download, FileText, BookOpen, Check, FileDown, Sparkles } from 'lucide-react';

interface BookCompilerProps {
  project: BookProject;
  onNewProject: () => void;
}

const BookCompiler: React.FC<BookCompilerProps> = ({ project, onNewProject }) => {
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      await generatePDF(project);
    } catch (error) {
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadWord = async () => {
    setDownloadingWord(true);
    try {
      await generateWord(project);
    } catch (error) {
      alert('Failed to generate Word document. Please try again.');
    } finally {
      setDownloadingWord(false);
    }
  };

  const totalWords = project.outlines.reduce(
    (acc, chapter) => acc + (chapter.content?.split(' ').length || 0),
    0,
  );

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Book Complete!</h2>
        <p className="text-slate-500">Your book has been generated and is ready for download</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Book Details
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Idea</span>
                <span className="text-slate-900 font-medium text-right max-w-[60%] truncate">
                  {project.idea.idea}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="text-slate-900 font-medium">{project.idea.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Language</span>
                <span className="text-slate-900 font-medium">{project.idea.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chapters</span>
                <span className="text-slate-900 font-medium">{project.outlines.length}</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Statistics
            </h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Words</span>
                <span className="text-slate-900 font-medium tabular-nums">
                  {totalWords.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chapters Written</span>
                <span className="text-slate-900 font-medium">
                  {project.outlines.filter((c) => c.isWritten).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Complete
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Chapters
          </h3>
          <div className="space-y-2">
            {project.outlines.map((chapter, index) => (
              <div
                key={chapter.id}
                className="flex items-center gap-3 text-sm py-1.5"
              >
                <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-slate-700 truncate">{chapter.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-5 text-center">
            Download Your Book
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="group flex flex-col items-center gap-3 bg-red-50 hover:bg-red-100 border border-red-200/60 rounded-2xl p-5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="bg-red-500 p-3 rounded-xl group-hover:scale-105 transition-transform">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-slate-900 text-sm">Download PDF</h4>
                <p className="text-xs text-slate-500 mt-0.5">Universal format</p>
              </div>
              {downloadingPDF ? (
                <div className="flex items-center gap-1.5 text-red-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                  <span className="text-xs">Generating...</span>
                </div>
              ) : (
                <Download className="h-4 w-4 text-red-500 group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>

            <button
              onClick={handleDownloadWord}
              disabled={downloadingWord}
              className="group flex flex-col items-center gap-3 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 rounded-2xl p-5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="bg-blue-500 p-3 rounded-xl group-hover:scale-105 transition-transform">
                <FileDown className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-slate-900 text-sm">Download Word</h4>
                <p className="text-xs text-slate-500 mt-0.5">Editable format</p>
              </div>
              {downloadingWord ? (
                <div className="flex items-center gap-1.5 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                  <span className="text-xs">Generating...</span>
                </div>
              ) : (
                <Download className="h-4 w-4 text-blue-500 group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>

          <div className="bg-sky-50 border border-sky-200/60 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <BookOpen className="h-4 w-4 text-sky-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-sky-900 text-sm mb-0.5">Using the mobile app?</h4>
                <p className="text-xs text-sky-700">
                  Check your device notifications for download completion. Files will be saved to
                  your Downloads folder.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={onNewProject}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl transition-colors font-medium text-sm"
            >
              Create New Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCompiler;
