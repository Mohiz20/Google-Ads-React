import Head from "next/head";
import Script from "next/script";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import AdBlockerNotice from "@/components/AdBlockerNotice";
import VideoAdPlayer from "@/components/VideoAdPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [imaLoaded, setImaLoaded] = useState(false);

  const handleImaLoad = () => {
    setImaLoaded(true);
    console.log('Google IMA SDK loaded successfully');
  };

  const handleImaError = () => {
    console.log('Failed to load Google IMA SDK - likely blocked by ad blocker');
  };

  return (
    <>
      <AdBlockerNotice />
      <Script
        src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"
        strategy="afterInteractive"
        onLoad={handleImaLoad}
        onError={handleImaError}
      />
      <Head>
        <title>Google IMA Ads Demo</title>
        <meta name="description" content="Google IMA SDK integration demo with video ads" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Temporary CSP bypass for development */}
        {process.env.NODE_ENV === 'development' && (
          <meta httpEquiv="Content-Security-Policy" content="script-src 'self' 'unsafe-eval' 'unsafe-inline' https: http:; object-src 'none';" />
        )}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
        style={{
          display: 'block',
          padding: '20px',
          minHeight: '100vh'
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px'
        }}>
          <h1 style={{ marginBottom: '10px', fontSize: '2rem' }}>Google IMA Ads Demo</h1>
          <p style={{ marginBottom: '30px', fontSize: '1.1rem' }}>
            IMA SDK Status: {imaLoaded ? '✅ Loaded' : '⏳ Loading...'}
          </p>
          
          <VideoAdPlayer />
        </div>
      </div>
    </>
  );
}
