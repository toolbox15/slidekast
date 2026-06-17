// 🔄 LOOP ENGINE: Active index state to rotate slides one-by-one
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    
    // Automatically advance to the next slide every 6 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [photos]);

  // Always keep the current active slide in view
  const currentSlide = photos[currentIndex] || photos[0];

  return (
    <main style={{ 
      height: '100vh', 
      width: '100vw', 
      background: '#090d0f', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative',
      overflow: 'hidden',
      color: '#f8fafc'
    }}>
      <section style={{
        width: '100%',
        maxWidth: '1200px',
        height: '85vh',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr', // Elegant splitscreen layout
        gap: '60px',
        padding: '0 40px',
        alignItems: 'center'
      }}>
        {/* Left Aspect: The Full Portrait Memory Image */}
        <div style={{ 
          height: '100%', 
          maxHeight: '75vh',
          border: '1px solid #d9bf8d', 
          borderRadius: '4px', 
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          background: '#101417'
        }}>
          <img 
            src={currentSlide.imageUrl || currentSlide.image_url} 
            alt="Tribute Slide" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>

        {/* Right Aspect: The Text Message Sidebar Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingRight: '20px' }}>
          <p style={{ letterSpacing: '3px', fontSize: '12px', color: '#d9bf8d', textTransform: 'uppercase', margin: 0 }}>
            Shared Remembrance
          </p>
          <blockquote style={{ 
            color: '#f8fafc', 
            fontSize: '32px', 
            fontFamily: 'Georgia, serif', 
            lineHeight: '1.5', 
            fontStyle: 'italic',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            "{currentSlide.message_text || currentSlide.message}"
          </blockquote>
          <div style={{ width: '40px', height: '1px', background: '#d9bf8d', marginTop: '10px' }} />
          <cite style={{ color: '#d9bf8d', fontSize: '20px', fontWeight: 'bold', fontStyle: 'normal', letterSpacing: '1px' }}>
            — {currentSlide.sender_name || "Anonymous Friend"}
          </cite>
        </div>
      </section>

      {/* Subtle Fixed Bottom Brand Identification */}
      <footer style={{ position: 'absolute', bottom: '30px', left: '40px', display: 'flex', gap: '15px', alignItems: 'center', opacity: 0.4 }}>
        <p style={{ margin: 0, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#d9bf8d' }}>
          Celebrating Tom Henderson
        </p>
      </footer>
    </main>
  );
}