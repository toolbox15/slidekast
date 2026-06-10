import { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

/**
 * Custom React hook to stream the latest uploaded photos and messages.
 * @param {string} eventId - The unique ID of the event (e.g., 'smith-wedding-2026')
 * @param {number} maxItems - How many records to cache for the rotation loop (default: 20)
 */
export const useLiveTributes = (eventId, maxItems = 20) => {
  const [tributes, setTributes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reference the exact subcollection where your uploads are flying in
    const tributesRef = collection(db, 'events', eventId, 'live_tributes');
    
    // Query to pull the newest slides first
    const q = query(tributesRef, orderBy('createdAt', 'desc'), limit(maxItems));

    // Establish the persistent websocket connection to the database
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setTributes(items);
      setLoading(false);
    }, (error) => {
      globalThis.console.error("Firestore Streaming Error:", error);
      setLoading(false);
    });

    // Clean up the network connection when the screen unmounts
    return () => unsubscribe();
  }, [eventId, maxItems]);

  return { tributes, loading };
};
