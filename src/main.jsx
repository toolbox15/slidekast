import React from 'react';
import ReactDOM from 'react-dom/client';
import GuestUploadForm from './GuestUploadForm';
import { FuneralSlideshow } from './FuneralSlideshow';

// Quick check to see what page the browser is trying to look at
const currentPath = window.location.pathname;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ minHeight: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      {currentPath === '/display' ? (
        // TV Screen View
        <FuneralSlideshow eventId="smith-wedding-2026" />
      ) : (
        // Phone Upload View (Default Page)
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <GuestUploadForm eventId="smith-wedding-2026" />
        </div>
      )}
    </div>
  </React.StrictMode>
);