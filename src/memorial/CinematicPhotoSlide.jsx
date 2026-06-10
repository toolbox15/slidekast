import { AbsoluteFill, Img, interpolate } from "remotion";
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
  const radius = frameShape === "oval" ? "999px" : "28px";

  const imageScale = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [1, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const imageY = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [10, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const frameGlow = interpolate(frame, [0, PHOTO_SLIDE_FRAMES], [0.16, 0.28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textFrame = Math.max(0, frame - TEXT_REVEAL_DELAY);
  const textOpacity = interpolate(textFrame, [0, TEXT_REVEAL_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const textY = interpolate(textFrame, [0, TEXT_REVEAL_FRAMES], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const handwritingFrame = Math.max(0, textFrame - 4);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity,
        backgroundColor: "#101417",
      }}
    >
      {imgUrl ? (
        <Img
          src={imgUrl}
          style={{
            position: "absolute",
            inset: -34,
            width: "calc(100% + 68px)",
            height: "calc(100% + 68px)",
            objectFit: "cover",
            objectPosition: "center",
            filter: "blur(42px) brightness(0.36) saturate(0.92)",
            transform: `scale(${1.08 + frameGlow * 0.08})`,
            opacity: isEntering ? 1 : 0.94,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: "58px 96px 238px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${imageScale}) translateY(${imageY}px)`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            borderRadius: radius,
            border: "1px solid rgba(238,222,190,0.72)",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.16), rgba(255,255,255,0.045))",
            boxShadow: `0 34px 96px rgba(0,0,0,0.52), 0 0 ${
              26 + frameGlow * 42
            }px rgba(217,191,141,0.18), inset 0 0 0 1px rgba(255,255,255,0.14)`,
          }}
        >
          {imgUrl ? (
            <Img
              src={imgUrl}
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: frameShape === "oval" ? "999px" : "12px",
                boxShadow: "0 18px 52px rgba(0,0,0,0.48)",
                filter: "saturate(0.96) contrast(1.04)",
              }}
            />
          ) : (
            <div
              style={{
                width: 840,
                maxWidth: "100%",
                height: 500,
                maxHeight: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 62,
                boxSizing: "border-box",
                borderRadius: frameShape === "oval" ? "999px" : "12px",
                background:
                  "linear-gradient(135deg, rgba(82,98,104,0.62), rgba(28,34,38,0.88))",
                color: "rgba(255,255,255,0.82)",
                fontFamily: "Georgia, serif",
                fontSize: 48,
                lineHeight: 1.16,
                textAlign: "center",
              }}
            >
              {caption}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 50,
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
          zIndex: 10,
        }}
      >
        {message ? (
          <HandwritingMessage
            message={message}
            sender={name}
            frame={handwritingFrame}
          />
        ) : (
          <>
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 42,
                fontStyle: "italic",
                color: "#f8fafc",
                margin: "0 0 12px",
                lineHeight: 1.32,
                textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                maxWidth: 1200,
              }}
            >
              {caption}
            </p>
            {name ? (
              <h3
                style={{
                  color: "#d9bf8d",
                  fontSize: 22,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  margin: 0,
                  fontWeight: 400,
                  textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                {name}
              </h3>
            ) : null}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
