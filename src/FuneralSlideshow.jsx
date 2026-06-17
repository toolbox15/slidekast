// src/FuneralSlideshow.jsx
import React from 'react';
import { MemorialSlideshowController } from './memorial/MemorialSlideshowController';

export const FuneralSlideshow = (props) => {
  // This forces whatever event ID is in the URL to run on the high-end marquee ticker layout
  return <MemorialSlideshowController {...props} />;
};