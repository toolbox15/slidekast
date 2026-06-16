// src/wedding/WeddingSlideshowController.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getInputProps, useCurrentFrame, staticFile } from 'remotion';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import { interpolate, spring, useVideoConfig } from 'remotion';
import { buildSmartWeddingTimeline, calculateSlideOpacity } from './weddingUtils';

// ==========================================
// 1. UNIFIED WEDDING DISPLAY PLAYER
// ==========================================
const WeddingPhotoPlayer = ({ item, opacity }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Internal local states to anchor the typewriter text safely inside this instance
  const messageText = item.photo.message_text || 'Cheers to the beautiful couple!';
  const senderName = item.photo.sender_name || 'Wedding Guest';

  // State to hold the progressively typed string text
  const [typedMessage, setTypedMessage] = useState('');

  // Running local layout calculations
  const motionScale = interpolate(frame, [0, 300], [1.0, 1.07], { extrapolateRight: 'clamp' });
  const motionTranslateY = interpolate(frame, [0, 300], [0, -12], { extrapolateRight: 'clamp' });
  const entranceSpring = spring({ frame, fps, config: { damping: 16 } });

  // RUN TYPEWRITER DIRECTLY PER COMPONENT INSTANCE LIFECYCLE
  useEffect(() => {
    let charIndex = 0;
    setTypedMessage(''); // Clear out any residual text instantly on mount

    // 3.0 frames per character at 30fps is roughly 10 characters typed per second
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

  if (!item || !item.photo) return null;

  return (
    <div 
      style={{ 
        position: 'absolute',
        inset: 0,
        display: 'flex', 
        flexDirection: 'row', // Restores full-width side-by-side proportions
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#000000',
        overflow: 'hidden'
      }}
    >
      {/* Ambient Backdrop Blur (Transitions gracefully) */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${item.photo.image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(45px) brightness(16%)',
          transform: 'scale(1.15)', 
          zIndex: 1,
          opacity: opacity
        }}
      />

      {/* Left Column: Full-Scale Secure Photo Viewport (65% Width restored) */}
      <div style={{ 
        width: '65%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        zIndex: 2,
        padding: '40px 30px',
        boxSizing: 'border-box',
        transform: `scale(${entranceSpring})`,
        opacity: opacity
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden', 
          borderRadius: '16px',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.85)'
        }}>
          <img 
            src={item.photo.image_url} 
            alt="Live Wedding Stream" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain', 
              transform: `scale(${motionScale}) translateY(${motionTranslateY}px)`,
            }}
          />
        </div>
      </div>

      {/* Right Column: Permanent Sidebar Display Profile Area (35% Width restored) */}
      <div 
        style={{ 
          width: '35%', 
          height: '100%', 
          background: 'linear-gradient(to right, rgba(12, 15, 18, 0.98), rgba(6, 8, 10, 1.0))',
          borderLeft: '4px solid rgba(217, 191, 141, 0.5)', 
          display: 'flex',
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'flex-start', 
          padding: '0 35px 40px 35px', 
          boxSizing: 'border-box',
          zIndex: 5,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Luxury Gold Header Decorative Divider Filigree */}
        <img 
          src={staticFile('Wedding1/gold-divider.png')} 
          alt=""
          style={{
            width: 'calc(100% - 4px)', 
            height: 'auto',
            marginTop: '2px', 
            marginBottom: '50px',
            mixBlendMode: 'screen', 
            opacity: 0.95,
            flexShrink: 0
          }}
        />

        {/* Curated Couple Profile Circle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '25px' }}>
          <img 
            src={staticFile('Wedding1/couple-profile.png')} 
            style={{ 
              width: '140px', 
              height: '140px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '4px solid #d9bf8d',
              boxShadow: '0 12px 24px rgba(0,0,0,0.4)'
            }} 
            alt="Bride and Groom" 
          />
        </div>

        {/* Guest Identity Heading Label */}
        <span style={{ 
          color: '#d9bf8d', 
          fontFamily: 'Georgia, serif', 
          fontSize: '3.0rem', 
          fontWeight: 'bold', 
          display: 'block',
          letterSpacing: '1px',
          marginBottom: '24px',
          textShadow: '3px 3px 6px rgba(0,0,0,0.6)'
        }}>
          {senderName}
        </span>

        {/* Guest Text Message Block with Synchronized Multi-Slide Typewriter Processing */}
        <p style={{ 
          color: '#ffffff', 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '2.8rem', 
          margin: 0, 
          fontStyle: 'italic',
          fontWeight: '600', 
          lineHeight: '1.4',
          maxWidth: '95%',
          textShadow: '2px 2px 5px rgba(0,0,0,0.9)'
        }}>
          {typedMessage ? `"${typedMessage}"` : ""}
        </p>
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

const MOCK_BASE_COUPLE_PHOTOS = [
  { image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200', message_text: 'Cheers to the beautiful couple!', sender_name: 'Wedding Guest' },
  { image_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200', message_text: 'Wishing you a lifetime of love!', sender_name: 'Wedding Guest' }
];

export const WeddingSlideshowController = () => {
  const { liveEventId } = getInputProps();
  const currentFrame = useCurrentFrame();
  const [liveGuestUploads, setLiveGuestUploads] = useState([]);
  const previousDataHashRef = useRef('');

  useEffect(() => {
    const targetCollectionRef = collection(db, 'events', liveEventId || 'smith-wedding-2026', 'receptionStream');
    const q = query(targetCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedPhotos = [];
      let incomingDataString = '';

      snapshot.forEach((doc) => {
        const data = doc.data();
        updatedPhotos.push({ id: doc.id, photo: data });
        incomingDataString += `${doc.id}-${data.image_url || ''}-${data.message_text || ''};`;
      });
      
      if (incomingDataString !== previousDataHashRef.current) {
        previousDataHashRef.current = incomingDataString;
        setLiveGuestUploads(updatedPhotos);
      }
    }, (error) => {
      console.error("Firestore stream error: ", error);
    });

    return () => unsubscribe();
  }, [liveEventId]);

  const timeline = useMemo(() => {
    try {
      return buildSmartWeddingTimeline(MOCK_BASE_COUPLE_PHOTOS, liveGuestUploads, currentFrame);
    } catch (e) {
      const rawItems = liveGuestUploads.length > 0 ? liveGuestUploads : MOCK_BASE_COUPLE_PHOTOS;
      const normalizedItems = rawItems.map((item, index) => {
        if (item.photo) return item;
        return { id: item.id || `fallback-${index}`, photo: item };
      });
      return { items: normalizedItems };
    }
  }, [liveGuestUploads, currentFrame]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#000' }}>
      {timeline && timeline.items && timeline.items.map((item) => {
        let opacity = 1;
        try { opacity = calculateSlideOpacity(item, currentFrame); } catch (e) { opacity = 1; }
        if (opacity <= 0) return null; 

        return (
          <WeddingPhotoPlayer 
            key={item.id} 
            item={item} 
            opacity={opacity} 
          />
        );
      })}
    </div>
  );
};