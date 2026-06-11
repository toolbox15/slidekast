import React, { useState } from 'react';
import { db, storage } from './firebase'; // Adjust this path based on your setup
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DirectorAdminForm = ({ eventId }) => {
  const [category, setCategory] = useState('earlyYearsPhotos');
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setStatusMessage('⚠️ Please select an image file first.');
      return;
    }

    setIsUploading(true);
    setStatusMessage('⏳ Uploading to secure event directory...');

    try {
      // 1. Save image to Firebase Storage inside a folder matching the eventId
      const storagePath = `events/${eventId}/${category}/${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);

      // 2. Reference the exact event document in Firestore
      const eventDocRef = doc(db, 'events', eventId);

      // 3. Push the new photo details into the array matching their chosen chapter category
      await updateDoc(eventDocRef, {
        [category]: arrayUnion({
          image_url: downloadURL,
          caption: caption,
          uploaded_at: new Date().toISOString()
        })
      });

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

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
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
    </div>
  );
};

export default DirectorAdminForm;