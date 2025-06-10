import { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Courses from './components/Courses';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('courses');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setCurrentView('auth');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchUserProfile = async (currentToken) => {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setCurrentView('courses');
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setCurrentView('auth');
        console.error('Failed to fetch profile, token might be invalid');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setCurrentView('auth');
    }
  };

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    setCurrentView('courses');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentView('auth');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const renderView = () => {
    if (!token || currentView === 'auth') {
      return <Auth onLogin={handleLogin} />;
    }
    switch (currentView) {
      case 'profile':
        return <Profile token={token} user={user} setUser={setUser} />;
      case 'courses':
        return <Courses token={token} user={user} />;
      default:
        return <Courses token={token} user={user} />;
    }
  };

  return (
    <div className="app-container">
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>LearnSphere</h1>
        </div>
        <div className="nav-actions">
          {token && (
            <>
              <button className="nav-button" onClick={() => setCurrentView('courses')}>Courses</button>
              <button className="nav-button" onClick={() => setCurrentView('profile')}>Profile</button>
              <button className="nav-button" onClick={handleLogout}>Logout</button>
              {user && <span className="nav-user">Welcome, {user.name} ({user.role})</span>}
            </>
          )}
          {!token && (
            <button className="nav-button" onClick={() => setCurrentView('auth')}>Login/Register</button>
          )}
          <button className="nav-button theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </nav>
      <main className="app-main fade-in">
        {renderView()}
      </main>
    </div>
  );
}

export default App;