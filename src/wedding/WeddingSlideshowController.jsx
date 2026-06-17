import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getInputProps, useCurrentFrame, staticFile } from 'remotion';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import { interpolate, spring, useVideoConfig } from 'remotion';
import { buildSmartWeddingTimeline, calculateSlideOpacity } from './weddingUtils';

// ==========================================
// 1. UNIFIED WEDDING DISPLAY INTERSTITIAL & PHOTO PLAYER
// ==========================================
const WeddingPhotoPlayer = ({ item, opacity, liveEventId }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const videoRef = useRef(null);

  // Auto-play insurance guard for stubborn browsers
  useEffect(() => {
    if (item.type === 'welcome' && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log("Browser autoplay blocked or postponed video engagement safely:", err);
      });
    }
  }, [item.type]);

  // Handle Welcome Interstitial Video Rendering State
  if (item.type === 'welcome') {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `https://slidekast.vercel.app/${liveEventId}`
    )}&color=0-0-0&bgcolor=ffffff`;

    return (
      <div 
        style={{ 
          position: 'absolute',
          inset: 0,
          backgroundColor: '#0c0f12', // Matches your exact luxury theme color if asset pauses
          overflow: 'hidden',
          opacity: opacity,
          zIndex: 10
        }}
      >
        {/* Full-bleed Video utilizing standard public folder routing and secure layout flags */}
        <video
          ref={videoRef}
          src="/Wedding1/welcome-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          webkit-playsinline="true"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1
          }}
        />

        {/* Left Box Overlay: Centering QR Code inside your gold frame overlay */}
        <div 
          style={{
            position: 'absolute',
            left: '37.8%',  
            top: '53.5%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            width: '272px',
            height: '272px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 0 40px rgba(215, 180, 106, 0.4)'
          }}
        >
          <img 
            src={qrCodeUrl} 
            alt="Scan QR Code" 
            style={{ width: '90%', height: '90%', objectFit: 'contain' }} 
          />
        </div>

        {/* Right Area: Gold Text Instructions Container Layout */}
        <div 
          style={{
            position: 'absolute',
            right: '4%',
            top: '32%',
            width: '42%',
            height: '55%',
            zIndex: 5,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}
        >
          <div style={{
            color: '#d9bf8d',
            fontFamily: 'Georgia, serif',
            fontSize: '3.3rem',
            textAlign: 'center',
            lineHeight: '1.4',
            fontWeight: 'bold',
            textShadow: '0 4px 12px rgba(0,0,0,0.9)'
          }}>
            <p style={{ margin: '0 0 20px 0', color: '#d9bf8d' }}>Welcome Friends & Family</p>
            <p style={{ color: '#ffffff', fontSize: '2.4rem', fontStyle: 'italic', margin: 0 }}>
              Scan the QR Code to share your photos and blessings directly to this live screen!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- STANDARD GUEST PHOTO RENDER BLOCK ---
  const messageText = item.photo?.message_text || item.photo?.message || 'Cheers to the beautiful couple!';
  const senderName = item.photo?.sender_name || item.photo?.sender || 'Wedding Guest';
  const imgUrl = item.photo?.imageUrl || item.photo?.image_url || '';

  const [typedMessage, setTypedMessage] = useState('');
  const motionScale = interpolate(frame, [0, 300], [1.0, 1.07], { extrapolateRight: 'clamp' });
  const motionTranslateY = interpolate(frame, [0, 300], [0, -12], { extrapolateRight: 'clamp' });
  const entranceSpring = spring({ frame, fps, config: { damping: 16 } });

  useEffect(() => {
    let charIndex = 0;
    setTypedMessage('');
    const intervalDuration = (1000 / fps) * 3.0; 

    const typerInterval = setInterval(() => {
      if (charIndex <= messageText.length) {
        setTypedMessage(messageText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typerInterval);
      }
    }, intervalDuration);

    return () => clearInterval(typerInterval);
  }, [messageText, fps]);

  if (!imgUrl) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(45px) brightness(16%)', transform: 'scale(1.15)', zIndex: 1, opacity: opacity }} />
      <div style={{ width: '65%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2, padding: '40px 30px', boxSizing: 'border-box', transform: `scale(${entranceSpring})`, opacity: opacity }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.85)' }}>
          <img src={imgUrl} alt="Live Wedding Stream" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${motionScale}) translateY(${motionTranslateY}px)` }} />
        </div>
      </div>
      <div style={{ width: '35%', height: '100%', background: 'linear-gradient(to right, rgba(12, 15, 18, 0.98), rgba(6, 8, 10, 1.0))', borderLeft: '4px solid rgba(217, 191, 141, 0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '0 35px 40px 35px', boxSizing: 'border-box', zIndex: 5, textAlign: 'center', position: 'relative' }}>
        <img src="/Wedding1/gold-divider.png" alt="" style={{ width: 'calc(100% - 4px)', height: 'auto', marginTop: '2px', marginBottom: '50px', mixBlendMode: 'screen', opacity: 0.95, flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '25px' }}>
          <img src="/Wedding1/couple-profile.png" style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #d9bf8d', boxShadow: '0 12px 24px rgba(0,0,0,0.4)' }} alt="Bride and Groom" />
        </div>
        <span style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', fontSize: '3.0rem', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '24px', textShadow: '3px 3px 6px rgba(0,0,0,0.6)' }}>{senderName}</span>
        <p style={{ color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '2.8rem', margin: 0, fontStyle: 'italic', fontWeight: '600', lineHeight: '1.4', maxWidth: '95%', textShadow: '2px 2px 5px rgba(0,0,0,0.9)' }}>{typedMessage ? `"${typedMessage}"` : ""}</p>
      </div>
    </div>
  );
};

// ==========================================
// 2. TIMELINE LOOP & DATABASE SYNC ENGINE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCMQA0SGLYMq2lf0zSr8NQA_JrNDBFSAmk",
  authDomain: "elite-event-network.firebaseapp.com",
  projectId: "elite-event-network",
  storageBucket: "elite-event-network.appspot.com",
  messagingSenderId: "118072539772",
  appId: "1:118072539772:web:0b9451cdf0387cfc3da7f9"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export const WeddingSlideshowController = () => {
  const remotionProps = getInputProps();
  const currentFrame = useCurrentFrame();
  const [liveGuestUploads, setLiveGuestUploads] = useState([]);
  const [dbStatus, setDbStatus] = useState('Initializing pipeline...');
  const previousDataHashRef = useRef('');

  const liveEventId = useMemo(() => {
    if (remotionProps && remotionProps.liveEventId) return remotionProps.liveEventId;
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    return pathSegments[0] || 'smith-wedding-2026';
  }, [remotionProps]);

  useEffect(() => {
    setDbStatus(`Connecting path: events/${liveEventId}/receptionStream...`);
    const targetCollectionRef = collection(db, 'events', liveEventId, 'receptionStream');
    const q = query(targetCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedPhotos = [];
      let incomingDataString = '';

      if (snapshot.empty) {
        setDbStatus(`Connected! Stream active but channel folder is completely empty.`);
      } else {
        setDbStatus(`Connected! Active document pool found.`);
      }

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.imageUrl && !data.image_url) return;

        updatedPhotos.push({ id: doc.id, photo: data });
        incomingDataString += `${doc.id}-${data.image_url || data.imageUrl || ''}-${data.message_text || data.message || ''};`;
      });
      
      if (incomingDataString !== previousDataHashRef.current) {
        previousDataHashRef.current = incomingDataString;
        setLiveGuestUploads(updatedPhotos);
      }
    }, (error) => {
      console.error("Firestore stream error: ", error);
      setDbStatus(`Firestore Connection Denied: ${error.message}`);
    });

    return () => unsubscribe();
  }, [liveEventId]);

  const timeline = useMemo(() => {
    return buildSmartWeddingTimeline([], liveGuestUploads, currentFrame);
  }, [liveGuestUploads, currentFrame]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#000' }}>
      {/* Visual Diagnostic Tracker */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 9999, background: 'rgba(0,0,0,0.9)', color: '#d9bf8d', padding: '12px 18px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', border: '1px solid rgba(217,191,141,0.4)', letterSpacing: '0.5px' }}>
        ⚙️ SYSTEM CORE TRACE: {dbStatus}
      </div>

      {timeline && timeline.items && timeline.items.map((item) => {
        let opacity = 1;
        try { 
          opacity = calculateSlideOpacity(item, currentFrame); 
          if (isNaN(opacity) || opacity <= 0) return null;
        } catch (e) { 
          opacity = 1; 
        }

        return (
          <WeddingPhotoPlayer 
            key={item.id} 
            item={item} 
            opacity={opacity} 
            liveEventId={liveEventId}
          />
        );
      })}
    </div>
  );
};