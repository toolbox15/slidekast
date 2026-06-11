import React from 'react';
import ReactDOM from 'react-dom/client';
import GuestUploadForm from './GuestUploadForm';
import DirectorAdminForm from './DirectorAdminForm'; // We will create this next
import { FuneralSlideshow } from './FuneralSlideshow';

// Break down the URL path (e.g., /smith-wedding-2026/admin)
const pathSegments = window.location.pathname.split('/').filter(Boolean);

// The first segment is always our dynamic Event ID
const eventId = pathSegments[0] || 'default-event';

// Check the second segment of the URL path
const isDisplayPage = pathSegments[1] === 'display';
const isAdminPage = pathSegments[1] === 'admin';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ minHeight: '100vh', width: '100vw', margin: 0, padding: 0, background: '#101417', color: '#f8fafc' }}>
      {isDisplayPage ? (
        // TV Screen View
        <FuneralSlideshow eventId={eventId} liveEventId={eventId} />
      ) : isAdminPage ? (
        // Director Pre-Load View
        <DirectorAdminForm eventId={eventId} />
      ) : (
        // Phone Upload View (Default Guest Page)
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <GuestUploadForm eventId={eventId} />
        </div>
      )}
    </div>
  </React.StrictMode>
);