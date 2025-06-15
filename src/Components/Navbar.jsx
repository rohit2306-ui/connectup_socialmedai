import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ detect route changes

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]); // ✅ whenever route changes, re-check login

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchUsers = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/users?search=${searchTerm}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [searchTerm]);

  const handleUserClick = (id) => {
    setSearchTerm('');
    setResults([]);
    navigate(`/user/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <h2><Link className="logo">connectUP</Link></h2>
    {/* {isLoggedIn && (
  <h4><Link className='homea' to="/home">Home</Link></h4>
)} */}

    {isLoggedIn ? (
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      ) : (
        <Link to="/login">Login</Link>
      )}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {results.length > 0 && (
          <ul className="search-results">
            {results.map(user => (
              <li key={user._id} onClick={() => handleUserClick(user._id)}>
                {user.firstName} {user.lastName}
              </li>
            ))}
          </ul>
        )}
      </div>

      
    </nav>
  );
}

export default Navbar;
