// src/wedding/weddingUtils.js

export const PHOTO_SLIDE_FRAMES = 150; // Each photo plays for ~5 seconds at 30fps
export const TRANSITION_FRAMES = 30;   // Crossfade duration (~1 second)

/**
 * Builds an active playback timeline that injects new live uploads immediately next-in-line.
 * @param {Array} basePhotos - Pre-loaded background/engagement photos of the couple.
 * @param {Array} liveUploads - Real-time uploads streaming from the wedding guests via Firestore.
 * @param {number} currentFrame - The active frame tick of the live player loop.
 */
export const buildSmartWeddingTimeline = (basePhotos, liveUploads, currentFrame) => {
  let timeline = [];
  let cursor = 0;

  // 1. Build the foundational loop out of the pre-loaded base couple photos
  const baseItems = basePhotos.map((photo, index) => {
    const item = {
      id: photo.id || `base-${index}`,
      type: 'photo',
      photo: photo,
      duration: PHOTO_SLIDE_FRAMES,
      start: cursor,
      end: cursor + PHOTO_SLIDE_FRAMES
    };
    cursor += PHOTO_SLIDE_FRAMES;
    return item;
  });

  if (!liveUploads || liveUploads.length === 0) {
    return { items: baseItems, totalDuration: cursor };
  }

  // 2. Locate which base slide is actively displaying on screen right now
  const activeIndex = baseItems.findIndex(
    (item) => currentFrame >= item.start && currentFrame < item.end
  );
  const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;
  const injectionIndex = safeActiveIndex + 1;

  // 3. Inject the live guest uploads right after the active slide
  let updatedItems = [...baseItems];
  let liveCursor = updatedItems[safeActiveIndex].end;

  liveUploads.forEach((upload, offset) => {
    const targetSlot = injectionIndex + offset;
    const newItem = {
      id: upload.id || `live-guest-${Date.now()}-${offset}`,
      type: 'photo',
      photo: upload, // Holds image_url, sender_name, message_text, avatar_url
      duration: PHOTO_SLIDE_FRAMES,
      start: liveCursor,
      end: liveCursor + PHOTO_SLIDE_FRAMES
    };
    updatedItems.splice(targetSlot, 0, newItem);
    liveCursor += PHOTO_SLIDE_FRAMES;
  });

  // 4. Shift the start and end frame times of all remaining base photos down the line
  for (let i = injectionIndex + liveUploads.length; i < updatedItems.length; i++) {
    updatedItems[i].start = liveCursor;
    updatedItems[i].end = liveCursor + updatedItems[i].duration;
    liveCursor += updatedItems[i].duration;
  }

  return {
    items: updatedItems,
    totalDuration: liveCursor
  };
};

/**
 * Calculates opacity for a smooth crossfade transition between elements.
 */
export const calculateSlideOpacity = (item, currentFrame) => {
  if (currentFrame < item.start || currentFrame >= item.end) return 0;
  
  // Fade in at the beginning of the slide duration
  if (currentFrame < item.start + TRANSITION_FRAMES) {
    return (currentFrame - item.start) / TRANSITION_FRAMES;
  }
  
  // Fade out at the tail end of the slide duration
  if (currentFrame > item.end - TRANSITION_FRAMES) {
    return (item.end - currentFrame) / TRANSITION_FRAMES;
  }
  
  return 1; // Stay fully visible in the middle
};