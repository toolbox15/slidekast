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

  /* 🖥️ WIDESCREEN SMART TV/PROJECTOR DISPLAY LAYOUT */
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
    background: linear-gradient(to right, rgba(12, 15, 18, 0.98), rgba(6, 8, 10, 1.0));
    border-left: 4px solid rgba(217, 191, 141, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0 35px 40px 35px;
    box-sizing: border-box;
  }

  /* 📱 MOBILE GALLERY TIMELINE OVERRIDES (Screen widths under 768px) */
  @media (max-width: 768px) {
    .tv-display-mode {
      display: none !important;
    }
    .mobile-gallery-mode {
      display: block !important;
      width: 100vw;
      height: 100vh;
      overflow-y: auto !important;
      background-color: #0c0f12;
      -webkit-overflow-scrolling: touch;
    }
    .mobile-header-banner {
      background: linear-gradient(to bottom, rgba(20, 24, 30, 0.95), rgba(12, 15, 18, 1));
      border-bottom: 2px solid rgba(217, 191, 141, 0.3);
      padding: 30px 20px;
      text-align: center;
    }
    .mobile-feed-container {
      padding: 20px 15px 60px 15px;
      display: flex;
      flex-direction: column;
      gap: 25px;
    }
    .mobile-guest-card {
      background: #13171e;
      border: 2px solid #d9bf8d;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    }
    .mobile-card-img-wrapper {
      width: 100%;
      height: 300px;
      background-color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .mobile-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .mobile-card-content {
      padding: 20px;
      text-align: center;
    }
    .mobile-card-name {
      color: #d9bf8d;
      font-family: 'Georgia', serif;
      font-size: 1.6rem;
      font-weight: bold;
      margin-bottom: 8px;
      display: block;
    }
    .mobile-card-text {
      color: #ffffff;
      font-family: system-ui, sans-serif;
      font-size: 1.2rem;
      font-style: italic;
      line-height: 1.4;
      margin: 0;
    }
  }
`;

// ==========================================
// 1. UNIFIED DISPLAY COMPONENT
// ==========================================
const WeddingPhotoPlayer = ({ item, liveEventId }) => {
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
      <div className="animate-fade tv-display-mode" style={{ position: 'absolute', inset: 0, backgroundColor: '#0c0f12' }}>
        <video src="/Wedding1/welcome-bg.mp4" autoPlay loop muted playsInline style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
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
    <div className="animate-fade tv-display-mode" style={{ position: 'absolute', inset: 0 }}>
      <div className="animate-kenburns" style={{ position: 'absolute', inset: 0, backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(45px) brightness(16%)', transform: 'scale(1.15)', zIndex: 1 }} />
      <div className="tv-photo-stage" style={{ zIndex: 2 }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.85)' }}>
          <img className="animate-kenburns" src={imgUrl} alt="Live Stream" style={{ width: '100%', height: '100%', objectFit: 'contain', zIndex: 3 }} />
        </div>
      </div>
      <div className="tv-sidebar-stage" style={{ zIndex: 5, textAlign: 'center' }}>
        <img src="/Wedding1/gold-divider.png" alt="" style={{ width: 'calc(100% - 4px)', height: 'auto', marginTop: '2px', marginBottom: '50px', mixBlendMode: 'screen', opacity: 0.95 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
          <img src="/Wedding1/couple-profile.png" style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #d9bf8d', boxShadow: '0 12px 24px rgba(0,0,0,0.4)' }} alt="Profile" />
        </div>
        <span style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', fontSize: '3.0rem', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '24px', textShadow: '3px 3px 6px rgba(0,0,0,0.6)' }}>{senderName}</span>
        <p style={{ color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '2.8rem', margin: 0, fontStyle: 'italic', fontWeight: '600', lineHeight: '1.4', maxWidth: '95%', textShadow: '2px 2px 5px rgba(0,0,0,0.9)' }}>
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
      snapshot.forEach((doc) => {
        const data = doc.data();
        const targetUrl = data.imageUrl || data.image_url || data.url || data.downloadURL;
        if (!targetUrl) return;
        updatedPhotos.push({ id: doc.id, photo: data });
      });
      setLiveGuestUploads(updatedPhotos);
    }, (error) => {
      console.error("Firestore sync offline", error);
    });

    return () => unsubscribe();
  }, [liveEventId]);

  // Widescreen Slide Rotation Logic
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

  // ⚡ STRATEGIC FEED: Newest submissions show right on top of the mobile stack!
  const mobileSortedGallery = useMemo(() => {
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

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <style>{slideshowStyles}</style>

      {/* 🖥️ VIEWPORT LAYER 1: Renders when screen is wide (Widescreen Signage Link) */}
      {activeItem && <WeddingPhotoPlayer item={activeItem} liveEventId={liveEventId} />}

      {/* 📱 VIEWPORT LAYER 2: Renders completely structured scrolling gallery on mobile links */}
      <div className="mobile-gallery-mode" style={{ display: 'none' }}>
        <header className="mobile-header-banner">
          <h1 style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', margin: '0 0 8px 0', fontSize: '2rem' }}>Welcome Friends & Family</h1>
          <p style={{ color: '#ffffff', fontFamily: 'system-ui', fontSize: '1.05rem', margin: '0 0 20px 0', fontStyle: 'italic', opacity: 0.85 }}>
            Live Guest Gallery Roll
          </p>
          
          {/* 🔗 STYLED LINK BUTTON: Pinned directly beneath the header card */}
          <a 
            href={`/${liveEventId}`}
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              backgroundColor: '#d9bf8d',
              color: '#0c0f12',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              borderRadius: '30px',
              boxShadow: '0 4px 15px rgba(215, 180, 106, 0.4)',
              transition: 'transform 0.2s ease'
            }}
          >
            📸 Upload Another Photo
          </a>
        </header>

        <main className="mobile-feed-container">
          {mobileSortedGallery.length === 0 ? (
            <div style={{ color: '#ffffff', textAlign: 'center', padding: '40px 20px', fontFamily: 'system-ui', opacity: 0.6 }}>
              No photos submitted yet. Be the first to share a memory!
            </div>
          ) : (
            mobileSortedGallery.map((item) => {
              const url = item.photo.imageUrl || item.photo.image_url || item.photo.url || item.photo.downloadURL;
              return (
                <article key={item.id} className="mobile-guest-card">
                  <div className="mobile-card-img-wrapper">
                    <img src={url} alt="Guest Upload" className="mobile-card-img" />
                  </div>
                  <div className="mobile-card-content">
                    <span className="mobile-card-name">
                      {item.photo.sender_name || item.photo.sender || 'Wedding Guest'}
                    </span>
                    <p className="mobile-card-text">
                      "{item.photo.message_text || item.photo.message || 'Cheers to the beautiful couple!'}"
                    </p>
                  </div>
                </article>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
};