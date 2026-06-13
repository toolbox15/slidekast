import { interpolate } from "remotion";
import React from "react";
import { HandwritingMessage } from "./HandwritingMessage";
import {
  PHOTO_SLIDE_FRAMES,
  TRANSITION_FRAMES,
  resolveImageSource,
} from "./memorialUtils";

const TEXT_REVEAL_DELAY = TRANSITION_FRAMES + 30; 
const TEXT_REVEAL_FRAMES = 35;

export const CinematicPhotoSlide = ({
  photo,
  frame,
  frameShape,
  opacity = 1,
  isEntering = false,
}) => {
  // Read layout directives directly from the Firestore Object Map
  const layout = photo?.layoutType || "full-screen"; 
  const textStyle = photo?.textStyle || "classic-serif";
  
  const imgUrl1 = resolveImageSource(photo?.primary_url || photo?.image_url || "");
  const imgUrl2 = photo?.sibling_urls?.[0] ? resolveImageSource(photo.sibling_urls[0]) : null;
  
  const name = photo?.sender_name || "";
  const message = photo?.message_text || "";
  const caption = photo?.caption || "";
  const radius = frameShape === "oval" ? "50%" : "16px";

  // --- PREMIUM DIMENSIONAL MOTION PHYSICS ---
  
  // 1. Background Ambient Plate: Slow, deep breathing zoom
  const bgScale = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [1.05, 1.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  
  // 2. Foreground Hero Image 1: Sweeping upward float + gentle scale out
  const heroScale1 = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [1.02, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const heroDriftY1 = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [15, -25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frameGlow = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [0.2, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 3. Foreground Hero Image 2: Asymmetric counter-motion for split timelines
  const heroScale2 = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [1.12, 1.03], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const heroDriftY2 = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [-15, 25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 4. Text Overlay: Sophisticated slow-rise delayed easing
  const textFrame = Math.max(0, frame - TEXT_REVEAL_DELAY);
  const textOpacity = interpolate(textFrame, [0, TEXT_REVEAL_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textDriftY = interpolate(textFrame, [0, TEXT_REVEAL_FRAMES], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const handwritingFrame = Math.max(0, textFrame - 4);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity,
        backgroundColor: "#090c0d",
      }}
    >
      {/* 1. IMMERSIVE ATMOSPHERIC DEEP BLUR BACKGROUND PLATE */}
      {imgUrl1 && (
        <img
          src={imgUrl1}
          alt=""
          style={{
            position: "absolute",
            inset: -60,
            width: "calc(100% + 120px)",
            height: "calc(100% + 120px)",
            objectFit: "cover",
            objectPosition: "center",
            filter: "blur(75px) brightness(0.15) saturate(0.85)",
            transform: `scale(${bgScale})`,
            opacity: 0.9,
          }}
        />
      )}

      {/* 2. RESPONSIVE CANVAS WORKSPACE */}
      <div
        style={{
          position: "absolute",
          inset: "5% 6% 180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "50px",
        }}
      >
        {/* IMAGE FRAME 1 */}
        {imgUrl1 && (
          <div
            style={{
              position: "relative",
              width: layout === "split-portrait" && imgUrl2 ? "46%" : "100%",
              height: "100%",
              maxWidth: layout === "split-portrait" ? "520px" : "1100px",
              borderRadius: radius,
              border: "1px solid rgba(217,191,141,0.35)",
              background: "linear-gradient(135deg, rgba(16, 21, 23, 0.8) 0%, rgba(24, 32, 35, 0.75) 50%, rgba(16, 21, 23, 0.8) 100%)",
              padding: "14px",
              boxSizing: "border-box",
              boxShadow: `0 50px 100px rgba(0,0,0,0.85), 0 0 ${40 + frameGlow * 20}px rgba(217,191,141,0.08), inset 0 0 0 1px rgba(255,255,255,0.06)`,
              transform: `translateY(${heroDriftY1}px)`,
              overflow: "hidden",
            }}
          >
            <img
              src={imgUrl1}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: layout === "full-screen" ? "contain" : "cover",
                objectPosition: "center 35%",
                borderRadius: frameShape === "oval" ? "50%" : "8px",
                transform: `scale(${heroScale1})`,
                transition: "transform 0.05s linear",
                filter: "contrast(1.02) saturate(0.98)",
              }}
            />
          </div>
        )}

        {/* IMAGE FRAME 2 (Staggered Split Motion Timeline) */}
        {layout === "split-portrait" && imgUrl2 && (
          <div
            style={{
              position: "relative",
              width: "46%",
              height: "100%",
              maxWidth: "520px",
              borderRadius: radius,
              border: "1px solid rgba(217,191,141,0.35)",
              background: "linear-gradient(135deg, rgba(16, 21, 23, 0.8) 0%, rgba(24, 32, 35, 0.75) 50%, rgba(16, 21, 23, 0.8) 100%)",
              padding: "14px",
              boxSizing: "border-box",
              boxShadow: `0 50px 100px rgba(0,0,0,0.85), 0 0 ${40 + frameGlow * 20}px rgba(217,191,141,0.08), inset 0 0 0 1px rgba(255,255,255,0.06)`,
              transform: `translateY(${heroDriftY2}px)`,
              overflow: "hidden",
            }}
          >
            <img
              src={imgUrl2}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 35%",
                borderRadius: "8px",
                transform: `scale(${heroScale2})`,
                transition: "transform 0.05s linear",
                filter: "contrast(1.02) saturate(0.98)",
              }}
            />
          </div>
        )}
      </div>

      {/* 3. HIGH-END TYPOGRAPHY OVERLAY ZONE */}
      <div
        style={{
          position: "absolute",
          bottom: "45px",
          left: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 80px",
          boxSizing: "border-box",
          opacity: message ? 1 : textOpacity,
          transform: `translateY(${textDriftY}px)`,
          zIndex: 30,
        }}
      >
        {message ? (
          <HandwritingMessage
            message={message}
            sender={name}
            frame={handwritingFrame}
          />
        ) : caption ? (
          <>
            <p
              style={{
                fontFamily: textStyle === "classic-serif" ? "Georgia, serif" : "Arial, sans-serif",
                fontSize: textStyle === "classic-serif" ? "35px" : "26px",
                fontStyle: textStyle === "classic-serif" ? "italic" : "normal",
                letterSpacing: textStyle === "modern-caps" ? "3px" : "normal",
                color: "#f8fafc",
                margin: "0 0 12px",
                lineHeight: 1.4,
                textShadow: "0 4px 15px rgba(0,0,0,0.95)",
                maxWidth: "1050px",
                fontWeight: "300",
              }}
            >
              {caption}
            </p>
            {name ? (
              <h3
                style={{
                  color: "#d9bf8d",
                  fontSize: "13px",
                  letterSpacing: "7px",
                  textTransform: "uppercase",
                  margin: 0,
                  fontWeight: "400",
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                {name}
              </h3>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
};