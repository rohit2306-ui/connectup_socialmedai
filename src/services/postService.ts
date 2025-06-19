import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where, 
  arrayUnion, 
  arrayRemove,
  onSnapshot,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Post, Comment } from '../types';

export const createPost = async (userId: string, content: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get user data first
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    
    const postData = {
      userId,
      username: userData.username,
      name: userData.name,
      content: content.trim(),
      createdAt: Timestamp.now(),
      likes: [],
      comments: []
    };

    await addDoc(collection(db, 'posts'), postData);
    return { success: true };
  } catch (error: any) {
    console.error('Error creating post:', error);
    return { success: false, error: error.message };
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    const postsQuery = query(
      collection(db, 'posts'), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(postsQuery);
    
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        userId: data.userId,
        username: data.username,
        name: data.name,
        content: data.content,
        createdAt: data.createdAt.toDate(),
        likes: data.likes || [],
        comments: data.comments || []
      });
    });

    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
};

export const getPostsByUserId = async (userId: string): Promise<Post[]> => {
  try {
    const postsQuery = query(
      collection(db, 'posts'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(postsQuery);
    
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        userId: data.userId,
        username: data.username,
        name: data.name,
        content: data.content,
        createdAt: data.createdAt.toDate(),
        likes: data.likes || [],
        comments: data.comments || []
      });
    });

    return posts;
  } catch (error) {
    console.error('Error getting user posts:', error);
    return [];
  }
};

export const likePost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) return false;
    
    const postData = postDoc.data();
    const likes = postData.likes || [];
    
    if (likes.includes(userId)) {
      // Unlike the post
      await updateDoc(postRef, {
        likes: arrayRemove(userId)
      });
    } else {
      // Like the post
      await updateDoc(postRef, {
        likes: arrayUnion(userId)
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error liking post:', error);
    return false;
  }
};

export const addComment = async (postId: string, userId: string, content: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    
    const comment: Comment = {
      id: Date.now().toString(), // Simple ID generation
      userId,
      username: userData.username,
      name: userData.name,
      content: content.trim(),
      createdAt: new Date()
    };

    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion({
        ...comment,
        createdAt: Timestamp.fromDate(comment.createdAt)
      })
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error adding comment:', error);
    return { success: false, error: error.message };
  }
};

export const deletePost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) return false;
    
    const postData = postDoc.data();
    
    // Check if the current user owns the post
    if (postData.userId !== userId) return false;
    
    await deleteDoc(postRef);
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};

export const subscribeToPostsRealtime = (callback: (posts: Post[]) => void) => {
  const postsQuery = query(
    collection(db, 'posts'), 
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(postsQuery, (querySnapshot) => {
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        userId: data.userId,
        username: data.username,
        name: data.name,
        content: data.content,
        createdAt: data.createdAt.toDate(),
        likes: data.likes || [],
        comments: (data.comments || []).map((comment: any) => ({
          ...comment,
          createdAt: comment.createdAt.toDate()
        }))
      });
    });
    callback(posts);
  });
};