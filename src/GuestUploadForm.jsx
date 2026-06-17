import { useMemo, useState } from "react";
// Connects the custom premium styling to this form
import "./App.css"; 
// Import your existing Firebase config modules
import { db, storage } from "./firebaseConfig"; 
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EVENT_CONFIG = {
  wedding: {
    eyebrow: "THE WEDDING OF",
    eventName: "Marcus & Danielle",
    heading: "Share Your Memory",
    description:
      "Upload a photo and leave a blessing for the couple’s live display.",
    messageLabel: "Leave a Blessing",
    placeholder:
      "Wishing you a beautiful lifetime of love, laughter, and happiness together!",
    button: "Send to Live Display",
  },

  memorial: {
    eyebrow: "CELEBRATING THE LIFE OF",
    eventName: "James Williams",
    heading: "Share a Memory",
    description:
      "Upload a treasured photo or leave a condolence for the family.",
    messageLabel: "Share a Condolence or Memory",
    placeholder:
      "Your kindness and unforgettable smile will always remain in our hearts.",
    button: "Submit Memorial Tribute",
  },

  "Tom-Memorial": {
    eyebrow: "CELEBRATING THE LIFE OF",
    eventName: "Tom Henderson",
    heading: "Share a Memory",
    description:
      "Upload a treasured photo or leave a condolence for the family.",
    messageLabel: "Share a Condolence or Memory",
    placeholder:
      "Your kindness and unforgettable smile will always remain in our hearts.",
    button: "Submit Memorial Tribute",
  },

  birthday: {
    eyebrow: "CELEBRATING",
    eventName: "Angela’s 60th Birthday",
    heading: "Join the Celebration",
    description:
      "Upload a photo and leave a birthday message for the live display.",
    messageLabel: "Leave a Birthday Message",
    placeholder:
      "Wishing you many more years of happiness, laughter, and wonderful memories!",
    button: "Send Birthday Message",
  },

  graduation: {
    eyebrow: "CONGRATULATIONS",
    eventName: "Class of 2026",
    heading: "Celebrate the Graduate",
    description:
      "Upload a photo and send congratulations to the live display.",
    messageLabel: "Send Congratulations",
    placeholder:
      "Congratulations on this amazing achievement. Your future is bright!",
    button: "Send Congratulations",
  },
};

export default function GuestUploadForm({ eventId }) {

  const eventType = useMemo(() => {
    return eventId || "wedding"; 
  }, [eventId]);

  const event = useMemo(() => {
    if (EVENT_CONFIG[eventType]) return EVENT_CONFIG[eventType];

    const lowerType = eventType.toLowerCase();
    if (lowerType.includes("memorial")) return EVENT_CONFIG.memorial;
    if (lowerType.includes("birthday")) return EVENT_CONFIG.birthday;
    if (lowerType.includes("graduation")) return EVENT_CONFIG.graduation;

    return EVENT_CONFIG.wedding;
  }, [eventType]);

  // 📡 FORCED INSTANT ACTION: Automatically set to true for weddings to skip moderation text displays
  const isInstantStream = useMemo(() => {
    return eventType === "Tom-Memorial" || eventType.toLowerCase().includes("wedding") || eventType.toLowerCase().includes("stream");
  }, [eventType]);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const maxCharacters = 120;

  function handlePhotoChange(event) {
    const selectedFile = event.target.files?.[0];
    setError("");

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please choose a JPG, PNG, WEBP, or other image file.");
      return;
    }

    const maximumSize = 10 * 1024 * 1024;
    if (selectedFile.size > maximumSize) {
      setError("Please choose an image smaller than 10 MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPhoto(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }

  function removePhoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPhoto(null);
    setPreviewUrl("");
  }

  async function handleSubmit(eventObject) {
    eventObject.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a short message.");
      return;
    }

    if (!photo) {
      setError("Please choose a photo.");
      return;
    }

    try {
      setStatus("uploading");

      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}_${photo.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      
      const storageLocationRef = ref(storage, `events/${eventType}/${uniqueFileName}`);
      
      const uploadSnapshot = await uploadBytes(storageLocationRef, photo);
      const cloudDisplayUrl = await getDownloadURL(uploadSnapshot.ref);

      // ⚡ FORCE LIVE WEDDING ACCESS: Weddings now funnel straight to receptionStream folder!
      const collectionPath = isInstantStream || eventType.toLowerCase().includes("wedding") ? "receptionStream" : "live_tributes";
      const targetFirestoreCollection = collection(db, "events", eventType, collectionPath);

      await addDoc(targetFirestoreCollection, {
        sender_name: name.trim().substring(0, 30), 
        message_text: message.trim().substring(0, 120), 
        imageUrl: cloudDisplayUrl,
        eventType: eventType,
        createdAt: timestamp,
        approved: true 
      });

      setStatus("success");
    } catch (submitError) {
      console.error("SlideKast Upload Core Fault:", submitError);
      setStatus("idle");
      setError("Your submission could not be sent due to a network connection timeout. Please try again.");
    }
  }

  function resetForm() {
    setName("");
    setMessage("");
    removePhoto();
    setStatus("idle");
    setError("");
  }

  if (status === "success") {
    return (
      <main className="page-shell">
        <section className="form-card success-card">
          <div className="success-icon" aria-hidden="true">✓</div>
          
          <p className="event-eyebrow">{event.eventName}</p>
          
          <h1>Thank You</h1>
          <p className="success-message">
            Your photo and message were submitted successfully.
          </p>
          
          <div className="approval-notice">
            Your submission is appearing instantly on the live screen display!
          </div>
          
          <button className="primary-button" type="button" onClick={resetForm}>
            {eventType === "Tom-Memorial" ? "Submit Another Memory" : "Submit Another Photo"}
          </button>
          <PoweredBy />
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="form-card">
        <header className="event-header">
          <p className="event-eyebrow">{event.eyebrow}</p>
          <p className="event-name">{event.eventName}</p>
          <div className="header-divider" />
          <h1>{event.heading}</h1>
          <p className="event-description">{event.description}</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="guest-name">Your Name</label>
            <input
              id="guest-name"
              type="text"
              value={name}
              onChange={(eventObject) => setName(eventObject.target.value)}
              placeholder="e.g., The Ramos Family"
              autoComplete="name"
              maxLength={60}
            />
          </div>

          <div className="field-group">
            <div className="label-row">
              <label htmlFor="guest-message">{event.messageLabel}</label>
              <span className={message.length >= maxCharacters ? "character-count limit" : "character-count"}>
                {message.length}/{maxCharacters}
              </span>
            </div>
            <textarea
              id="guest-message"
              value={message}
              onChange={(eventObject) => setMessage(eventObject.target.value)}
              placeholder={event.placeholder}
              maxLength={maxCharacters}
              rows={5}
            />
          </div>

          <div className="field-group">
            <label>Choose a Photo</label>
            {!previewUrl ? (
              <label className="upload-zone" htmlFor="photo-upload">
                <span className="camera-icon" aria-hidden="true">▣</span>
                <span className="upload-title">Choose or Take a Photo</span>
                <span className="upload-help">JPG, PNG or WEBP · Maximum 10 MB</span>
                <input
                  id="photo-upload"
                  className="hidden-file-input"
                  type="file"
                  accept="image/*"
                  // 🟢 REMOVED capture="environment" to unlock your local phone gallery roll option!
                  onChange={handlePhotoChange}
                />
              </label>
            ) : (
              <div className="photo-preview">
                <img src={previewUrl} alt="Selected upload preview" />
                <div className="preview-overlay">
                  <p>{photo?.name}</p>
                  <button type="button" className="remove-photo-button" onClick={removePhoto}>
                    Remove Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button className="primary-button" type="submit" disabled={status === "uploading"}>
            {status === "uploading" ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Uploading…
              </>
            ) : (
              event.button
            )}
          </button>

          <p className="privacy-notice">
            By submitting, you allow the event host to review and display your photo and message during this private event.
          </p>
        </form>
        <PoweredBy />
      </section>
    </main>
  );
}

function PoweredBy() {
  return (
    <footer className="powered-footer">
      <span>Powered by</span>
      <a href="https://slidekast.com" target="_blank" rel="noopener noreferrer">
        SlideKast
      </a>
      <a className="planning-link" href="https://slidekast.com" target="_blank" rel="noopener noreferrer">
        Planning an event? See how it works.
      </a>
    </footer>
  );
}