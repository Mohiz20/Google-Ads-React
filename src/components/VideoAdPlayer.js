import { useEffect, useRef, useState } from 'react';

const VideoAdPlayer = () => {
  const videoRef = useRef(null);
  const adDisplayRef = useRef(null);
  const [adsManager, setAdsManager] = useState(null);
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [adError, setAdError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [isClient, setIsClient] = useState(false);
  const [adDisplayContainer, setAdDisplayContainer] = useState(null);
  const [adCompleted, setAdCompleted] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isClient) return;

    let checkInterval;
    let timeoutId;
    let attemptCount = 0;
    const maxAttempts = 50; // 5 seconds with 100ms intervals

    const checkForIMA = () => {
      attemptCount++;
      setLoadingStatus(`Checking for IMA SDK... (attempt ${attemptCount}/${maxAttempts})`);
      
      console.log(`IMA Check ${attemptCount}:`, {
        windowGoogle: !!window.google,
        googleIma: !!(window.google && window.google.ima),
        fullPath: window.google?.ima,
        videoReady: !!videoRef.current,
        adDisplayReady: !!adDisplayRef.current
      });

      if (window.google && window.google.ima && videoRef.current && adDisplayRef.current) {
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
        setLoadingStatus('IMA SDK found! Initializing ads...');
        // Add a small delay to ensure DOM is fully ready
        setTimeout(initializeAds, 100);
        return;
      }

      if (attemptCount >= maxAttempts) {
        clearInterval(checkInterval);
        setAdError('Google IMA SDK failed to load after 5 seconds. This is likely due to an ad blocker or network issue.');
        setLoadingStatus('Failed to load');
      }
    };

    const initializeAds = () => {
      try {
        setLoadingStatus('Setting up IMA configuration...');
        
        // Ensure all required elements are available
        if (!videoRef.current || !adDisplayRef.current) {
          throw new Error('Video or ad display container not ready');
        }

        // Initialize the SDK settings
        if (window.google.ima.settings) {
          window.google.ima.settings.setVpaidMode(window.google.ima.ImaSdkSettings.VpaidMode.INSECURE);
          window.google.ima.settings.setLocale('en');
          window.google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);
        }
        
        // Create ad display container
        const container = new window.google.ima.AdDisplayContainer(
          adDisplayRef.current,
          videoRef.current
        );
        
        setAdDisplayContainer(container);
        
        // Initialize the container
        container.initialize();
        
        requestAdsFromContainer(container, 0);
      } catch (error) {
        console.error('Ads initialization error:', error);
        setAdError('Failed to initialize ads: ' + error.message);
        setLoadingStatus('Initialization failed');
      }
    };

    // Start checking immediately, then every 100ms
    checkForIMA();
    checkInterval = setInterval(checkForIMA, 100);

    // Fallback timeout
    timeoutId = setTimeout(() => {
      clearInterval(checkInterval);
      if (!adsLoaded && !adError) {
        setAdError('Timeout: Google IMA SDK did not load within 10 seconds');
        setLoadingStatus('Timeout');
      }
    }, 10000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeoutId);
      if (adsManager) {
        try {
          adsManager.destroy();
        } catch (e) {
          console.warn('Error destroying ads manager:', e);
        }
      }
    };
  }, [isClient]);

  // Function to request ads from container
  const requestAdsFromContainer = (container, adTagIndex = 0, autoPlay = false) => {
    try {
      setLoadingStatus('Requesting ads...');
      setAdError(null);
      setAdCompleted(false);
      
      // Multiple ad tags to fallback to if one fails (only Google-hosted to avoid CORS)
      const adTags = [
        // Google's test ad tag (primary)
        'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=' + Math.random(),
        
        // Alternative Google test ad: VMAP sample
        'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ct%3Dredirectlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=' + Math.random(),
        
        // Google single preroll skippable
        'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_preroll_skippable&sz=640x480&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=' + Math.random()
      ];
      
      const adsRequest = new window.google.ima.AdsRequest();
      adsRequest.adTagUrl = adTags[adTagIndex] || adTags[0];
      adsRequest.linearAdSlotWidth = 640;
      adsRequest.linearAdSlotHeight = 480;
      adsRequest.nonLinearAdSlotWidth = 640;
      adsRequest.nonLinearAdSlotHeight = 150;
      
      const adsLoader = new window.google.ima.AdsLoader(container);
      
      adsLoader.addEventListener(
        window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        (adsManagerLoadedEvent) => {
          console.log('Ads manager loaded event received');
          const manager = adsManagerLoadedEvent.getAdsManager(videoRef.current);
          setAdsManager(manager);
          setAdsLoaded(true);
          setLoadingStatus('Ready to play ads!');
          
          // Add event listeners
          manager.addEventListener(window.google.ima.AdErrorEvent.Type.AD_ERROR, (adErrorEvent) => {
            console.error('Ad error:', adErrorEvent.getError());
            setAdError(adErrorEvent.getError().getMessage());
            setLoadingStatus('Ad error occurred');
            manager.destroy();
            setAdsManager(null);
            setAdsLoaded(false);
          });
          
          manager.addEventListener(window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => {
            console.log('Content pause requested');
            videoRef.current?.pause();
          });
          
          manager.addEventListener(window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => {
            console.log('Content resume requested');
            videoRef.current?.play();
          });
          
          manager.addEventListener(window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED, () => {
            console.log('All ads completed');
            setLoadingStatus('All ads completed');
            setAdCompleted(true);
            manager.destroy();
            setAdsManager(null);
            setAdsLoaded(false);
          });
          
          manager.addEventListener(window.google.ima.AdEvent.Type.LOADED, () => {
            console.log('Ad loaded');
            setLoadingStatus('Ad loaded and ready');
          });
          
          manager.addEventListener(window.google.ima.AdEvent.Type.STARTED, () => {
            console.log('Ad started');
            setLoadingStatus('Ad is playing...');
          });
          
          // Auto-play if requested
          if (autoPlay) {
            try {
              console.log('Auto-playing ad');
              manager.init(640, 480, window.google.ima.ViewMode.NORMAL);
              manager.start();
            } catch (playError) {
              console.error('Error auto-playing ad:', playError);
            }
          }
        },
        false
      );
      
      adsLoader.addEventListener(
        window.google.ima.AdErrorEvent.Type.AD_ERROR,
        (adErrorEvent) => {
          console.error('Ad error:', adErrorEvent.getError());
          const error = adErrorEvent.getError();
          const errorCode = error.getErrorCode();
          
          // Handle specific error codes
          if (errorCode === 303 && adTagIndex < adTags.length - 1) {
            // No ads available, try next ad tag
            console.log(`No ads available for tag ${adTagIndex}, trying next...`);
            setLoadingStatus(`No ads available, trying alternative source ${adTagIndex + 2}...`);
            setTimeout(() => {
              requestAdsFromContainer(container, adTagIndex + 1);
            }, 1000);
          } else {
            // All ad tags failed or different error
            let errorMessage = error.getMessage() || 'Unknown ad error';
            if (errorCode === 303) {
              errorMessage = 'No ads available from any source. This is common with test ads - try again later.';
            }
            setAdError(errorMessage);
            setLoadingStatus('Ad error occurred');
          }
        },
        false
      );
      
      adsLoader.requestAds(adsRequest);
    } catch (error) {
      console.error('Error requesting ads:', error);
      setAdError('Failed to request ads: ' + error.message);
      setLoadingStatus('Request failed');
    }
  };

  const playAds = () => {
    if (adsManager && videoRef.current) {
      try {
        console.log('Starting ads playback');
        setLoadingStatus('Starting ads...');
        
        // Initialize ads manager with proper dimensions
        adsManager.init(640, 480, window.google.ima.ViewMode.NORMAL);
        adsManager.start();
        
      } catch (error) {
        console.error('Error playing ads:', error);
        setAdError('Failed to play ads: ' + error.message);
        setLoadingStatus('Failed to start ads');
      }
    } else {
      console.warn('Ads manager or video not ready');
      setAdError('Ads manager or video player not ready');
    }
  };

  // Function to load new ads manually
  const loadNewAds = () => {
    if (adDisplayContainer) {
      requestAdsFromContainer(adDisplayContainer, 0, false); // Start with first ad tag and do not auto-play
    } else {
      setAdError('Ad container not available');
    }
  };

  // Add a manual retry function
  const retryLoad = () => {
    setAdError(null);
    setAdsLoaded(false);
    setAdCompleted(false);
    setLoadingStatus('Retrying...');
    setAdsManager(null);
    window.location.reload();
  };

  // Show loading state during SSR or before client initialization
  if (!isClient) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '15px' }}>Video Ad Player Example</h2>
        <div style={{ 
          background: '#f0f0f0', 
          padding: '20px', 
          textAlign: 'center',
          borderRadius: '8px'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '15px' }}>Video Ad Player Example</h2>
      
      {/* Debug info */}
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        marginBottom: '10px',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#333'
      }}>
        <strong>Debug Info:</strong><br/>
        IMA SDK Available: {typeof window !== 'undefined' && window.google?.ima ? '✅ Yes' : '❌ No'}<br/>
        Video Ready: {videoRef.current ? '✅ Yes' : '❌ No'}<br/>
        Ad Container Ready: {adDisplayRef.current ? '✅ Yes' : '❌ No'}<br/>
        Ads Manager Ready: {adsManager ? '✅ Yes' : '❌ No'}<br/>
        Status: {loadingStatus}<br/>
        Browser: {typeof navigator !== 'undefined' && navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'}
      </div>
      
      {adError && (
        <div style={{ 
          background: '#fee', 
          border: '1px solid #fcc', 
          padding: '10px', 
          color: 'black',
          marginBottom: '10px',
          borderRadius: '4px'
        }}>
          <strong>Ad Error:</strong> {adError}
          
          {/* Specific help for common errors */}
          {adError.includes('No ads available') && (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px', 
              background: '#fff3cd', 
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <strong>💡 This is normal:</strong> Test ad servers often run out of ads. Try:
              <br/>• Wait a few minutes and try again
              <br/>• Refresh the page completely
            </div>
          )}
          
          <br/>
          <button 
            onClick={retryLoad}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Retry
          </button>
        </div>
      )}
      
      <div style={{ 
        position: 'relative', 
        background: '#000',
        marginBottom: '10px',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <video
          ref={videoRef}
          width="640"
          height="480"
          controls
          style={{ display: 'block', width: '100%', height: 'auto' }}
          onLoadedMetadata={() => console.log('Video metadata loaded')}
          onCanPlay={() => console.log('Video can play')}
        >
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div
          ref={adDisplayRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        />
      </div>
      
      {/* Modify button controls to only have 'Load Ads' and 'Play Ads' */}
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {!adsLoaded && (
          <button
            onClick={loadNewAds}
            disabled={!adDisplayContainer}
            style={{
              padding: '8px 16px',
              backgroundColor: adDisplayContainer ? '#2196F3' : '#cccccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: adDisplayContainer ? 'pointer' : 'not-allowed'
            }}
          >
            Load Ads
          </button>
        )}

        {adsLoaded && !adCompleted && (
          <button
            onClick={playAds}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Play Ads
          </button>
        )}
      </div>

      {/* Success message */}
      {adCompleted && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: '#d4edda', 
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          color: 'black',
          fontSize: '12px'
        }}>
          ✅ <strong>Success!</strong> Ad played successfully. Click "Load New Ads" to prepare the next ad.
        </div>
      )}

      {/* Troubleshooting tips */}
      {!adsLoaded && !adError && !adCompleted && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          color: 'black',
          fontSize: '12px'
        }}>
          <strong>Troubleshooting:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Check if you have an ad blocker enabled (most common cause)</li>
            <li>Try opening in incognito/private mode</li>
            <li>Check browser console for network errors</li>
            <li>Some corporate networks block ad-related domains</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VideoAdPlayer;