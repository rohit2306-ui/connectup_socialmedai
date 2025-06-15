import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Post() {
  const [caption, setCaption] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    try {
      await axios.post('http://localhost:5000/api/posts', {
        caption
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Post created!');
      navigate(`/dashboard/${userId}`);
    } catch (err) {
      alert('Failed to create post');
    }
  };

  return (
    <div className="newpostpage">
      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
}

export default Post;
