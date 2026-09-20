// src/plumbing/components/TrustProofOverlay.tsx

import React from 'react';
import {
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

interface ReviewItem {
  client: string;
  name: string;
  rating: string;
  location: string;
  quote: string;
  tagIcon: string;
  tagText: string;
}

const reviewsData: ReviewItem[] = [
  {
    client: 'Strike Plumbing',
    name: 'Danielle R.',
    rating: '5.0 ★★★★★',
    location: 'Oak Park, IL',
    quote:
      'Water was pouring under our sink. Strike arrived quickly, fixed the leak on the spot, and cleaned up completely.',
    tagIcon: '⚡',
    tagText: 'Fixed Right Away',
  },
  {
    client: 'Strike Plumbing',
    name: 'Marcus T.',
    rating: '5.0 ★★★★★',
    location: 'Chicago, IL',
    quote:
      'Basement drain backed up late at night. Strike arrived fast, gave upfront pricing, and cleared the blockage.',
    tagIcon: '⚡',
    tagText: 'Emergency Relief',
  },
  {
    client: 'Strike Plumbing',
    name: 'Robert M.',
    rating: '5.0 ★★★★★',
    location: 'Berwyn, IL',
    quote:
      'Water heater quit suddenly. Honest options, zero surprise diagnostic charges, and running hot again fast.',
    tagIcon: '⚡',
    tagText: 'Upfront Pricing',
  },
  {
    client: 'Strike Plumbing',
    name: 'Nicole S.',
    rating: '5.0 ★★★★★',
    location: 'Cicero, IL',
    quote:
      'Recurring drain problems solved. They ran an inline camera, showed the root clog, and fixed it same day.',
    tagIcon: '📹',
    tagText: 'Camera Diagnosis',
  },
];

interface TrustProofOverlayProps {
  startFrame?: number;
  sfxVolume?: number;
}

export const TrustProofOverlay: React.FC<TrustProofOverlayProps> = ({
  startFrame = 0,
  sfxVolume = 0.28,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Initial Scene 3 text flying off to the left
  const exitProgress = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const flyOutX = interpolate(exitProgress, [0, 1], [0, -1100]);
  const flyOutOpacity = interpolate(exitProgress, [0, 0.8], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 2. White 60% expanding radial frost circle
  const rippleScale = interpolate(frame, [10, 28], [0, 2.8], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rippleOpacity = interpolate(frame, [10, 28], [0, 0.65], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 3. Scene Exit Horizontal Card Flip (Frames 132 to 144) — Flips open to the left like turning a card over
  const sceneExitProgress = interpolate(frame, [132, 144], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitRotateY = interpolate(sceneExitProgress, [0, 1], [0, -90]);
  const exitTranslateX = interpolate(sceneExitProgress, [0, 1], [0, -40]);

  // CARD 1: Intro spotlight, then drop to row 3 (Y = 1380)
  const c1Intro = spring({
    frame: Math.max(0, frame - 24),
    fps,
    config: { damping: 15, mass: 0.7, stiffness: 140 },
  });

  const c1DropProgress = interpolate(frame, [48, 64], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const c1DropSpring = spring({
    frame: Math.max(0, frame - 48),
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 110 },
  });
  const c1Y = interpolate(c1DropSpring, [0, 1], [500, 1380]);
  const c1Rotate = interpolate(c1DropProgress, [0, 0.5, 1], [0, -10, 0]);
  const c1Scale = interpolate(c1DropProgress, [0, 1], [1.0, 0.94]);

  // CARD 2: Marcus T. falls into row 2 (Y = 1000)
  const c2Spring = spring({
    frame: Math.max(0, frame - 68),
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 130 },
  });
  const c2Y = interpolate(c2Spring, [0, 1], [-260, 1000]);
  const c2Opacity = interpolate(frame, [68, 74], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // CARD 3: Robert M. falls into row 1 (Y = 620)
  const c3Spring = spring({
    frame: Math.max(0, frame - 88),
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 130 },
  });
  const c3Y = interpolate(c3Spring, [0, 1], [-260, 620]);
  const c3Opacity = interpolate(frame, [88, 94], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // CARD 4: Nicole S. falls into row 0 (Y = 240)
  const c4Spring = spring({
    frame: Math.max(0, frame - 108),
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 130 },
  });
  const c4Y = interpolate(c4Spring, [0, 1], [-260, 240]);
  const c4Opacity = interpolate(frame, [108, 114], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const renderReviewRow = (
    rev: ReviewItem,
    yPos: number,
    scaleVal: number,
    opacityVal: number,
    rotDeg: number = 0
  ) => {
    return (
      <div
        style={{
          position: 'absolute',
          top: yPos,
          left: 60,
          width: 960,
          transform: `scale(${scaleVal}) rotate(${rotDeg}deg)`,
          transformOrigin: 'center center',
          opacity: opacityVal,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        {/* Customer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              style={{
                fontFamily: 'Montserrat, Arial, sans-serif',
                fontSize: 44,
                fontWeight: 900,
                color: '#0f172a',
                textShadow: '0 2px 8px rgba(255, 255, 255, 1)',
              }}
            >
              {rev.name}
            </span>
            <span
              style={{
                fontSize: 30,
                color: '#f59e0b',
                fontWeight: 900,
                filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2))',
              }}
            >
              {rev.rating}
            </span>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              borderRadius: 24,
              padding: '8px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 6px 16px rgba(2, 132, 199, 0.35)',
            }}
          >
            <span style={{ fontSize: 22, color: '#ffffff' }}>{rev.tagIcon}</span>
            <span
              style={{
                fontFamily: 'Montserrat, Arial, sans-serif',
                fontSize: 22,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}
            >
              {rev.tagText}
            </span>
          </div>
        </div>

        {/* Location subline */}
        <div
          style={{
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 26,
            fontWeight: 800,
            color: '#0284c7',
            letterSpacing: '0.5px',
          }}
        >
          📍 {rev.location}
        </div>

        {/* Big high-contrast quote */}
        <div
          style={{
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1.35,
            color: '#0f172a',
            textShadow: '0 2px 8px rgba(255, 255, 255, 1)',
            marginTop: 4,
          }}
        >
          “{rev.quote}”
        </div>

        <div
          style={{
            width: '100%',
            height: 3,
            backgroundColor: 'rgba(2, 132, 199, 0.35)',
            marginTop: 10,
          }}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1080,
        height: 1920,
        pointerEvents: 'none',
        zIndex: 60,
        overflow: 'hidden',
        perspective: 1400,
      }}
    >
      {/* Soft wind swoosh sequences */}
      <Sequence from={24} durationInFrames={18}>
        <Audio src={staticFile('clients/strike_plumbing/audio/sfx/swoosh.wav')} volume={sfxVolume} />
      </Sequence>
      <Sequence from={48} durationInFrames={18}>
        <Audio src={staticFile('clients/strike_plumbing/audio/sfx/swoosh.wav')} volume={sfxVolume} />
      </Sequence>
      <Sequence from={68} durationInFrames={18}>
        <Audio src={staticFile('clients/strike_plumbing/audio/sfx/swoosh.wav')} volume={sfxVolume} />
      </Sequence>
      <Sequence from={88} durationInFrames={18}>
        <Audio src={staticFile('clients/strike_plumbing/audio/sfx/swoosh.wav')} volume={sfxVolume} />
      </Sequence>
      <Sequence from={108} durationInFrames={18}>
        <Audio src={staticFile('clients/strike_plumbing/audio/sfx/swoosh.wav')} volume={sfxVolume} />
      </Sequence>

      {/* Fly-off text from Scene 3 */}
      {frame < 16 && (
        <div
          style={{
            position: 'absolute',
            top: 960,
            left: 5,
            width: 1080,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            transform: `translateX(${flyOutX}px)`,
            opacity: flyOutOpacity,
          }}
        >
          <div
            style={{
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontSize: 44,
              fontWeight: 900,
              color: '#ffffff',
            }}
          >
            DRAIN CLEARING • CAMERA INSPECTION
          </div>
        </div>
      )}

      {/* White Frosted Ripple Circle */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 1300,
          height: 1300,
          marginLeft: -650,
          marginTop: -650,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          opacity: rippleOpacity,
          transform: `scale(${rippleScale})`,
          filter: 'blur(40px)',
        }}
      />

      {/* Master 3D Wrapper: Horizontal card flip revealing Scene 5 directly behind */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          transform: `perspective(1400px) rotateY(${exitRotateY}deg) translateX(${exitTranslateX}px)`,
          transformOrigin: 'left center',
          opacity: 1,
        }}
      >
        {/* Danielle R. (Spotlights, tilts, drops to Row 3) */}
        {frame >= 24 &&
          renderReviewRow(
            reviewsData[0],
            c1Y,
            c1Scale * Math.min(1, c1Intro),
            Math.min(1, (frame - 24) / 4),
            c1Rotate
          )}

        {/* Marcus T. (Row 2) */}
        {frame >= 68 && renderReviewRow(reviewsData[1], c2Y, 0.94, c2Opacity)}

        {/* Robert M. (Row 1) */}
        {frame >= 88 && renderReviewRow(reviewsData[2], c3Y, 0.94, c3Opacity)}

        {/* Nicole S. (Row 0) */}
        {frame >= 108 && renderReviewRow(reviewsData[3], c4Y, 0.94, c4Opacity)}
      </div>
    </div>
  );
};