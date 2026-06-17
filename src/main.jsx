import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import GuestUploadForm from './GuestUploadForm';
import { MemorialAdminDashboard } from './memorial/MemorialAdminDashboard';
import { FuneralSlideshow } from './FuneralSlideshow';
import { WeddingSlideshowController } from './wedding/WeddingSlideshowController';
import { db } from './firebaseConfig'; 
import { doc, onSnapshot } from 'firebase/firestore';

const MainApp = () => {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const eventId = pathSegments[0] || 'smith-wedding-2026';

  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  const compositionParam = urlParams.get('composition');

  const isDisplayPage = 
    pathSegments[1] === 'display' || 
    viewParam === 'display' || 
    compositionParam === 'FuneralHomeSlideshow';

  const isAdminPage = 
    pathSegments[1] === 'admin' || 
    viewParam === 'admin';

  // 📡 THE ABSOLUTE ROUTE FILTER
  // Explicitly forces wedding layouts if the URL path contains 'wedding'
  const isWeddingTheme = eventId.toLowerCase().includes('wedding');

  const [eventStatus, setEventStatus] = useState({ loading: true, active: true, error: false });
  const [eventPhotos, setEventPhotos] = useState({
    earlyYearsPhotos: [],
    familyPhotos: [],
    legacyPhotos: []
  });

  useEffect(() => {
    setEventPhotos({ earlyYearsPhotos: [], familyPhotos: [], legacyPhotos: [] });

    if (eventId === 'default-event') {
      setEventStatus({ loading: false, active: true, error: false });
      return;
    }

    const docRef = doc(db, 'events', eventId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const now = new Date();
        const expirationDate = data.expiresAt ? new Date(data.expiresAt) : null;
        
        setEventPhotos({
          earlyYearsPhotos: data.earlyYearsPhotos || [],
          familyPhotos: data.familyPhotos || [],
          legacyPhotos: data.legacyPhotos || []
        });

        if (data.isActive === false || (expirationDate && now > expirationDate)) {
          setEventStatus({ loading: false, active: false, error: false });
        } else {
          setEventStatus({ loading: false, active: true, error: false });
        }
      } else {
        setEventStatus({ loading: false, active: true, error: false });
      }
    }, (error) => {
      console.error("Security authorization listener failed:", error);
      setEventStatus({ loading: false, active: false, error: true });
    });

    return () => unsubscribe();
  }, [eventId]);

  if (eventStatus.loading) {
    return (
      <div style={{ background: '#101417', color: '#d9bf8d', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', letterSpacing: '1px' }}>
        LOADING DATA SYSTEM...
      </div>
    );
  }

  if (!eventStatus.active) {
    return (
      <div style={{ background: '#101417', color: '#f8fafc', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', padding: '20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '450px', background: '#182325', border: '1px solid #d9bf8d', padding: '40px', borderRadius: '8px' }}>
          <h2 style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', marginTop: 0 }}>Presentation Concluded</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>The loop window is closed.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', width: '100vw', margin: 0, padding: 0, background: '#101417', color: '#f8fafc' }}>
      {isDisplayPage ? (
        isWeddingTheme ? (
          // 🚀 FORCE ROUTE: Send wedding URLs straight to the brand new wedding controller file!
          <WeddingSlideshowController 
            liveEventId={eventId}
          />
        ) : (
          // Otherwise, send directly to the memorial slideshow
          <FuneralSlideshow 
            eventId={eventId} 
            liveEventId={eventId} 
            earlyYearsPhotos={eventPhotos.earlyYearsPhotos}
            familyPhotos={eventPhotos.familyPhotos}
            legacyPhotos={eventPhotos.legacyPhotos}
          />
        )
      ) : isAdminPage ? (
        <MemorialAdminDashboard 
          eventId={eventId} 
          initialEarlyYears={eventPhotos.earlyYearsPhotos}
          initialFamily={eventPhotos.familyPhotos}
          initialLegacy={eventPhotos.legacyPhotos}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <GuestUploadForm eventId={eventId} />
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);