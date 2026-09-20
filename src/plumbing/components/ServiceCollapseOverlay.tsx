// src/plumbing/components/ServiceCollapseOverlay.tsx

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

export interface ServiceItem {
  title: string;
  detail: string;
}

interface ServiceCollapseOverlayProps {
  startFrame?: number;
  items?: ServiceItem[];
  sfxVolume?: number;
}

const defaultItems: ServiceItem[] = [
  { title: 'DRAIN CLEARING', detail: 'Rapid snaking & high-pressure jetting' },
  { title: 'CAMERA INSPECTION', detail: 'Pinpoint underground blockages fast' },
  { title: 'PIPE & VALVE REPAIR', detail: 'Upfront pricing, no diagnostic guesswork' },
];

export const ServiceCollapseOverlay: React.FC<ServiceCollapseOverlayProps> = ({
  startFrame = 14,
  items = defaultItems,
  sfxVolume = 0.4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: 'absolute',
        top: 960,
        left: 0,
        width: 1080,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        pointerEvents: 'none',
        zIndex: 60,
      }}
    >
      {items.map((item, index) => {
        // Staggered entrance
        const itemStart = startFrame + index * 12;
        const localFrame = Math.max(0, frame - itemStart);

        const entrySpring = spring({
          frame: localFrame,
          fps,
          config: { damping: 18, mass: 0.8, stiffness: 140 },
        });

        const unrollProgress = interpolate(
          frame,
          [itemStart + 6, itemStart + 16],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const translateY = interpolate(entrySpring, [0, 1], [35, 0]);
        const entryOpacity = interpolate(localFrame, [0, 5], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        // Staggered exit: each row flies off to the left sequentially starting at frame 114
        const exitStart = 114 + index * 8;
        const exitProgress = interpolate(
          frame,
          [exitStart, exitStart + 12],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const exitTranslateX = interpolate(exitProgress, [0, 1], [0, -1100]);
        const exitOpacity = interpolate(exitProgress, [0, 0.8], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <React.Fragment key={`service_item_frag_${index}`}>
            <Sequence from={itemStart} durationInFrames={12}>
              <Audio
                src={staticFile('clients/strike_plumbing/audio/sfx/bubble_tick.wav')}
                volume={sfxVolume}
              />
            </Sequence>

            <div
              style={{
                width: 880,
                background:
                  'radial-gradient(ellipse at center, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 80%)',
                padding: '8px 16px',
                borderRadius: 12,
                transform: `translate3d(${exitTranslateX}px, ${translateY}px, 0) scale(${entrySpring})`,
                willChange: 'transform, opacity',
                opacity: entryOpacity * exitOpacity,
              }}
            >
              {/* Title row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    backgroundColor: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: 22,
                    fontWeight: 900,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.95)',
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <span
                  style={{
                    fontFamily: 'Montserrat, Arial, sans-serif',
                    fontSize: 42,
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '1.4px',
                    textTransform: 'uppercase',
                    textShadow:
                      '0 4px 12px rgba(0, 0, 0, 1), 0 1px 3px rgba(0, 0, 0, 1)',
                  }}
                >
                  {item.title}
                </span>
              </div>

              {/* Sub-detail row */}
              <div
                style={{
                  paddingLeft: 54,
                  paddingTop: 4,
                  opacity: unrollProgress,
                  transform: `translate3d(0, ${(1 - unrollProgress) * -8}px, 0)`,
                  willChange: 'transform, opacity',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'Inter, Arial, sans-serif',
                    fontSize: 26,
                    fontWeight: 700,
                    color: '#38bdf8',
                    letterSpacing: '0.4px',
                    textShadow:
                      '0 3px 8px rgba(0, 0, 0, 1), 0 1px 2px rgba(0, 0, 0, 1)',
                  }}
                >
                  {item.detail}
                </p>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
export default ServiceCollapseOverlay;