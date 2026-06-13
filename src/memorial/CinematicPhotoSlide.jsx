import { interpolate } from "remotion";
import React, { useMemo } from "react";
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
  const radius = frameShape === "oval" ? "50%" : "12px";

  // 1. Continuous Floating Motion Mechanics
  const motionScale = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [1.01, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const motionTranslateY = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [4, -12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const alternateMotionScale = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [1.07, 1.01], {
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

  // 2. Multi-Image Parsing Architecture
  // If your Firestore contains sibling images or if we split a vertical chain:
  const photoCluster = useMemo(() => {
    if (!imgUrl) return [];
    // If multiple URLs are packed or passed via a custom layout field, split them.
    // Otherwise, we default to treating the single incoming photo intelligently.
    if (photo?.sibling_urls && Array.isArray(photo.sibling_urls)) {
      return [imgUrl, ...photo.sibling_urls.map(url => resolveImageSource(url))];
    }
    return [imgUrl];
  }, [imgUrl, photo]);

  const isMultiDisplay = photoCluster.length > 1;

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
      {/* Immersive Ambient Blur Background Plate */}
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
            filter: "blur(55px) brightness(0.22) saturate(1.05)",
            opacity: 0.88,
          }}
        />
      ) : null}

      {/* Primary Responsive Workspace */}
      <div
        style={{
          position: "absolute",
          inset: "4% 5% 180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px", // Breathing room between side-by-side portrait configurations
        }}
      >
        {photoCluster.map((url, idx) => {
          // Alternate the scale direction for multi-image sets so they look individually custom animated
          const computedScale = idx % 2 === 0 ? motionScale : alternateMotionScale;
          const computedY = idx % 2 === 0 ? motionTranslateY : -motionTranslateY;

          return (
            <div
              key={idx}
              style={{
                position: "relative",
                display: "inline-block",
                maxHeight: "100%",
                maxWidth: isMultiDisplay ? "48%" : "100%",
                borderRadius: radius,
                border: "1px solid rgba(217,191,141,0.48)",
                background: "rgba(14, 19, 21, 0.7)",
                padding: "12px",
                boxSizing: "border-box",
                boxShadow: "0 25px 65px rgba(0,0,0,0.7), 0 0 35px rgba(217,191,141,0.12)",
                overflow: "hidden",
                transform: `scale(${computedScale}) translateY(${computedY}px)`,
                transition: "transform 0.03s linear",
              }}
            >
              <img
                src={url}
                alt=""
                style={{
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "72vh", // Keeps the outline completely clamped to image boundaries
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: frameShape === "oval" ? "50%" : "6px",
                  filter: "contrast(1.01) saturate(0.99)",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* High-End Cinematic Typography Shield Zone */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
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
          transform: `translateY(${textY}px)`,
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
                fontFamily: "Georgia, serif",
                fontSize: "36px",
                fontStyle: "italic",
                color: "#f8fafc",
                margin: "0 0 10px",
                lineHeight: 1.35,
                textShadow: "0 3px 12px rgba(0,0,0,0.95)",
                maxWidth: "1100px",
                fontWeight: "300"
              }}
            >
              {caption}
            </p>
            {name ? (
              <h3
                style={{
                  color: "#d9bf8d",
                  fontSize: "15px",
                  letterSpacing: "6px",
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