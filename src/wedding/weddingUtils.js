export const PHOTO_SLIDE_FRAMES = 150; // Each photo plays for ~5 seconds at 30fps
export const WELCOME_SLIDE_FRAMES = 300; // Welcome screen plays for ~10 seconds to read text
export const TRANSITION_FRAMES = 30;   // Crossfade duration (~1 second)

/**
 * Builds an active playback timeline that injects an interactive welcome card at regular intervals.
 */
export const buildSmartWeddingTimeline = (basePhotos, liveUploads, currentFrame) => {
  let cursor = 0;

  // 1. Prioritize live uploads. If none exist, we will loop the welcome screen indefinitely.
  const rawPhotos = liveUploads && liveUploads.length > 0 
    ? liveUploads.map(item => item.photo || item) 
    : [];

  let combinedDecks = [];

  // Always start the entire presentation sequence with the Welcome Interstitial Card
  combinedDecks.push({ type: 'welcome' });

  if (rawPhotos.length === 0) {
    // If there is no live data yet, keep cycling the welcome layout indefinitely
    const item = {
      id: 'welcome-loop-initial',
      type: 'welcome',
      duration: WELCOME_SLIDE_FRAMES,
      start: 0,
      end: WELCOME_SLIDE_FRAMES
    };
    return { items: [item], totalDuration: WELCOME_SLIDE_FRAMES };
  }

  // 2. Distribute photos and inject the welcome card after every 5 pictures
  rawPhotos.forEach((photo, index) => {
    combinedDecks.push({ type: 'photo', data: photo });
    
    // Changing threshold gap: Every 5 photos, inject a Welcome card for arriving guests
    if ((index + 1) % 5 === 0) {
      combinedDecks.push({ type: 'welcome' });
    }
  });

  // 3. Map thresholds over the calculated compilation sequence array
  const items = combinedDecks.map((slide, index) => {
    const isWelcome = slide.type === 'welcome';
    const duration = isWelcome ? WELCOME_SLIDE_FRAMES : PHOTO_SLIDE_FRAMES;
    
    const item = {
      id: isWelcome ? `welcome-slide-${index}` : `photo-slide-${index}-${slide.data.id || index}`,
      type: slide.type,
      photo: isWelcome ? null : slide.data,
      duration: duration,
      start: cursor,
      end: cursor + duration
    };
    cursor += duration;
    return item;
  });

  // 4. 🔄 Infinite Loop Recycler: Keep sliding forward past clock boundaries cleanly
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
  
  if (currentFrame < item.start + TRANSITION_FRAMES) {
    return (currentFrame - item.start) / TRANSITION_FRAMES;
  }
  
  if (currentFrame > item.end - TRANSITION_FRAMES) {
    return (item.end - currentFrame) / TRANSITION_FRAMES;
  }
  
  return 1;
};