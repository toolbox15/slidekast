import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import GuestUploadForm from './GuestUploadForm';
import DirectorAdminForm from './DirectorAdminForm';
import { FuneralSlideshow } from './FuneralSlideshow';
import { db } from './firebaseConfig'; // Aligned to use your project's exact config path
import { doc, onSnapshot } from 'firebase/firestore';

const MainApp = () => {
  // 1. Parse the URL path to extract the dynamic Event ID and view page
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const eventId = pathSegments[0] || 'default-event';
  const isDisplayPage = pathSegments[1] === 'display';
  const isAdminPage = pathSegments[1] === 'admin';

  // 2. Set initial authorization state
  const [eventStatus, setEventStatus] = useState({ loading: true, active: true, error: false });

  // 3. Real-Time Security Guard Check
  useEffect(() => {
    // If it's a generic landing without an event ID, pass it through safely
    if (eventId === 'default-event') {
      setEventStatus({ loading: false, active: true, error: false });
      return;
    }

    const docRef = doc(db, 'events', eventId);
    
    // Listen to the event's control document in real time
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const now = new Date();
        const expirationDate = data.expiresAt ? new Date(data.expiresAt) : null;
        
        // KILL-SWITCH INTERCEPTOR RULES:
        // Triggers lock if: 1. Manual flag 'isActive' is set to false
        // OR 2. An expiration timestamp exists and the current time is past it
        if (data.isActive === false || (expirationDate && now > expirationDate)) {
          setEventStatus({ loading: false, active: false, error: false });
        } else {
          setEventStatus({ loading: false, active: true, error: false });
        }
      } else {
        // If the document doesn't exist yet, let it pass so the director can 
        // organically auto-create the collection upon their first photo upload
        setEventStatus({ loading: false, active: true, error: false });
      }
    }, (error) => {
      console.error("Security authorization listener failed:", error);
      setEventStatus({ loading: false, active: false, error: true });
    });

    return () => unsubscribe();
  }, [eventId]);

  // Loading screen displayed while verifying security parameters
  if (eventStatus.loading) {
    return (
      <div style={{ background: '#101417', color: '#d9bf8d', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', letterSpacing: '1px' }}>
        SECURING CONNECTION...
      </div>
    );
  }

  // THE LOCK SCREEN: What vendors, venues, or guests see instantly if unpaid or expired
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
        <FuneralSlideshow eventId={eventId} liveEventId={eventId} />
      ) : isAdminPage ? (
        <DirectorAdminForm eventId={eventId} />
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