import React, { useState, useEffect } from 'react';
import { Calendar, Edit3, Trash2, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

import { updateUserProfile } from '../services/authService';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserPosts();
    }
  }, [user]);

  const loadUserPosts = async () => {
  if (!user) return;

  setLoading(true);
  try {
    const q = query(collection(db, 'posts'), where('userId', '==', user.id));
    const querySnapshot = await getDocs(q);

    const posts: Post[] = [];
    querySnapshot.forEach((docSnap) => {
      posts.push({ id: docSnap.id, ...docSnap.data() } as Post);
    });

    setUserPosts(posts);
  } catch (error) {
    console.error('Error loading user posts:', error);
  } finally {
    setLoading(false);
  }
};


  const handleDeletePost = async (postId: string) => {
  if (!window.confirm('Are you sure you want to delete this post?')) return;

  try {
    await deleteDoc(doc(db, 'posts', postId));
    setUserPosts(prev => prev.filter(post => post.id !== postId));
  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Failed to delete post. Please try again.');
  }
};


  const handleEditName = () => {
    setIsEditing(true);
    setEditedName(user?.name || '');
  };

  const handleSaveName = async () => {
    if (!editedName.trim() || !user) return;

    setUpdating(true);
    try {
      const success = await updateUserProfile(user.id, { name: editedName.trim() });
      if (success) {
        // The auth context will automatically update when Firebase Auth profile changes
        setIsEditing(false);
      } else {
        alert('Failed to update name. Please try again.');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update name. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date: Date | string) => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return 'Invalid date';

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.name.charAt(0)}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-xl font-bold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white"
                    />
                    <Button size="sm" onClick={handleSaveName} loading={updating}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                    <button
                      onClick={handleEditName}
                      className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-1">@{user.username}</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.joinedDate)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900 dark:text-white">{userPosts.length}</span>
                  <span>Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Posts</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading your posts...</p>
              </div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Share your first thought with the community!
              </p>
              <Button onClick={() => window.location.href = '/create'}>
                Create Your First Post
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {userPosts.map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(post.createdAt)}
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-gray-900 dark:text-white leading-relaxed mb-4">
                    {post.content}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes.length} likes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments.length} comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;