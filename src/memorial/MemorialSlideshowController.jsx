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
  if (items.length === 0 || totalDuration <= 0) return [];

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
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ maxWidth: '90%', width: '1120px' }}>
        <div style={{ color: '#d9bf8d', fontSize: '20px', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '20px' }}>
          {section.eyebrow}
        </div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 6vw, 84px)', lineHeight: 1.1, fontWeight: 400, transform: `translateY(${titleY}px)` }}>
          {section.title}
        </div>
        <div style={{ width: ruleWidth, height: '2px', background: 'linear-gradient(90deg, transparent, #d9bf8d, transparent)', margin: '24px auto' }} />
        <div style={{ fontSize: 'clamp(16px, 2vw, 24px)', lineHeight: 1.4, color: 'rgba(255,255,255,0.78)' }}>
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
      slideIndex={item.slideIndex}
      frameShape={item.section.frameShape}
      opacity={opacity}
      isEntering={isEntering}
    />
  );
};

// --- LIGHTWEIGHT VECTOR DOVE DESIGN ---
const FlyingDoveParticle = ({ delay, scale, startX }) => (
  <svg
    viewBox="0 0 24 24"
    style={{
      position: 'absolute',
      bottom: '110px', // Launches right from the top edge of the card
      left: `${startX}px`,
      width: '32px',
      height: '32px',
      fill: 'rgba(255, 255, 255, 0.55)',
      filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))',
      pointerEvents: 'none',
      animation: `doveFlyUp 3.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards`,
      transform: `scale(${scale})`,
    }}
  >
    <path d="M12,2C11.5,4 9.5,7.5 7,8.5C5,9.3 2.5,9 1,9.5C0.5,9.7 0.5,10.3 1,10.5C3.5,11.5 6,11.5 7.5,13C9,14.5 9,17 10,19.5C10.2,20 10.8,20 11,19.5C11.5,17 12,14.5 13.5,13C15,11.5 17.5,11.5 20,10.5C20.5,10.3 20.5,11.3 20,11.5C17.5,12.5 15.5,16 15,18C14.8,18.5 15.4,19 15.8,18.6C18,16.5 21,15.5 23,15.5C23.5,15.5 23.8,15 23.4,14.7C20.5,12.5 17.5,9.5 15,6C13.5,4 12.5,2.5 12,2Z" />
  </svg>
);

// LIVE LOWER THIRD WITH FLIGHT ENGINE INTEGRATION
const LiveTributeLowerThird = ({ uploads, frame }) => {
  const [doveBursts, setDoveBursts] = useState([]);

  const liveUploads = useMemo(
    () => uploads.length > 0 ? uploads : [{
      id: 'awaiting-live-tribute',
      image_url: '',
      sender_name: 'Guestbook',
      message_text: 'Your memories will appear here.',
    }],
    [uploads]
  );

  const activeIndex = Math.floor(frame / LIVE_LOWER_THIRD_FRAMES) % liveUploads.length;
  const activeUpload = liveUploads[activeIndex];
  const itemFrame = frame % LIVE_LOWER_THIRD_FRAMES;
  const imageSource = resolveImageSource(activeUpload.image_url);

  // TRIGGER DOVE BURST EFFECT INSTANTLY WHEN INDEX ROTATES
  useEffect(() => {
    if (!activeUpload?.id) return;
    
    // Generate a quick burst of random offsets and staggered deployment intervals
    const newDoves = Array.from({ length: 4 }).map((_, i) => ({
      id: `${activeUpload.id}-dove-${i}-${Date.now()}`,
      delay: i * 0.35,              // Staggers launch sequence
      scale: 0.6 + Math.random() * 0.5, // Randomizes sizes
      startX: 80 + Math.random() * 260, // Randomizes starting positions along horizontal length
    }));

    setDoveBursts((prev) => [...prev, ...newDoves].slice(-12)); // Keeps stack memory clean
  }, [activeIndex, activeUpload?.id]);

  const translateX = linearInterpolate(itemFrame, [0, LIVE_LOWER_THIRD_FRAMES], [-1100, 1100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const translateY = linearInterpolate(itemFrame, [0, LIVE_LOWER_THIRD_FRAMES / 2, LIVE_LOWER_THIRD_FRAMES], [10, -10, 10], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = linearInterpolate(itemFrame, [0, 54, LIVE_LOWER_THIRD_FRAMES - 64, LIVE_LOWER_THIRD_FRAMES], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(90deg, rgba(10,14,16,0.18), rgba(10,14,16,0.85) 18%, rgba(10,14,16,0.9) 50%, rgba(10,14,16,0.85) 82%, rgba(10,14,16,0.18))',
        borderTop: '1px solid rgba(217,191,141,0.28)',
        boxShadow: '0 -15px 50px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        overflow: 'visible', // CRITICAL: Allows flying doves to sail out of the lower box boundaries
        pointerEvents: 'none',
      }}
    >
      {/* INJECT ANIMATION INJECTOR CSS RULES */}
      <style>{`
        @keyframes doveFlyUp {
          0% {
            transform: translateY(0) scale(0.4) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            transform: translateY(-250px) translateX(40px) scale(0.8) rotate(15deg);
          }
          100% {
            transform: translateY(-550px) translateX(-20px) scale(1) rotate(-10deg);
            opacity: 0;
          }
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          width: 'fit-content',
          minWidth: '450px',    
          maxWidth: '85vw',
          minHeight: '110px',
          opacity,
          transform: `translate(${translateX}px, ${translateY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '16px 24px',
          background: 'rgba(18,23,25,0.95)',
          border: '1px solid rgba(217,191,141,0.42)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
          borderRadius: '8px',
          boxSizing: 'border-box'
        }}
      >
        {/* DOVE RENDER WRAPPER */}
        {doveBursts.map((dove) => (
          <FlyingDoveParticle key={dove.id} delay={dove.delay} scale={dove.scale} startX={dove.startX} />
        ))}

        <div
          style={{
            width: '75px',
            height: '75px',
            flex: '0 0 75px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '6px',
          }}
        >
          {imageSource ? (
            <img src={imageSource} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.52)', fontFamily: 'Georgia, serif', fontSize: '24px' }}>+</div>
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', fontSize: '22px', lineHeight: 1.1, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeUpload.sender_name || 'Guest'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: '16px', lineHeight: 1.3, fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 16% 18%, rgba(154,178,177,0.26), transparent 24%), radial-gradient(circle at 86% 76%, rgba(217,191,141,0.18), transparent 28%), linear-gradient(135deg, #101417 0%, #243136 48%, #121517 100%)', zIndex: -1 }}>
      <div style={{ position: 'absolute', inset: '3%', border: '1px solid rgba(255,255,255,0.14)', boxShadow: 'inset 0 0 140px rgba(0,0,0,0.22)' }} />
      <div style={{ position: 'absolute', top: 0, right: '15%', width: '2px', height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.32), transparent)', opacity: shimmer }} />
      <div style={{ position: 'absolute', left: '4%', bottom: '4%', color: 'rgba(255,255,255,0.58)', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
        {funeralHomeName}
      </div>
      <div style={{ position: 'absolute', right: '4%', bottom: '4%', color: 'rgba(255,255,255,0.58)', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
        {lovedOneName}
      </div>
    </div>
  );
};

const buildSections = ({ earlyYearsPhotos, familyPhotos, legacyPhotos }) => {
  return [
    {
      id: 'early-years',
      eyebrow: 'Legacy Childhood Photos',
      title: 'The Early Years',
      subtitle: 'A tender look back at childhood, siblings, school days, and first memories.',
      frameShape: 'rounded',
      photos: earlyYearsPhotos.map((photo, index) => normalizePhoto({ image_url: photo }, `Early Years ${index + 1}`)),
    },
    {
      id: 'life-and-family',
      eyebrow: 'Marriage, Children, Milestones',
      title: 'Building a Life & Family',
      subtitle: 'The chapters of partnership, parenthood, home, work, and milestones.',
      frameShape: 'rounded',
      photos: familyPhotos.map((photo, index) => normalizePhoto({ image_url: photo }, `Family Chapter ${index + 1}`)),
    },
    {
      id: 'lasting-legacy',
      eyebrow: 'Recent Photos, Grandkids, Community Impact',
      title: 'A Lasting Legacy',
      subtitle: 'Recent moments, grandchildren, friendships, service, and community impact.',
      frameShape: 'oval',
      photos: legacyPhotos.map((photo, index) => normalizePhoto({ image_url: photo }, `Legacy Moment ${index + 1}`)),
    },
  ].map((section) => ({
    ...section,
    photos: section.photos.length > 0 ? section.photos : [
      { image_url: '', caption: section.title, sender_name: '', message_text: '' }
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
  const [frame, setFrame] = useState(0);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    let animationFrameId;
    const renderLoop = () => {
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;
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
    () => (tributes.length > 0 ? tributes : liveTributesSeed).map((upload, index) => normalizeUpload(upload, index)),
    [tributes, liveTributesSeed]
  );

  const sections = useMemo(
    () => buildSections({ earlyYearsPhotos, familyPhotos, legacyPhotos }),
    [earlyYearsPhotos, familyPhotos, legacyPhotos]
  );
  
  const timeline = useMemo(() => buildTimeline(sections), [sections]);
  const { items, totalDuration } = useMemo(() => buildPlaybackItems(timeline), [timeline]);
  const visibleItems = useMemo(() => getVisiblePlaybackItems(items, totalDuration, frame), [items, totalDuration, frame]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden',
        background: '#101417',
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        boxSizing: 'border-box'
      }}
    >
      <Background funeralHomeName={funeralHomeName} lovedOneName={lovedOneName} frame={frame} />
      
      {/* ZONE 1: CORE PRESENTATION WORKSPACE */}
      <div style={{ flex: '0 0 80%', width: '100%', position: 'relative', overflow: 'hidden' }}>
        {visibleItems.map(({ item, frame: itemFrame, opacity, isEntering }) =>
          item.type === 'title' ? (
            <SectionTitleCard key={`${item.id}-${item.start}`} section={item.section} frame={itemFrame} opacity={opacity} />
          ) : (
            <SectionPhotoPlayer key={`${item.id}-${item.start}`} item={item} slideFrame={itemFrame} opacity={opacity} isEntering={isEntering} />
          )
        )}
      </div>

      {/* ZONE 2: RUNNING LOWER THIRD COMPONENT */}
      <div style={{ flex: '0 0 20%', width: '100%', position: 'relative', zIndex: 50 }}>
        <LiveTributeLowerThird uploads={lowerThirdUploads} frame={frame} />
      </div>
    </div>
  );
};