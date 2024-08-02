import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Auth from './components/Authorization/Auth';
import Main from './components/Main/Main';
import Navbar from './components/Nav/NavBar';
import StickySide from './components/StickySide/StickySide';
import ProfileManagement from './components/ProfileManagement/ProfileManagement';
import PricingSection from './components/PricingSection/PricingSection'; // Import the PricingSection component
import axios from 'axios';
import './App.css';

const App = () => {
  const [authMode, setAuthMode] = useState(null); // null, 'login', 'register'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectToMain, setRedirectToMain] = useState(false); // State to manage redirection
  const [activeAccount, setActiveAccount] = useState(null); // State to manage active account

  const handleCloseAuth = () => setAuthMode(null);

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
        if (response.status === 200) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error checking current user', error);
      } finally {
        setLoading(false);
      }
    };
    checkCurrentUser();
  }, []);

  const handleAuthSuccess = async () => {
    try {
      const response = await axios.get('http://localhost:5000/auth/current_user', { withCredentials: true });
      if (response.status === 200) {
        setUser(response.data.user);
        setAuthMode(null);
        setRedirectToMain(true); // Redirect to main page on successful authentication
      }
    } catch (error) {
      console.error('Error checking current user', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/auth/logout', {}, { withCredentials: true });
      if (response.status === 200) {
        setUser(null);
        setRedirectToMain(false); // Reset redirect state on logout
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    if (redirectToMain) {
      setRedirectToMain(false); // Reset redirect state after redirection
    }
  }, [redirectToMain]);

  useEffect(() => {
    console.log('App.js: activeAccount changed:', activeAccount); // Debugging log for activeAccount change
  }, [activeAccount]);

  if (loading) {
    return null;
  }

  return (
    <Router>
      <div className="app">
        {user ? (
          <>
            {redirectToMain && <Navigate to="/" replace />} {/* Redirect to main page when user is set */}
            <Navbar />
            <div className="layout">
              <StickySide setActiveAccount={setActiveAccount} activeAccount={activeAccount} />
              <div className="content">
                <Routes>
                  <Route path="/" element={activeAccount ? <Main activeAccount={activeAccount} /> : <p>Loading...</p>} />
                  <Route path="/profile-management" element={<ProfileManagement onLogout={handleLogout} activeAccount={activeAccount} setActiveAccount={setActiveAccount} />} />
                  <Route path="/pricing-section" element={<PricingSection onPlanSelect={() => setRedirectToMain(true)} />} /> {/* Route to PricingSection */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
          </>
        ) : (
          <>
            <Landing setAuthMode={setAuthMode} />
            {authMode && <Auth mode={authMode} onClose={handleCloseAuth} onAuthSuccess={handleAuthSuccess} />}
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
