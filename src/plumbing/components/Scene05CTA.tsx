// src/plumbing/components/Scene05CTA.tsx

import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Scene05OrbitVideo } from './Scene05OrbitVideo';

interface Scene05CTAProps {
  phoneNumber?: string;
  startDelayFrames?: number;
}

// Solid telephone handset with outward vibrating audio rings
const RingingPhoneIcon: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const cycle = frame % 20;
  const shakeAngle =
    cycle < 14
      ? Math.sin((cycle / 14) * Math.PI * 4) * 14
      : 0;

  const wave1 = interpolate((frame % 18) / 18, [0, 0.5, 1], [0.25, 1, 0.25]);
  const wave2 = interpolate(((frame + 5) % 18) / 18, [0, 0.5, 1], [0.15, 0.85, 0.15]);

  return (
    <div
      style={{
        width: 112,
        height: 112,
        flexShrink: 0,
        marginTop: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter:
          'drop-shadow(0 0 18px rgba(250, 204, 21, 0.95)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.85))',
      }}
    >
      <svg
        viewBox="0 0 512 512"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
      >
        <path
          d="M 380 170 C 430 220 430 292 380 342"
          fill="none"
          stroke="#facc15"
          strokeWidth="34"
          strokeLinecap="round"
          opacity={wave1}
        />
        <path
          d="M 440 120 C 510 190 510 322 440 392"
          fill="none"
          stroke="#facc15"
          strokeWidth="34"
          strokeLinecap="round"
          opacity={wave2}
        />
        <g
          transform={`rotate(${shakeAngle}, 240, 256)`}
          style={{ transformOrigin: '240px 256px' }}
        >
          <path
            d="M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.3l60.6-49.6a24 24 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6.61l-104 24A24 24 0 0 0 .1 48c0 256.5 207.9 464 464 464a24 24 0 0 0 23.4-18.5l24-104a24.29 24.29 0 0 0-14.11-27.7z"
            fill="#facc15"
          />
        </g>
      </svg>
    </div>
  );
};

// Prominent, borderless vector clock with spinning hands
const OversizeSpinningClock: React.FC<{ size?: number }> = ({ size = 180 }) => {
  const frame = useCurrentFrame();

  // Rapid minute hand rotation (1 full turn every 24 frames / 1s)
  const minuteAngle = (frame * 15) % 360;
  // Hour hand rotation
  const hourAngle = (frame * 3.75) % 360;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        overflow: 'visible',
        filter:
          'drop-shadow(0 0 22px rgba(255, 30, 30, 0.95)) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.9))',
        flexShrink: 0,
      }}
    >
      {/* Outer Dial Rim */}
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="rgba(10, 10, 15, 0.85)"
        stroke="#FF1E1E"
        strokeWidth="6"
      />

      {/* 12, 3, 6, 9 Hour Ticks */}
      <line x1="50" y1="12" x2="50" y2="20" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="88" y1="50" x2="80" y2="50" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="50" y1="88" x2="50" y2="80" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
      <line x1="12" y1="50" x2="20" y2="50" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

      {/* Center Pivot */}
      <circle cx="50" cy="50" r="5.5" fill="#FFFFFF" />

      {/* Hour Hand */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="28"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        transform={`rotate(${hourAngle} 50 50)`}
      />

      {/* Minute Hand */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="18"
        stroke="#FF1E1E"
        strokeWidth="4"
        strokeLinecap="round"
        transform={`rotate(${minuteAngle} 50 50)`}
      />
    </svg>
  );
};

export const Scene05CTA: React.FC<Scene05CTAProps> = ({
  phoneNumber = '(773) 236-7202',
  startDelayFrames = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const digits = phoneNumber.split('');
  const FRAMES_PER_DIGIT = 7;

  // 1. Overshoot Entrance Physics (Triggered at frame 16 of Scene 5)
  const entranceSpring = spring({
    frame: frame - (startDelayFrames + 8),
    fps,
    config: {
      damping: 8,
      stiffness: 140,
      mass: 0.75,
    },
  });

  // Scale shoots past 1.0 (to ~1.18) before settling at 1.0
  const entranceScale = interpolate(entranceSpring, [0, 1], [0.1, 1.0]);
  const entranceTranslateY = interpolate(entranceSpring, [0, 1], [140, 0]);
  const entranceOpacity = interpolate(entranceSpring, [0, 1], [0, 1]);

  // 2. Looping Kinetic Bounce Pulse (Continuous breathing cycle)
  const loopCycle = (frame - (startDelayFrames + 18)) / fps;
  const loopScale = frame >= startDelayFrames + 18
    ? 1 + Math.sin(loopCycle * Math.PI * 3) * 0.045
    : 1;

  const pulseGlow = frame >= startDelayFrames + 18
    ? 14 + Math.sin(loopCycle * Math.PI * 3) * 12
    : 16;

  return (
    <AbsoluteFill style={{ width: 1080, height: 1920, overflow: 'hidden' }}>
      {/* Layer 1: Drone Orbit Background Plate */}
      <Scene05OrbitVideo blurAmount={12} overlayOpacity={0.45} />

      {/* Layer 2: Glowing Blue Frame Plate */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Img
          src={staticFile('clients/strike_plumbing/scene05/cta_banner_bg.png')}
          style={{
            width: 1080,
            height: 1920,
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
        />
      </AbsoluteFill>

      {/* Layer 3: Static Graphic Card (Headline, Badges, QR Code) */}
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Img
          src={staticFile('clients/strike_plumbing/scene05/cta_static_overlay.png')}
          style={{
            width: 1080,
            height: 1920,
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
        />
      </AbsoluteFill>

      {/* Layer 4: Ringing Handset + Overshoot Digits */}
      <div
        style={{
          position: 'absolute',
          top: 954,
          left: 46,
          width: 770,
          height: 130,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 14,
          zIndex: 50,
        }}
      >
        <RingingPhoneIcon frame={frame} fps={fps} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {digits.map((char, index) => {
            const triggerFrame = startDelayFrames + index * FRAMES_PER_DIGIT;

            const punchProgress = spring({
              frame: Math.max(0, frame - triggerFrame),
              fps,
              config: {
                damping: 12,
                mass: 0.5,
                stiffness: 170,
              },
            });

            const scale = interpolate(punchProgress, [0, 0.45, 1], [1.0, 1.7, 1.0]);
            const glowRadius = interpolate(punchProgress, [0, 0.45, 1], [10, 40, 10]);
            const glowOpacity = interpolate(punchProgress, [0, 0.45, 1], [0.4, 1.0, 0.4]);

            const zIndex = frame >= triggerFrame && frame < triggerFrame + 14 ? 100 : 10;

            return (
              <span
                key={index}
                style={{
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontSize: 82,
                  fontWeight: 900,
                  color: '#facc15',
                  display: 'inline-block',
                  transform: `scale(${scale})`,
                  transformOrigin: 'center center',
                  textShadow: `0 0 ${glowRadius}px rgba(250, 204, 21, ${glowOpacity}), 0 3px 6px rgba(0, 0, 0, 0.9)`,
                  zIndex,
                  minWidth: char === ' ' ? '18px' : undefined,
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      </div>

      {/* Layer 5: Standalone Overshooting Clock & Kinetic Text (Zero Box / Zero Border) */}
      <div
        style={{
          position: 'absolute',
          top: 1240,
          left: '50%',
          transform: `translateX(-50%) translateY(${entranceTranslateY}px) scale(${entranceScale * loopScale})`,
          opacity: entranceOpacity,
          width: 1040,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          zIndex: 60,
          pointerEvents: 'none',
        }}
      >
        {/* Large Spinning Vector Clock */}
        <OversizeSpinningClock size={180} />

        {/* Large Red Kinetic Typography */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: 68,
              fontWeight: 900,
              color: '#FF1E1E',
              letterSpacing: 2,
              textTransform: 'uppercase',
              lineHeight: 1.02,
              textShadow: `0 0 ${pulseGlow}px rgba(255, 30, 30, 0.9), 0 4px 14px rgba(0, 0, 0, 0.95), 0 2px 4px #000000`,
            }}
          >
            AVAILABLE 24/7
          </div>
          <div
            style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: 46,
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: 3,
              textTransform: 'uppercase',
              lineHeight: 1.05,
              textShadow: '0 0 18px rgba(0, 0, 0, 1), 0 4px 12px rgba(0, 0, 0, 0.95)',
            }}
          >
            SEVEN DAYS A WEEK
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};