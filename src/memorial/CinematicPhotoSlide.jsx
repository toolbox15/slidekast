import React from 'react';

export const CinematicPhotoSlide = ({ photo, frame, opacity, isEntering }) => {
  // If your file has existing interpolate scales or timings, leave them here.
  
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        zIndex: 5
      }}
    >
      {/* FORCE BREAKOUT ENFORCER FRAME */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px', // Dynamic 2px auto-adjust out from photo edge
          border: '1px solid rgba(217,191,141,0.35)', // Thin gold line accent
          backgroundColor: '#161f23',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          borderRadius: '4px',
          width: 'fit-content', // Strictly prohibits horizontal wing stretching
          height: 'fit-content',
          maxWidth: '85vw',
          maxHeight: '62vh',
        }}
      >
        <img
          src={photo?.image_url}
          alt=""
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '62vh',
            objectFit: 'contain',
            borderRadius: '2px',
          }}
        />
      </div>

      {/* TEXT POSITIONED SAFELY BELOW THE BREAKOUT FRAME */}
      {photo?.caption && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              color: '#f8fafc',
              fontFamily: 'Georgia, serif',
              fontSize: '28px',
              fontStyle: 'italic',
              textShadow: '0 2px 8px rgba(0,0,0,0.7)',
            }}
          >
            {photo.caption}
          </p>
        </div>
      )}
    </div>
  );
};