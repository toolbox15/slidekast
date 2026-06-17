// src/FuneralSlideshow.jsx
import React from 'react';
import { MemorialSlideshowController } from './memorial/MemorialSlideshowController';
import { WeddingSlideshowController } from './wedding/WeddingSlideshowController';

export const FuneralSlideshow = (props) => {
  const { liveEventId } = props;
  
  // 📡 THE CORE THEME ROUTER SWITCH
  // If the event name includes 'wedding', automatically mount the gold sidebar typewriter view
  const isWeddingTheme = liveEventId === 'smith-wedding-2026' || 
                         (liveEventId && liveEventId.toLowerCase().includes('wedding'));

  if (isWeddingTheme) {
    return <WeddingSlideshowController {...props} />;
  }

  // Otherwise, default safely to the lower-third scrolling marquee format
  return <MemorialSlideshowController {...props} />;
};