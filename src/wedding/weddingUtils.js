export const PHOTO_SLIDE_FRAMES = 150; // Each photo plays for ~5 seconds at 30fps
export const TRANSITION_FRAMES = 30;   // Crossfade duration (~1 second)

/**
 * Builds an active playback timeline optimized for pure real-time crowd streaming.
 * @param {Array} basePhotos - Combined fallback deck.
 * @param {Array} liveUploads - Real-time guest entries tracking from Firestore.
 * @param {number} currentFrame - The active frame tick of the live player loop.
 */
export const buildSmartWeddingTimeline = (basePhotos, liveUploads, currentFrame) => {
  let timeline = [];
  let cursor = 0;

  // 1. Prioritize live guest content. If none exists yet, fall back to the base welcoming slide cards.
  const rawPhotos = liveUploads && liveUploads.length > 0 
    ? liveUploads.map(item => item.photo || item) 
    : basePhotos;

  // 2. Build items map with frame thresholds
  const items = rawPhotos.map((photo, index) => {
    const item = {
      id: photo.id || `slide-${index}-${photo.createdAt || 'static'}`,
      type: 'photo',
      photo: photo,
      duration: PHOTO_SLIDE_FRAMES,
      start: cursor,
      end: cursor + PHOTO_SLIDE_FRAMES
    };
    cursor += PHOTO_SLIDE_FRAMES;
    return item;
  });

  // 3. 🔄 THE SEAMLESS RECYCLER: Prevents timeline expiration freeze-outs!
  // If the absolute player clock climbs past the deck threshold, wrap it back cleanly.
  if (currentFrame >= cursor && cursor > 0) {
    const loopOffset = Math.floor(currentFrame / cursor) * cursor;
    const adjustedItems = items.map(item => ({
      ...item,
      start: item.start + loopOffset,
      end: item.end + loopOffset
    }));

    return {
      items: adjustedItems,
      totalDuration: cursor
    };
  }

  return {
    items,
    totalDuration: cursor
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