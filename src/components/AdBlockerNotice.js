import { useState, useEffect } from 'react';

const AdBlockerNotice = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Simple test to detect if ads are being blocked
    const testElement = document.createElement('div');
    testElement.innerHTML = '&nbsp;';
    testElement.className = 'adsbox';
    testElement.style.position = 'absolute';
    testElement.style.left = '-10000px';
    document.body.appendChild(testElement);

    setTimeout(() => {
      if (testElement.offsetHeight === 0) {
        setIsBlocked(true);
        setShowNotice(true);
      }
      document.body.removeChild(testElement);
    }, 100);
  }, []);

  if (!showNotice) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#ff6b6b',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <strong>⚠️ Ad Blocker Detected</strong>
      <p style={{ margin: '5px 0', fontSize: '11px' }}>
        Ad blocker is preventing Google IMA SDK from loading. 
        For development, please disable ad blocker or whitelist this domain.
      </p>
      <button 
        onClick={() => setShowNotice(false)}
        style={{
          background: 'transparent',
          border: '1px solid white',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        Dismiss
      </button>
    </div>
  );
};

export default AdBlockerNotice;
