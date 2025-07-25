import { useState, useEffect } from 'react';

// Utility for loading Google IMA SDK with fallback mechanisms
export const loadIMASDK = () => {
  return new Promise((resolve, reject) => {
    // Check if IMA is already loaded
    if (window.google && window.google.ima) {
      resolve(window.google.ima);
      return;
    }

    // Try loading the script
    const script = document.createElement('script');
    script.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
    script.async = true;
    
    script.onload = () => {
      if (window.google && window.google.ima) {
        resolve(window.google.ima);
      } else {
        reject(new Error('IMA SDK loaded but not available'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load IMA SDK - likely blocked by ad blocker'));
    };
    
    // Set a timeout in case the script never loads or errors
    const timeout = setTimeout(() => {
      reject(new Error('IMA SDK load timeout'));
    }, 10000);
    
    script.onload = () => {
      clearTimeout(timeout);
      if (window.google && window.google.ima) {
        resolve(window.google.ima);
      } else {
        reject(new Error('IMA SDK loaded but not available'));
      }
    };
    
    document.head.appendChild(script);
  });
};

// Hook for React components
export const useIMASDK = () => {
  const [sdk, setSdk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadIMASDK()
      .then((ima) => {
        setSdk(ima);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  return { sdk, loading, error };
};
