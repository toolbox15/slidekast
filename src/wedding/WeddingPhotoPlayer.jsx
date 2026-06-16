// src/wedding/WeddingPhotoPlayer.jsx
import React from 'react';
import { interpolate, spring, useVideoConfig, useCurrentFrame, staticFile } from 'remotion';

const WeddingPhotoPlayer = ({ item, opacity }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  if (!item || !item.photo) return null;

  // 1. Ken Burns Smooth Zoom Drift (Calibrated to exactly 10 seconds / 300 frames)
  const motionScale = interpolate(frame, [0, 300], [1.0, 1.07], {
    extrapolateRight: 'clamp',
  });
  
  const motionTranslateY = interpolate(frame, [0, 300], [0, -12], {
    extrapolateRight: 'clamp',
  });

  // 2. Elegantly pop the photo frame into view on arrival
  const entranceSpring = spring({
    frame: frame,
    fps,
    config: { damping: 16 },
  });

  // 3. Typewriter Effect Logic
  const message = item.photo.message_text || 'Cheers to the beautiful couple!';
  const typingSpeed = 3.0; // 3.0 frames per character = normal pace
  const charsToShow = Math.floor(frame / typingSpeed);
  
  const displayedMessage = opacity < 1 ? "" : message.slice(0, charsToShow);
  const currentSenderName = opacity < 1 ? "" : (item.photo.sender_name || 'Wedding Guest');

  return (
    <div 
      style={{ 
        position: 'absolute',
        inset: 0,
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#000000',
        overflow: 'hidden',
        zIndex: opacity > 0.9 ? 10 : 1 
      }}
    >
      {/* Ambient Backdrop Blur */}
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

      {/* Left Column: Secure Photo Viewport */}
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
        
        {/* Mask Wrapper to Lock Motion Inside the Bounds */}
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
          
          {/* Moving Foreground Photo */}
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

      {/* Right Column: High-Visibility Sidebar */}
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
        
        {/* Luxury Gold Header */}
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

        {/* Curated Couple Gallery Circle */}
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

        {/* Guest Name Heading */}
        <span style={{ 
          color: '#d9bf8d', 
          fontFamily: 'Georgia, serif', 
          fontSize: '3.0rem', 
          fontWeight: 'bold', 
          display: 'block',
          letterSpacing: '1px',
          marginBottom: '24px',
          textShadow: '3px 3px 6px rgba(0,0,0,0.6)',
          height: '4rem', 
          visibility: currentSenderName ? 'visible' : 'hidden'
        }}>
          {currentSenderName}
        </span>

        {/* Big Guest Text Message Block */}
        <p style={{ 
          color: '#ffffff', 
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '2.8rem', 
          margin: 0, 
          fontStyle: 'italic',
          fontWeight: '600', 
          lineHeight: '1.4',
          maxWidth: '95%',
          textShadow: '2px 2px 5px rgba(0,0,0,0.9)',
          visibility: displayedMessage ? 'visible' : 'hidden'
        }}>
          {displayedMessage ? `"${displayedMessage}"` : ""}
        </p>

      </div>
    </div>
  );
};

// CRITICAL EXPORT MATCH FIX
export default WeddingPhotoPlayer;