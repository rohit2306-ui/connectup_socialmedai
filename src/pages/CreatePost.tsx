import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X } from 'lucide-react';
import Button from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/postService';

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const maxLength = 500;
  const remainingChars = maxLength - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim()) {
      setError('Please write something before posting');
      return;
    }

    if (content.length > maxLength) {
      setError(`Post is too long. Maximum ${maxLength} characters allowed.`);
      return;
    }

    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPost(user.id, content);
      
      if (result.success) {
        navigate('/feed');
      } else {
        setError(result.error || 'Failed to create post. Please try again.');
      }
    } catch (error) {
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() && !window.confirm('Are you sure you want to discard this post?')) {
      return;
    }
    navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Post</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your thoughts with the community
          </p>
        </div>

        {/* Post Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{user?.username}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Textarea */}
            <div className="space-y-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today?"
                className="w-full min-h-[200px] p-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none transition-colors duration-200"
                maxLength={maxLength}
              />
              
              {/* Character Count */}
              <div className="flex justify-between items-center text-sm">
                <div></div>
                <span className={`${remainingChars < 50 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {remainingChars} characters remaining
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!content.trim() || content.length > maxLength}
              >
                <Send className="h-4 w-4 mr-2" />
                Post Thought
              </Button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Posting Tips</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Be authentic and share your genuine thoughts</li>
            <li>• Keep it respectful and positive</li>
            <li>• Engage with others who comment on your posts</li>
            <li>• Use this space to inspire and connect with your community</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;