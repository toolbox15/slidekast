import { staticFile } from 'remotion';

export const TITLE_CARD_FRAMES = 105;
export const PHOTO_SLIDE_FRAMES = 180;
export const TRANSITION_FRAMES = 30;
export const LIVE_POLL_INTERVAL_MS = 7000;

export const clampGuestMessage = (message) => {
  const words = String(message || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 10);

  return words.join(' ').slice(0, 80);
};

export const resolveImageSource = (src) => {
  if (!src || typeof src !== 'string') {
    return null;
  }

  const trimmed = src.trim();

  if (!trimmed) {
    return null;
  }

  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  return staticFile(trimmed);
};

export const normalizeUpload = (upload, index = 0) => {
  return {
    id: upload.id || upload.created_at || `live-${index}`,
    image_url: upload.image_url || upload.imageUrl || upload.url || '',
    sender_name: upload.sender_name || upload.senderName || 'Guest',
    message_text: clampGuestMessage(upload.message_text || upload.messageText || ''),
    created_at: upload.created_at || upload.createdAt || '',
  };
};

export const normalizePhoto = (photo, fallbackLabel) => {
  if (typeof photo === 'string') {
    return {
      image_url: photo,
      caption: fallbackLabel,
      sender_name: '',
      message_text: '',
    };
  }

  return {
    image_url: photo?.image_url || photo?.imageUrl || photo?.src || '',
    caption: photo?.caption || fallbackLabel,
    sender_name: photo?.sender_name || photo?.senderName || '',
    message_text: clampGuestMessage(photo?.message_text || photo?.messageText || ''),
  };
};

export const buildTimeline = (sections) => {
  let cursor = 0;

  return sections.map((section) => {
    const photoCount = Math.max(section.photos.length, 1);
    const duration = TITLE_CARD_FRAMES + photoCount * PHOTO_SLIDE_FRAMES;
    const entry = {
      ...section,
      start: cursor,
      duration,
      end: cursor + duration,
    };

    cursor += duration;
    return entry;
  });
};

export const getActiveTimelineEntry = (timeline, frame) => {
  const total = timeline.reduce((sum, section) => sum + section.duration, 0);
  const loopFrame = total > 0 ? frame % total : 0;
  const section =
    timeline.find((entry) => loopFrame >= entry.start && loopFrame < entry.end) ||
    timeline[0];
  const sectionFrame = loopFrame - section.start;

  if (sectionFrame < TITLE_CARD_FRAMES) {
    return {
      mode: 'title',
      section,
      sectionFrame,
      slideIndex: -1,
      slideFrame: sectionFrame,
      total,
    };
  }

  const photoFrame = sectionFrame - TITLE_CARD_FRAMES;
  const slideIndex = Math.min(
    Math.floor(photoFrame / PHOTO_SLIDE_FRAMES),
    Math.max(section.photos.length - 1, 0)
  );

  return {
    mode: 'photo',
    section,
    sectionFrame,
    slideIndex,
    slideFrame: photoFrame - slideIndex * PHOTO_SLIDE_FRAMES,
    total,
  };
};

