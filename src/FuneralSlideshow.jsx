import { useEffect, useState, useMemo } from "react";
import { db } from "./firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export function FuneralSlideshow({ liveEventId, enableLiveData }) {
  const [photos, setPhotos] = useState([]);

  // 📡 EXPRESS LANE FILTER: Tells the player which pipeline collection to read
  const isInstantStream = useMemo(() => {
    return liveEventId === "Tom-Memorial" || (liveEventId && liveEventId.toLowerCase().includes("stream"));
  }, [liveEventId]);

  useEffect(() => {
    // ⚡ FORCE ENABLER: Force true for Tom-Memorial if the parent forgot to pass it
    const shouldRunLive = enableLiveData || liveEventId === "Tom-Memorial";
    
    if (!shouldRunLive || !liveEventId) return;

    // ⚡ DYNAMIC ROUTING: Automatically switches collections to find your uploaded files
    const collectionPath = isInstantStream ? "receptionStream" : "live_tributes";
    const collectionRef = collection(db, "events", liveEventId, collectionPath);

    // If using the standard holding tank, only stream things a human or AI approved
    // If using the express lane, pull everything because it auto-approves as true!
    const queryConstraints = isInstantStream 
      ? collectionRef 
      : query(collectionRef, where("approved", "==", true));

    const unsubscribe = onSnapshot(queryConstraints, (snapshot) => {
      const liveData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sorts assets chronologically so new slides insert cleanly into the loop
      setPhotos(liveData.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error("Firestore dynamic slideshow listener failed:", error);
    });

    return () => unsubscribe();
  }, [liveEventId, enableLiveData, isInstantStream]);

  // Dynamic Event Name Resolution
  const eventName = liveEventId === "Tom-Memorial" ? "Tom Henderson" : "Your Loved One";

  // 🛠️ FIX: Graceful placeholder handler when no photos exist yet to stop the pure black screen bug
  if (photos.length === 0) {
    return (
      <div style={{ background: '#101417', color: '#d9bf8d', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', textAlign: 'center', padding: '20px', boxSizing: 'border-box' }}>
        <p style={{ letterSpacing: '3px', fontSize: '13px', color: '#d9bf8d', textTransform: 'uppercase', marginBottom: '5px' }}>
          Celebrating the Life of
        </p>
        <h1 style={{ color: '#f8fafc', fontSize: '36px', fontWeight: '400', marginTop: '5px', marginBottom: '20px' }}>
          {eventName}
        </h1 >
        <div style={{ width: '80px', height: '1px', background: '#d9bf8d', marginBottom: '30px' }} />
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', fontStyle: 'italic', maxWidth: '500px', lineHeight: '1.6' }}>
          "Awaiting shared memories. Scan the QR code or visit the upload page to cast your photos and tributes live onto this display screen."
        </p>
      </div>
    );
  }

  return (
    <div className="slideshow-root-container" style={{ minHeight: '100vh', width: '100vw', background: '#101417', position: 'relative', overflow: 'hidden' }}>
      {/* 📺 PREMIUM SLIDER ROTATION COMPONENT LOOP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', padding: '40px' }}>
        {photos.map((photo) => (
          <div key={photo.id} style={{ background: '#182325', border: '1px solid #d9bf8d', borderRadius: '4px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <img 
              src={photo.imageUrl || photo.image_url} 
              alt="Tribute compilation frame" 
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '2px' }} 
            />
            <p style={{ color: '#d9bf8d', margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
              {photo.sender_name || "Anonymous Guest"}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '13px', lineHeight: '1.4', fontStyle: 'italic' }}>
              "{photo.message_text || photo.message}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}