import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';

// ==========================================
// CINEMATIC STYLES (Ken Burns + Crossfade)
// ==========================================
const slideshowStyles = `
  @keyframes kenburns {
    0% { transform: scale(1.0) translate(0px, 0px); }
    50% { transform: scale(1.08) translate(-10px, -5px); }
    100% { transform: scale(1.0) translate(0px, 0px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-kenburns {
    animation: kenburns 24s ease-in-out infinite;
  }
  .animate-fade {
    animation: fadeIn 1.2s ease-in-out forwards;
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
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#ff4d6d', '#ff758f', '#ff8fa3', '#d9bf8d', '#ffb3c1'];

    // 🎯 COORDINATES LOCKED: Spawns exactly behind the Name text in the 35% Sidebar column
    const originX = window.innerWidth * 0.825; 
    const originY = window.innerHeight * 0.30; 

    // Generate 40 dispersing heart particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: originX + (Math.random() - 0.5) * 40, // Small localized cluster behind name
        y: originY,
        size: Math.random() * 12 + 8, // Sleek, lightweight sizes
        speedX: (Math.random() - 0.5) * 5, // Disperses outward to left and right
        speedY: -Math.random() * 4 - 2, // Floats steadily upwards
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.04
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
        p.opacity -= 0.012; // Beautiful, snappy evaporation arc
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
      }
    }

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [triggerToggle]);

  // Note: zIndex 4 puts the canvas overlay behind the sidebar text layers but on top of backgrounds
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 4 }} />;
};

// ==========================================
// 1. UNIFIED WEDDING DISPLAY PLAYER
// ==========================================
const WeddingPhotoPlayer = ({ item, liveEventId }) => {
  const videoRef = useRef(null);
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
      <div className="animate-fade" style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', backgroundColor: '#0c0f12', overflow: 'visible', zIndex: 999 }}>
        <style>{slideshowStyles}</style>
        <video
          ref={videoRef}
          src="/Wedding1/welcome-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
        />

        <div 
          style={{ 
            position: 'absolute', 
            left: '30.8%', 
            top: '55.5%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 5, 
            width: '340px', 
            height: '340px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: '#ffffff', 
            borderRadius: '12px', 
            padding: '20px',
            boxSizing: 'border-box',
            boxShadow: '0 0 50px rgba(215, 180, 106, 0.5)' 
          }}
        >
          <img src={qrCodeApiUrl} alt="Scan QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ position: 'absolute', right: '4%', top: '32%', width: '42%', height: '55%', zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', items: 'center', textAlign: 'center' }}>
          <div style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', fontSize: '3.3rem', lineHeight: '1.4', fontWeight: 'bold', textShadow: '0 4px 12px rgba(0,0,0,0.9)' }}>
            <p style={{ margin: '0 0 20px 0' }}>Welcome Friends & Family</p>
            <p style={{ color: '#ffffff', fontSize: '2.4rem', fontStyle: 'italic', margin: 0 }}>
              Scan the QR Code to share your photos and blessings directly to this live screen!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!imgUrl) return null;

  return (
    <div className="animate-fade" style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000', overflow: 'hidden', zIndex: 999 }}>
      <style>{slideshowStyles}</style>
      
      <div 
        className="animate-kenburns"
        style={{ position: 'absolute', inset: 0, backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(45px) brightness(16%)', transform: 'scale(1.15)', zIndex: 1 }} 
      />
      
      <div style={{ width: '65%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2, padding: '40px 30px', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.85)' }}>
          <img 
            className="animate-kenburns"
            src={imgUrl} 
            alt="Live Stream" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 3 }} 
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800";
            }}
          />
        </div>
      </div>

      {/* Right Sidebar Text Segment - Kept at high zIndex so hearts drift from beneath it */}
      <div style={{ width: '35%', height: '100%', background: 'linear-gradient(to right, rgba(12, 15, 18, 0.98), rgba(6, 8, 10, 1.0))', borderLeft: '4px solid rgba(217, 191, 141, 0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '0 35px 40px 35px', boxSizing: 'border-box', zIndex: 5, textAlign: 'center' }}>
        <img src="/Wedding1/gold-divider.png" alt="" style={{ width: 'calc(100% - 4px)', height: 'auto', marginTop: '2px', marginBottom: '50px', mixBlendMode: 'screen', opacity: 0.95 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
          <img src="/Wedding1/couple-profile.png" style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #d9bf8d', boxShadow: '0 12px 24px rgba(0,0,0,0.4)' }} alt="Profile" />
        </div>
        
        {/* 💫 NAME LAYER: Explicit stack positioning handles the background origin burst cleanly */}
        <span style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', fontSize: '3.0rem', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '24px', textShadow: '3px 3px 6px rgba(0,0,0,0.6)', zIndex: 6 }}>
          {senderName}
        </span>
        
        <p style={{ color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '2.8rem', margin: 0, fontStyle: 'italic', fontWeight: '600', lineHeight: '1.4', maxWidth: '95%', textShadow: '2px 2px 5px rgba(0,0,0,0.9)', zIndex: 6 }}>
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
          setCurrentSlideIndex(1); 
        }
      }
    }, (error) => {
      console.error("Firestore sync offline", error);
    });

    return () => unsubscribe();
  }, [liveEventId, liveGuestUploads.length]);

  const timelineItems = useMemo(() => {
    let combined = [{ id: 'welcome-initial', type: 'welcome' }];

    if (liveGuestUploads.length > 0) {
      const sortedUploads = [...liveGuestUploads].sort((a, b) => (b.photo?.createdAt || 0) - (a.photo?.createdAt || 0));
      
      sortedUploads.forEach((item, index) => {
        combined.push({
          id: `photo-${index}-${item.id}`,
          type: 'photo',
          photo: item.photo
        });

        if ((index + 1) % 5 === 0) {
          combined.push({
            id: `welcome-loop-${index}`,
            type: 'welcome'
          });
        }
      });
    }

    return combined;
  }, [liveGuestUploads]);

  useEffect(() => {
    if (timelineItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % timelineItems.length);
    }, 8500);

    return () => clearInterval(interval);
  }, [timelineItems]);

  const activeItem = timelineItems[currentSlideIndex] || timelineItems[0];

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000', zIndex: 999 }}>
      <HeartBurstCanvas triggerToggle={burstTrigger} />
      
      {activeItem && (
        <WeddingPhotoPlayer 
          key={activeItem.id} 
          item={activeItem} 
          liveEventId={liveEventId}
        />
      )}
    </div>
  );
};