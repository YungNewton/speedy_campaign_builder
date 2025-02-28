import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Combine imports
import ScopedGlobalStyle from './LandingStyles';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../ToastifyOverrides.css';
import config from '../../config';
import CookiePopup from '../CookieModal/CookiePopup';

const apiUrl = config.apiUrl;
const stripePublishableKey = config.stripePublishableKey;

const Landing = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation(); // Initialize useLocation

  const handleHamburgMenuClick = () => {
    document.querySelector('.nav-menu-btn-container').style.right = '0';
  };

  const handleCloseSidebarClick = () => {
    document.querySelector('.nav-menu-btn-container').style.right = '-310px';
  };

  const handleFaqClick = (e) => {
    const faqHeading = e.target.closest('.faq-single-heading');
    if (faqHeading) {
      const desc = faqHeading.nextElementSibling;
      if (desc) {
        if (desc.style.maxHeight === '350px') {
          desc.style.maxHeight = '0';
          faqHeading.querySelector('span').innerText = '+';
        } else {
          desc.style.maxHeight = '350px';
          faqHeading.querySelector('span').innerText = '-';
        }
      }
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      console.log('Creating anonymous checkout session...');
      const response = await axios.post(
        `${apiUrl}/payment/create-anonymous-checkout-session`,
        { plan },
        { withCredentials: true }
      );

      if (response.data.sessionId) {
        console.log('Stripe session created, redirecting to checkout...');
        const stripe = window.Stripe(
          stripePublishableKey
        );
        stripe.redirectToCheckout({ sessionId: response.data.sessionId });
      } else {
        console.error('Failed to create checkout session.');
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error during checkout or login process:', error);
      toast.error('Error: ' + error.message);
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    message: "",
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Simple validation
    if (!formData.fullName || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
  
    setLoading(true);
  
    try {
      // Send structured JSON instead of a single string in "body"
      await axios.post(`${apiUrl}/auth/send-support-email`, {
        name: formData.fullName,
        email: formData.email,
        company: formData.company || "N/A",
        message: formData.message,
      },
      { withCredentials: true }
      );
  
      toast.success("We've received your message!");
  
      // Clear form
      setFormData({ fullName: "", email: "", company: "", message: "" });
    } catch (error) {
      console.error("Email sending error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };  
  
  // Scroll to section if the state contains a target
  useEffect(() => {
    if (location.state?.section) {
      const target = document.getElementById(location.state.section);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state]);

  return (
    <div id="home">
      <ScopedGlobalStyle /> {/* Inject scoped global styles */}
      <nav>
        <img className="back-shadow nav-shadow" src="./assets/nav-shadow.svg" alt="" />
        <a href="/">
          <img className="header-logo" src="./assets/logo-header.png" alt="" />
        </a>
        <svg className="hamburg-menu" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={handleHamburgMenuClick}>
          <path d="M3 6H21M3 12H21M3 18H21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="nav-menu-btn-container">
          <span className="close-sidebar" onClick={handleCloseSidebarClick}>&times;</span>
          <ul>
            <li><a href="#" className="active-tab">Home</a></li>
            <li><a href="#benefit-section">Benefits</a></li>
            <li><a href="#pricing-section">Pricing</a></li>
            <li><a href="#faq-section">FAQ’s</a></li>
            <li><a href="#contact-section">Contact</a></li>
          </ul>
          <div className="nav-btn-container">
            <button onClick={() => navigate('/login')}>Login</button>
            <a className="no-dec" href="#pricing-section">
              <button className="get-started">
                Get Started
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8L22 12M22 12L18 16M22 12H2" stroke="#EEEEEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </a>
          </div>
        </div>
      </nav>
      <CookiePopup />
      <div className="hero">
        <img className="back-shadow hero-mid-shadow" src="./assets/hero-center-shadow.svg" alt="" />
        <img className="back-shadow hero-bottom-shadow" src="./assets/hero-bottom-shadow.svg" alt="" />
        <div className="hero-inner">
          <p className="hero-heading">
            Revolutionize Your Facebook
            <span> Ads Campaigns with Lightning-Fast</span> Creation & Upload
          </p>
          <p className="hero-description">
            Are you tired of spending hours painstakingly building your Facebook
            Ads campaigns, only to be frustrated by sluggish load times and
            endless waiting? Say goodbye to wasted time and hello to
            lightning-fast campaign creation with our groundbreaking software.
          </p>
          <div className="hero-video">
            <video
              src="https://quickcampaignvideos.s3.us-east-1.amazonaws.com/hero-video.mp4"
              playsInline
              poster="./assets/poster2.jpg"
              controls
            ></video>
          </div>
        </div>
      </div>

      <div className="old-new-way-section">
          <div className="divider-line"></div>

          <div className="old-new-way-wrapper">
            <div className="old-new-way-content">
              <h2 className="old-new-way-section-heading">
                The <span>Old Way:</span> Slow, Inefficient Campaign Creation
              </h2>
              <p className="old-new-way-section-desc">
                As a digital marketer, you know the importance of testing multiple creatives to optimize your Facebook Ads performance. But the process of manually creating campaigns, ad sets, and ads is painfully slow. With each click, you're forced to wait for pages to load, eating away at your precious time and productivity.
              </p>
              <div className="arrow-wrapper">
                <img className="connector-line" src="./assets/move-right.svg" alt="Arrow Connector" />
              </div>
            </div>
            <div className="old-new-way-video">
              <video
                className="old-way-video"
                src="https://quick-campaigns.s3.eu-west-2.amazonaws.com/video2.mp4"
                autoPlay
                loop
                muted
                playsInline
              ></video>
            </div>
          </div>

          <div className="old-new-way-wrapper">
            <div className="old-new-way-content">
              <h2 className="old-new-way-section-heading">
                The <span>New Way:</span> Streamlined Campaign Upload From Your Desktop
              </h2>
              <p className="old-new-way-section-desc">
                Our revolutionary software eliminates the frustration of slow campaign creation. With our intuitive desktop application, you can build and upload campaigns at lightning speed, directly from your local PC. No more waiting for pages to load or clicking through endless settings.
              </p>
              <div className="arrow-wrapper">
                <img className="connector-line" src="./assets/move-right.svg" alt="Arrow Connector" />
              </div>
            </div>
            <div className="old-new-way-video">
              <video
                className="new-way-video"
                src="https://quick-campaigns.s3.eu-west-2.amazonaws.com/video3.mp4"
                autoPlay
                loop
                muted
                playsInline
              ></video>
            </div>
          </div>
        </div>
        
      <div id="benefit-section" className="benefit-section">
        <p className="benefit-heading">
          The Benefits: Save <span>Time</span>, Boost <span>Productivity</span>,
          Optimize <span>Performance</span>
        </p>
        <div className="benefit-card-container">
          <div className="benefit-card">
            <div className="benefit-card-wrapper">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.33336 18.6666C5.08105 18.6674 4.83367 18.5967 4.61997 18.4625C4.40626 18.3284 4.23501 18.1364 4.1261 17.9088C4.01718 17.6812 3.97509 17.4273 4.0047 17.1768C4.0343 16.9262 4.1344 16.6892 4.29336 16.4932L17.4934 2.89323C17.5924 2.77893 17.7273 2.7017 17.876 2.6742C18.0247 2.6467 18.1783 2.67058 18.3117 2.7419C18.445 2.81322 18.5501 2.92775 18.6098 3.0667C18.6695 3.20565 18.6801 3.36076 18.64 3.50656L16.08 11.5332C16.0045 11.7353 15.9792 11.9526 16.0062 12.1666C16.0331 12.3805 16.1116 12.5848 16.2348 12.7618C16.3581 12.9388 16.5224 13.0832 16.7137 13.1828C16.9051 13.2823 17.1177 13.3339 17.3334 13.3332H26.6667C26.919 13.3324 27.1664 13.4031 27.3801 13.5373C27.5938 13.6714 27.7651 13.8634 27.874 14.091C27.9829 14.3186 28.025 14.5724 27.9954 14.823C27.9658 15.0736 27.8657 15.3106 27.7067 15.5066L14.5067 29.1066C14.4077 29.2208 14.2728 29.2981 14.1241 29.3256C13.9754 29.3531 13.8217 29.3292 13.6884 29.2579C13.555 29.1866 13.4499 29.072 13.3903 28.9331C13.3306 28.7941 13.3199 28.639 13.36 28.4932L15.92 20.4666C15.9955 20.2645 16.0209 20.0472 15.9939 19.8332C15.9669 19.6192 15.8885 19.415 15.7652 19.238C15.642 19.061 15.4777 18.9165 15.2863 18.817C15.095 18.7175 14.8824 18.6659 14.6667 18.6666H5.33336Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="benefit-card-heading">Lightning-Fast Creation</p>
              <p className="benefit-card-desc">
                Build and launch campaigns in seconds, not hours.
              </p>
            </div>
          </div>
          <div className="benefit-card">
            <div className="benefit-card-wrapper">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.33325 5.33325L14.7599 27.9999L18.1066 18.1466L27.9999 14.7599L5.33325 5.33325Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="benefit-card-heading">Seamless Integration</p>
              <p className="benefit-card-desc">
                Upload directly from your desktop, no more navigating sluggish web
                interfaces.
              </p>
            </div>
          </div>
          <div className="benefit-card">
            <div className="benefit-card-wrapper">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M28 9.33341L9.09338 28.2401C8.38466 28.941 7.42739 29.333 6.43063 29.3305C5.43387 29.328 4.47858 28.9312 3.77338 28.2267C3.06665 27.5192 2.66968 26.5601 2.66968 25.5601C2.66968 24.5601 3.06665 23.6009 3.77338 22.8934L22.6667 4.00008M21.3334 2.66675L29.3334 10.6667M16 21.3334H5.33338" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="benefit-card-heading">Streamlined Testing</p>
              <p className="benefit-card-desc">
                Effortlessly test a large number of creatives to optimize ad
                performance.
              </p>
            </div>
          </div>
          <div className="benefit-card">
            <div className="benefit-card-wrapper">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M29.3333 23.5334L17.1066 29.0801C16.7592 29.2385 16.3818 29.3205 16 29.3205C15.6181 29.3205 15.2407 29.2385 14.8933 29.0801L2.66663 23.5334M29.3333 16.8667L17.1066 22.4134C16.7592 22.5719 16.3818 22.6539 16 22.6539C15.6181 22.6539 15.2407 22.5719 14.8933 22.4134L2.66663 16.8667M17.1066 2.90674C16.7592 2.74827 16.3818 2.66626 16 2.66626C15.6181 2.66626 15.2407 2.74827 14.8933 2.90674L3.46663 8.10674C3.23002 8.21106 3.02886 8.38193 2.88764 8.59854C2.74642 8.81515 2.67123 9.06816 2.67123 9.32674C2.67123 9.58532 2.74642 9.83832 2.88764 10.0549C3.02886 10.2715 3.23002 10.4424 3.46663 10.5467L14.9066 15.7601C15.254 15.9185 15.6314 16.0005 16.0133 16.0005C16.3951 16.0005 16.7725 15.9185 17.12 15.7601L28.56 10.5601C28.7966 10.4557 28.9977 10.2849 29.1389 10.0683C29.2802 9.85165 29.3554 9.59865 29.3554 9.34007C29.3554 9.08149 29.2802 8.82849 29.1389 8.61188C28.9977 8.39527 28.7966 8.22439 28.56 8.12007L17.1066 2.90674Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="benefit-card-heading">Increased Productivity</p>
              <p className="benefit-card-desc">
                Focus on strategy and analysis, not tedious campaign setup.
              </p>
            </div>
          </div>
          <div className="benefit-card">
            <div className="benefit-card-wrapper">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.66675 16.0001C2.66675 16.0001 6.66675 6.66675 16.0001 6.66675C25.3334 6.66675 29.3334 16.0001 29.3334 16.0001C29.3334 16.0001 25.3334 25.3334 16.0001 25.3334C6.66675 25.3334 2.66675 16.0001 2.66675 16.0001Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.0001 20.0001C18.2092 20.0001 20.0001 18.2092 20.0001 16.0001C20.0001 13.7909 18.2092 12.0001 16.0001 12.0001C13.7909 12.0001 12.0001 13.7909 12.0001 16.0001C12.0001 18.2092 13.7909 20.0001 16.0001 20.0001Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="benefit-card-heading">Intuitive Interface</p>
              <p className="benefit-card-desc">
                User-friendly design makes campaign creation a breeze.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="how-works-section">
        <img className="back-shadow how-work-bottom-shadow" src="./assets/how-works-bottom-shadow.svg" alt="" />
        <img className="back-shadow how-work-mid-shadow" src="./assets/how-work-mid-shadow.svg" alt="" />
        <img className="back-shadow how-work-right-shadow" src="./assets/how-works-right-shadow.svg" alt="" />
        <div className="how-work-left">
          <p className="how-work-heading">How <span>QuickCampaigns</span> Works</p>
          <div className="how-work-right">
            <div className="how-works-video">
              <video
                src="https://quickcampaignvideos.s3.us-east-1.amazonaws.com/how-to-video.mp4"
                playsInline
                controls
                poster="./assets/poster1.jpg"
              ></video>
            </div>
          </div>
          <div className="how-works-card-container">
            <div className="how-works-card">
              <div className="how-works-card-wrapper">
                <p className="how-work-card-number">1</p>
                <p className="how-work-card-desc">
                  Connect your Facebook Ad account by following the simple authorization process, ensuring a secure and seamless link to your ad manager.
                </p>
              </div>
            </div>
            <div className="how-works-card">
              <div className="how-works-card-wrapper">
                <p className="how-work-card-number">2</p>
                <p className="how-work-card-desc">
                  Choose whether to start a new campaign or add an ad set to an existing campaign, giving you flexibility based on your current advertising strategy.
                </p>
              </div>
            </div>
            <div className="how-works-card">
              <div className="how-works-card-wrapper">
                <p className="how-work-card-number">3</p>
                <p className="how-work-card-desc">
                  Upload your ad creatives directly from your desktop, set your default ad copy, targeting, and preferences, and quickly build your campaign to streamline future uploads.
                </p>
              </div>
            </div>
            <div className="how-works-card">
              <div className="how-works-card-wrapper">
                <p className="how-work-card-number">4</p>
                <p className="how-work-card-desc">
                  Click upload and watch as the software automatically builds and launches your campaign in seconds, saving you time and eliminating manual effort.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="pricing-section" className="pricing-section">
        <p className="price-heading">
          Choose The <span>Perfect Plan</span> For Your Needs
        </p>
        <p className="price-desc">Flexible Pricing to Suit Every Advertiser</p>
        <div className="price-card-container">
          <div className="price-card">
            <div class="price-card-description-container">
              <p class="price-card-price">$0</p>
              <p class="price-card-accounts">1 Ad Account</p>
              <p class="price-card-plan">Free 1 Day Trial</p>
              <p class="price-card-plan-desc">Try QuickCampaigns Now Risk-Free</p>
            </div>
            <div className="price-card-feature-container">
              <div className="price-card-feature text-free">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#378CE7" fillOpacity="0.7" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.0964 7.39016L9.93638 14.3002L8.03638 12.2702C7.68638 11.9402 7.13638 11.9202 6.73638 12.2002C6.34638 12.4902 6.23638 13.0002 6.47638 13.4102L8.72638 17.0702C8.94638 17.4102 9.32638 17.6202 9.75638 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#EEEEEE" />
                </svg>
                Upload ads to 1 ad account <br />
              </div>
              <div className="price-card-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#378CE7" fillOpacity="0.7" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.0964 7.39016L9.93638 14.3002L8.03638 12.2702C7.68638 11.9402 7.13638 11.9202 6.73638 12.2002C6.34638 12.4902 6.23638 13.0002 6.47638 13.4102L8.72638 17.0702C8.94638 17.4102 9.32638 17.6202 9.75638 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#EEEEEE" />
                </svg>
                Experience full feature access during the trial.
              </div>
              <div className="price-card-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#378CE7" fillOpacity="0.7" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.0964 7.39016L9.93638 14.3002L8.03638 12.2702C7.68638 11.9402 7.13638 11.9202 6.73638 12.2002C6.34638 12.4902 6.23638 13.0002 6.47638 13.4102L8.72638 17.0702C8.94638 17.4102 9.32638 17.6202 9.75638 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#EEEEEE" />
                </svg>
                Test the software risk-free before committing.
              </div>
            </div>
            <button className="price-start-btn" onClick={() => handleSubscribe('Free Trial')}>Get Started</button>
          </div>
          <div className="price-card popular-plan">
            <div className="popular-plan-wrapper">
              <p>Most Popular</p>
              <svg width="70" height="58" viewBox="0 0 70 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M38.5158 9.90098C25.6315 17.6818 18.4779 31.9119 14.1785 45.8289C13.9575 46.5441 13.6873 47.2619 13.4404 47.9605C12.75 46.5676 8.03917 34.9998 6.13728 35.707C5.02576 36.1204 5.66158 37.6059 5.90619 38.2052C7.67675 42.5372 9.40645 46.4209 11.522 50.6102C13.1143 53.7639 16.0773 52.9418 19.0123 51.9819C23.4934 50.5165 23.8571 50.0963 28.4466 48.4097C29.203 48.1315 29.9979 47.9067 30.699 47.5593C31.5233 47.1502 32.4071 46.2845 31.9695 45.341C31.4735 44.2716 30.3945 44.3471 29.4728 44.7397C29.2803 44.8222 29.0849 44.8977 28.8877 44.9686C26.7215 45.7463 16.8895 49.8951 16.562 49.1937C16.4515 48.9575 16.4888 48.6827 16.5306 48.4255C17.7342 41.0033 20.9214 33.9331 24.6866 27.4731C27.2199 23.126 30.4713 19.1994 34.2601 15.8874C37.3047 13.2258 40.7371 10.966 44.4762 9.40628C48.4857 7.73348 52.366 7.38881 56.6492 7.13439C59.1151 6.98817 57.162 4.63891 55.7901 4.37429C54.2823 4.08303 52.668 4.60609 51.2031 4.91103C46.5692 5.87811 42.3375 7.59325 38.5158 9.90098Z" fill="#5356FF" />
              </svg>
            </div>
            <div class="price-card-description-container">
              <p className="price-card-price">$129.95/Month</p>
              <p className="price-card-accounts">1 Ad Account</p>
              <p className="price-card-plan">Professional Plan</p>
              <p className="price-card-plan-desc">
                Perfect for Individual Advertisers and Small Teams
              </p>
            </div>
            <div className="price-card-feature-container">
              <div className="price-card-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#378CE7" fillOpacity="0.7" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.0964 7.39016L9.93638 14.3002L8.03638 12.2702C7.68638 11.9402 7.13638 11.9202 6.73638 12.2002C6.34638 12.4902 6.23638 13.0002 6.47638 13.4102L8.72638 17.0702C8.94638 17.4102 9.32638 17.6202 9.75638 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#EEEEEE" />
                </svg>
                Upload unlimited ads to 1 ad account.
              </div>
              <div className="price-card-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#378CE7" fillOpacity="0.7" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.0964 7.39016L9.93638 14.3002L8.03638 12.2702C7.68638 11.9402 7.13638 11.9202 6.73638 12.2002C6.34638 12.4902 6.23638 13.0002 6.47638 13.4102L8.72638 17.0702C8.94638 17.4102 9.32638 17.6202 9.75638 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#EEEEEE" />
                </svg>
                Perfect for solo marketers and small teams.
              </div>
              <div className="price-card-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#378CE7" fillOpacity="0.7" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.0964 7.39016L9.93638 14.3002L8.03638 12.2702C7.68638 11.9402 7.13638 11.9202 6.73638 12.2002C6.34638 12.4902 6.23638 13.0002 6.47638 13.4102L8.72638 17.0702C8.94638 17.4102 9.32638 17.6202 9.75638 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#EEEEEE" />
                </svg>
                Access all features and customization tools.
              </div>
              <div className="price-card-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#378CE7" fillOpacity="0.7" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.0964 7.39016L9.93638 14.3002L8.03638 12.2702C7.68638 11.9402 7.13638 11.9202 6.73638 12.2002C6.34638 12.4902 6.23638 13.0002 6.47638 13.4102L8.72638 17.0702C8.94638 17.4102 9.32638 17.6202 9.75638 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#EEEEEE" />
                </svg>
                Receive dedicated support for ad management.
              </div>
            </div>
            <button className="price-start-btn" onClick={() => handleSubscribe('Professional')}>Get Started</button>
          </div>
          <div className="price-card popular-plan enterprise-plan">
            <div className="popular-plan-wrapper enterprise-plan-wrapper">
              <p>Best Value</p>
              <svg width="70" height="58" viewBox="0 0 70 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M38.5158 9.90098C25.6315 17.6818 18.4779 31.9119 14.1785 45.8289C13.9575 46.5441 13.6873 47.2619 13.4404 47.9605C12.75 46.5676 8.03917 34.9998 6.13728 35.707C5.02576 36.1204 5.66158 37.6059 5.90619 38.2052C7.67675 42.5372 9.40645 46.4209 11.522 50.6102C13.1143 53.7639 16.0773 52.9418 19.0123 51.9819C23.4934 50.5165 23.8571 50.0963 28.4466 48.4097C29.203 48.1315 29.9979 47.9067 30.699 47.5593C31.5233 47.1502 32.4071 46.2845 31.9695 45.341C31.4735 44.2716 30.3945 44.3471 29.4728 44.7397C29.2803 44.8222 29.0849 44.8977 28.8877 44.9686C26.7215 45.7463 16.8895 49.8951 16.562 49.1937C16.4515 48.9575 16.4888 48.6827 16.5306 48.4255C17.7342 41.0033 20.9214 33.9331 24.6866 27.4731C27.2199 23.126 30.4713 19.1994 34.2601 15.8874C37.3047 13.2258 40.7371 10.966 44.4762 9.40628C48.4857 7.73348 52.366 7.38881 56.6492 7.13439C59.1151 6.98817 57.162 4.63891 55.7901 4.37429C54.2823 4.08303 52.668 4.60609 51.2031 4.91103C46.5692 5.87811 42.3375 7.59325 38.5158 9.90098Z" fill="#5356FF" />
              </svg>
            </div>
            <p className="price-card-price">$99.5/Month</p>
            <p className="price-card-accounts">
              For 2 or more ad accounts, with pricing per account.
            </p>
            <p className="price-card-plan">Enterprise plan</p>
            <p className="price-card-plan-desc">Ideal for Agencies and Businesses</p>
            <div className="price-card-feature-container">
              <div className="price-card-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#378CE7" fillOpacity="0.7" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.0964 7.39016L9.93638 14.3002L8.03638 12.2702C7.68638 11.9402 7.13638 11.9202 6.73638 12.2002C6.34638 12.4902 6.23638 13.0002 6.47638 13.4102L8.72638 17.0702C8.94638 17.4102 9.32638 17.6202 9.75638 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#EEEEEE" />
                </svg>
                Upload unlimited ads to multiple ad accounts.
              </div>
              <div className="price-card-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#378CE7" fillOpacity="0.7" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.0964 7.39016L9.93638 14.3002L8.03638 12.2702C7.68638 11.9402 7.13638 11.9202 6.73638 12.2002C6.34638 12.4902 6.23638 13.0002 6.47638 13.4102L8.72638 17.0702C8.94638 17.4102 9.32638 17.6202 9.75638 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#EEEEEE" />
                </svg>
                Perfect for agencies and businesses.
              </div>
              <div className="price-card-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#378CE7" fillOpacity="0.7" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.0964 7.39016L9.93638 14.3002L8.03638 12.2702C7.68638 11.9402 7.13638 11.9202 6.73638 12.2002C6.34638 12.4902 6.23638 13.0002 6.47638 13.4102L8.72638 17.0702C8.94638 17.4102 9.32638 17.6202 9.75638 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#EEEEEE" />
                </svg>
                Access all features and customization tools.
              </div>
              <div className="price-card-feature">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="12" fill="#378CE7" fillOpacity="0.7" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.0964 7.39016L9.93638 14.3002L8.03638 12.2702C7.68638 11.9402 7.13638 11.9202 6.73638 12.2002C6.34638 12.4902 6.23638 13.0002 6.47638 13.4102L8.72638 17.0702C8.94638 17.4102 9.32638 17.6202 9.75638 17.6202C10.1664 17.6202 10.5564 17.4102 10.7764 17.0702C11.1364 16.6002 18.0064 8.41016 18.0064 8.41016C18.9064 7.49016 17.8164 6.68016 17.0964 7.38016V7.39016Z" fill="#EEEEEE" />
                </svg>
                Receive dedicated support for ad management.
              </div>
            </div>
            <button className="price-start-btn" onClick={() => handleSubscribe('Enterprise')}>Get Started</button>
          </div>
        </div>
      </div>


      <div id="review-section" className="customer-say-section">
        <p className="customer-say-heading">What Our Customers Say</p>
        <div className="customer-say-container">
          <div className="single-customer-say">
            <div>
              <img src="./assets/star.svg" alt="" />
              <img src="./assets/star.svg" alt="" />
              <img src="./assets/star.svg" alt="" />
              <img src="./assets/star.svg" alt="" />
              <img src="./assets/star.svg" alt="" />
            </div>
            <p>
              This software has been a game-changer for our agency. We can now
              test hundreds of ad creatives in the time it used to take us to set
              up a single campaign. The results speak for themselves - our
              clients' ROAS has skyrocketed. <span>" Sarah -</span>
              <span>Digital Marketing Agency Owner</span>
            </p>
          </div>
          <div className="single-customer-say">
            <div>
              <img src="./assets/star.svg" alt="" />
              <img src="./assets/star.svg" alt="" />
              <img src="./assets/star.svg" alt="" />
              <img src="./assets/star.svg" alt="" />
              <img src="./assets/star.svg" alt="" />
            </div>
            <p>
              As a solo entrepreneur, time is my most valuable resource. This tool
              has saved me countless hours and allowed me to scale my Facebook Ads
              quickly and efficiently. It's a must-have for any serious marketer.”
              <span>" John -</span>
              <span> E-commerce Entrepreneur</span>
            </p>
          </div>
        </div>
      </div>

      <div className="get-start-section">
        <img className="back-shadow get-start-shadow" src="./assets/get-start-shadow.svg" alt="" />
        <img className="back-shadow money-back-shadow" src="./assets/money-back-shadow.svg" alt="" />
        <div className="get-start-wrapper get-start-wrapper-first">
          <p className="get-start-heading">Get Started Today</p>
          <p className="get-start-desc">
            Ready to revolutionize your Facebook Ads campaigns? Sign up now and
            experience the power of lightning-fast campaign creation. Say goodbye
            to wasted time and hello to increased productivity and performance.
          </p>
          <a className="no-dec" href="#pricing-section">
          <button className="get-start-btn">
            Buy Now
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8L22 12M22 12L18 16M22 12H2" stroke="#EEEEEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          </a>
        </div>
        <div className="get-start-wrapper get-start-wrapper-last">
          <p className="get-start-heading">30-Day Money-Back Guarantee</p>
          <p className="get-start-desc">
            We're confident you'll love our software, but if for any reason you're
            not satisfied, we offer a 30-day money-back guarantee. Try it
            risk-free today.
          </p>
        </div>
      </div>

      <div id="faq-section" className="faq-section">
        <p className="faq-heading">Frequently Asked Question</p>
        <p className="faq-desc">Ask everything you need to know about our products</p>
        <div className="faqs-container">
          <div className="faq">
            <p className="faq-single-heading" onClick={handleFaqClick}>
              How does the software connect to my ad accounts? <span>+</span>
            </p>
            <p className="faq-single-desc">
              Our software securely connects to your Facebook ad accounts via
              Facebook's official API. During the setup process, you will be
              guided through a simple authorization procedure, ensuring that your
              ad account credentials and data remain private and secure.
            </p>
          </div>
          <div className="faq">
            <p className="faq-single-heading" onClick={handleFaqClick}>
              Is the software easy to use? <span>+</span>
            </p>
            <p className="faq-single-desc">
              Yes! Our intuitive interface makes campaign creation a breeze, even
              for beginners.
            </p>
          </div>
          <div className="faq">
            <p className="faq-single-heading" onClick={handleFaqClick}>
              Can I use this for existing campaigns? <span>+</span>
            </p>
            <p className="faq-single-desc">
              Absolutely. You can easily add new creatives to your existing
              campaigns or create new ones from scratch.
            </p>
          </div>
          <div className="faq">
            <p className="faq-single-heading" onClick={handleFaqClick}>
              What formats does the software support? <span>+</span>
            </p>
            <p className="faq-single-desc">
              Our software supports all standard image and video formats accepted
              by Facebook Ads.
            </p>
          </div>
          <div className="faq">
            <p className="faq-single-heading" onClick={handleFaqClick}>
              How much time can I expect to save? <span>+</span>
            </p>
            <p className="faq-single-desc">
              Our users report saving hours per week on campaign creation, freeing
              up time for strategy and optimization.
            </p>
          </div>
        </div>
      </div>

      {/* <div className="have-que-section">
        <img className="back-shadow have-que-left-shadow" src="./assets/have-que-left-shadow.svg" alt="" />
        <img className="back-shadow have-que-right-shadow" src="./assets/have-que-right-shadow.svg" alt="" />
        <div className="have-que-inner">
          <p>
            Have questions or need a personalized demo? Our team is here to help!
            Schedule a call now.
          </p>
          <div className="book-btn-box">
            <img className="back-shadow have-que-btn-shadow" src="./assets/have-que-btn-shadow.svg" alt="" />
            <button>
              Book A Call Now
              <svg width="22" height="10" viewBox="0 0 22 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 1L21 5M21 5L17 9M21 5H1" stroke="#EEEEEE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div> */}

      <div className="affiliate-section">
        {/* Background images */}
        <div className="affiliate-bg">
          <img className="affiliate-bg-img get-start-shadow" src="./assets/get-start-shadow.svg" alt="" />
          <img className="affiliate-bg-img money-back-shadow" src="./assets/money-back-shadow.svg" alt="" />
        </div>
        <h2>
          Become a QuickCampaigns Affiliate <br className="desktop-break" />
          And Earn 30% Recurring Commissions!
        </h2>
        <p>
          Refer customers to QuickCampaigns and earn 30% recurring commissions on every payment they make. 
          Build a stream of passive income as your referrals continue using the service!
        </p>

        {/* Cards */}
        <div className="affiliate-cards">
          {/* Card 1 */}
          <div className="affiliate-card">
            <p className="affiliate-card-number">1</p>
            <h3>Sign Up</h3>
            <p>It’s quick, easy, and free to join. Simply fill out a short form, and 
              you’ll get instant access to your affiliate dashboard and referral link.</p>
          </div>

          {/* Card 2 */}
          <div className="affiliate-card">
            <p className="affiliate-card-number">2</p>
            <h3>Share Link</h3>
            <p>Promote QuickCampaigns to your audience through your blog, website, or 
              social media channels.</p>
          </div>

          {/* Card 3 */}
          <div className="affiliate-card">
            <p className="affiliate-card-number">3</p>
            <h3>Earn Commissions</h3>
            <p>Earn 30% of every customer’s monthly payments for as long as they stay active users.</p>
          </div>
        </div>

        {/* Sign Up Button */}
        <button className="affiliate-signup-btn">
          Sign Up Now
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8L22 12M22 12L18 16M22 12H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div id="contact-section" className="contact-us-section">
        <p className="contact-us-heading">Contact Us</p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <p className="send-msg-heading">Send us a message</p>

          <div>
            <label>Full name</label>
            <br />
            <input type="text" name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} />
          </div>

          <div>
            <label>Email address</label>
            <br />
            <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
          </div>

          <div>
            <label>Company</label>
            <br />
            <input type="text" name="company" placeholder="Enter your Company Name" value={formData.company} onChange={handleChange} />
          </div>

          <div>
            <label>Write your message</label>
            <br />
            <textarea name="message" rows="3" placeholder="Write Your Question Here..." value={formData.message} onChange={handleChange}></textarea>
          </div>

          <button className="contact-send-msg" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      <footer>
        <div className="footer-first-col">
          <a href="/">
            <img className="footer-logo" src="./assets/logo-footer.png" alt="" />
          </a>
          <p className="footer-logo-desc">
            Our software intelligently creates campaigns, ad sets, and ads based
            on your selected folders and default settings.
          </p>
        </div>
        <div className="footer-column-container footer-second-col">
          <div>
            <p>Pages</p>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="#benefit-section">Benefits</a></li>
              <li><a href="#pricing-section">Pricing</a></li>
              <li><a href="#review-section">Reviews</a></li>
              <li><a href="#faq-section">FAQ’s</a></li>
            </ul>
          </div>
          <div>
            <p>Help</p>
            <ul>
              <li><a href="#contact-section">Contact</a></li>
              <li><a href="/terms-of-service">Terms & Conditions</a></li>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/refund-policy">Refund Policy</a></li>
              <li><a href="/deletion-policy">Data Deletion Policy</a></li>
              <li><a href="/cookies-policy">Cookies Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-third-col">
          <p>Newsletter</p>
          <input type="text" placeholder="Enter your email" />
          <br />
          <button className="subscribe-btn">Subscribe Now</button>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
