import { interpolate } from "remotion";
import React from "react";
import { HandwritingMessage } from "./HandwritingMessage";
import {
  PHOTO_SLIDE_FRAMES,
  TRANSITION_FRAMES,
  resolveImageSource,
} from "./memorialUtils";

const TEXT_REVEAL_DELAY = TRANSITION_FRAMES + 24;
const TEXT_REVEAL_FRAMES = 28;

export const CinematicPhotoSlide = ({
  photo,
  frame,
  frameShape,
  opacity = 1,
  isEntering = false,
}) => {
  const imgUrl = resolveImageSource(photo?.image_url || "");
  const name = photo?.sender_name || "";
  const message = photo?.message_text || "";
  const caption = photo?.caption || "";
  const radius = frameShape === "oval" ? "50%" : "16px";

  // Pure mathematical pan and zoom factors driven by your controller frame loop
  const imageScale = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [1.02, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const imageY = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [0, -15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frameGlow = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [0.2, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  
  const textFrame = Math.max(0, frame - TEXT_REVEAL_DELAY);
  const textOpacity = interpolate(textFrame, [0, TEXT_REVEAL_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textY = interpolate(textFrame, [0, TEXT_REVEAL_FRAMES], [15, 0], {
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
        backgroundColor: "#0d1113",
      }}
    >
      {/* 1. Immersive Blurred Ambient Glow Plate */}
      {imgUrl ? (
        <img
          src={imgUrl}
          alt=""
          style={{
            position: "absolute",
            inset: -40,
            width: "calc(100% + 80px)",
            height: "calc(100% + 80px)",
            objectFit: "cover",
            objectPosition: "center",
            filter: "blur(60px) brightness(0.25) saturate(1.1)",
            transform: `scale(1.1)`,
            opacity: 0.85,
          }}
        />
      ) : null}

      {/* 2. Primary Hero Presentation Frame */}
      <div
        style={{
          position: "absolute",
          // Safely locks the main picture inside the top 75% workspace, leaving room for text
          inset: "4% 6% 160px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: frameShape === "oval" ? "min(55vh, 100%)" : "100%",
            height: "100%",
            maxWidth: "1160px",
            overflow: "hidden",
            borderRadius: radius,
            border: "1px solid rgba(217,191,141,0.45)",
            background: "rgba(16, 21, 23, 0.6)",
            boxShadow: `0 30px 70px rgba(0,0,0,0.65), 0 0 ${30 + frameGlow * 30}px rgba(217,191,141,0.15)`,
          }}
        >
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={caption}
              style={{
                width: "100%",
                height: "100%",
                // Cover fills the golden container frame with premium presence
                objectFit: frameShape === "oval" ? "cover" : "contain",
                objectPosition: "center 35%",
                transform: `scale(${imageScale}) translateY(${imageY}px)`,
                filter: "contrast(1.02) saturate(0.98)",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                boxSizing: "border-box",
                color: "rgba(255,255,255,0.85)",
                fontFamily: "Georgia, serif",
                fontSize: "36px",
                lineHeight: 1.3,
                textAlign: "center",
                fontStyle: "italic"
              }}
            >
              {caption}
            </div>
          )}
        </div>
      </div>

      {/* 3. High-End Typography Overlay Zone */}
      <div
        style={{
          position: "absolute",
          bottom: "35px",
          left: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 60px",
          boxSizing: "border-box",
          opacity: message ? 1 : textOpacity,
          transform: `translateY(${textY}px)`,
          zIndex: 20,
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
                fontFamily: "Georgia, serif",
                fontSize: "34px",
                fontStyle: "italic",
                color: "#f8fafc",
                margin: "0 0 8px",
                lineHeight: 1.3,
                textShadow: "0 3px 10px rgba(0,0,0,0.95)",
                maxWidth: "1000px",
                fontWeight: "300"
              }}
            >
              {caption}
            </p>
            {name ? (
              <h3
                style={{
                  color: "#d9bf8d",
                  fontSize: "16px",
                  letterSpacing: "5px",
                  textTransform: "uppercase",
                  margin: 0,
                  fontWeight: "400",
                  textShadow: "0 2px 4px rgba(0,0,0,0.8)",
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