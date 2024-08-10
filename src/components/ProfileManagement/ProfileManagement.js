import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../ToastifyOverrides.css';
import styles from './ProfileManagement.module.css';

const ProfileManagement = ({ onLogout, activeAccount, setActiveAccount }) => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [adAccountDetails, setAdAccountDetails] = useState({});
  const [isBound, setIsBound] = useState(false);

  const [subscriptionPlan, setSubscriptionPlan] = useState('');  
  const [subscriptionStartDate, setSubscriptionStartDate] = useState('-- -- --');
  const [subscriptionEndDate, setSubscriptionEndDate] = useState('-- -- --');
  const [isActive, setIsActive] = useState(false);  
  const [runningPlan, setRunningPlan] = useState('No active plan');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/profile', { withCredentials: true });
        if (response.status === 200) {
          const { username, email, profile_picture } = response.data.user;
          setFullName(username);
          setEmail(email);
          setProfilePic(profile_picture ? profile_picture : null);
        }
      } catch (error) {
        toast.error('Error fetching profile');
        console.error('Error fetching profile', error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchUserSubscriptionStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/payment/user-subscription-status', { withCredentials: true });
        if (response.status === 200) {
          const { plan, start_date, end_date, is_active } = response.data;
          setSubscriptionPlan(plan);
          setSubscriptionStartDate(start_date);
          setSubscriptionEndDate(end_date);
          setIsActive(is_active);
        }
      } catch (error) {
        toast.error('Error fetching user subscription status');
        console.error('Error fetching user subscription status', error);
      }
    };
    
    fetchUserSubscriptionStatus();
  }, []);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/payment/subscription-status/${activeAccount.id}`, 
          { withCredentials: true }
        );
  
        if (response.status === 200) {
          const { plan, start_date, end_date, is_active } = response.data;
          setRunningPlan(plan);
          setSubscriptionStartDate(start_date);
          setSubscriptionEndDate(end_date);
          setIsActive(is_active);
        }
      } catch (error) {
        toast.error('Error fetching subscription details');
        console.error('Error fetching subscription details', error);
      }
    };
  
    if (activeAccount) {
      fetchSubscriptionDetails();
      setIsBound(activeAccount.is_bound);
      fetchAdAccountDetails(activeAccount.id);
    }
  }, [activeAccount]);

  const fetchAdAccountDetails = async (adAccountId) => {
    try {
      const response = await axios.get(`http://localhost:5000/auth/ad_account/${adAccountId}`, { withCredentials: true });
      setAdAccountDetails(response.data);
    } catch (error) {
      toast.error('Error fetching ad account details');
      console.error('Error fetching ad account details', error);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5242880) {
      setProfilePic(URL.createObjectURL(file));
    } else {
      toast.error('File size should be less than 5MB');
    }
  };

  const verifyField = async (url, fieldData) => {
    try {
      const response = await axios.post(url, fieldData, { withCredentials: true });
      return response.data.valid;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  };

  const handleAdAccountChange = (e) => {
    const { name, value } = e.target;
    setAdAccountDetails({ ...adAccountDetails, [name]: value });
  };

  const handleAdAccountSave = async () => {
    if (isBound) {
      toast.error('Ad account settings can only be changed once.');
      return;
    }

    const confirmSave = window.confirm(
      'Ad account settings cannot be changed later. Are you sure you want to proceed?'
    );

    if (confirmSave) {
      const { ad_account_id, pixel_id, facebook_page_id, app_id, app_secret, access_token } = adAccountDetails;

      const isAdAccountValid = await verifyField('http://localhost:5000/auth/verify_ad_account', { ad_account_id, access_token });
      const isPixelValid = await verifyField('http://localhost:5000/auth/verify_pixel_id', { pixel_id, access_token });
      const isPageValid = await verifyField('http://localhost:5000/auth/verify_facebook_page_id', { facebook_page_id, access_token });
      const isAppValid = await verifyField('http://localhost:5000/auth/verify_app_id', { app_id, access_token });
      const isAppSecretValid = await verifyField('http://localhost:5000/auth/verify_app_secret', { app_secret, access_token });
      const isTokenValid = await verifyField('http://localhost:5000/auth/verify_access_token', { access_token });

      if (isAdAccountValid && isPixelValid && isPageValid && isAppValid && isAppSecretValid && isTokenValid) {
        try {
          const response = await axios.post(
            'http://localhost:5000/auth/ad_account',
            { id: activeAccount.id, ...adAccountDetails },
            { withCredentials: true }
          );
          if (response.status === 200) {
            toast.success('Ad account updated successfully');
            setIsBound(true);
          }
        } catch (error) {
          toast.error('Error saving ad account');
          console.error('Error saving ad account', error);
        }
      } else {
        toast.error('Invalid ad account details for one or more fields.');
      }
    }
  };

  const handleSaveChanges = async () => {
    const formData = new FormData();
    formData.append('username', fullName);
    formData.append('profile_picture', document.querySelector('input[type="file"]').files[0]);

    try {
      const response = await axios.post('http://localhost:5000/auth/profile', formData, { withCredentials: true });
      if (response.status === 200) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Error saving profile');
      console.error('Error saving profile', error);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await axios.get('http://localhost:5000/payment/active-ad-accounts', { withCredentials: true });
      const activeAdAccountsCount = response.data.count;

      console.log(runningPlan)
      console.log(isActive)
      console.log(activeAdAccountsCount)

      const confirmCancel = window.confirm(
        runningPlan === 'Enterprise' && isActive && activeAdAccountsCount < 3
          ? `There are only 2 active ad accounts with running plans. Canceling the subscription for this account will cancel all subscriptions. Are you sure you want to proceed?`
          : `Are you sure you want to cancel the subscription for ad account: ${activeAccount.id}?`
      );

      if (confirmCancel) {
        const cancelResponse = await axios.post('http://localhost:5000/payment/cancel-subscription', { ad_account_id: activeAccount.id }, { withCredentials: true });

        if (cancelResponse.status === 200) {
          toast.success(cancelResponse.data.message);
          setIsActive(false);
          setSubscriptionStartDate('-- -- --');
          setSubscriptionEndDate('-- -- --');
          setRunningPlan('No active plan');
        }
      }
    } catch (error) {
      toast.error('Error fetching active ad accounts or canceling subscription');
      console.error('Error fetching active ad accounts or canceling subscription:', error);
    }
  };

  const handleRenewSubscription = async () => {
    try {
      const response = await axios.post('http://localhost:5000/payment/renew-subscription', 
        { ad_account_id: activeAccount.id, plan: subscriptionPlan },
        { withCredentials: true }
      );

      if (response.data.sessionId) {
        const stripe = window.Stripe('pk_test_51PiyL901UFm1325d6TwRCbSil7dWz63iOlmtqEZV6uLOQhXZSPwqhZPZ1taioo9s6g1IAbFjsD4OV6q4zWcv1ycV00fISOFZLY');
        stripe.redirectToCheckout({ sessionId: response.data.sessionId });
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      toast.error('Error renewing subscription');
      console.error('Error renewing subscription:', error);
    }
};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src="/assets/Vector4.png"
          alt="Go Back"
          className={styles.goBackIcon}
          onClick={() => navigate('/')}
        />
        <h2>Profile Management</h2>
      </div>
      <div className={styles.profileContent}>
        <div className={styles.section}>
          {profilePic && <img src={profilePic} alt="Profile" className={styles.profilePic} />}
          <h3>Profile Information</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePicChange}
            className={styles.profileInput}
          />
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={styles.profileInput}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            disabled
            className={styles.profileInput}
          />
          <button
          onClick={handleSaveChanges}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          Save Profile
        </button>
        </div>
        <div className={styles.section}>
          <h3>Ad Account Settings</h3>
          <p className={styles.infoText}>
            Ad account settings cannot be changed after being saved.
          </p>
          <input
            type="text"
            name="ad_account_id"
            placeholder="Ad Account ID"
            value={adAccountDetails.ad_account_id || ''}
            onChange={handleAdAccountChange}
            className={styles.profileInput}
            required
            disabled={isBound}
          />
          <input
            type="text"
            name="pixel_id"
            placeholder="Pixel ID"
            value={adAccountDetails.pixel_id || ''}
            onChange={handleAdAccountChange}
            className={styles.profileInput}
            required
            disabled={isBound}
          />
          <input
            type="text"
            name="facebook_page_id"
            placeholder="Facebook Page ID"
            value={adAccountDetails.facebook_page_id || ''}
            onChange={handleAdAccountChange}
            className={styles.profileInput}
            required
            disabled={isBound}
          />
          <input
            type="text"
            name="app_id"
            placeholder="App ID"
            value={adAccountDetails.app_id || ''}
            onChange={handleAdAccountChange}
            className={styles.profileInput}
            required
            disabled={isBound}
          />
          <input
            type="text"
            name="app_secret"
            placeholder="App Secret"
            value={adAccountDetails.app_secret || ''}
            onChange={handleAdAccountChange}
            className={styles.profileInput}
            required
            disabled={isBound}
          />
          <input
            type="text"
            name="access_token"
            placeholder="Access Token"
            value={adAccountDetails.access_token || ''}
            onChange={handleAdAccountChange}
            className={styles.profileInput}
            required
            disabled={isBound}
          />
          <button
          onClick={handleAdAccountSave}
          className={`${styles.button} ${styles.primaryButton}`}
          disabled={isBound}
        >
          Save Ad Account settings
        </button>
        </div>
        <div className={styles.section}>
          <h3>Subscription Details</h3>
          <p><strong>Plan:</strong> {subscriptionPlan}</p>
          <p><strong>Running Plan:</strong> {runningPlan}</p>
          <p><strong>Start Date:</strong> {subscriptionStartDate}</p>
          {subscriptionEndDate && (
            <p><strong>End Date:</strong> {subscriptionEndDate}</p>
          )}
          {isActive ? (
            <p><strong>Status:</strong> Active</p>
          ) : (
            <p><strong>Status:</strong> Inactive</p>
          )}
        </div>
      </div>
      <div className={styles.footer}>
        <button onClick={() => navigate('/pricing-section')} className={`${styles.button} ${styles.primaryButton}`}>
            Change Plan
        </button>
        {runningPlan !== 'No active plan' && (
          <button onClick={handleCancelSubscription} className={`${styles.button} ${styles.secondaryButton}`}>
            Cancel Subscription
          </button>
        )}
        {(subscriptionPlan === 'Professional' || subscriptionPlan === 'Enterprise') && runningPlan === 'No active plan' && (
          <button onClick={handleRenewSubscription} className={`${styles.button} ${styles.renewButton}`}>
            Renew Subscription
          </button>
        )}
        <button onClick={onLogout} className={`${styles.button} ${styles.secondaryButton}`}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileManagement;
