import React from 'react';
import ReactDOM from 'react-dom/client';
import GuestUploadForm from './GuestUploadForm';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <GuestUploadForm eventId="smith-wedding-2026" />
    </div>
  </React.StrictMode>
);