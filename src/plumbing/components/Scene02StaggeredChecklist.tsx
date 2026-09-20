// src/plumbing/components/Scene02StaggeredChecklist.tsx

import React from 'react';
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export interface ChecklistItem {
  text: string;
}

const defaultItems: ChecklistItem[] = [
  { text: 'CLOGGED DRAINS' },
  { text: 'LEAKING PIPES' },
  { text: 'NO HOT WATER' },
  { text: 'BURST PIPES' },
  { text: 'AND MORE' },
];

interface Scene02StaggeredChecklistProps {
  startFrame?: number;
  items?: ChecklistItem[];
}

export const Scene02StaggeredChecklist: React.FC<Scene02StaggeredChecklistProps> = ({
  startFrame = 12,
  items = defaultItems,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: 'absolute',
        top: 580,
        right: 48,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        pointerEvents: 'none',
        zIndex: 65,
      }}
    >
      {items.map((item, index) => {
        // Stagger each item sequentially by 9 frames (~0.37s)
        const itemStart = startFrame + index * 9;
        const localFrame = Math.max(0, frame - itemStart);

        const slideSpring = spring({
          frame: localFrame,
          fps,
          config: { damping: 15, mass: 0.7, stiffness: 140 },
        });

        const translateX = interpolate(slideSpring, [0, 1], [380, 0]);
        const opacity = interpolate(localFrame, [0, 4], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={`stagger_item_${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              transform: `translate3d(${translateX}px, 0, 0)`,
              opacity,
              willChange: 'transform, opacity',
            }}
          >
            {/* Red Badge with White Checkmark */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: 34,
                fontWeight: 900,
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.75)',
                border: '2px solid rgba(255, 255, 255, 0.6)',
                flexShrink: 0,
              }}
            >
              ✓
            </div>

            {/* Checklist Label */}
            <span
              style={{
                fontFamily: 'Montserrat, Arial, sans-serif',
                fontSize: 40,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                textShadow:
                  '0 3px 10px rgba(0, 0, 0, 1), 0 1px 3px rgba(0, 0, 0, 1), 0 0 20px rgba(0, 0, 0, 0.9)',
                whiteSpace: 'nowrap',
              }}
            >
              {item.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Scene02StaggeredChecklist;