import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';

// ==========================================
// 📱 PREMIUM HYBRID RESPONSIVE GRID STYLES
// ==========================================
const slideshowStyles = `
  @keyframes kenburns {
    0% { transform: scale(1.0) translate(0px, 0px); }
    50% { transform: scale(1.08) translate(-10px, -5px); }
    100% { transform: scale(1.0) translate(0px, 0px); }
  }
  
  @keyframes crossDissolve {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes strictFadeInOut {
    0% { opacity: 0; }
    15% { opacity: 1; }
    85% { opacity: 1; }
    100% { opacity: 0; }
  }
  
  .animate-kenburns {
    animation: kenburns 24s ease-in-out infinite;
  }
  
  .animate-cross-dissolve {
    animation: crossDissolve 6.0s cubic-bezier(0.445, 0.05, 0.55, 0.95) forwards;
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
    position: relative;
    overflow: hidden;
    background-color: #000000;
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
    position: relative;
    z-index: 10;
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
    
    .mobile-video-frame {
      height: 45vh;
      width: 100%;
      position: relative;
      background-color: #000;
      border-bottom: 2px solid rgba(217, 191, 141, 0.3);
      overflow: hidden;
    }
    
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
      cursor: pointer;
      position: relative; /* Anchor for canvas bubbles */
      overflow: visible;
      transition: background 0.2s ease;
    }
    .mobile-feed-card.active-card {
      border: 1px solid #d9bf8d;
      background: rgba(217, 191, 141, 0.04);
    }
    
    .mobile-card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    
    .mobile-feed-sender {
      color: #d9bf8d;
      font-family: 'Georgia', serif;
      font-weight: bold;
      font-size: 1.1rem;
    }
    
    /* ❤️ CARD-LEVEL LIKE INTERFACE BUTTON */
    .mobile-like-trigger-zone {
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(217, 191, 141, 0.3);
      padding: 4px 10px;
      border-radius: 20px;
      color: #ffffff;
      font-family: system-ui, sans-serif;
      font-size: 0.85rem;
      font-weight: bold;
      z-index: 5;
      position: relative;
    }
    .mobile-like-trigger-zone:active {
      transform: scale(0.92);
      background: rgba(217, 191, 141, 0.1);
    }

    .mobile-feed-text {
      color: #ffffff;
      font-family: system-ui, sans-serif;
      font-size: 1rem;
      margin: 0;
      line-height: 1.4;
    }
    
    .mobile-reply-box {
      margin-top: 12px;
      border-top: 1px dashed rgba(217, 191, 141, 0.2);
      padding-top: 10px;
    }
    .mobile-reply-item {
      background: rgba(0, 0, 0, 0.2);
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 6px;
      font-size: 0.9rem;
      border-left: 2px solid #d9bf8d;
    }
    .mobile-reply-author {
      color: #d9bf8d;
      font-weight: 700;
      margin-right: 6px;
    }
    .mobile-reply-body {
      color: #e0e0e0;
    }
    
    .mobile-input-row {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }
    .mobile-text-field {
      flex: 1;
      background: #0c0f12;
      border: 1px solid rgba(217, 191, 141, 0.4);
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    .mobile-send-btn {
      background: #d9bf8d;
      color: #0c0f12;
      border: none;
      padding: 8px 14px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 0.9rem;
    }
  }
`;

// ==========================================
// 🎇 LOCALIZED CARD PARTICLE BURST CANVAS
// ==========================================
const CardBurstCanvas = ({ clicks, isMemorial }) => {
  const canvasRef = useRef(null);
  const prevClicksRef = useRef(clicks);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let activeParticles = [];
    let animationFrameId;

    const setupCanvasSize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    setupCanvasSize();

    const spawnParticles = () => {
      const colors = isMemorial ? ['#ffffff', '#d9bf8d', '#e0e0e0'] : ['#ff4d6d', '#ff758f', '#ff8fa3', '#d9bf8d'];
      
      // Spawn near the bottom right area where the like button sits
      const originX = canvas.width - 45;
      const originY = canvas.height - 20;

      for (let i = 0; i < 8; i++) {
        activeParticles.push({
          x: originX + (Math.random() - 0.5) * 20,
          y: originY,
          size: Math.random() * 10 + 6,
          speedX: (Math.random() - 0.5) * 4,
          speedY: -Math.random() * 4 - 2, // Upward floating vector
          opacity: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI,
          spinSpeed: (Math.random() - 0.5) * 0.08
        });
      }
    };

    // Detect click state change to spawn a localized cluster
    if (clicks > prevClicksRef.current) {
      spawnParticles();
      prevClicksRef.current = clicks;
    }

    // Shapes: Heart Canvas Generator
    const drawHeartShape = (ctx, x, y, size) => {
      ctx.beginPath();
      ctx.moveTo(x, y + size / 4);
      ctx.quadraticCurveTo(x, y - size / 2, x + size / 2, y - size / 2);
      ctx.quadraticCurveTo(x + size, y - size / 2, x + size, y + size / 4);
      ctx.quadraticCurveTo(x + size, y + size * 0.75, x, y + size * 1.2);
      ctx.quadraticCurveTo(x - size, y + size * 0.75, x - size, y + size / 4);
      ctx.quadraticCurveTo(x - size, y - size / 2, x, y - size / 2);
      ctx.closePath();
      ctx.fill();
    };

    // Shapes: Cross Canvas Generator
    const drawCrossShape = (ctx, x, y, size) => {
      const thickness = size * 0.3;
      ctx.beginPath();
      // Horizontal bar
      ctx.rect(x - size / 2, y - thickness / 2, size, thickness);
      // Vertical bar
      ctx.rect(x - thickness / 2, y - size * 0.7, thickness, size * 1.3);
      ctx.closePath();
      ctx.fill();
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let holdsAlive = false;

      activeParticles.forEach((p) => {
        if (p.opacity <= 0) return;
        holdsAlive = true;

        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity -= 0.02;
        p.rotation += p.spinSpeed;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        if (isMemorial) {
          drawCrossShape(ctx, 0, 0, p.size);
        } else {
          drawHeartShape(ctx, 0, 0, p.size);
        }
        
        ctx.restore();
      });

      if (holdsAlive) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    if (activeParticles.length > 0 || clicks > 0) {
      loop();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [clicks, isMemorial]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'absolute', 
        inset: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: 4, 
        backgroundColor: 'transparent' 
      }} 
    />
  );
};

// ==========================================
// ❤️ DESIGN-ANCHORED RECEPTION SCREEN BURST
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

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 12, backgroundColor: 'transparent' }} />;
};

// ==========================================
// 1. UNIFIED PRESENTATION ELEMENT PLAYER
// ==========================================
const WeddingPhotoPlayer = ({ item, burstTrigger }) => {
  const [typedMessage, setTypedMessage] = useState('');

  const currentPhoto = item?.photo || {};
  const messageText = currentPhoto.message_text || currentPhoto.message || 'Cheers to the beautiful couple!';
  const senderName = currentPhoto.sender_name || currentPhoto.sender || 'Wedding Guest';
  const imgUrl = currentPhoto.imageUrl || currentPhoto.image_url || currentPhoto.url || currentPhoto.downloadURL || '';

  useEffect(() => {
    if (!messageText) return;
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
  }, [messageText, item.id]);

  if (!imgUrl) return null;

  return (
    <div className="tv-display-mode" style={{ position: 'absolute', inset: 0 }}>
      <div className="tv-photo-stage animate-cross-dissolve" key={`img-stage-${item.id}`}>
        <div className="animate-kenburns" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(45px) brightness(16%)', transform: 'scale(1.15)', zIndex: 1 }} />
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.85)', zIndex: 2 }}>
          <img className="animate-kenburns" src={imgUrl} alt="Live Stream" style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 3 }} />
        </div>
      </div>

      <div className="tv-sidebar-stage">
        <HeartBurstCanvas triggerToggle={burstTrigger} />
        <img src="/Wedding1/gold-divider.png" alt="" style={{ width: 'calc(100% - 4px)', height: 'auto', marginTop: '-3px', marginBottom: '35px', mixBlendMode: 'screen', opacity: 0.95, zIndex: 3 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '45px', zIndex: 3 }}>
          <img src="/Wedding1/couple-profile.png" style={{ width: '360px', height: '360px', borderRadius: '50%', objectFit: 'cover', border: '7px solid #d9bf8d', boxShadow: '0 20px 45px rgba(0,0,0,0.6)' }} alt="Profile" />
        </div>
        <span style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', fontSize: '3.0rem', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '24px', textShadow: '3px 3px 6px rgba(0,0,0,0.6)', zIndex: 4 }}>
          {senderName}
        </span>
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

export const WeddingSlideshowController = ({ liveEventId: passedEventId, eventType }) => {
  const [liveGuestUploads, setLiveGuestUploads] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [burstTrigger, setBurstTrigger] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [guestName, setGuestName] = useState('');
  
  // Local state map to trigger immediate UI canvas burst before network finish
  const [localClickCounters, setLocalClickCounters] = useState({});
  
  const previousDataHashRef = useRef('');
  const isInitialLoadRef = useRef(true);

  const liveEventId = useMemo(() => {
    if (passedEventId) return passedEventId;
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    return pathSegments[0] || 'wedding';
  }, [passedEventId]);

  const isMemorialTheme = useMemo(() => {
    return eventType === "Tom-Memorial" || liveEventId.toLowerCase().includes('memorial');
  }, [eventType, liveEventId]);

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
        incomingDataString += `${doc.id}-${targetUrl}-${data.likeCount || 0}-${JSON.stringify(data.replies || [])};`;
      });
      
      if (incomingDataString !== previousDataHashRef.current) {
        if (!isInitialLoadRef.current && updatedPhotos.length > liveGuestUploads.length) {
          setBurstTrigger((prev) => prev + 1);
        }
        isInitialLoadRef.current = false;
        previousDataHashRef.current = incomingDataString;
        setLiveGuestUploads(updatedPhotos);
        if (updatedPhotos.length > 0 && currentSlideIndex === 0) {
          setCurrentSlideIndex(0); 
        }
      }
    }, (error) => {
      console.error("Firestore sync offline", error);
    });
    return () => unsubscribe();
  }, [liveEventId, liveGuestUploads.length, currentSlideIndex]);

  const sortedGalleryItems = useMemo(() => {
    return [...liveGuestUploads].sort((a, b) => {
      const timeA = a.photo?.createdAt?.seconds || a.photo?.createdAt || 0;
      const timeB = b.photo?.createdAt?.seconds || b.photo?.createdAt || 0;
      return timeB - timeA;
    });
  }, [liveGuestUploads]);

  useEffect(() => {
    if (sortedGalleryItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % sortedGalleryItems.length);
    }, 8500);
    return () => clearInterval(interval);
  }, [sortedGalleryItems]);

  // 📝 PERSISTENT FIREBASE LIKE INCREMENT ROUTER
  const handleLikeIncrement = async (e, documentId) => {
    e.preventDefault();
    e.stopPropagation(); // Avoid triggering card expanded drawer
    
    // 1. Immediately increment local click counters to fire smooth canvas animations instantly
    setLocalClickCounters((prev) => ({
      ...prev,
      [documentId]: (prev[documentId] || 0) + 1
    }));

    // 2. Commit transaction straight to deep Firebase document tree
    try {
      const docRef = doc(db, 'events', liveEventId, 'receptionStream', documentId);
      await updateDoc(docRef, {
        likeCount: increment(1)
      });
    } catch (err) {
      console.error("Could not append interaction like counter", err);
    }
  };

  const handleSendReply = async (e, documentId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!replyText.trim()) return;

    const finalAuthor = guestName.trim() || 'Wedding Guest';
    const replyPayload = {
      author: finalAuthor,
      text: replyText.trim(),
      timestamp: Date.now()
    };

    try {
      const docRef = doc(db, 'events', liveEventId, 'receptionStream', documentId);
      await updateDoc(docRef, {
        replies: arrayUnion(replyPayload)
      });
      setReplyText('');
    } catch (err) {
      console.error("Failed to commit live sub-reply", err);
    }
  };

  const activeItem = sortedGalleryItems[currentSlideIndex];
  const activeMobileItem = sortedGalleryItems[currentSlideIndex % sortedGalleryItems.length] || null;
  const mobileUrl = activeMobileItem?.photo?.imageUrl || activeMobileItem?.photo?.image_url || activeMobileItem?.photo?.url || activeMobileItem?.photo?.downloadURL;

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <style>{slideshowStyles}</style>

      {/* 🖥️ VIEWPORT LAYER 1: WIDESCREEN TV LAYOUT */}
      {activeItem ? (
        <WeddingPhotoPlayer item={activeItem} liveEventId={liveEventId} burstTrigger={burstTrigger} />
      ) : (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0c0f12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#d9bf8d', fontFamily: 'Georgia', fontSize: '2rem' }}>Waiting for Photos...</span>
        </div>
      )}

      {/* 📱 VIEWPORT LAYER 2: INTERACTIVE DASHBOARD WITH LOCALIZED CANVAS PARTICLE ENGINES */}
      <div className="mobile-dashboard-layout" style={{ display: 'none' }}>
        
        {/* BOX 1: FRAME */}
        <div className="mobile-video-frame">
          {!mobileUrl ? (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#0c0f12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', textAlign: 'center' }}>
              <span style={{ color: '#d9bf8d', fontFamily: 'Georgia', fontSize: '1.4rem', fontWeight: 'bold' }}>
                {isMemorialTheme ? "In Loving Memory" : "Marcus & Danielle"}
              </span>
              <span style={{ color: '#ffffff', opacity: 0.7, fontSize: '1rem', marginTop: '5px', fontStyle: 'italic' }}>Live Guest Slideshow Feed</span>
            </div>
          ) : (
            <div key={`mobile-${activeMobileItem.id}`} className="animate-fade-io" style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#000' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${mobileUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px) brightness(30%)' }} />
              <img src={mobileUrl} alt="Live Feed" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 2 }} />
            </div>
          )}
        </div>

        {/* BOX 2: NAVIGATION BAR */}
        <div className="mobile-action-bar">
          <a href={`/${liveEventId}`} className="mobile-action-btn">
            📸 Click to Photo Upload Page
          </a>
        </div>

        {/* BOX 3: INTERACTIVE TIMELINE FEED WITH ADAPTIVE THEME EMITTERS */}
        <div className="mobile-messages-feed">
          {sortedGalleryItems.length === 0 ? (
            <div style={{ color: '#ffffff', opacity: 0.4, textAlign: 'center', padding: '30px', fontFamily: 'system-ui' }}>
              Waiting for the first message...
            </div>
          ) : (
            sortedGalleryItems.map((item) => {
              const isSelected = selectedCardId === item.id;
              const cardReplies = item.photo?.replies || [];
              const databaseLikes = item.photo?.likeCount || 0;
              const localClicks = localClickCounters[item.id] || 0;

              return (
                <div 
                  key={item.id} 
                  className={`mobile-feed-card ${isSelected ? 'active-card' : ''}`}
                  onClick={() => setSelectedCardId(isSelected ? null : item.id)}
                >
                  {/* 🎇 Local embedded particle layer matches theme constraints directly */}
                  <CardBurstCanvas clicks={localClicks} isMemorial={isMemorialTheme} />

                  <div className="mobile-card-header-row">
                    <span className="mobile-feed-sender">
                      {item.photo.sender_name || item.photo.sender || (isMemorialTheme ? 'Family Friend' : 'Wedding Guest')}
                    </span>
                    
                    {/* ❤️/⛪ SHY-USER HIGH ENGAGEMENT INTERACTION REGION */}
                    <button 
                      type="button" 
                      className="mobile-like-trigger-zone"
                      onClick={(e) => handleLikeIncrement(e, item.id)}
                    >
                      <span>{isMemorialTheme ? "🤍" : "❤️"}</span>
                      <span>{databaseLikes + localClicks === 0 ? "Like" : databaseLikes}</span>
                    </button>
                  </div>

                  <p className="mobile-feed-text">
                    "{item.photo.message_text || item.photo.message || (isMemorialTheme ? 'Thinking of you during this time.' : 'Cheers to the beautiful couple!')}"
                  </p>

                  {/* 💬 REPLIES AREA */}
                  {isSelected ? (
                    <div className="mobile-reply-box" onClick={(e) => e.stopPropagation()}>
                      {cardReplies.map((reply, rIdx) => (
                        <div key={rIdx} className="mobile-reply-item">
                          <span className="mobile-reply-author">{reply.author}:</span>
                          <span className="mobile-reply-body">{reply.text}</span>
                        </div>
                      ))}

                      <form onSubmit={(e) => handleSendReply(e, item.id)} className="mobile-input-row">
                        <input 
                          type="text" 
                          placeholder="Your Name..." 
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="mobile-text-field"
                          style={{ maxWidth: '90px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Write a response..." 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="mobile-text-field"
                        />
                        <button type="submit" className="mobile-send-btn" onClick={(e) => handleSendReply(e, item.id)}>Reply</button>
                      </form>
                    </div>
                  ) : (
                    cardReplies.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#d9bf8d', marginTop: '8px', opacity: 0.8 }}>
                        💬 {cardReplies.length} {cardReplies.length === 1 ? 'response' : 'responses'} (Tap to read)
                      </div>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};