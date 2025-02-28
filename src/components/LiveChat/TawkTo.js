import React, { useEffect } from 'react';

const TawkTo = () => {
  useEffect(() => {
    // Create the script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://embed.tawk.to/67be3945915e62190b0dfc0e/1ikvgvdpq';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Append the script to the document body (or head)
    document.body.appendChild(script);

    // Optionally, cleanup by removing the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // This component doesn't render any visible element.
  return null;
};

export default TawkTo;
