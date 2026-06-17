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
          
          {/* Main Action Button */}
          <button className="primary-button" type="button" onClick={resetForm} style={{ marginBottom: '20px' }}>
            {eventType === "Tom-Memorial" ? "Submit Another Memory" : "Submit Another Photo"}
          </button>

          {/* 📱 1. RETURN TO MOBILE GALLERY / HOME LINK */}
          <button 
            className="secondary-button"
            type="button" 
            onClick={resetForm}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              padding: '12px',
              color: '#ffffff',
              textDecoration: 'none',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '1.05rem',
              fontWeight: '500',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              boxSizing: 'border-box',
              marginBottom: '15px',
              transition: 'all 0.2s ease'
            }}
          >
            🖼️ Return to Gallery Roll
          </button>

          {/* 📺 2. LIVE DISPLAY SHORTCUT LINK */}
          <a 
            href={`/${eventType}?view=display`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              padding: '12px',
              color: '#d9bf8d',
              textDecoration: 'none',
              fontFamily: 'system-ui, sans-serif',
              fontSize: '1.05rem',
              fontWeight: '600',
              border: '1px solid #d9bf8d',
              borderRadius: '8px',
              boxSizing: 'border-box',
              backgroundColor: 'rgba(217, 191, 141, 0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            📺 View Live Screen Display
          </a>

          <PoweredBy />
        </section>
      </main>
    );
  }