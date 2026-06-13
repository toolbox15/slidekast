import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import GuestUploadForm from './GuestUploadForm';
import { MemorialAdminDashboard } from './memorial/MemorialAdminDashboard'; // UPDATED: Imported the custom graphical dashboard GUI
import { FuneralSlideshow } from './FuneralSlideshow';
import { db } from './firebaseConfig'; 
import { doc, onSnapshot } from 'firebase/firestore';

const MainApp = () => {
  // 1. Parse the URL path to extract the dynamic Event ID and view page
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const eventId = pathSegments[0] || 'default-event';
  const isDisplayPage = pathSegments[1] === 'display';
  const isAdminPage = pathSegments[1] === 'admin';

  // 2. Set initial authorization and photo state
  const [eventStatus, setEventStatus] = useState({ loading: true, active: true, error: false });
  
  // State to hold the arrays pulled from Firestore
  const [eventPhotos, setEventPhotos] = useState({
    earlyYearsPhotos: [],
    familyPhotos: [],
    legacyPhotos: []
  });

  // 3. Real-Time Security Guard Check & Data Fetch
  useEffect(() => {
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
        
        // GRAB THE PHOTOS FROM FIRESTORE AND SAVE THEM TO STATE
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
        SECURING CONNECTION...
      </div>
    );
  }

  if (!eventStatus.active) {
    return (
      <div style={{ background: '#101417', color: '#f8fafc', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', padding: '20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '450px', background: '#182325', border: '1px solid #d9bf8d', padding: '40px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <h2 style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', marginTop: 0, fontSize: '28px', fontWeight: '400' }}>Presentation Concluded</h2>
          <div style={{ width: '60px', height: '2px', background: '#d9bf8d', margin: '20px auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', fontSize: '15px', marginBottom: '0' }}>
            The pilot window for this event directory has closed. To reactivate this live display loop, update licensing metrics, or export your gallery media logs, please contact your account representative.
          </p>
          <div style={{ marginTop: '35px', fontSize: '12px', color: '#d9bf8d', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>
            SlideKast Digital Signage
          </div>
        </div>
      </div>
    );
  }

  // 4. Secure Dynamic Routing execution if parameters clear validation
  return (
    <div style={{ minHeight: '100vh', width: '100vw', margin: 0, padding: 0, background: '#101417', color: '#f8fafc' }}>
      {isDisplayPage ? (
        // PASS THE FIRESTORE DATA DOWN AS PROPS TO LIVE LOOP DISPLAY
        <FuneralSlideshow 
          eventId={eventId} 
          liveEventId={eventId} 
          earlyYearsPhotos={eventPhotos.earlyYearsPhotos}
          familyPhotos={eventPhotos.familyPhotos}
          legacyPhotos={eventPhotos.legacyPhotos}
        />
      ) : isAdminPage ? (
        // RENDER THE NEW ADVANCED DASHBOARD GUI GRAPHICAL CONTROLLER
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