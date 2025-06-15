import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Postcard from './Postcard';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postRes = await axios.get('http://localhost:5000/api/feed', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPosts(postRes.data.posts);

        const notifyRes = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(notifyRes.data.notifications);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
  if (!token) navigate('/login');
}, []);


  return (
    <div className="home">
      <button onClick={() => navigate('/notifications')}>
        🔔 Notifications ({notifications.length})
      </button>

      <h2>✨ Feed</h2>
      <div className="feed-posts">
        {posts.map((post, i) => (
          <Postcard key={i} post={post} />
        ))}
      </div>
    </div>
  );
}

export default Home;
