import React, { useState } from 'react';
import { X, Copy, Check, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FreeCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface Task {
  task_type: string;
  status: string;
  credits_awarded: number;
}

const FreeCreditsModal: React.FC<FreeCreditsModalProps> = ({ isOpen, onClose, userId }) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const tweetText = 'Created a whole book with just a simple prompt. @shuvodip99 \nMust try: https://authorai.tech';
  const twitterHandle = '@shuvodip99';
  const websiteUrl = 'https://authorai.tech';
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=tech.authorai.twa&pli=1';

  React.useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_tasks')
        .select('task_type, status, credits_awarded')
        .eq('user_id', userId);

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  };

  const getTaskStatus = (taskType: string) => {
    const task = tasks.find(t => t.task_type === taskType);
    return task || null;
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedFile) {
      setError('Please select a screenshot');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('review-screenshots')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('review-screenshots')
        .getPublicUrl(fileName);

      const { error: taskError } = await supabase
        .from('credit_tasks')
        .upsert({
          user_id: userId,
          task_type: 'playstore_review',
          status: 'submitted',
          screenshot_url: fileName,
        }, {
          onConflict: 'user_id,task_type'
        });

      if (taskError) throw taskError;

      setUploadSuccess(true);
      setSelectedFile(null);
      loadTasks();

      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review');
    } finally {
      setUploading(false);
    }
  };

  const handleTwitterShare = async () => {
    try {
      await supabase
        .from('credit_tasks')
        .upsert({
          user_id: userId,
          task_type: 'twitter_share',
          status: 'submitted',
          submission_data: { shared_at: new Date().toISOString() }
        }, {
          onConflict: 'user_id,task_type'
        });

      loadTasks();

      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
        '_blank',
        'width=550,height=420'
      );
    } catch (err) {
      console.error('Error recording Twitter share:', err);
    }
  };

  if (!isOpen) return null;

  const twitterTask = getTaskStatus('twitter_share');
  const reviewTask = getTaskStatus('playstore_review');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">Get 400 Free Credits!</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4">
            <p className="text-center text-gray-700 font-medium">
              Complete these simple tasks and earn <span className="text-orange-600 font-bold">200 credits each</span>!
            </p>
          </div>

          <div className="space-y-6">
            <div className="border-2 border-orange-200 rounded-xl p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Task 1: Share on X (Twitter)
                  </h3>
                  <p className="text-gray-600 text-sm">Post about Author AI and earn 200 credits</p>
                </div>
                {twitterTask && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    twitterTask.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : twitterTask.status === 'submitted'
                      ? 'bg-blue-100 text-blue-800'
                      : twitterTask.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {twitterTask.status === 'approved' && `✓ Completed (+${twitterTask.credits_awarded} credits)`}
                    {twitterTask.status === 'submitted' && 'Under Review'}
                    {twitterTask.status === 'rejected' && 'Rejected'}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tweet this:</p>
                  <p className="text-gray-800 mb-3 whitespace-pre-wrap">{tweetText}</p>
                  <button
                    onClick={() => handleCopy(tweetText, 'tweet')}
                    className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {copiedText === 'tweet' ? (
                      <>
                        <Check className="h-4 w-4" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy Tweet
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">X Username:</p>
                    <p className="font-mono text-sm text-gray-800 mb-2">{twitterHandle}</p>
                    <button
                      onClick={() => handleCopy(twitterHandle, 'handle')}
                      className="w-full bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                    >
                      {copiedText === 'handle' ? (
                        <>
                          <Check className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Website URL:</p>
                    <p className="font-mono text-xs text-gray-800 mb-2 break-all">{websiteUrl}</p>
                    <button
                      onClick={() => handleCopy(websiteUrl, 'url')}
                      className="w-full bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                    >
                      {copiedText === 'url' ? (
                        <>
                          <Check className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleTwitterShare}
                  disabled={twitterTask?.status === 'approved' || twitterTask?.status === 'submitted'}
                  className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {twitterTask?.status === 'submitted' ? 'Awaiting Admin Approval' : 'Post on X (Twitter)'}
                </button>
              </div>
            </div>

            <div className="border-2 border-orange-200 rounded-xl p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Task 2: Review on Play Store
                  </h3>
                  <p className="text-gray-600 text-sm">Write a review and upload a screenshot to earn 200 credits</p>
                </div>
                {reviewTask && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    reviewTask.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : reviewTask.status === 'submitted'
                      ? 'bg-blue-100 text-blue-800'
                      : reviewTask.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {reviewTask.status === 'approved' && `✓ Completed (+${reviewTask.credits_awarded} credits)`}
                    {reviewTask.status === 'submitted' && 'Under Review'}
                    {reviewTask.status === 'rejected' && 'Rejected - Try Again'}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                  <li>Click the button below to visit our Play Store page</li>
                  <li>Write an honest review (minimum 3 stars)</li>
                  <li>Take a screenshot of your review</li>
                  <li>Upload the screenshot below</li>
                </ol>

                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all font-semibold text-center"
                >
                  Open Play Store
                </a>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="screenshot-upload"
                    disabled={uploading || reviewTask?.status === 'approved'}
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className={`cursor-pointer flex flex-col items-center justify-center ${
                      uploading || reviewTask?.status === 'approved' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 text-center">
                      {selectedFile ? selectedFile.name : 'Click to upload screenshot'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG (max 5MB)</p>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {uploadSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Screenshot submitted! Awaiting admin approval.
                  </div>
                )}

                <button
                  onClick={handleSubmitReview}
                  disabled={!selectedFile || uploading || reviewTask?.status === 'approved' || reviewTask?.status === 'submitted'}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : reviewTask?.status === 'submitted' ? (
                    'Awaiting Admin Approval'
                  ) : (
                    'Submit Screenshot'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeCreditsModal;
