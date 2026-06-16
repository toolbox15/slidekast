import { useEffect, useState, useMemo } from "react";
import { db } from "./firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";

// Tailor this component definition to match your file's existing props
export function FuneralSlideshow({ liveEventId, enableLiveData }) {
  const [photos, setPhotos] = useState([]);

  // 📡 EXPRESS LANE FILTER: Tells the player which pipeline collection to read
  const isInstantStream = useMemo(() => {
    return liveEventId === "Tom-Memorial" || (liveEventId && liveEventId.toLowerCase().includes("stream"));
  }, [liveEventId]);

  useEffect(() => {
    if (!enableLiveData || !liveEventId) return;

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
    });

    return () => unsubscribe();
  }, [liveEventId, enableLiveData, isInstantStream]);

  // Fallback rendering condition: displays the form if no valid data is available
  if (photos.length === 0) {
    // This is where your code drops in the GuestUploadForm component placeholder
    // Once photos array gets populated, this block vanishes and the loop plays!
  }

  return (
    <div className="slideshow-root-container">
      {/* Your premium slider rendering layout components go here */}
    </div>
  );
}