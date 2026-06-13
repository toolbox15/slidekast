// Rebuilt Live Tribute Component: Locked cleanly inside its assigned 20% viewport footprint
const LiveTributeLowerThird = ({ uploads, frame }) => {
  const liveUploads = useMemo(
    () => uploads.length > 0 ? uploads : [{
      id: 'awaiting-live-tribute',
      image_url: '',
      sender_name: 'Guestbook',
      message_text: 'Your memories will appear here.',
    }],
    [uploads]
  );

  const activeIndex = Math.floor(frame / LIVE_LOWER_THIRD_FRAMES) % liveUploads.length;
  const activeUpload = liveUploads[activeIndex];
  const itemFrame = frame % LIVE_LOWER_THIRD_FRAMES;
  const imageSource = resolveImageSource(activeUpload.image_url);

  const translateX = linearInterpolate(itemFrame, [0, LIVE_LOWER_THIRD_FRAMES], [-1100, 1100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const translateY = linearInterpolate(itemFrame, [0, LIVE_LOWER_THIRD_FRAMES / 2, LIVE_LOWER_THIRD_FRAMES], [10, -10, 10], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = linearInterpolate(itemFrame, [0, 54, LIVE_LOWER_THIRD_FRAMES - 64, LIVE_LOWER_THIRD_FRAMES], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(90deg, rgba(10,14,16,0.18), rgba(10,14,16,0.85) 18%, rgba(10,14,16,0.9) 50%, rgba(10,14,16,0.85) 82%, rgba(10,14,16,0.18))',
        borderTop: '1px solid rgba(217,191,141,0.28)',
        boxShadow: '0 -15px 50px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 'fit-content', // FIXED: Forces the card to collapse tightly around the content length
          minWidth: '450px',    // Gives it a solid base width so short messages still look substantial
          maxWidth: '85vw',
          minHeight: '110px',
          opacity,
          transform: `translate(${translateX}px, ${translateY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '16px 24px',
          background: 'rgba(18,23,25,0.95)',
          border: '1px solid rgba(217,191,141,0.42)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
          borderRadius: '8px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '75px',
            height: '75px',
            flex: '0 0 75px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '6px',
          }}
        >
          {imageSource ? (
            <img src={imageSource} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.52)', fontFamily: 'Georgia, serif', fontSize: '24px' }}>+</div>
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: '#d9bf8d', fontFamily: 'Georgia, serif', fontSize: '22px', lineHeight: 1.1, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeUpload.sender_name || 'Guest'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: '16px', lineHeight: 1.3, fontWeight: 300, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {activeUpload.message_text || 'Shared a memory in loving tribute.'}
          </div>
        </div>
      </div>
    </div>
  );
};