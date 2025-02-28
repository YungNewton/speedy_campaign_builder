const config = {
    apiUrl: process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5000',
    facebookAdsApiUrl: process.env.REACT_APP_FACEBOOK_ADS_API_URL || 'http://localhost:5001',
    stripePublishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QnhAEBslQSg03TDdge0w2PmG8DqkMwCQjl0t20l8wtHh2QcrAmqFSRJgJTnspMjXwYBO4rHWP2Rihb6tOFjm5aI00Um2LTewe',
    appId: process.env.REACT_APP_APP_ID || '1153977715716035',
    appSecret: process.env.REACT_APP_APP_SECRET || '30d73e973e26535fc1e445f2e0b16cb7',
  };
  
  export default config;
  