import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', formData);
      
      // ✅ Save token and user info
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user._id);
      localStorage.setItem('name', `${res.data.user.firstName} ${res.data.user.lastName}`);

      alert("Login successful");

      // ✅ Redirect to user's unique dashboard
      navigate(`/dashboard/${res.data.user._id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="email" placeholder="Enter your email" onChange={handleChange} />
        <input type="password" name="password" placeholder="Enter your password" onChange={handleChange} />
        <button type="submit">Login</button>
      </form>
      <Link to="/">Create new account</Link>
    </div>
  );
}

export default Login;
