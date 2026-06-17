import { useEffect, useState, useMemo } from "react";
import { db } from "./firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";

// ⚡ RESTORED: Bringing back the original pre-loaded photo array props!
export function FuneralSlideshow({ 
  liveEventId, 
  enableLiveData,
  earlyYearsPhotos = [],
  familyPhotos = [],
  legacyPhotos = []
}) {
  const [liveUploadedPhotos, setLiveUploadedPhotos] = useState([]);

  // 📡 EXPRESS LANE FILTER: Tells the player which pipeline collection to read
  const isInstantStream = useMemo(() => {
    return liveEventId === "Tom-Memorial" || (liveEventId && liveEventId.toLowerCase().includes("stream"));
  }, [liveEventId]);

  // Listen for live guest uploads in the background
  useEffect(() => {
    const shouldRunLive = enableLiveData || liveEventId === "Tom-Memorial";
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
        sender_name: doc.data().sender_name || "Guest",
        message_text: doc.data().message_text || doc.data().message,
        createdAt: doc.data().createdAt || Date.now()
      }));
      
      setLiveUploadedPhotos(liveData.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => {
      console.error("Firestore live loop stream failure:", error);
    });

    return () => unsubscribe();
  }, [liveEventId, enableLiveData, isInstantStream]);

  // 🎯 THE MASTER DECK: Combines your original photos with the new live guest uploads!
  const allSlides = useMemo(() => {
    // 1. Format your original preset photos so they match the slider data structure
    const formattedOriginals = [
      ...earlyYearsPhotos.map((url, i) => ({ id: `early-${i}`, imageUrl: url, sender_name: "", message_text: "" })),
      ...familyPhotos.map((url, i) => ({ id: `family-${i}`, imageUrl: url, sender_name: "", message_text: "" })),
      ...legacyPhotos.map((url, i) => ({ id: `legacy-${i}`, imageUrl: url, sender_name: "", message_text: "" }))
    ];

    // 2. Put the live guest uploads first, followed by your full original slideshow deck
    return [...liveUploadedPhotos, ...formattedOriginals];
  }, [earlyYearsPhotos, familyPhotos, legacyPhotos, liveUploadedPhotos]);

  // 🔄 THE ORIGINAL AUTOMATED SLIDESHOW LOOP ENGINE
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (allSlides.length <= 1) return;
    
    // Rotates smoothly through your full slide deck every 6 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [allSlides]);

  // Safe fallback if the system is initializing
  const currentSlide = allSlides[currentIndex] || allSlides[0];

  // If absolutely no photos exist anywhere yet, show the premium placeholder
  if (allSlides.length === 0) {
    return (
      <div style={{ background: '#101417', color: '#d9bf8d', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifycontent: 'center', fontFamily: 'Georgia, serif', textAlign: 'center' }}>
        <h1 style={{ color: '#f8fafc', fontSize: '28px', fontWeight: '400' }}>Preparing SlideKast Presentation...</h1>
      </div>
    );
  }

  return (
    <main style={{ height: '100vh', width: '100vw', background: '#090d0f', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <section style={{ width: '100%', maxWidth: '1200px', height: '85vh', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', padding: '0 40px', alignItems: 'center' }}>
        
        {/* Left Side: The Main Visual Photo Deck Area */}
        <div style={{ height: '100%', maxHeight: '75vh', border: '1px solid #d9bf8d', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', background: '#101417' }}>
          <img 
            src={currentSlide.imageUrl} 
            alt="Memorial Tribute Presentation Frame" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>

        {/* Right Side: Dynamic Context Subtitle Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <p style={{ letterSpacing: '3px', fontSize: '11px', color: '#d9bf8d', textTransform: 'uppercase', margin: 0 }}>
            In Loving Memory
          </p>
          
          {currentSlide.message_text ? (
            <>
              <blockquote style={{ color: '#f8fafc', fontSize: '28px', fontFamily: 'Georgia, serif', lineHeight: '1.5', fontStyle: 'italic', margin: 0 }}>
                "{currentSlide.message_text}"
              </blockquote>
              <div style={{ width: '40px', height: '1px', background: '#d9bf8d' }} />
              <cite style={{ color: '#d9bf8d', fontSize: '18px', fontWeight: 'bold', fontStyle: 'normal' }}>
                — {currentSlide.sender_name}
              </cite>
            </>
          ) : (
            // Fallback typography layout if the cycling image is from your original preset archive folder
            <h2 style={{ color: '#f8fafc', fontSize: '36px', fontFamily: 'Georgia, serif', fontWeight: '400', margin: 0 }}>
              Tom Henderson
            </h2>
          )}
        </div>
      </section>
    </main>
  );
}