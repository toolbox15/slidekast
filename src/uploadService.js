import { db, storage } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads a guest photo and tribute message to the Firebase event stream.
 * @param {string} eventId - The unique ID of the event (e.g., 'wedding-06-08')
 * @param {File} file - The raw image file from the input button
 * @param {string} name - The name of the guest
 * @param {string} message - The 10-word/80-char max blessing
 */
export const uploadGuestTribute = async (eventId, file, name, message) => {
  try {
    // 1. Create a unique path inside your new Storage bucket
    const fileExtension = file.name.split('.').pop();
    const fallbackPhotoId = globalThis.crypto?.getRandomValues?.(new Uint32Array(1))[0] || 'upload';
    const uniquePhotoId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${fallbackPhotoId}`;
    const storageRef = ref(storage, `events/${eventId}/tribute_photos/${uniquePhotoId}.${fileExtension}`);

    // 2. Upload the raw image file
    const uploadResult = await uploadBytes(storageRef, file);
    
    // 3. Get the live public URL of the uploaded photo
    const photoUrl = await getDownloadURL(uploadResult.ref);

    // 4. Save the document into the Firestore collection for the Remotion loop to read
    const liveStreamRef = collection(db, "events", eventId, "live_tributes");
    await addDoc(liveStreamRef, {
      sender_name: name.trim().substring(0, 30), // Truncate to safety limits
      message_text: message.trim().substring(0, 80), // Truncate to keep typography perfect
      image_url: photoUrl,
      createdAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    globalThis.console.error("Firebase Upload Error:", error);
    return { success: false, error: error.message };
  }
};
