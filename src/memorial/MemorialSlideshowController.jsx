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
        <div style={{ color: '#d9bf8d', fontSize: '18px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>
          {section.eyebrow}
        </div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 4vw, 64px)', lineHeight: 1.2, fontWeight: 400, transform: `translateY(${titleY}px)` }}>
          {section.title}
        </div>
        <div style={{ width: ruleWidth, height: '1px', background: 'linear-gradient(90deg, transparent, #d9bf8d, transparent)', margin: '16px auto' }} />
        <div style={{ fontSize: 'clamp(14px, 1.5vw, 20px)', lineHeight: 1.4, color: 'rgba(255,255,255,0.78)' }}>
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

const AscendingCrossParticle = ({ delay, startX, driftX, targetY }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{
        position: 'absolute',
        top: '2px',
        left: '100%',
        marginLeft: '12px',
        width: '18px',
        height: '18px',
        fill: '#d9bf8d',
        filter: 'drop-shadow(0 0 6px rgba(217,191,141,0.4))',
        pointerEvents: 'none',
        animation: `crossSlowAscend 4.5s cubic-bezier(0.445, 0.05, 0.55, 0.95) ${delay}s forwards`,
        opacity: 0,
        '--startX': `${startX}px`,
        '--driftX': `${driftX}px`,
        '--targetY': `${targetY}px`,
      }}
    >
      <path d="M10,2 H14 V6 H18 V10 H14 V22 H10 V10 H6 V6 H10 Z" />
    </svg>
  );
};

const GoldDustParticle = ({ angle, delay, distance, size }) => {
  const cos = Math.cos((angle * Math.PI) / 180);
  const sin = Math.sin((angle * Math.PI) / 180);
  const targetX = (distance * cos).toFixed(1);
  const targetY = (distance * sin - 40).toFixed(1);

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '100%',
        marginLeft: '20px',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#d9bf8d',
        borderRadius: '50%',
        boxShadow: '0 0 4px #d9bf8d, 0 0 8px #ffffff',
        pointerEvents: 'none',
        animation: `dustScatter 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards`,
        opacity: 0,
        '--tx': `${targetX}px`,
        '--ty': `${targetY}px`,
      }}
    />
  );
};

const Background = ({ funeralHomeName, lovedOneName, frame }) => {
  const shimmer = linearInterpolate(frame % 180, [0, 90, 180], [0.18, 0.34, 0.18]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 16% 18%, rgba(154,178,177,0.26), transparent 24%), radial-gradient(circle at 86% 76%, rgba(217,191,141,0.18), transparent 28%), linear-gradient(135deg, #101417 0%, #243136 48%, #121517 100%)', zIndex: -1 }}>
      <div style={{ position: 'absolute', inset: '3%', border: '1px solid rgba(255,255,255,0.14)', boxShadow: 'inset 0 0 140px rgba(0,0,0,0.22)' }} />
      <div style={{ position: 'absolute', top: 0, right: '15%', width: '2px', height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.32), transparent)', opacity: shimmer }} />
    </div>
  );
};

// --- MOBILE SPLIT-SCREEN CHAT MODULE ---
const MobileLiveChatFeed = ({ uploads }) => {
  const chatEndRef = useRef(null);

  // Auto-scrolls chat feed to keep the newest uploads visible
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [uploads]);

  return (
    <div
      className="mobile-chat-container"
      style={{
        flex: '1 1 50%',
        background: '#14191c',
        borderTop: '2px solid rgba(217,191,141,0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Live Stream Title Sub-Bar */}
      <div style={{ background: '#192124', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#4ade80', borderRadius: '50%', boxShadow: '0 0 8px #4ade80' }} />
          <span style={{ fontSize: '13px', fontFamily: 'Georgia, serif', color: '#d9bf8d', letterSpacing: '1px', textTransform: 'uppercase' }}>Guestbook Activity Stream</span>
        </div>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{uploads.length} entries</span>
      </div>

      {/* Message Feed Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {uploads.map((msg, idx) => {
          const imgUrl = resolveImageSource(msg.image_url);
          return (
            <div 
              key={msg.id || idx} 
              style={{ 
                display: 'flex', 
                gap: '12px', 
                background: 'rgba(255,255,255,0.02)', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                border: '1px solid rgba(255,255,255,0.03)',
                animation: 'fadeInUp 0.4s ease-out forwards'
              }}
            >
              {imgUrl && (
                <img 
                  src={imgUrl} 
                  style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(217,191,141,0.2)' }} 
                  alt="" 
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', fontSize: '14px', fontWeight: 500 }}>
                    {msg.sender_name || 'Anonymous'}
                  </span>
                  <svg viewBox="0 0 24 24" style={{ width: '11px', height: '11px', fill: 'rgba(217,191,141,0.6)' }}>
                    <path d="M10,2 H14 V6 H18 V10 H14 V22 H10 V10 H6 V6 H10 Z" />
                  </svg>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: 1.4, margin: 0 }}>
                  {msg.message_text}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
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

const LiveTributeLowerThird = ({ uploads, frame }) => {
  const seenMessageIds = useRef(new Set());
  const currentMessageIdRef = useRef(null);
  const [isFirstTime, setIsFirstTime] = useState(false);

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

  if (activeUpload && activeUpload.id !== currentMessageIdRef.current) {
    currentMessageIdRef.current = activeUpload.id;
    if (!seenMessageIds.current.has(activeUpload.id)) {
      seenMessageIds.current.add(activeUpload.id);
      setIsFirstTime(true);
    } else {
      setIsFirstTime(false);
    }
  }

  const translateX = linearInterpolate(itemFrame, [0, LIVE_LOWER_THIRD_FRAMES], [-1100, 1100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const hasReachedCenter = translateX >= 0;
  const shouldDisperse = isFirstTime && hasReachedCenter;

  const translateY = linearInterpolate(itemFrame, [0, LIVE_LOWER_THIRD_FRAMES / 2, LIVE_LOWER_THIRD_FRAMES], [10, -10, 10], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = linearInterpolate(itemFrame, [0, 54, LIVE_LOWER_THIRD_FRAMES - 64, LIVE_LOWER_THIRD_FRAMES], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const crossPlacements = [
    { delay: 0.0, startX: 0, driftX: -20, targetY: -290 },
    { delay: 0.5, startX: -5, driftX: 25, targetY: -360 },
    { delay: 1.0, startX: 5, driftX: -8, targetY: -420 }
  ];

  const dustAngles = [220, 240, 260, 270, 280, 300, 320, 250, 290, 270];

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
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes crossSlowAscend {
          0% { transform: translate(var(--startX), 0); opacity: 0; }
          15% { opacity: 0.85; }
          75% { opacity: 0.60; }
          100% { transform: translate(var(--driftX), var(--targetY)); opacity: 0; }
        }
        @keyframes dustScatter {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          15% { opacity: 0.9; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.2); opacity: 0; }
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          width: 'fit-content',
          minWidth: '320px',    
          maxWidth: '90vw',
          minHeight: '90px',
          opacity,
          transform: `translate(${translateX}px, ${translateY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 20px',
          background: 'rgba(18,23,25,0.95)',
          border: '1px solid rgba(217,191,141,0.42)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
          borderRadius: '8px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            flex: '0 0 60px',
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
            <div style={{ color: 'rgba(255,255,255,0.52)', fontFamily: 'Georgia, serif', fontSize: '20px' }}>+</div>
          )}
        </div>
        
        <div style={{ minWidth: 0, flex: 1, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: 'fit-content' }}>
            <span style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', fontSize: '18px', lineHeight: 1.1, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeUpload.sender_name || 'Guest'}
            </span>

            <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
              <svg
                viewBox="0 0 24 24"
                style={{
                  width: '16px',
                  height: '16px',
                  fill: '#d9bf8d',
                  marginLeft: '10px',
                  marginBottom: '2px',
                  filter: 'drop-shadow(0 0 4px rgba(217,191,141,0.5))',
                  transition: 'opacity 0.25s ease-out',
                  opacity: shouldDisperse ? 0 : 1, 
                }}
              >
                <path d="M10,2 H14 V6 H18 V10 H14 V22 H10 V10 H6 V6 H10 Z" />
              </svg>

              {shouldDisperse && crossPlacements.map((config, idx) => (
                <AscendingCrossParticle 
                  key={`${activeUpload.id}-cloncross-${idx}`} 
                  delay={config.delay}
                  startX={config.startX}
                  driftX={config.driftX}
                  targetY={config.targetY}
                />
              ))}

              {shouldDisperse && dustAngles.map((angle, idx) => (
                <GoldDustParticle 
                  key={`${activeUpload.id}-dust-${idx}`} 
                  angle={angle} 
                  delay={idx * 0.04} 
                  distance={25 + Math.random() * 35}
                  size={Math.random() > 0.5 ? 3 : 2}
                />
              ))}
            </div>
          </div>

          <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: '14px', lineHeight: 1.3, fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {activeUpload.message_text || 'Shared a memory.'}
          </div>
        </div>
      </div>
    </div>
  );
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
  const [isMobile, setIsMobile] = useState(false);
  const lastTimeRef = useRef(Date.now());

  // Detect window resizing to dynamically toggle full-screen vs split-screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Initial run
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      className="slideshow-master-viewport"
      style={{
        position: 'fixed',
        inset: 0,
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden',
        background: '#101417',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row', // Columns on mobile split, flat row layouts elsewhere
        width: '100vw',
        height: '100vh',
        boxSizing: 'border-box'
      }}
    >
      {/* Global CSS Injection for Mobile Fade Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Background funeralHomeName={funeralHomeName} lovedOneName={lovedOneName} frame={frame} />
      
      {/* LEFT SIDE / TOP HALF: THE CINEMATIC MEDIA CONTROLLER */}
      <div 
        style={{ 
          flex: isMobile ? '0 0 50%' : '0 0 100%', 
          width: isMobile ? '100%' : '100%', 
          height: isMobile ? '50%' : '100%',
          position: 'relative', 
          overflow: 'hidden' 
        }}
      >
        <div style={{ position: 'absolute', inset: 0, bottom: isMobile ? 0 : '20%', overflow: 'hidden' }}>
          {visibleItems.map(({ item, frame: itemFrame, opacity, isEntering }) =>
            item.type === 'title' ? (
              <SectionTitleCard key={`${item.id}-${item.start}`} section={item.section} frame={itemFrame} opacity={opacity} />
            ) : (
              <SectionPhotoPlayer key={`${item.id}-${item.start}`} item={item} slideFrame={itemFrame} opacity={opacity} isEntering={isEntering} />
            )
          )}
        </div>

        {/* Hide running ticker ticker overlay entirely when mobile split chat view is engaged */}
        {!isMobile && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20%', zIndex: 50 }}>
            <LiveTributeLowerThird uploads={lowerThirdUploads} frame={frame} />
          </div>
        )}
      </div>

      {/* RIGHT SIDE / BOTTOM HALF: ACTIVE LIVE CHAT RENDERING WINDOW */}
      {isMobile && <MobileLiveChatFeed uploads={lowerThirdUploads} />}
    </div>
  );
};