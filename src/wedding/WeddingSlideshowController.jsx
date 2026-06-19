import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';

// ==========================================
// 📱 PREMIUM HYBRID RESPONSIVE GRID STYLES
// ==========================================
const slideshowStyles = `
  @keyframes kenburns {
    0% { transform: scale(1.0) translate(0px, 0px); }
    50% { transform: scale(1.08) translate(-10px, -5px); }
    100% { transform: scale(1.0) translate(0px, 0px); }
  }
  
  /* 🎬 SYNCED FADE-IN / FADE-OUT SEQUENCE FOR TV & MOBILE */
  @keyframes strictFadeInOut {
    0% { opacity: 0; }
    8% { opacity: 1; }
    92% { opacity: 1; }
    100% { opacity: 0; }
  }
  
  .animate-kenburns {
    animation: kenburns 24s ease-in-out infinite;
  }
  
  .animate-fade-io {
    animation: strictFadeInOut 8.5s ease-in-out forwards;
  }

  /* 🖥️ TV/WIDESCREEN MODE */
  .tv-display-mode {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: #000000;
  }
  .tv-photo-stage {
    width: 65%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 30px;
    box-sizing: border-box;
  }
  .tv-sidebar-stage {
    width: 35%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(12, 15, 18, 0.98), rgba(6, 8, 10, 1.0));
    border-left: 4px solid rgba(217, 191, 141, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0 35px 40px 35px;
    box-sizing: border-box;
  }

  /* 📱 MOBILE ARCHITECTURE OVERRIDES */
  @media (max-width: 768px) {
    .tv-display-mode {
      display: none !important;
    }
    .mobile-dashboard-layout {
      display: flex !important;
      flex-direction: column !important;
      width: 100vw;
      height: 100vh;
      background-color: #0c0f12;
      overflow: hidden;
    }
    
    /* Box 1: Mobile Slideshow Viewport Frame (Top 45%) */
    .mobile-video-frame {
      height: 45vh;
      width: 100%;
      position: relative;
      background-color: #000;
      border-bottom: 2px solid rgba(217, 191, 141, 0.3);
      overflow: hidden;
    }
    
    /* Box 2: Original Dark Slate Action Button Bar with Bold White Text */
    .mobile-action-bar {
      height: 10vh;
      width: 100%;
      background: #13171e;
      border-bottom: 2px solid #d9bf8d;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      z-index: 10;
    }
    .mobile-action-btn {
      color: #ffffff !important;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-decoration: none;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Box 3: Live Messages Feed (Bottom 45%) */
    .mobile-messages-feed {
      height: 45vh;
      width: 100%;
      overflow-y: auto !important;
      padding: 15px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      -webkit-overflow-scrolling: touch;
    }
    .mobile-feed-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(217, 191, 141, 0.2);
      border-radius: 8px;
      padding: 15px;
      text-align: left;
    }
    .mobile-feed-card:first-child {
      border: 1px solid #d9bf8d;
      background: rgba(217, 191, 141, 0.05);
    }
    .mobile-feed-sender {
      color: #d9bf8d;
      font-family: 'Georgia', serif;
      font-weight: bold;
      font-size: 1.1rem;
      display: block;
      margin-bottom: 4px;
    }
    .mobile-feed-text {
      color: #ffffff;
      font-family: system-ui, sans-serif;
      font-size: 1rem;
      margin: 0;
      line-height: 1.4;
    }
  }
`;

// ==========================================
// ❤️ DESIGN-ANCHORED HEART EMITTER
// ==========================================
const HeartBurstCanvas = ({ triggerToggle }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (triggerToggle === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    let particles = [];
    const colors = ['#ff4d6d', '#ff758f', '#ff8fa3', '#d9bf8d', '#ffb3c1'];
    const originX = canvas.width / 2;
    const originY = canvas.height * 0.72; 

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: originX + (Math.random() - 0.5) * 80,
        y: originY,
        size: Math.random() * 14 + 8,
        speedX: (Math.random() - 0.5) * 5,
        speedY: -Math.random() * 6 - 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.05
      });
    }

    let animationId;
    function drawHeart(ctx, x, y, size) {
      ctx.beginPath();
      ctx.moveTo(x, y + size / 4);
      ctx.quadraticCurveTo(x, y - size / 2, x + size / 2, y - size / 2);
      ctx.quadraticCurveTo(x + size, y - size / 2, x + size, y + size / 4);
      ctx.quadraticCurveTo(x + size, y + size * 0.75, x, y + size * 1.2);
      ctx.quadraticCurveTo(x - size, y + size * 0.75, x - size, y + size / 4);
      ctx.quadraticCurveTo(x - size, y - size / 2, x, y - size / 2);
      ctx.quadraticCurveTo(x, y + size / 4, x, y + size / 4);
      ctx.closePath();
      ctx.fill();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        if (p.opacity <= 0) return;
        alive = true;
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity -= 0.012;
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        drawHeart(ctx, 0, 0, p.size);
        ctx.restore();
      });
      if (alive) {
        animationId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [triggerToggle]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2, backgroundColor: 'transparent' }} />;
};

// ==========================================
// 1. UNIFIED PRESENTATION ELEMENT PLAYER
// ==========================================
const WeddingPhotoPlayer = ({ item, liveEventId, burstTrigger }) => {
  const [typedMessage, setTypedMessage] = useState('');

  const currentPhoto = item?.photo || {};
  const messageText = currentPhoto.message_text || currentPhoto.message || 'Cheers to the beautiful couple!';
  const senderName = currentPhoto.sender_name || currentPhoto.sender || 'Wedding Guest';
  const imgUrl = currentPhoto.imageUrl || currentPhoto.image_url || currentPhoto.url || currentPhoto.downloadURL || '';

  useEffect(() => {
    if (item.type !== 'photo' || !messageText) return;
    let charIndex = 0;
    setTypedMessage('');
    const cleanMessage = String(messageText);
    const typerInterval = setInterval(() => {
      if (charIndex <= cleanMessage.length) {
        setTypedMessage(cleanMessage.substring(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typerInterval);
      }
    }, 35);
    return () => clearInterval(typerInterval);
  }, [messageText, item.type, item.id]);

  if (item.type === 'welcome') {
    const qrCodeTargetUrl = `https://slidekast.vercel.app/${liveEventId}`;
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrCodeTargetUrl)}&color=0-0-0&bgcolor=ffffff`;

    return (
      /* 📺 TV SLIDE: Locked to the new fade-in / fade-out sequence animation */
      <div className="animate-fade-io tv-display-mode" style={{ position: 'absolute', inset: 0, backgroundColor: '#0c0f12' }}>
        <video src="/Wedding1/welcome-bg.mp4" autoPlay loop muted playsInline preload="auto" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
        <div style={{ position: 'absolute', left: '30.8%', top: '55.5%', transform: 'translate(-50%, -50%)', zIndex: 5, width: '340px', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 0 50px rgba(215, 180, 106, 0.5)' }}>
          <img src={qrCodeApiUrl} alt="Scan QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ position: 'absolute', right: '4%', top: '32%', width: '42%', height: '55%', zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', fontSize: '3.3rem', lineHeight: '1.4', fontWeight: 'bold', textShadow: '0 4px 12px rgba(0,0,0,0.9)' }}>
            <p style={{ margin: '0 0 20px 0' }}>Welcome Friends & Family</p>
            <p style={{ color: '#ffffff', fontSize: '2.4rem', fontStyle: 'italic', margin: 0 }}>Scan the QR Code to share your photos directly!</p>
          </div>
        </div>
      </div>
    );
  }

  if (!imgUrl) return null;

  return (
    /* 📺 TV SLIDE: Synchronized identical fade-in / fade-out layout window */
    <div className="animate-fade-io tv-display-mode" style={{ position: 'absolute', inset: 0 }}>
      <div className="animate-kenburns" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(45px) brightness(16%)', transform: 'scale(1.15)', zIndex: 1 }} />
      <div className="tv-photo-stage" style={{ zIndex: 2 }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.85)' }}>
          <img className="animate-kenburns" src={imgUrl} alt="Live Stream" style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 3 }} />
        </div>
      </div>
      <div className="tv-sidebar-stage" style={{ zIndex: 5, textAlign: 'center' }}>
        <HeartBurstCanvas triggerToggle={burstTrigger} />
        <img src="/Wedding1/gold-divider.png" alt="" style={{ width: 'calc(100% - 4px)', height: 'auto', marginTop: '-3px', marginBottom: '35px', mixBlendMode: 'screen', opacity: 0.95, zIndex: 3 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '45px', zIndex: 3 }}>
          <img src="/Wedding1/couple-profile.png" style={{ width: '360px', height: '360px', borderRadius: '50%', objectFit: 'cover', border: '7px solid #d9bf8d', boxShadow: '0 20px 45px rgba(0,0,0,0.6)' }} alt="Profile" />
        </div>
        <span style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', fontSize: '3.0rem', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '24px', textShadow: '3px 3px 6px rgba(0,0,0,0.6)', zIndex: 4 }}>{senderName}</span>
        <p style={{ color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '2.8rem', margin: 0, fontStyle: 'italic', fontWeight: '600', lineHeight: '1.4', maxWidth: '95%', textShadow: '2px 2px 5px rgba(0,0,0,0.9)', zIndex: 4 }}>
          {typedMessage ? `"${typedMessage}"` : ""}
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 2. MAIN SYNC CONTROLLER
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCMQA0SGLYMq2lf0zSr8NQA_JrNDBFSAmk",
  authDomain: "elite-event-network.firebaseapp.com",
  projectId: "elite-event-network",
  storageBucket: "elite-event-network.appspot.com",
  messagingSenderId: "118072539772",
  appId: "1:118072539772:web:0b9451cdf0387cfc3da7f9"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export const WeddingSlideshowController = ({ liveEventId: passedEventId }) => {
  const [liveGuestUploads, setLiveGuestUploads] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [burstTrigger, setBurstTrigger] = useState(0);
  const previousDataHashRef = useRef('');
  const isInitialLoadRef = useRef(true);

  const liveEventId = useMemo(() => {
    if (passedEventId) return passedEventId;
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    return pathSegments[0] || 'wedding';
  }, [passedEventId]);

  useEffect(() => {
    const targetCollectionRef = collection(db, 'events', liveEventId, 'receptionStream');
    const q = query(targetCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedPhotos = [];
      let incomingDataString = '';
      snapshot.forEach((doc) => {
        const data = doc.data();
        const targetUrl = data.imageUrl || data.image_url || data.url || data.downloadURL;
        if (!targetUrl) return;
        updatedPhotos.push({ id: doc.id, photo: data });
        incomingDataString += `${doc.id}-${targetUrl};`;
      });
      
      if (incomingDataString !== previousDataHashRef.current) {
        if (!isInitialLoadRef.current && updatedPhotos.length > liveGuestUploads.length) {
          setBurstTrigger((prev) => prev + 1);
        }
        isInitialLoadRef.current = false;
        previousDataHashRef.current = incomingDataString;
        setLiveGuestUploads(updatedPhotos);
        if (updatedPhotos.length > 0) {
          setCurrentSlideIndex(0); 
        }
      }
    }, (error) => {
      console.error("Firestore sync offline", error);
    });
    return () => unsubscribe();
  }, [liveEventId, liveGuestUploads.length]);

  const widescreenTimelineItems = useMemo(() => {
    let combined = [{ id: 'welcome-initial', type: 'welcome' }];
    if (liveGuestUploads.length > 0) {
      const sorted = [...liveGuestUploads].sort((a, b) => (b.photo?.createdAt || 0) - (a.photo?.createdAt || 0));
      sorted.forEach((item, index) => {
        combined.push({ id: `photo-${index}-${item.id}`, type: 'photo', photo: item.photo });
        if ((index + 1) % 5 === 0) combined.push({ id: `welcome-loop-${index}`, type: 'welcome' });
      });
    }
    return combined;
  }, [liveGuestUploads]);

  const mobileSortedGalleryItems = useMemo(() => {
    return [...liveGuestUploads].sort((a, b) => {
      const timeA = a.photo?.createdAt?.seconds || a.photo?.createdAt || 0;
      const timeB = b.photo?.createdAt?.seconds || b.photo?.createdAt || 0;
      return timeB - timeA;
    });
  }, [liveGuestUploads]);

  useEffect(() => {
    if (widescreenTimelineItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % widescreenTimelineItems.length);
    }, 8500);
    return () => clearInterval(interval);
  }, [widescreenTimelineItems]);

  const activeItem = widescreenTimelineItems[currentSlideIndex] || widescreenTimelineItems[0];
  
  const activeMobileItem = useMemo(() => {
    if (mobileSortedGalleryItems.length === 0) return null;
    const mobileIndex = currentSlideIndex % mobileSortedGalleryItems.length;
    return mobileSortedGalleryItems[mobileIndex];
  }, [mobileSortedGalleryItems, currentSlideIndex]);

  const mobileUrl = activeMobileItem?.photo?.imageUrl || activeMobileItem?.photo?.image_url || activeMobileItem?.photo?.url || activeMobileItem?.photo?.downloadURL;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <style>{slideshowStyles}</style>

      {/* 🖥️ VIEWPORT LAYER 1: WIDESCREEN TV LAYOUT */}
      {activeItem && <WeddingPhotoPlayer item={activeItem} liveEventId={liveEventId} burstTrigger={burstTrigger} />}

      {/* 📱 VIEWPORT LAYER 2: CLEAN SPLIT-SCREEN DASHBOARD (MOBILE) */}
      <div className="mobile-dashboard-layout" style={{ display: 'none' }}>
        
        {/* 🟥 BOX 1: FADE-IN / FADE-OUT IMAGES FRAME */}
        <div className="mobile-video-frame">
          {!mobileUrl ? (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#0c0f12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', textAlign: 'center' }}>
              <span style={{ color: '#d9bf8d', fontFamily: 'Georgia', fontSize: '1.4rem', fontWeight: 'bold' }}>Marcus & Danielle</span>
              <span style={{ color: '#ffffff', opacity: 0.7, fontSize: '1rem', marginTop: '5px', fontStyle: 'italic' }}>Live Guest Slideshow Feed</span>
            </div>
          ) : (
            /* 📱 MOBILE SLIDE: Matches identical fade-in/out transition matrix perfectly using unmount mounting keys */
            <div key={activeMobileItem.id} className="animate-fade-io" style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#000' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${mobileUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px) brightness(30%)' }} />
              <img src={mobileUrl} alt="Live Feed" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 2 }} />
            </div>
          )}
        </div>

        {/* ⬛ BOX 2: NAVIGATION DIVIDER BAR (Clean layout-driven casing) */}
        <div className="mobile-action-bar">
          <a href={`/${liveEventId}`} className="mobile-action-btn">
            📸 Click to Photo Upload Page
          </a>
        </div>

        {/* ⬛ BOX 3: MESSAGES SCROLLING TIMELINE */}
        <div className="mobile-messages-feed">
          {mobileSortedGalleryItems.length === 0 ? (
            <div style={{ color: '#ffffff', opacity: 0.4, textAlign: 'center', padding: '30px', fontFamily: 'system-ui' }}>
              Waiting for the first message...
            </div>
          ) : (
            mobileSortedGalleryItems.map((item) => (
              <div key={item.id} className="mobile-feed-card">
                <span className="mobile-feed-sender">
                  {item.photo.sender_name || item.photo.sender || 'Wedding Guest'}
                </span>
                <p className="mobile-feed-text">
                  "{item.photo.message_text || item.photo.message || 'Cheers to the beautiful couple!'}"
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};