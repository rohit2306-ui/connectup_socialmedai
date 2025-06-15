import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import user from "../images/user.jpg";
import Postcard from './Postcard';
import axios from 'axios';

function Dashboard() {
  const [userData, setUserData] = useState({});
  const [posts, setPosts] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:5000/api/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userRes.data.user);
        setPosts(userRes.data.posts);
      } catch (err) {
        alert("Error fetching dashboard data");
        console.error(err);
        navigate('/login');
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className='dashboard'>
      <img src={user} alt="user" />
      <div className="data">
       <h3 className='username'>
  {userData.firstName} {userData.lastName}
</h3>
<h4 className='connections'>Connections: {userData.connections?.length || 0}</h4>


        {/* <button className='connectwith'>connectUP</button> */}
        <button className='newpost' onClick={() => navigate('/post')}>New post</button>
      </div>
      <div className="posts">
        <h2>Your Posts</h2>
        <div className="allposts">
          {posts.map((post, idx) => (
            <Postcard key={idx} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
