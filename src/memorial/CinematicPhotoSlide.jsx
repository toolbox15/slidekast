import React from 'react';

const slideInterpolate = (value, inputRange, outputRange) => {
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;
  if (value <= inputMin) return outputMin;
  if (value >= inputMax) return outputMax;
  const percentage = (value - inputMin) / (inputMax - inputMin);
  return outputMin + percentage * (outputMax - outputMin);
};

export const CinematicPhotoSlide = ({ photo, frame, slideIndex = 0, opacity }) => {
  // Determine layout variations based on the slide number loop
  const isEveryThird = (slideIndex + 1) % 3 === 0; // Slide 3, 6, 9...
  const isOddIndex = slideIndex % 2 !== 0;        // Slide 2, 4, 6...

  // --- ANIMATION TIMINGS ---
  // Base entries
  const basePhotoOpacity = slideInterpolate(frame, [0, 15], [0, 1]);
  const baseTextOpacity = slideInterpolate(frame, [12, 28], [0, 1]);

  // Layout 1 & 2: Side-by-Side Staggered Math
  const leftToRightX = slideInterpolate(frame, [0, 25], [-40, 0]);
  const rightToLeftX = slideInterpolate(frame, [12, 38], [50, 0]);

  // Layout 3: Centerpiece Zoom Math
  const centerScale = slideInterpolate(frame, [0, 180], [0.96, 1.03]); // Beautiful slow breathing zoom

  // --- CONDITIONAL LAYOUT GENERATOR ---
  
  // VARIATION 3: THE CENTERPIECE (Every 3rd Slide)
  if (isEveryThird) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity,
          display: 'flex',
          flexDirection: 'column', // Stacks vertically
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '40px',
          boxSizing: 'border-box',
          width: '100vw',
          height: '100%',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 'fit-content',
            height: 'fit-content',
            padding: '2px',
            border: '1px solid rgba(217,191,141,0.35)',
            backgroundColor: '#161f23',
            boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
            borderRadius: '4px',
            maxWidth: '85vw',
            transform: `scale(${centerScale})`,
            opacity: basePhotoOpacity,
          }}
        >
          <img
            src={photo?.image_url}
            alt=""
            style={{ display: 'block', maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain', borderRadius: '2px' }}
          />
        </div>
        {photo?.caption && (
          <div style={{ textAlign: 'center', opacity: baseTextOpacity }}>
            <p style={{ margin: 0, color: '#f8fafc', fontFamily: 'Georgia, serif', fontSize: '32px', fontStyle: 'italic', textShadow: '0 2px 10px rgba(0,0,0,0.65)' }}>
              {photo.caption}
            </p>
          </div>
        )}
      </div>
    );
  }

  // VARIATION 1 & 2: SIDE-BY-SIDE SIDE SWAPS
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        display: 'flex',
        flexDirection: isOddIndex ? 'row-reverse' : 'row', // Flips layout side based on index!
        alignItems: 'center',
        justifyContent: 'center',
        gap: '60px',
        padding: '0 80px',
        boxSizing: 'border-box',
        width: '100vw',
        height: '100%',
      }}
    >
      {/* PHOTO BLOCK */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 'fit-content',
          height: 'fit-content',
          padding: '2px',
          border: '1px solid rgba(217,191,141,0.35)',
          backgroundColor: '#161f23',
          boxShadow: '0 25px 60px rgba(0,0,0,0.65)',
          borderRadius: '4px',
          maxWidth: '55vw',
          // If odd, slides in from right. If even, slides in from left.
          transform: `translateX(${isOddIndex ? -rightToLeftX : leftToRightX}px)`,
          opacity: basePhotoOpacity,
        }}
      >
        <img
          src={photo?.image_url}
          alt=""
          style={{ display: 'block', maxWidth: '100%', maxHeight: '76vh', objectFit: 'contain', borderRadius: '2px' }}
        />
      </div>

      {/* TEXT CAPTION BLOCK */}
      {photo?.caption && (
        <div 
          style={{ 
            maxWidth: '32vw', 
            textAlign: isOddIndex ? 'right' : 'left', // Aligns text cleanly to match the swapped side
            // Text movement opposes the image entry vector for cinematic tension
            transform: `translateX(${isOddIndex ? -leftToRightX : rightToLeftX}px)`,
            opacity: baseTextOpacity,
          }}
        >
          <p
            style={{
              margin: 0,
              color: '#f8fafc',
              fontFamily: 'Georgia, serif',
              fontSize: '36px',
              fontStyle: 'italic',
              lineHeight: '1.35',
              textShadow: '0 2px 10px rgba(0,0,0,0.65)',
            }}
          >
            {photo.caption}
          </p>
        </div>
      )}
    </div>
  );
};