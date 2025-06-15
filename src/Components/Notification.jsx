import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const res = await axios.get('http://localhost:5000/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(res.data.notifications);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAccept = async (userId) => {
    try {
      await axios.post(`http://localhost:5000/api/accept/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Request accepted');
      fetchNotifications(); // refresh list
    } catch (err) {
      alert('Failed to accept request');
    }
  };

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      <ul>
        {notifications.map((n, i) => (
          <li key={i}>
            <span onClick={() => navigate(`/user/${n.from._id}`)}>
              {n.from.firstName} sent you a ConnectUP request
            </span>
            <button onClick={() => handleAccept(n.from._id)}>Accept</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notification;
