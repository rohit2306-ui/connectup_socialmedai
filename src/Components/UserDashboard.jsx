import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Postcard from './Postcard';

function UserDashboard() {
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const [userData, setUserData] = useState({});
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:5000/api/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userRes.data.user);
        setPosts(userRes.data.posts);
      } catch (err) {
        console.error(err);
        alert('Failed to load user profile');
      }
    };

    fetchUserData();
  }, [id]);

  return (
    <div className='dashboard'>
      <div className="data">
        <h3 className='username'>{userData.firstName} {userData.lastName}</h3>
        
<button
  className='connectwith'
  onClick={async () => {
    try {
      await axios.post(`http://localhost:5000/api/connect/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('ConnectUP request sent!');
    } catch (err) {
      alert('Failed to send request');
    }
  }}
>
  ConnectUP
</button>

      </div>
      <div className="posts">
        <h2>{userData.firstName}'s Posts</h2>
        <div className="allposts">
          {posts.map((post, idx) => (
            <Postcard key={idx} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
