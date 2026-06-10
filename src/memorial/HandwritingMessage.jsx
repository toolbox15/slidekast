import { interpolate } from 'remotion';
import React from 'react';
import { clampGuestMessage } from './memorialUtils';

export const HandwritingMessage = ({ message, sender, frame, durationInFrames = 90 }) => {
  const text = clampGuestMessage(message);
  const chars = Array.from(text);
  const revealCount = Math.round(
    interpolate(frame, [0, durationInFrames], [0, chars.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const underline = interpolate(frame, [20, durationInFrames], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const senderOpacity = interpolate(frame, [durationInFrames - 18, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (!text) {
    return null;
  }

  return (
    <div
      style={{
        width: '100%',
        textAlign: 'center',
        color: '#f8efe1',
        filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.34))',
      }}
    >
      <div
        style={{
          minHeight: 74,
          fontFamily: '"Segoe Script", "Brush Script MT", cursive',
          fontSize: 49,
          lineHeight: 1.18,
          letterSpacing: 0,
          whiteSpace: 'normal',
        }}
      >
        {chars.map((char, index) => {
          return (
            <span
              key={`${char}-${index}`}
              style={{
                opacity: index < revealCount ? 1 : 0,
                display: char === ' ' ? 'inline' : 'inline-block',
              }}
            >
              {char}
            </span>
          );
        })}
      </div>
      <div
        style={{
          width: `${underline}%`,
          maxWidth: 620,
          height: 1,
          margin: '10px auto 12px',
          background: 'linear-gradient(90deg, transparent, #d6bd8d, transparent)',
        }}
      />
      {sender ? (
        <div
          style={{
            fontSize: 20,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'rgba(248,239,225,0.72)',
            opacity: senderOpacity,
          }}
        >
          {sender}
        </div>
      ) : null}
    </div>
  );
};
