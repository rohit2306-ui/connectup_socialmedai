import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { User, Post } from '../types';
import { getUserByUsername } from '../services/userService';
import { getPostsByUserId } from '../services/postService';
import PostCard from '../components/Post/PostCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!username) return;

      setLoading(true);

      try {
        const foundUser = await getUserByUsername(username);
        if (!foundUser || !foundUser.id) {
          console.error('User not found or missing ID');
          setNotFound(true);
          return;
        }

        setUser(foundUser);

        console.log('Found user ID for post fetching:', foundUser.id);
        const posts = await getPostsByUserId(foundUser.id);

        console.log('Posts fetched:', posts.length);
        setUserPosts(posts);
      } catch (error) {
        console.error('Error loading user profile:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [username]);

  const formatDate = (date: Date | string) => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (notFound) return <Navigate to="/search" replace />;
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.name.charAt(0)}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">@{user.username}</p>

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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Posts by {user.name}
            </h2>
          </div>

          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
              <p className="text-gray-600 dark:text-gray-400">{user.name} hasn't shared any thoughts yet.</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} showActions={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
