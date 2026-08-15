import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function LoginForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('volunteer');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const existingToken = localStorage.getItem('token');
    const existingRole = localStorage.getItem('role');
    if (existingToken && existingRole) {
      navigate(existingRole === 'manager' ? '/manager' : '/volunteer');
    }
  }, []);

  function handleRegister(event) {
    event.preventDefault();
    fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        if (data.message === 'User registered successfully') {
          setIsRegistering(false);
        }
      });
  }

  function handleLogin(event) {
    event.preventDefault();
    fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.user.role);
          localStorage.setItem('name', data.user.name);
          navigate(data.user.role === 'manager' ? '/manager' : '/volunteer');
        } else {
          setMessage(data.message);
        }
      });
  }

  if (isRegistering) {
    return (
      <div className="page-narrow">
        <div className="card">
          <h1>Register</h1>
          <form onSubmit={handleRegister}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="volunteer">Volunteer</option>
              <option value="manager">Manager</option>
            </select>
            <button type="submit">Register</button>
            {message && <p className="message">{message}</p>}
          </form>
          <button className="secondary" onClick={() => setIsRegistering(false)}>
            Already have an account? Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-narrow">
      <div className="card">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button type="submit">Login</button>
          {message && <p className="message">{message}</p>}
        </form>
        <button className="secondary" onClick={() => setIsRegistering(true)}>
          New here? Register
        </button>
      </div>
    </div>
  );
}

export default LoginForm;