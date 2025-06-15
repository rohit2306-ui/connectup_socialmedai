import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/signup', {
        firstName, lastName, email, password
      });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="signup">
      <h1>Signup</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="firstName" placeholder='First name' onChange={handleChange} />
        <input type="text" name="lastName" placeholder='Second name' onChange={handleChange} />
        <input type="text" name="email" placeholder='Enter your mail' onChange={handleChange} />
        <input type="password" name="password" placeholder='Create password' onChange={handleChange} />
        <input type="password" name="confirmPassword" placeholder='Re-enter password' onChange={handleChange} />
        <button className='create_account'>Submit</button>
      </form>
      <Link to="/Login">Alredy have an account</Link>
    </div>
  );
}

export default Signup;
