import { useEffect, useState, useMemo } from "react";
import { db } from "./firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export function FuneralSlideshow({ 
  liveEventId, 
  enableLiveData,
  earlyYearsPhotos = [],
  familyPhotos = [],
  legacyPhotos = []
}) {
  const [liveUploadedPhotos, setLiveUploadedPhotos] = useState([]);

  // 📡 EXPRESS LANE FILTER
  const isInstantStream = useMemo(() => {
    return liveEventId === "smith-wedding-2026" || 
           liveEventId === "Tom-Memorial" || 
           (liveEventId && liveEventId.toLowerCase().includes("stream"));
  }, [liveEventId]);

  // Listen for live guest uploads
  useEffect(() => {
    const shouldRunLive = enableLiveData || liveEventId === "smith-wedding-2026" || liveEventId === "Tom-Memorial";
    if (!shouldRunLive || !liveEventId) return;

    const collectionPath = isInstantStream ? "receptionStream" : "live_tributes";
    const collectionRef = collection(db, "events", liveEventId, collectionPath);

    const queryConstraints = isInstantStream 
      ? collectionRef 
      : query(collectionRef, where("approved", "==", true));

    const unsubscribe = onSnapshot(queryConstraints, (snapshot) => {
      const liveData = snapshot.docs.map((doc) => ({
        id: doc.id,
        imageUrl: doc.data().imageUrl || doc.data().image_url,
        sender_name: doc.data().sender_name || doc.data().sender || "",
        message_text: doc.data().message_text || doc.data().message || "",
        createdAt: doc.data().createdAt || Date.now()
      }));
      
      setLiveUploadedPhotos(liveData.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error("Firestore live stream failure:", error);
    });

    return () => unsubscribe();
  }, [liveEventId, enableLiveData, isInstantStream]);

  // 🎯 THE MASTER DECK: Merges live updates and pre-loaded folders seamlessly
  const allSlides = useMemo(() => {
    const formattedOriginals = [
      ...earlyYearsPhotos.map((url, i) => ({ id: `early-${i}`, imageUrl: url, sender_name: "", message_text: "" })),
      ...familyPhotos.map((url, i) => ({ id: `family-${i}`, imageUrl: url, sender_name: "", message_text: "" })),
      ...legacyPhotos.map((url, i) => ({ id: `legacy-${i}`, imageUrl: url, sender_name: "", message_text: "" }))
    ];

    return [...liveUploadedPhotos, ...formattedOriginals];
  }, [earlyYearsPhotos, familyPhotos, legacyPhotos, liveUploadedPhotos]);

  // 🔄 LOOP TIMER
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (allSlides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [allSlides]);

  const currentSlide = allSlides[currentIndex] || allSlides[0];

  if (allSlides.length === 0) {
    return (
      <div style={{ background: '#101417', color: '#d9bf8d', height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <h1 style={{ color: '#f8fafc', fontSize: '28px', fontWeight: '400' }}>Loading Presentation...</h1>
      </div>
    );
  }

  return (
    <main style={{ height: '100vh', width: '100vw', background: '#090d0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', padding: '40px 0 20px 0', boxSizing: 'border-box' }}>
      
      {/* 📺 PHOTO DISPLAY BOX */}
      <div style={{ flex: 1, width: '100%', maxWidth: '1400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '0 40px' }}>
        <div style={{ height: '100%', maxHeight: '72vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(217, 191, 141, 0.25)', borderRadius: '6px', background: '#101417', boxShadow: '0 30px 70px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
          <img 
            src={currentSlide?.imageUrl} 
            alt="Slideshow Frame" 
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
          />
        </div>
      </div>

      {/* 💬 BOTTOM GUEST MESSAGING BLOCK */}
      <footer style={{ width: '100%', maxWidth: '1200px', padding: '20px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center', minHeight: '120px', justifyContent: 'center' }}>
        {currentSlide?.message_text ? (
          <>
            <blockquote style={{ color: '#f8fafc', fontSize: '28px', fontFamily: 'Georgia, serif', lineHeight: '1.4', fontStyle: 'italic', margin: 0, maxWidth: '950px' }}>
              "{currentSlide.message_text}"
            </blockquote>
            <cite style={{ color: '#d9bf8d', fontSize: '18px', fontWeight: 'bold', fontStyle: 'normal', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>
              — {currentSlide.sender_name}
            </cite>
          </>
        ) : (
          <h2 style={{ color: '#f8fafc', fontSize: '32px', fontFamily: 'Georgia, serif', fontWeight: '400', letterSpacing: '1px', margin: 0 }}>
            {liveEventId === "smith-wedding-2026" ? "Marcus & Danielle" : "Tom Henderson"}
          </h2>
        )}
      </footer>
    </main>
  );
}