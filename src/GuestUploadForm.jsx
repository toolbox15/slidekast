import React, { useState } from 'react';
import { uploadGuestTribute } from './uploadService';

export default function GuestUploadForm({ eventId = "demo-event" }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setStatus(prev => ({ ...prev, error: null }));
    } else {
      setStatus(prev => ({ ...prev, error: "Please select a valid image file (PNG/JPEG)." }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !message || !file) {
      setStatus(prev => ({ ...prev, error: "All fields are required!" }));
      return;
    }

    setStatus({ loading: true, success: false, error: null });

    const result = await uploadGuestTribute(eventId, file, name, message);

    if (result.success) {
      setStatus({ loading: false, success: true, error: null });
      setName('');
      setMessage('');
      setFile(null);
    } else {
      setStatus({ loading: false, success: false, error: result.error });
    }
  };

  if (status.success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#2e7d32' }}>✨ Sent Successfully!</h2>
        <p>Look at the big screen to see your memory slide into the live stream loop.</p>
        <button 
          onClick={() => setStatus(prev => ({ ...prev, success: false }))}
          style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0070f3', color: '#fff', cursor: 'pointer' }}
        >
          Send Another Memory
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '5px' }}>Share Your Memory</h2>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginTop: '0', marginBottom: '25px' }}>
        Upload a photo and leave a short blessing for the live display screen.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Name Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Your Name</label>
          <input 
            type="text" 
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., The Ramos Family"
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
            required
          />
        </div>

        {/* Message Input with 80-character strict cap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Short Blessing (10-12 words max)</label>
            <span style={{ fontSize: '12px', color: message.length >= 80 ? 'red' : '#666' }}>
              {message.length}/80 chars
            </span>
          </div>
          <textarea 
            maxLength={80}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., Wishing you a beautiful lifetime of love, laughter, and happiness together!"
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', height: '80px', resize: 'none' }}
            required
          />
        </div>

        {/* File Uploader */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Choose Photo</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            style={{ fontSize: '16px' }}
            required
          />
        </div>

        {/* Error Notification */}
        {status.error && (
          <div style={{ color: 'red', fontSize: '14px', backgroundColor: '#ffebee', padding: '10px', borderRadius: '6px' }}>
            ⚠️ {status.error}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={status.loading}
          style={{ 
            padding: '14px', 
            borderRadius: '8px', 
            border: 'none', 
            background: status.loading ? '#ccc' : '#000', 
            color: '#fff', 
            fontSize: '16px', 
            fontWeight: 'bold', 
            cursor: status.loading ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          {status.loading ? 'Uploading to Screen...' : 'Send to Live Display'}
        </button>

      </form>

      {/* Embedded SlideKast Lead Generation Footer Link */}
      <div style={{ textAlign: 'center', marginTop: '35px', paddingBottom: '10px' }}>
        <a 
          href="https://slidekast.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            fontSize: '11px', 
            color: '#777', 
            textDecoration: 'none', 
            letterSpacing: '2px', 
            textTransform: 'uppercase', 
            fontWeight: '500',
            transition: 'color 0.2s, letter-spacing 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#d9bf8d'; // Transitions to gold brand accent on desktop hover
          }} 
          onMouseLeave={(e) => {
            e.target.style.color = '#777';
          }}
        >
          Powered by <span style={{ fontWeight: 'bold' }}>SlideKast</span>
        </a>
      </div>

    </div>
  );
}