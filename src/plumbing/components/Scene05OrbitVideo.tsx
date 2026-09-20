// src/plumbing/components/Scene05OrbitVideo.tsx

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

interface Scene05OrbitVideoProps {
  blurAmount?: number;
  overlayOpacity?: number;
}

export const Scene05OrbitVideo: React.FC<Scene05OrbitVideoProps> = ({
  blurAmount = 14,
  overlayOpacity = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Frames 0-76 contain the clean forward pan (before the AI ghost/dissolve)
  const CLEAN_SPAN_SECONDS = 76 / fps;

  // Oscillates forward to 50% duration, then smoothly reverses
  const progress = interpolate(
    frame % durationInFrames,
    [0, durationInFrames / 2, durationInFrames],
    [0, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const currentVideoTime = progress * CLEAN_SPAN_SECONDS;

  return (
    <AbsoluteFill
      style={{
        width: 1080,
        height: 1920,
        overflow: 'hidden',
        backgroundColor: '#0f172a',
      }}
    >
      <OffthreadVideo
        src={staticFile('clients/strike_plumbing/scene05/house_orbit.mp4')}
        startFrom={Math.floor(currentVideoTime * fps)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scale(1.1)',
          filter: `blur(${blurAmount}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(15, 23, 42, ${overlayOpacity})`,
          mixBlendMode: 'multiply',
        }}
      />
    </AbsoluteFill>
  );
};