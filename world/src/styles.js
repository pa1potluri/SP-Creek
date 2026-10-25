// Art styles: each sets the brush/finish sliders plus the depth-based look.
// look.mode: 0 none, 1 animated film, 2 blocky toy, 3 paper cut, 4 pixel art, 5 watercolour (see LookShader).
// textures: which texture set the world wears (World.setTextureSet): oil, clean or flat.
// plants: which trees and grass stand in the world (World.setPlants): painted, blocks or lowpoly.
// Nothing here animates by itself: with a still camera every style gives a perfectly still picture.
export const STYLES = {
  oil: {
    label: 'Oil painting', textures: 'oil', plants: 'painted',
    paint: { radius: 4, strength: 1, wobble: 0.8, boil: 0, impasto: 0.6, canvas: 0.5, sat: 1, warmth: 0, contrast: 1.05, vignette: 0.4, grain: 0.2 },
    look: { mode: 0 }, fxaa: false, weave: 1,
  },
  film: {
    label: 'Animated film (Pixar-like)', textures: 'clean', plants: 'painted',
    paint: { radius: 1, strength: 0, wobble: 0, boil: 0, impasto: 0, canvas: 0, sat: 1.0, warmth: 0.04, contrast: 0.97, vignette: 0.2, grain: 0 },
    look: { mode: 1, dof: 0.6, bloom: 0.3 }, fxaa: true, weave: 0,
  },
  toy: {
    label: 'Blocky toy (Roblox-like)', textures: 'flat', plants: 'blocks',
    paint: { radius: 1, strength: 0, wobble: 0, boil: 0, impasto: 0, canvas: 0, sat: 1.15, warmth: 0, contrast: 1.02, vignette: 0.1, grain: 0 },
    look: { mode: 2, poster: 14, outline: 0.3 }, fxaa: true, weave: 0,
  },
  clean: {
    label: 'Clean 3D', textures: 'clean', plants: 'painted',
    paint: { radius: 1, strength: 0, wobble: 0, boil: 0, impasto: 0, canvas: 0, sat: 0.92, warmth: 0, contrast: 1.0, vignette: 0.2, grain: 0 },
    look: { mode: 0 }, fxaa: true, weave: 0,
  },
  paper: {
    label: 'Paper cut', textures: 'clean', plants: 'painted',
    paint: { radius: 3, strength: 1, wobble: 0, boil: 0, impasto: 0, canvas: 0.8, sat: 0.95, warmth: 0.04, contrast: 1, vignette: 0.3, grain: 0.15 },
    look: { mode: 3, poster: 7, layers: 7, paperShadow: 1.5 }, fxaa: true, weave: 0,
  },
  pixel: {
    label: 'Pixel art', textures: 'flat', plants: 'lowpoly',
    paint: { radius: 1, strength: 0.6, wobble: 0, boil: 0, impasto: 0, canvas: 0, sat: 1.1, warmth: 0, contrast: 1.05, vignette: 0.15, grain: 0 },
    look: { mode: 4, poster: 8, pixel: 4 }, fxaa: false, weave: 0,
  },
  watercolor: {
    label: 'Watercolour (preview)', textures: 'clean', plants: 'painted',
    paint: { radius: 2, strength: 0.35, wobble: 0, boil: 0, impasto: 0, canvas: 0, sat: 0.9, warmth: 0.02, contrast: 0.94, vignette: 0.08, grain: 0 },
    look: { mode: 5, wash: 0.65, pigment: 0.45, paper: 0.55 }, fxaa: true, weave: 0,
  },
};
