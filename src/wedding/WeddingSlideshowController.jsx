import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
import { QRCodeCanvas } from 'qrcode.react';

// ==========================================
// 1. UNIFIED WEDDING DISPLAY PLAYER
// ==========================================
const WeddingPhotoPlayer = ({ item, liveEventId }) => {
  const videoRef = useRef(null);
  const [typedMessage, setTypedMessage] = useState('');

  const messageText = item.photo?.message_text || item.photo?.message || 'Cheers to the beautiful couple!';
  const senderName = item.photo?.sender_name || item.photo?.sender || 'Wedding Guest';
  const imgUrl = item.photo?.imageUrl || item.photo?.image_url || '';

  useEffect(() => {
    if (item.type !== 'photo') return;
    let charIndex = 0;
    setTypedMessage('');

    const typerInterval = setInterval(() => {
      if (charIndex <= messageText.length) {
        setTypedMessage(messageText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typerInterval);
      }
    }, 40);

    return () => clearInterval(typerInterval);
  }, [messageText, item.type, item.id]);

  if (item.type === 'welcome') {
    const qrCodeTargetUrl = `https://slidekast.vercel.app/${liveEventId}`;

    return (
      <div style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', backgroundColor: '#0c0f12', overflow: 'visible', zIndex: 999 }}>
        <video
          ref={videoRef}
          src="/Wedding1/welcome-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
        />

        {/* QR Code Container - Sized and Centered perfectly behind the Golden Frame Layout Area */}
        <div 
          style={{ 
            position: 'absolute', 
            left: '49.8%', 
            top: '55.5%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 5, 
            width: '430px', 
            height: '430px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: '#ffffff', 
            borderRadius: '12px', 
            padding: '24px',
            boxSizing: 'border-box',
            boxShadow: '0 0 50px rgba(215, 180, 106, 0.5)' 
          }}
        >
          {/* High-fidelity browser Canvas vector QR renderer */}
          <QRCodeCanvas
            value={qrCodeTargetUrl}
            size={380}
            level="H"
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>

        {/* Instructions */}
        <div style={{ position: 'absolute', right: '4%', top: '32%', width: '42%', height: '55%', zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
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
    <div style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000', overflow: 'visible', zIndex: 999 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(45px) brightness(16%)', transform: 'scale(1.15)', zIndex: 1 }} />
      
      <div style={{ width: '65%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2, padding: '40px 30px', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.85)' }}>
          <img src={imgUrl} alt="Live Stream" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      <div style={{ width: '35%', height: '100%', background: 'linear-gradient(to right, rgba(12, 15, 18, 0.98), rgba(6, 8, 10, 1.0))', borderLeft: '4px solid rgba(217, 191, 141, 0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '0 35px 40px 35px', boxSizing: 'border-box', zIndex: 5, textAlign: 'center' }}>
        <img src="/Wedding1/gold-divider.png" alt="" style={{ width: 'calc(100% - 4px)', height: 'auto', marginTop: '2px', marginBottom: '50px', mixBlendMode: 'screen', opacity: 0.95 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
          <img src="/Wedding1/couple-profile.png" style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #d9bf8d', boxShadow: '0 12px 24px rgba(0,0,0,0.4)' }} alt="Profile" />
        </div>
        <span style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', fontSize: '3.0rem', fontWeight: 'bold', display: 'block', letterSpacing: '1px', marginBottom: '24px', textShadow: '3px 3px 6px rgba(0,0,0,0.6)' }}>{senderName}</span>
        <p style={{ color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '2.8rem', margin: 0, fontStyle: 'italic', fontWeight: '600', lineHeight: '1.4', maxWidth: '95%', textShadow: '2px 2px 5px rgba(0,0,0,0.9)' }}>{typedMessage ? `"${typedMessage}"` : ""}</p>
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
  const previousDataHashRef = useRef('');

  const liveEventId = useMemo(() => {
    if (passedEventId) return passedEventId;
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    return pathSegments[0] || 'smith-wedding-2026';
  }, [passedEventId]);

  useEffect(() => {
    const targetCollectionRef = collection(db, 'events', liveEventId, 'receptionStream');
    const q = query(targetCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedPhotos = [];
      let incomingDataString = '';

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.imageUrl && !data.image_url) return;
        updatedPhotos.push({ id: doc.id, photo: data });
        incomingDataString += `${doc.id}-${data.image_url || data.imageUrl || ''};`;
      });
      
      if (incomingDataString !== previousDataHashRef.current) {
        previousDataHashRef.current = incomingDataString;
        setLiveGuestUploads(updatedPhotos);
      }
    }, (error) => {
      console.error("Firestore sync tracking offline", error);
    });

    return () => unsubscribe();
  }, [liveEventId]);

  const timelineItems = useMemo(() => {
    let combined = [{ id: 'welcome-initial', type: 'welcome' }];

    if (liveGuestUploads.length > 0) {
      liveGuestUploads.forEach((item, index) => {
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
    }, 6000);

    return () => clearInterval(interval);
  }, [timelineItems]);

  const activeItem = timelineItems[currentSlideIndex] || timelineItems[0];

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'visible', backgroundColor: '#000', zIndex: 999 }}>
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