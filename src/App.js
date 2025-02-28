import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Landing from './components/Landing/Landing';
import Auth from './components/Authorization/Auth';
import ResetPassword from './components/Authorization/PasswordReset';
import Registration from './components/Authorization/Registration';
import Main from './components/Main/Main';
import Navbar from './components/Nav/NavBar';
import StickySide from './components/StickySide/StickySide';
import ProfileManagement from './components/ProfileManagement/ProfileManagement';
import PricingSection from './components/PricingSection/PricingSection';
import PaymentSuccess from './components/PaymentSuccess/PaymentSuccess';
import axios from 'axios';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import SetupAdAccountPopup from './components/SetUpPopUp/SetupAdAccountPopup';
import PrivacyPolicy from './components/Policies/PrivacyPolicy';
import RefundPolicy from './components/Policies/RefundPolicy';
import DeletionPolicy from './components/Policies/DeletionPolicy';
import TermsOfService from './components/Policies/TermsOfService';
import CookiesPolicy from './components/Policies/CookiesPolicy.js';
import Affiliate from './components/Affiliate/Affiliate.js';
import CookiesSettings from './components/CookieModal/CookiesSettings';
import config from './config';
import TawkTo from './components/LiveChat/TawkTo';

const apiUrl = config.apiUrl;

const AppContent = () => {
  const [authMode, setAuthMode] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectToMain, setRedirectToMain] = useState(false);
  const [activeAccount, setActiveAccount] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const navigate = useNavigate();
  const abortControllersRef = useRef(new Set());

  useEffect(() => {
    const checkCurrentUser = async () => {
      const controller = new AbortController();
      abortControllersRef.current.add(controller);
      try {
        const response = await axios.get(`${apiUrl}/auth/current_user`, { withCredentials: true, signal: controller.signal, });
        if (response.status === 200) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error checking current user', error);
      } finally {
        abortControllersRef.current.delete(controller);
        setLoading(false);
      }
    };
    checkCurrentUser();
  }, []);

  const handleAuthSuccess = async () => {
    try {
      const response = await axios.get(`${apiUrl}/auth/current_user`, { withCredentials: true });
      if (response.status === 200) {
        setUser(response.data.user);
        setAuthMode(null);
        setRedirectToMain(true);
      }
    } catch (error) {
      console.error('Error checking current user', error);
    }
  };

  const handleLogout = async () => {
    try {
      abortControllersRef.current.forEach((controller) => controller.abort()); // Cancel all ongoing requests
      abortControllersRef.current.clear(); // Clear the set
  
      const response = await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true });
      if (response.status === 200) {
        setUser(null);
        setRedirectToMain(false);
        navigate('/login');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };  

  const handlePlanUpgrade = () => {
    setRefreshTrigger((prev) => !prev);
  };

  useEffect(() => {
    if (redirectToMain) {
      navigate('/');
      setRedirectToMain(false);
    }
  }, [redirectToMain, navigate]);

  if (loading) {
    return null;
  }

  return (
    <div className="app">
      <ToastContainer />
      <Routes>
        {/* Standalone Pages */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/deletion-policy" element={<DeletionPolicy />} />
        <Route path="/cookies-policy" element={<CookiesPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-settings" element={<CookiesSettings />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/affiliate" element={<Affiliate />} />

        {/* Authenticated User Layout */}
        {user ? (
          <>
            <Route
              path="*"
              element={
                <>
                  <Navbar onLogout={handleLogout} refreshTrigger={refreshTrigger} />
                  <div className="layout">
                    <StickySide
                      setActiveAccount={setActiveAccount}
                      activeAccount={activeAccount}
                      refreshTrigger={refreshTrigger}
                    />
                    <div className="content">
                      <Routes>
                        <Route
                          path="/"
                          element={activeAccount ? (
                            <Main activeAccount={activeAccount} setActiveAccount={setActiveAccount} />
                          ) : (
                            <p>Loading...</p>
                          )}
                        />
                        <Route
                          path="/profile-management"
                          element={<ProfileManagement onLogout={handleLogout} activeAccount={activeAccount} setActiveAccount={setActiveAccount} onPlanUpgrade={handlePlanUpgrade}/>}
                        />
                        <Route path="/pricing-section" element={<PricingSection onPlanUpgrade={handlePlanUpgrade} />} />
                        <Route path="/success" element={<PaymentSuccess />} />
                        <Route path="/setup-ad-account" element={<SetupAdAccountPopup />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </div>
                  </div>
                </>
              }
            />
          </>
        ) : (
          <>
            {/* Non-authenticated User Layout */}
            <Route path="/" element={<Landing setAuthMode={setAuthMode} />} />
            <Route path="/login" element={<Auth mode="login" onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/register" element={<Auth mode="register" onAuthSuccess={handleAuthSuccess} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
      <TawkTo />
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
