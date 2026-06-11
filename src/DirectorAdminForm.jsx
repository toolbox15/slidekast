import React, { useState, useEffect } from 'react';
import { db, storage } from './firebaseConfig'; // Fixed file path to match your initialization file
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const DirectorAdminForm = ({ eventId }) => {
  const [category, setCategory] = useState('earlyYearsPhotos');
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // State to hold live database entries for visual management
  const [eventData, setEventData] = useState({
    earlyYearsPhotos: [],
    familyPhotos: [],
    legacyPhotos: [],
  });

  // 1. Listen to the database stream in real-time so layout edits sync instantly
  useEffect(() => {
    const docRef = doc(db, 'events', eventId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEventData({
          earlyYearsPhotos: data.earlyYearsPhotos || [],
          familyPhotos: data.familyPhotos || [],
          legacyPhotos: data.legacyPhotos || [],
        });
      }
    });
    return () => unsubscribe();
  }, [eventId]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) setImageFile(e.target.files[0]);
  };

  // 2. Handle asset uploads directly into structural directories
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setStatusMessage('⚠️ Please select an image file first.');
      return;
    }

    setIsUploading(true);
    setStatusMessage('⏳ Uploading to secure event directory...');

    try {
      const storagePath = `events/${eventId}/${category}/${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);

      const eventDocRef = doc(db, 'events', eventId);
      const updatedArray = [...(eventData[category] || []), {
        id: `${Date.now()}`, // Generated tracking ID for precise targeting during deletion/edits
        image_url: downloadURL,
        caption: caption.trim(),
        storage_path: storagePath, // Cached to target storage objects during hard purges
        uploaded_at: new Date().toISOString()
      }];

      await updateDoc(eventDocRef, { [category]: updatedArray });

      setStatusMessage('✅ Success! Image added to the slideshow loop.');
      setCaption('');
      setImageFile(null);
      e.target.reset();
    } catch (error) {
      console.error("Error updating retrospective folder:", error);
      setStatusMessage('❌ Upload failed. Verify database rules or connection.');
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Handle inline real-time caption edits as they type
  const handleUpdateCaption = async (currentCategory, photoId, newCaption) => {
    try {
      const eventDocRef = doc(db, 'events', eventId);
      const updatedArray = eventData[currentCategory].map((p) => 
        p.id === photoId ? { ...p, caption: newCaption } : p
      );
      await updateDoc(eventDocRef, { [currentCategory]: updatedArray });
    } catch (error) {
      console.error("Error updating caption:", error);
    }
  };

  // 4. Handle complete removal from both Firestore and Cloud Storage buckets
  const handleDeletePhoto = async (currentCategory, photo) => {
    if (!window.confirm("Are you sure you want to permanently delete this photo from the slideshow?")) return;

    try {
      const eventDocRef = doc(db, 'events', eventId);
      
      // Filter out target item from database array
      const updatedArray = eventData[currentCategory].filter((p) => p.id !== photo.id);
      await updateDoc(eventDocRef, { [currentCategory]: updatedArray });

      // Clean up the binary file in Storage to minimize cloud data bloat
      if (photo.storage_path) {
        const fileRef = ref(storage, photo.storage_path);
        await deleteObject(fileRef);
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  // Helper template renderer for management blocks
  const renderPhotoManagerSection = (title, currentCategory) => {
    const photos = eventData[currentCategory] || [];
    if (photos.length === 0) return null;

    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', borderBottom: '1px solid rgba(217,191,141,0.2)', paddingBottom: '8px', fontSize: '18px' }}>{title} ({photos.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px', marginTop: '15px' }}>
          {photos.map((photo) => (
            <div key={photo.id || photo.image_url} style={{ background: '#101417', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: '100%', height: '100px', overflow: 'hidden', borderRadius: '4px', background: '#000' }}>
                <img src={photo.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              
              <input 
                type="text" 
                value={photo.caption || ''} 
                onChange={(e) => handleUpdateCaption(currentCategory, photo.id, e.target.value)}
                placeholder="Add caption..."
                style={{ width: '100%', padding: '6px', background: '#182325', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }}
              />
              
              <button 
                type="button"
                onClick={() => handleDeletePhoto(currentCategory, photo)}
                style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', width: '100%', transition: '0.2s' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* 1. Upload Console */}
      <div style={{ background: '#182325', border: '1px solid #d9bf8d', borderRadius: '8px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', marginTop: 0, marginBottom: '10px' }}>Director Dashboard</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '30px' }}>Pre-loading media files for ID: <strong style={{ color: '#fff' }}>{eventId}</strong></p>
        
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d9bf8d' }}>1. Select Slideshow Chapter:</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '12px', background: '#101417', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }}
            >
              <option value="earlyYearsPhotos">The Early Years (Childhood/Youth)</option>
              <option value="familyPhotos">Building a Life & Family (Milestones)</option>
              <option value="legacyPhotos">A Lasting Legacy (Recent/Community)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d9bf8d' }}>2. Optional Photo Caption:</label>
            <input 
              type="text" 
              placeholder="e.g., High School Graduation, 1978" 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{ width: '100%', padding: '12px', background: '#101417', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#d9bf8d' }}>3. Choose File:</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              style={{ color: 'rgba(255,255,255,0.8)' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isUploading}
            style={{ padding: '14px', background: isUploading ? '#444' : '#d9bf8d', color: '#101417', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: isUploading ? 'not-allowed' : 'pointer', transition: '0.2s' }}
          >
            {isUploading ? 'Processing File...' : 'Upload to Slideshow Folder'}
          </button>
        </form>

        {statusMessage && (
          <div style={{ marginTop: '20px', padding: '12px', background: '#101417', borderLeft: '3px solid #d9bf8d', fontSize: '14px' }}>
            {statusMessage}
          </div>
        )}
      </div>

      {/* 2. Live Management Grid Studio */}
      <div style={{ background: '#182325', border: '1px solid rgba(217,191,141,0.3)', borderRadius: '8px', padding: '30px', marginTop: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', marginTop: 0, marginBottom: '5px' }}>Manage & Edit Slideshow</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '10px' }}>Captions save automatically in real-time as you type them.</p>
        
        {eventData.earlyYearsPhotos.length === 0 && eventData.familyPhotos.length === 0 && eventData.legacyPhotos.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '6px', marginTop: '20px' }}>
            No media uploaded to this event loop yet.
          </div>
        )}

        {renderPhotoManagerSection("Chapter 1: The Early Years", "earlyYearsPhotos")}
        {renderPhotoManagerSection("Chapter 2: Building a Life & Family", "familyPhotos")}
        {renderPhotoManagerSection("Chapter 3: A Lasting Legacy", "legacyPhotos")}
      </div>

    </div>
  );
};

export default DirectorAdminForm;