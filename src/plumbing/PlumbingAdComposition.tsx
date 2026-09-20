// src/plumbing/PlumbingAdComposition.tsx

import React, { useState } from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import scene02Raw from './clients/strike_plumbing/configs/scene02.json';
import scene03Raw from './clients/strike_plumbing/configs/scene03.json';
import scene04Raw from './clients/strike_plumbing/configs/scene04.json';
import scene05Raw from './clients/strike_plumbing/configs/scene05.json';

import { SceneRenderer } from '../hvac/SceneRenderer';
import { ServiceCollapseOverlay } from './components/ServiceCollapseOverlay';
import { TrustProofOverlay } from './components/TrustProofOverlay';
import { Scene05CTA } from './components/Scene05CTA';
import { Scene02StaggeredChecklist } from './components/Scene02StaggeredChecklist';
import type { SceneConfig } from '../hvac/types';
import type { HVACAdCompositionProps } from '../hvac/hvacSceneSchema';

export interface PlumbingAdCompositionProps extends HVACAdCompositionProps {
  s1_logoX?: number;
  s1_logoY?: number;
  s1_logoScale?: number;
}

export const defaultPlumbingProps: PlumbingAdCompositionProps = {
  musicVolume: 0.35,
  voVolume: 1,

  s1_bgX: 0,
  s1_bgY: 0,
  s1_bgScale: 1.0,
  s1_logoX: 0,
  s1_logoY: -20,
  s1_logoScale: 1.25,
  s1_headlineX: 0,
  s1_headlineY: 0,
  s1_headlineScale: 1.0,
  s1_supportX: 0,
  s1_supportY: 0,
  s1_supportScale: 1.0,

  s2_bgX: 0,
  s2_bgY: 0,
  s2_bgScale: 1,
  s2_headlineX: 0,
  s2_headlineY: 0,
  s2_headlineScale: 1,
  s2_supportX: 0,
  s2_supportY: 0,
  s2_supportScale: 1,

  s3_bgX: 0,
  s3_bgY: 0,
  s3_bgScale: 1.0,
  s3_headlineX: 0,
  s3_headlineY: 0,
  s3_headlineScale: 1.0,
  s3_supportX: 0,
  s3_supportY: 0,
  s3_supportScale: 1.0,
  s3_phoneY: 0,

  s4_bgX: 0,
  s4_bgY: 0,
  s4_bgScale: 1.0,
  s4_headlineX: 0,
  s4_headlineY: 0,
  s4_headlineScale: 1,
  s4_supportX: 0,
  s4_supportY: 0,
  s4_supportScale: 1.0,

  s5_bgX: 0,
  s5_bgY: 0,
  s5_bgScale: 1,
  s5_headlineX: 0,
  s5_headlineY: 0,
  s5_headlineScale: 1,
  s5_supportX: 0,
  s5_supportY: 30,
  s5_supportScale: 0.9,
};

const SafeAudio: React.FC<{ src: string; volume: number }> = ({ src, volume }) => {
  const [hasError, setHasError] = useState(false);
  if (hasError || !src || volume <= 0) return null;

  return (
    <Audio
      src={staticFile(src)}
      volume={volume}
      onError={() => setHasError(true)}
    />
  );
};

const ControlledVoiceTrack: React.FC<{
  src: string;
  masterVolume: number;
  durationFrames: number;
}> = ({ src, masterVolume, durationFrames }) => {
  const frame = useCurrentFrame();

  const fadeOutStart = durationFrames - 12;
  const currentVolume = interpolate(
    frame,
    [0, fadeOutStart, durationFrames],
    [masterVolume, masterVolume, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return <SafeAudio src={src} volume={currentVolume} />;
};

const StrikeLogoSequence: React.FC<{
  x?: number;
  y?: number;
  scale?: number;
}> = ({ x = 0, y = 0, scale = 1 }) => {
  const frame = useCurrentFrame();
  const startNum = 86400;
  const totalFrames = 71;

  const currentSeqIndex = Math.min(Math.max(0, frame), totalFrames - 1);
  const fileNum = (startNum + currentSeqIndex).toString().padStart(8, '0');
  const imageSrc = `clients/strike_plumbing/scene01/logo_sequence/logo${fileNum}.png`;

  return (
    <div
      style={{
        position: 'absolute',
        top: 90 + y,
        left: '50%',
        transform: `translate3d(-50%, 0, 0) translateX(${x}px) scale(${scale})`,
        width: 580,
        height: 200,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    >
      <Img
        src={staticFile(imageSrc)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

const Scene01DirectView: React.FC<{
  logoX?: number;
  logoY?: number;
  logoScale?: number;
  headlineX?: number;
  headlineY?: number;
  headlineScale?: number;
  supportX?: number;
  supportY?: number;
  supportScale?: number;
}> = ({
  logoX = 0,
  logoY = 0,
  logoScale = 1.25,
  headlineX = 0,
  headlineY = 0,
  headlineScale = 1,
  supportX = 0,
  supportY = 0,
  supportScale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineOpacity = interpolate(frame, [20, 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const headlineTranslateY = interpolate(frame, [20, 32], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const ctaProgress = spring({
    frame: frame - 48,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const ctaScaleVal = frame >= 48 ? interpolate(ctaProgress, [0, 1], [0.92, 1]) : 0;
  const ctaOpacityVal = frame >= 48 ? interpolate(ctaProgress, [0, 1], [0, 1]) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
      <OffthreadVideo
        src={staticFile('clients/strike_plumbing/scene01/speaker_hook.mp4')}
        volume={1.0}
        startFrom={0}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
          objectFit: 'cover',
          zIndex: 1,
        }}
      />
      <StrikeLogoSequence x={logoX} y={logoY} scale={logoScale} />
      <div
        style={{
          position: 'absolute',
          top: 310 + headlineY,
          left: '50%',
          transform: `translate3d(-50%, 0, 0) translateX(${headlineX}px) translateY(${headlineTranslateY}px) scale(${headlineScale})`,
          opacity: headlineOpacity,
          zIndex: 40,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 900,
          pointerEvents: 'none',
          willChange: 'transform, opacity',
        }}
      >
        <Img
          src={staticFile('clients/strike_plumbing/scene01/03_headline.png')}
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 130 - supportY,
          left: '50%',
          transform: `translate3d(-50%, 0, 0) translateX(${supportX}px) scale(${ctaScaleVal * supportScale})`,
          opacity: ctaOpacityVal,
          zIndex: 40,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 940,
          pointerEvents: 'none',
          willChange: 'transform, opacity',
        }}
      >
        <Img
          src={staticFile('clients/strike_plumbing/scene01/04_footer_cta.png')}
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </div>
    </AbsoluteFill>
  );
};

const applySceneTransforms = (
  sceneConfig: SceneConfig,
  headlineId: string | string[],
  supportId: string | string[],
  transforms: {
    bgX?: number;
    bgY?: number;
    bgScale?: number;
    headlineX?: number;
    headlineY?: number;
    headlineScale?: number;
    supportX?: number;
    supportY?: number;
    supportScale?: number;
    phoneY?: number;
  },
  excludedLayerIds: string[] = []
): SceneConfig => {
  const cloned: SceneConfig = JSON.parse(JSON.stringify(sceneConfig));

  if (cloned.audio) {
    delete (cloned as any).audio;
  }

  if (!cloned.layers) return cloned;

  // Filter out any static layer being replaced programmatically
  cloned.layers = cloned.layers.filter((layer: any) => !excludedLayerIds.includes(layer.id));

  const headlineIds = Array.isArray(headlineId) ? headlineId : [headlineId];
  const supportIds = Array.isArray(supportId) ? supportId : [supportId];

  cloned.layers = cloned.layers.map((layer: any) => {
    const existingPlacement = layer.placement || {};

    if (layer.id === 'background') {
      const newX = transforms.bgX ?? layer.x ?? existingPlacement.x ?? 0;
      const newY = transforms.bgY ?? layer.y ?? existingPlacement.y ?? 0;
      const newScale = transforms.bgScale ?? layer.scale ?? 1;
      return {
        ...layer,
        x: newX,
        y: newY,
        scale: newScale,
        placement: { ...existingPlacement, x: newX, y: newY },
      };
    }
    if (headlineIds.includes(layer.id)) {
      const newX = transforms.headlineX ?? layer.x ?? existingPlacement.x ?? 0;
      const newY = transforms.headlineY ?? layer.y ?? existingPlacement.y ?? 0;
      const newScale = transforms.headlineScale ?? layer.scale ?? 1;
      return {
        ...layer,
        x: newX,
        y: newY,
        scale: newScale,
        placement: { ...existingPlacement, x: newX, y: newY },
      };
    }
    if (supportIds.includes(layer.id)) {
      const newX = transforms.supportX ?? layer.x ?? existingPlacement.x ?? 0;
      const newY = transforms.supportY ?? layer.y ?? existingPlacement.y ?? 0;
      const newScale = transforms.supportScale ?? layer.scale ?? 1;
      return {
        ...layer,
        x: newX,
        y: newY,
        scale: newScale,
        placement: { ...existingPlacement, x: newX, y: newY },
      };
    }
    if (layer.id === 'phone_number' && transforms.phoneY !== undefined) {
      return {
        ...layer,
        y: transforms.phoneY,
        placement: { ...existingPlacement, y: transforms.phoneY },
      };
    }
    return layer;
  });

  return cloned;
};

export const PlumbingAdComposition: React.FC<PlumbingAdCompositionProps> = (props) => {
  const p: PlumbingAdCompositionProps = {
    ...defaultPlumbingProps,
    ...props,
  };

  const frame = useCurrentFrame();

  // Exclude static "checklist" so Scene02StaggeredChecklist animates smoothly
  const s2 = applySceneTransforms(
    scene02Raw as unknown as SceneConfig,
    ['headline_title', 'headline_subtitle', 'headline', '04_headline', 'warmth_restored'],
    ['05_service_checklist', 'warning_text', '06_warning_text', 'repairs_tuneups_installs'],
    {
      bgX: p.s2_bgX,
      bgY: p.s2_bgY,
      bgScale: p.s2_bgScale,
      headlineX: p.s2_headlineX,
      headlineY: p.s2_headlineY,
      headlineScale: p.s2_headlineScale,
      supportX: p.s2_supportX,
      supportY: p.s2_supportY,
      supportScale: p.s2_supportScale,
    },
    ['checklist']
  );

  const s3 = applySceneTransforms(
    scene03Raw as unknown as SceneConfig,
    ['honest_diagnosis', '03_honest_diagnosis', 'headline'],
    ['service_rail', 'footer_base', '04_service_rail', '05_footer_base'],
    {
      bgX: p.s3_bgX,
      bgY: p.s3_bgY,
      bgScale: p.s3_bgScale,
      headlineX: p.s3_headlineX,
      headlineY: p.s3_headlineY,
      headlineScale: p.s3_headlineScale,
      supportX: p.s3_supportX,
      supportY: p.s3_supportY,
      supportScale: p.s3_supportScale,
      phoneY: p.s3_phoneY,
    }
  );

  const s4 = applySceneTransforms(
    scene04Raw as unknown as SceneConfig,
    ['book_today', 'headline'],
    ['warm_comfort_one_call', 'support'],
    {
      bgX: p.s4_bgX,
      bgY: p.s4_bgY,
      bgScale: p.s4_bgScale,
      headlineX: p.s4_headlineX,
      headlineY: p.s4_headlineY,
      headlineScale: p.s4_headlineScale,
      supportX: p.s4_supportX,
      supportY: p.s4_supportY,
      supportScale: p.s4_supportScale,
    }
  );

  const s5 = applySceneTransforms(
    scene05Raw as unknown as SceneConfig,
    ['trusted_heating_experts', 'headline'],
    ['same_day_service', 'support'],
    {
      bgX: p.s5_bgX,
      bgY: p.s5_bgY,
      bgScale: p.s5_bgScale,
      headlineX: p.s5_headlineX,
      headlineY: p.s5_headlineY,
      headlineScale: p.s5_headlineScale,
      supportX: p.s5_supportX,
      supportY: p.s5_supportY,
      supportScale: p.s5_supportScale,
    }
  );

  const SCENE_FRAMES = 144;
  const VO_PLAYBACK_FRAMES = 170;

  const scenes = [
    { type: 'direct_s1' },
    { type: 'rendered', config: s2, vo: 'clients/strike_plumbing/audio/voiceover/scene02_vo.wav' },
    { type: 'rendered', config: s3, vo: 'clients/strike_plumbing/audio/voiceover/scene03_vo.wav' },
    { type: 'rendered', config: s4, vo: 'clients/strike_plumbing/audio/voiceover/scene04_vo.wav' },
    { type: 'rendered', config: s5, vo: 'clients/strike_plumbing/audio/voiceover/scene05_vo.wav' },
  ];

  const baseMusic = p.musicVolume ?? 0.35;
  const sceneProgress = frame % SCENE_FRAMES;
  const duckVolume = baseMusic * 0.45;
  const currentMusicVolume = interpolate(
    sceneProgress,
    [0, 6, 126, 138],
    [duckVolume, duckVolume, duckVolume, baseMusic],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* 1. VISUAL LAYER SEQUENCES */}
      {scenes.map((item, index) => {
        const startFrame = index * SCENE_FRAMES;
        const duration = index === scenes.length - 1 ? SCENE_FRAMES : SCENE_FRAMES + 1;

        return (
          <Sequence key={`visual_slot_${index}`} from={startFrame} durationInFrames={duration}>
            {index === 0 ? (
              <Scene01DirectView
                logoX={p.s1_logoX}
                logoY={p.s1_logoY}
                logoScale={p.s1_logoScale}
                headlineX={p.s1_headlineX}
                headlineY={p.s1_headlineY}
                headlineScale={p.s1_headlineScale}
                supportX={p.s1_supportX}
                supportY={p.s1_supportY}
                supportScale={p.s1_supportScale}
              />
            ) : index === 4 ? (
              <Scene05CTA phoneNumber="(555) 555-5555" startDelayFrames={10} />
            ) : (
              <SceneRenderer scene={item.config!} />
            )}

            {/* Scene 2 Staggered Checklist sliding sequentially from the right */}
            {index === 1 && <Scene02StaggeredChecklist startFrame={14} />}

            {index === 2 && <ServiceCollapseOverlay startFrame={14} />}
            {index === 3 && <TrustProofOverlay startFrame={0} />}
          </Sequence>
        );
      })}

      {/* 2. OVERLAPPING UNCLIPPED VOICEOVER TRACKS */}
      {scenes.map((item, index) => {
        if (!item.vo) return null;
        const startFrame = index * SCENE_FRAMES;

        return (
          <Sequence key={`vo_track_${index}`} from={startFrame} durationInFrames={VO_PLAYBACK_FRAMES}>
            <ControlledVoiceTrack
              src={item.vo}
              masterVolume={p.voVolume ?? 1}
              durationFrames={VO_PLAYBACK_FRAMES}
            />
          </Sequence>
        );
      })}

      {/* 3. Global Background Music */}
      <Sequence from={0} durationInFrames={720}>
        <SafeAudio
          src="clients/strike_plumbing/audio/music/plumbing_ad_music.wav"
          volume={currentMusicVolume}
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export default PlumbingAdComposition;