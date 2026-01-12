import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Edit3, Trash2, Check, X, Calendar, ExternalLink, User, Link2 } from 'lucide-react';
import {
  BookOfTheWeek,
  getAllBooksOfWeek,
  createBookOfWeek,
  updateBookOfWeek,
  deleteBookOfWeek,
  setActiveBook
} from '../utils/bookOfWeekApi';

const BookOfWeekManager: React.FC = () => {
  const [books, setBooks] = useState<BookOfTheWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<BookOfTheWeek | null>(null);

  const [formData, setFormData] = useState({
    week_start_date: '',
    week_end_date: '',
    book_title: '',
    book_drive_url: '',
    google_form_url: '',
    is_active: false,
    past_results_url: '',
    author_name: '',
    author_social_link: ''
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    const data = await getAllBooksOfWeek();
    setBooks(data);
    setLoading(false);
  };

  const handleOpenAddModal = () => {
    setFormData({
      week_start_date: '',
      week_end_date: '',
      book_title: '',
      book_drive_url: '',
      google_form_url: '',
      is_active: false,
      past_results_url: '',
      author_name: '',
      author_social_link: ''
    });
    setEditingBook(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (book: BookOfTheWeek) => {
    setFormData({
      week_start_date: book.week_start_date,
      week_end_date: book.week_end_date,
      book_title: book.book_title,
      book_drive_url: book.book_drive_url,
      google_form_url: book.google_form_url,
      is_active: book.is_active,
      past_results_url: book.past_results_url || '',
      author_name: book.author_name,
      author_social_link: book.author_social_link || ''
    });
    setEditingBook(book);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingBook(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bookData = {
      ...formData,
      past_results_url: formData.past_results_url || undefined,
      author_social_link: formData.author_social_link || undefined
    };

    if (editingBook) {
      const result = await updateBookOfWeek(editingBook.id, bookData);
      if (result.success) {
        alert('Book updated successfully!');
        handleCloseModal();
        loadBooks();
      } else {
        alert(`Error: ${result.error}`);
      }
    } else {
      const result = await createBookOfWeek(bookData);
      if (result.success) {
        alert('Book created successfully!');
        handleCloseModal();
        loadBooks();
      } else {
        alert(`Error: ${result.error}`);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    const result = await deleteBookOfWeek(id);
    if (result.success) {
      alert('Book deleted successfully!');
      loadBooks();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleSetActive = async (id: string) => {
    const result = await setActiveBook(id);
    if (result.success) {
      alert('Book set as active!');
      loadBooks();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-orange-500" />
              <span>Book of the Week Management</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage weekly book challenges and featured books
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Book</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No books added yet. Click "Add New Book" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <div
                key={book.id}
                className={`border rounded-lg p-4 ${
                  book.is_active ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{book.book_title}</h4>
                      {book.is_active && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>by {book.author_name}</span>
                        {book.author_social_link && (
                          <>
                            <span>•</span>
                            <a
                              href={book.author_social_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-500 hover:underline flex items-center space-x-1"
                            >
                              <Link2 className="h-3 w-3" />
                              <span>Social</span>
                            </a>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(book.week_start_date)} - {formatDate(book.week_end_date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="h-4 w-4" />
                        <a
                          href={book.book_drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-500 hover:underline"
                        >
                          View Book
                        </a>
                      </div>
                      {book.past_results_url && (
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4" />
                          <a
                            href={book.past_results_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:underline"
                          >
                            Past Results
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!book.is_active && (
                      <button
                        onClick={() => handleSetActive(book.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Set as active"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(book)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.book_title}
                  onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter book title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter author's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author Social Link (Optional)
                </label>
                <input
                  type="url"
                  value={formData.author_social_link}
                  onChange={(e) => setFormData({ ...formData, author_social_link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://twitter.com/username or Instagram/LinkedIn"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Add author's Twitter, Instagram, or LinkedIn profile
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Week Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.week_start_date}
                    onChange={(e) => setFormData({ ...formData, week_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Week End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.week_end_date}
                    onChange={(e) => setFormData({ ...formData, week_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Drive URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.book_drive_url}
                  onChange={(e) => setFormData({ ...formData, book_drive_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://drive.google.com/file/d/FILE_ID/view"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste any Google Drive share link (the URL will be automatically converted for embedding)
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ Important: Make sure the file is set to "Anyone with the link can view" in Google Drive sharing settings
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Form URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.google_form_url}
                  onChange={(e) => setFormData({ ...formData, google_form_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://docs.google.com/forms/d/e/FORM_ID/viewform"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste your Google Form URL (embedded parameter will be added automatically)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Past Results URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.past_results_url}
                  onChange={(e) => setFormData({ ...formData, past_results_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://example.com/past-results"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Set as active book
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingBook ? 'Update Book' : 'Create Book'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookOfWeekManager;
