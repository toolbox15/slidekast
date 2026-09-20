import { z } from 'zod';

export const LayerPlacementSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.union([z.number(), z.string()]).default('100%'),
  height: z.union([z.number(), z.string()]).default('100%'),
  fit: z.enum(['cover', 'contain', 'fill', 'none']).default('contain'),
});

export const AnimationSchema = z.object({
  type: z.string().default('none'),
  startFrame: z.number().optional(),
  durationInFrames: z.number().optional(),
  opacity: z.object({ from: z.number(), to: z.number() }).optional(),
  scale: z.object({ from: z.number(), to: z.number(), overshoot: z.number().optional() }).optional(),
  translateY: z.object({ from: z.number(), to: z.number() }).optional(),
  translateX: z.object({ from: z.number(), to: z.number() }).optional(),
});

export const LayerConfigSchema = z.object({
  id: z.string(),
  src: z.string().optional(),
  zIndex: z.number().default(0),
  placement: LayerPlacementSchema.optional(),
  animation: AnimationSchema.optional(),
});

export const SceneConfigSchema = z.object({
  sceneId: z.string(),
  sceneName: z.string(),
  fps: z.number(),
  durationInFrames: z.number(),
  layers: z.array(LayerConfigSchema),
});

export const HVACProjectSchema = z.object({
  project: z.object({
    clientName: z.string().optional(),
    scenes: z.array(z.any()).optional(), 
  }).optional(),
  // Expose the active scene config directly to the side panel
  activeScene: SceneConfigSchema.optional(),
});