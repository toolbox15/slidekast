import React, { useMemo, useState, useEffect, useRef } from 'react';
import { CinematicPhotoSlide } from './CinematicPhotoSlide';
import { useLiveTributes } from '../useLiveTributes'; 
import {
  PHOTO_SLIDE_FRAMES,
  TITLE_CARD_FRAMES,
  TRANSITION_FRAMES,
  buildTimeline,
  normalizePhoto,
  normalizeUpload,
  resolveImageSource,
} from './memorialUtils';

const LIVE_LOWER_THIRD_FRAMES = 540;

// Recreating Remotion's interpolate function using pure JavaScript math
const linearInterpolate = (value, inputRange, outputRange, options = {}) => {
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;
  
  if (value <= inputMin) return options.extrapolateLeft === 'clamp' ? outputMin : value;
  if (value >= inputMax) return options.extrapolateRight === 'clamp' ? outputMax : value;
  
  const percentage = (value - inputMin) / (inputMax - inputMin);
  return outputMin + percentage * (outputMax - outputMin);
};

const buildPlaybackItems = (timeline) => {
  const items = [];
  let cursor = 0;

  timeline.forEach((section) => {
    items.push({
      id: `${section.id}-title`,
      type: 'title',
      section,
      start: cursor,
      duration: TITLE_CARD_FRAMES,
      end: cursor + TITLE_CARD_FRAMES,
    });

    cursor += TITLE_CARD_FRAMES;

    section.photos.forEach((photo, index) => {
      items.push({
        id: `${section.id}-photo-${index}`,
        type: 'photo',
        section,
        photo,
        slideIndex: index,
        start: cursor,
        duration: PHOTO_SLIDE_FRAMES,
        end: cursor + PHOTO_SLIDE_FRAMES,
      });

      cursor += PHOTO_SLIDE_FRAMES;
    });
  });

  return {
    items,
    totalDuration: cursor,
  };
};

const getVisiblePlaybackItems = (items, totalDuration, frame) => {
  if (items.length === 0 || totalDuration <= 0) {
    return [];
  }

  const loopFrame = frame % totalDuration;
  const activeIndex = items.findIndex((item) => loopFrame >= item.start && loopFrame < item.end);
  const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;
  const active = items[safeActiveIndex];
  const activeFrame = loopFrame - active.start;
  const incomingOpacity = linearInterpolate(activeFrame, [0, TRANSITION_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const visible = [];

  if (activeFrame < TRANSITION_FRAMES) {
    const previous = items[(safeActiveIndex - 1 + items.length) % items.length];
    visible.push({
      item: previous,
      frame: Math.max(0, previous.duration - TRANSITION_FRAMES + activeFrame),
      opacity: 1 - incomingOpacity,
      isEntering: false,
      isExiting: true,
    });
  }

  visible.push({
    item: active,
    frame: activeFrame,
    opacity: incomingOpacity,
    isEntering: activeFrame < TRANSITION_FRAMES,
    isExiting: false,
  });

  return visible;
};

const SectionTitleCard = ({ section, frame, opacity }) => {
  const titleY = linearInterpolate(frame, [0, 44], [42, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ruleWidth = linearInterpolate(frame, [16, 66], [0, 420], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ width: 1120 }}>
        <div
          style={{
            color: '#d9bf8d',
            fontSize: 24,
            letterSpacing: 7,
            textTransform: 'uppercase',
            marginBottom: 28,
          }}
        >
          {section.eyebrow}
        </div>
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 94,
            lineHeight: 1.02,
            fontWeight: 400,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {section.title}
        </div>
        <div
          style={{
            width: ruleWidth,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #d9bf8d, transparent)',
            margin: '34px auto',
          }}
        />
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.36,
            color: 'rgba(255,255,255,0.78)',
          }}
        >
          {section.subtitle}
        </div>
      </div>
    </div>
  );
};

const SectionPhotoPlayer = ({ item, slideFrame, opacity, isEntering }) => {
  return (
    <CinematicPhotoSlide
      photo={item.photo}
      frame={slideFrame}
      frameShape={item.section.frameShape}
      opacity={opacity}
      isEntering={isEntering}
    />
  );
};

const LiveTributeLowerThird = ({ uploads, frame }) => {
  const liveUploads = useMemo(
    () =>
      uploads.length > 0
        ? uploads
        : [
            {
              id: 'awaiting-live-tribute',
              image_url: '',
              sender_name: 'Guestbook',
              message_text: 'Your memories will appear here.',
            },
          ],
    [uploads]
  );
  const activeIndex = Math.floor(frame / LIVE_LOWER_THIRD_FRAMES) % liveUploads.length;
  const activeUpload = liveUploads[activeIndex];
  const itemFrame = frame % LIVE_LOWER_THIRD_FRAMES;
  const imageSource = resolveImageSource(activeUpload.image_url);
  const translateX = linearInterpolate(
    itemFrame,
    [0, LIVE_LOWER_THIRD_FRAMES],
    [-980, 1980],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const translateY = linearInterpolate(
    itemFrame,
    [0, LIVE_LOWER_THIRD_FRAMES / 2, LIVE_LOWER_THIRD_FRAMES],
    [14, -18, 14],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const opacity = linearInterpolate(
    itemFrame,
    [0, 54, LIVE_LOWER_THIRD_FRAMES - 64, LIVE_LOWER_THIRD_FRAMES],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 60,
          height: 218,
          background:
            'linear-gradient(90deg, rgba(10,14,16,0.18), rgba(10,14,16,0.76) 18%, rgba(10,14,16,0.82) 50%, rgba(10,14,16,0.76) 82%, rgba(10,14,16,0.18))',
          borderTop: '1px solid rgba(217,191,141,0.28)',
          borderBottom: '1px solid rgba(255,255,255,0.11)',
          boxShadow: '0 -20px 70px rgba(0,0,0,0.28)',
          backdropFilter: 'blur(12px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 86,
          width: 900,
          minHeight: 164,
          opacity,
          transform: `translate(${translateX}px, ${translateY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 30,
          padding: '24px 34px',
          background: 'rgba(18,23,25,0.92)',
          border: '1px solid rgba(217,191,141,0.42)',
          boxShadow: '0 22px 54px rgba(0,0,0,0.34)',
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 112,
            height: 112,
            flex: '0 0 112px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 6,
          }}
        >
          {imageSource ? (
            <img
              src={imageSource}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              alt=""
            />
          ) : (
            <div
              style={{
                color: 'rgba(255,255,255,0.52)',
                fontFamily: 'Georgia, serif',
                fontSize: 36,
              }}
            >
              +
            </div>
          )}
        </div>
        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              color: '#d9bf8d',
              fontFamily: 'Georgia, serif',
              fontSize: 36,
              lineHeight: 1.04,
              marginBottom: 10,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activeUpload.sender_name || 'Guest'}
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.88)',
              fontSize: 28,
              lineHeight: 1.24,
              fontWeight: 300,
            }}
          >
            {activeUpload.message_text || 'Shared a memory in loving tribute.'}
          </div>
        </div>
      </div>
    </div>
  );
};

const Background = ({ funeralHomeName, lovedOneName, frame }) => {
  const shimmer = linearInterpolate(frame % 180, [0, 90, 180], [0.18, 0.34, 0.18]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(circle at 16% 18%, rgba(154,178,177,0.26), transparent 24%), radial-gradient(circle at 86% 76%, rgba(217,191,141,0.18), transparent 28%), linear-gradient(135deg, #101417 0%, #243136 48%, #121517 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 52,
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: 'inset 0 0 140px rgba(0,0,0,0.22)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 156,
          width: 3,
          height: '100%',
          background:
            'linear-gradient(to bottom, transparent, rgba(255,255,255,0.32), transparent)',
          opacity: shimmer,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 82,
          bottom: 56,
          color: 'rgba(255,255,255,0.58)',
          fontSize: 20,
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}
      >
        {funeralHomeName}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 82,
          bottom: 56,
          color: 'rgba(255,255,255,0.58)',
          fontSize: 20,
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}
      >
        {lovedOneName}
      </div>
    </div>
  );
};

const buildSections = ({
  earlyYearsPhotos,
  familyPhotos,
  legacyPhotos,
}) => {
  return [
    {
      id: 'early-years',
      eyebrow: 'Legacy Childhood Photos',
      title: 'The Early Years',
      subtitle: 'A tender look back at childhood, siblings, school days, and first memories.',
      frameShape: 'rounded',
      photos: earlyYearsPhotos.map((photo, index) =>
        normalizePhoto(photo, `Early Years ${index + 1}`)
      ),
    },
    {
      id: 'life-and-family',
      eyebrow: 'Marriage, Children, Milestones',
      title: 'Building a Life & Family',
      subtitle: 'The chapters of partnership, parenthood, home, work, and milestones.',
      frameShape: 'rounded',
      photos: familyPhotos.map((photo, index) =>
        normalizePhoto(photo, `Family Chapter ${index + 1}`)
      ),
    },
    {
      id: 'lasting-legacy',
      eyebrow: 'Recent Photos, Grandkids, Community Impact',
      title: 'A Lasting Legacy',
      subtitle: 'Recent moments, grandchildren, friendships, service, and community impact.',
      frameShape: 'oval',
      photos: legacyPhotos.map((photo, index) =>
        normalizePhoto(photo, `Legacy Moment ${index + 1}`)
      ),
    },
  ].map((section) => ({
    ...section,
    photos:
      section.photos.length > 0
        ? section.photos
        : [
            {
              image_url: '',
              caption: section.title,
              sender_name: '',
              message_text: '',
            },
          ],
  }));
};

export const MemorialSlideshowController = ({
  funeralHomeName = 'Evergreen Funeral Home',
  lovedOneName = 'Margaret Elaine Parker',
  liveEventId = 'smith-wedding-2026',
  earlyYearsPhotos = [],
  familyPhotos = [],
  legacyPhotos = [],
  liveTributesSeed = [],
}) => {
  // Creating a native browser clock running at roughly 30 frames per second
  const [frame, setFrame] = useState(0);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    let animationFrameId;
    
    const renderLoop = () => {
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;
      
      // Advance 1 video frame frame every ~33 milliseconds
      if (elapsed >= 33) {
        setFrame((prev) => prev + 1);
        lastTimeRef.current = now - (elapsed % 33);
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    
    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const { tributes } = useLiveTributes(liveEventId);
  const lowerThirdUploads = useMemo(
    () =>
      (tributes.length > 0 ? tributes : liveTributesSeed).map((upload, index) =>
        normalizeUpload(upload, index)
      ),
    [tributes, liveTributesSeed]
  );

  const sections = useMemo(
    () =>
      buildSections({
        earlyYearsPhotos,
        familyPhotos,
        legacyPhotos,
      }),
    [earlyYearsPhotos, familyPhotos, legacyPhotos]
  );
  
  const timeline = useMemo(() => buildTimeline(sections), [sections]);
  const { items, totalDuration } = useMemo(() => buildPlaybackItems(timeline), [timeline]);
  const visibleItems = useMemo(
    () => getVisiblePlaybackItems(items, totalDuration, frame),
    [items, totalDuration, frame]
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden',
        background: '#101417'
      }}
    >
      <Background funeralHomeName={funeralHomeName} lovedOneName={lovedOneName} frame={frame} />
      {visibleItems.map(({ item, frame: itemFrame, opacity, isEntering }) =>
        item.type === 'title' ? (
          <SectionTitleCard
            key={`${item.id}-${item.start}`}
            section={item.section}
            frame={itemFrame}
            opacity={opacity}
          />
        ) : (
          <SectionPhotoPlayer
            key={`${item.id}-${item.start}`}
            item={item}
            slideFrame={itemFrame}
            opacity={opacity}
            isEntering={isEntering}
          />
        )
      )}
      <LiveTributeLowerThird uploads={lowerThirdUploads} frame={frame} />
    </div>
  );
};