import { interpolate } from "remotion";
import React from "react";
import { HandwritingMessage } from "./HandwritingMessage";
import { PHOTO_SLIDE_FRAMES, TRANSITION_FRAMES, resolveImageSource } from "./memorialUtils";

const TEXT_REVEAL_DELAY = TRANSITION_FRAMES + 24;
const TEXT_REVEAL_FRAMES = 28;

export const CinematicPhotoSlide = ({ photo, frame, frameShape, opacity = 1, isEntering = false }) => {
  // Read layout directives directly from the Firestore Object Map
  const layout = photo?.layoutType || "full-screen"; 
  const textStyle = photo?.textStyle || "classic-serif";
  
  const imgUrl1 = resolveImageSource(photo?.primary_url || photo?.image_url || "");
  const imgUrl2 = photo?.sibling_urls?.[0] ? resolveImageSource(photo.sibling_urls[0]) : null;
  
  const name = photo?.sender_name || "";
  const message = photo?.message_text || "";
  const caption = photo?.caption || "";
  const radius = frameShape === "oval" ? "50%" : "12px";

  // Movement animations driven by frame loop
  const scaleIn = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [1.02, 1.10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scaleOut = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [1.08, 1.01], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const driftY = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [0, -15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const textFrame = Math.max(0, frame - TEXT_REVEAL_DELAY);
  const textOpacity = interpolate(textFrame, [0, TEXT_REVEAL_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textY = interpolate(textFrame, [0, TEXT_REVEAL_FRAMES], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity, backgroundColor: "#0d1113" }}>
      {/* Immersive Ambient Blur Plate */}
      {imgUrl1 && (
        <img src={imgUrl1} alt="" style={{ position: "absolute", inset: -40, width: "calc(100% + 80px)", height: "calc(100% + 80px)", objectFit: "cover", filter: "blur(55px) brightness(0.22)", opacity: 0.85 }} />
      )}

      {/* DYNAMIC LAYOUT ENGINE */}
      <div style={{ position: "absolute", inset: "4% 6% 160px", display: "flex", alignItems: "center", justifyContent: "center", gap: "40px" }}>
        
        {/* IMAGE FRAME 1 */}
        {imgUrl1 && (
          <div style={{
            position: "relative",
            width: layout === "split-portrait" && imgUrl2 ? "48%" : "100%",
            height: "100%",
            maxWidth: layout === "split-portrait" ? "550px" : "1160px",
            borderRadius: radius,
            border: "1px solid rgba(217,191,141,0.45)",
            background: "rgba(16, 21, 23, 0.7)",
            padding: "12px",
            boxSizing: "border-box",
            boxShadow: "0 30px 70px rgba(0,0,0,0.65)",
            transform: `scale(${scaleIn}) translateY(${driftY}px)`,
          }}>
            <img src={imgUrl1} alt="" style={{ width: "100%", height: "100%", objectFit: layout === "full-screen" ? "contain" : "cover", borderRadius: frameShape === "oval" ? "50%" : "6px" }} />
          </div>
        )}

        {/* IMAGE FRAME 2 (Only renders if explicitly commanded by your layout directive) */}
        {layout === "split-portrait" && imgUrl2 && (
          <div style={{
            position: "relative",
            width: "48%",
            height: "100%",
            maxWidth: "550px",
            borderRadius: radius,
            border: "1px solid rgba(217,191,141,0.45)",
            background: "rgba(16, 21, 23, 0.7)",
            padding: "12px",
            boxSizing: "border-box",
            boxShadow: "0 30px 70px rgba(0,0,0,0.65)",
            transform: `scale(${scaleOut}) translateY(${-driftY}px)`,
          }}>
            <img src={imgUrl2} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }} />
          </div>
        )}
      </div>

      {/* DYNAMIC TYPOGRAPHY ENGINE */}
      <div style={{ position: "absolute", bottom: "40px", left: 0, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 80px", boxSizing: "border-box", opacity: message ? 1 : textOpacity, transform: `translateY(${textY}px)`, zIndex: 30 }}>
        {message ? (
          <HandwritingMessage message={message} sender={name} frame={Math.max(0, textFrame - 4)} />
        ) : caption ? (
          <>
            <p style={{
              fontFamily: textStyle === "classic-serif" ? "Georgia, serif" : "Arial, sans-serif",
              fontSize: textStyle === "classic-serif" ? "36px" : "28px",
              fontStyle: textStyle === "classic-serif" ? "italic" : "normal",
              letterSpacing: textStyle === "modern-caps" ? "2px" : "normal",
              color: "#f8fafc",
              margin: "0 0 10px",
              lineHeight: 1.35,
              textShadow: "0 3px 12px rgba(0,0,0,0.95)",
              maxWidth: "1100px",
            }}>
              {caption}
            </p>
            {name && (
              <h3 style={{ color: "#d9bf8d", fontSize: "14px", letterSpacing: "6px", textTransform: "uppercase", margin: 0, fontWeight: "400" }}>
                {name}
              </h3>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};