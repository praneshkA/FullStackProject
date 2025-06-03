import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CSS/loginSignup.css';

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  // Toggle between Login and Signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '' });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission for login/signup
  const handleSubmit = async (e) => {
  e.preventDefault();

  const endpoint = isLogin ? '/api/login' : '/api/signup';
  const url = `https://fullstackproject-480y.onrender.com${endpoint}`;
  const payload = isLogin
    ? { email: formData.email, password: formData.password }
    : formData;

  console.log("Submitting", payload);

  try {
    const response = await axios.post(url, payload);
    console.log("Response:", response.data);

    if (response.data.success) {
      alert(response.data.message);
      if (isLogin && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userId', response.data.userId);
      }
      navigate('/');
    }
  } catch (error) {
    console.error("Login error:", error);
    if (error.response) {
      alert(error.response.data.message || 'Something went wrong');
    } else {
      alert('Network error. Please try again later.');
    }
  }
};


  return (
    <div className="login-glass-container">
      <form className="login-glass-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

        {!isLogin && (
          <div className="login-input-group">
            <input 
              type="text" 
              placeholder="Your Name" 
              name="username" 
              value={formData.username} 
              onChange={handleInputChange} 
              required 
            />
          </div>
        )}

        <div className="login-input-group">
          <input 
            type="email" 
            placeholder="Email Address" 
            name="email" 
            value={formData.email} 
            onChange={handleInputChange} 
            required 
          />
        </div>

        <div className="login-input-group">
          <input 
            type="password" 
            placeholder="Password" 
            name="password" 
            value={formData.password} 
            onChange={handleInputChange} 
            required 
          />
        </div>

        <button type="submit" className="login-button">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>

        <p className="login-switch-auth">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={toggleAuthMode}>
{isLogin ? <span className="hover-pointer">Sign Up</span> : <span className="hover-pointer">Login</span>}
          </span>
        </p>
      </form>
    </div>
  );
};

export default LoginSignup;