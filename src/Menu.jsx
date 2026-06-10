import { AbsoluteFill, Video, staticFile, Loop } from 'remotion';
import React from 'react';

export const Menu = (props) => {
  const {
    isLocked = false,
    headerText = "TONY'S BAR",
    headerSubtext = 'EATS & DRINKS',
    headerTop = 60,
    headerLeft = 460,
    headerWidth = 600,
    headerScale = 1.0,
    imageTop = 450,
    imageLeft = 580,
    imageWidth = 380,
    imageHeight = 460,
    foodHeading = 'EATS',
    foodTop = 260,
    foodLeft = 80,
    foodWidth = 600,
    foodSize = 26,
    cocktailsHeading = 'DRINKS',
    cocktailsTop = 260,
    cocktailsLeft = 840,
    cocktailsWidth = 610,
    cocktailsSize = 26,
    cocktailItems = [],
    foodItems = []
  } = props;

  if (isLocked) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#0c0202', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ padding: '50px', border: '4px solid #ff1a1a', backgroundColor: '#000', textAlign: 'center', boxShadow: '0 0 50px #ff0000' }}>
          <h1 style={{ color: '#ff1a1a', fontSize: '64px', fontWeight: '900', margin: '0' }}>STATUS: LOCKED</h1>
          <p style={{ color: '#fff', fontSize: '20px', marginTop: '15px' }}>PLEASE CONTACT SYSTEM ADMINISTRATOR</p>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#05070c', fontFamily: 'sans-serif', color: 'white', overflow: 'hidden' }}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="black-to-transparent" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              3 3 3 0 -0.08"
          />
        </filter>
      </svg>
      
      {/* ATMOSPHERIC BACKGROUND VIDEO */}
      <Loop durationInFrames={300}>
        <Video 
          src={staticFile('menu-bg.mp4')} 
          muted 
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', opacity: 0.2, zIndex: 1 }} 
        />
      </Loop>

      {/* MAIN BAR MENU BOARD */}
      <div style={{ position: 'absolute', width: '1920px', height: '1080px', zIndex: 2 }}>
        
        {/* MASSIVE HEADER AT THE TOP CENTER */}
        <div style={{
          position: 'absolute',
          top: `${headerTop}px`,
          left: `${headerLeft}px`,
          transform: `scale(${headerScale})`,
          transformOrigin: 'top center',
          border: '3px solid #ffffff',
          borderRadius: '4px',
          padding: '15px 60px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          textAlign: 'center',
          width: `${headerWidth}px`,
          boxShadow: '0 0 20px rgba(255,255,255,0.1)'
        }}>
          <h1 style={{ margin: 0, fontSize: '48px', fontWeight: '900', letterSpacing: '6px', color: '#fff' }}>{headerText}</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px', color: '#a1a1aa' }}>{headerSubtext}</p>
        </div>

        {/* COMPOSITED BLENDED VIDEO CONTAINER (POURING WINE/ bubbles) */}
        <div style={{ 
          position: 'absolute', 
          top: `${imageTop}px`, 
          left: `${imageLeft}px`, 
          width: `${imageWidth}px`, 
          height: `${imageHeight}px`, 
          zIndex: 3,
          pointerEvents: 'none'
        }}>
          <Video 
            src={staticFile('wine-pour-animation.mp4')} 
            muted 
            loop 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              backgroundColor: 'transparent',
              mixBlendMode: 'screen',
              filter: 'url(#black-to-transparent) brightness(1.45) contrast(1.35) saturate(1.15)'
            }} 
          />
        </div>

        {/* EATS COLUMN (LEFT SIDE OF THE SPLIT) */}
        <div style={{ position: 'absolute', top: `${foodTop}px`, left: `${foodLeft}px`, width: `${foodWidth}px` }}>
          <h2 style={{ color: '#38bdf8', fontSize: `${foodSize + 10}px`, fontWeight: '900', letterSpacing: '3px', borderBottom: '3px solid #38bdf8', paddingBottom: '8px', margin: '0 0 25px 0' }}>{foodHeading}</h2>
          {foodItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '25px' }}>
              <span style={{ fontSize: `${foodSize}px`, fontWeight: '700', letterSpacing: '1px' }}>{item.name}</span>
              <div style={{ flexGrow: 1, borderBottom: '2px dotted rgba(56, 189, 248, 0.2)', margin: '0 15px' }}></div>
              <span style={{ fontSize: `${foodSize + 2}px`, fontWeight: '900', color: '#38bdf8' }}>{item.price}</span>
            </div>
          ))}
        </div>

        {/* DRINKS COLUMN (RIGHT SIDE OF THE SPLIT) */}
        <div style={{ position: 'absolute', top: `${cocktailsTop}px`, left: `${cocktailsLeft}px`, width: `${cocktailsWidth}px` }}>
          <h2 style={{ color: '#ec4899', fontSize: `${cocktailsSize + 10}px`, fontWeight: '900', letterSpacing: '3px', borderBottom: '3px solid #ec4899', paddingBottom: '8px', margin: '0 0 25px 0' }}>{cocktailsHeading}</h2>
          {cocktailItems.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: `${cocktailsSize}px`, fontWeight: '700', letterSpacing: '1px' }}>{item.name}</span>
                <div style={{ flexGrow: 1, borderBottom: '2px dotted rgba(236, 72, 153, 0.2)', margin: '0 15px' }}></div>
                <span style={{ fontSize: `${cocktailsSize + 2}px`, fontWeight: '900', color: '#ec4899' }}>{item.price}</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: `${cocktailsSize - 6}px`, marginTop: '6px', lineHeight: '1.4' }}>{item.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </AbsoluteFill>
  );
};
