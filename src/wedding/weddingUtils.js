/**
 * Simple, browser-safe timeline builder for real-time streaming rotation.
 */
export const buildSmartWeddingTimeline = (liveUploads) => {
  // If no live uploads exist, return an empty array so the controller knows to stay on the welcome card
  const rawPhotos = liveUploads && liveUploads.length > 0 
    ? liveUploads.map(item => item.photo || item) 
    : [];

  let combinedDecks = [];

  // Always insert a welcome screen slot at the start
  combinedDecks.push({ type: 'welcome' });

  if (rawPhotos.length === 0) {
    return { items: [{ id: 'welcome-initial', type: 'welcome' }] };
  }

  // Loop through photos and inject a welcome screen after every 5 pictures
  rawPhotos.forEach((photo, index) => {
    combinedDecks.push({ type: 'photo', data: photo });
    if ((index + 1) % 5 === 0) {
      combinedDecks.push({ type: 'welcome' });
    }
  });

  return {
    items: combinedDecks.map((slide, index) => ({
      id: slide.type === 'welcome' ? `welcome-${index}` : `photo-${index}-${slide.data.id || index}`,
      type: slide.type,
      photo: slide.data || null
    }))
  };
};