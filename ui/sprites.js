// Cache de sprites dos peixes (data URLs geradas por pixelArt.js).
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { getBloodMoonFishDataURL, getFishDataURL, getFishSilhouetteDataURL } from '../pixelArt.js';

export class SpriteMethods {
  getFishSpriteURL(iconId) {
    if (!this._fishSpriteCache) this._fishSpriteCache = {};
    if (!this._fishSpriteCache[iconId]) {
      this._fishSpriteCache[iconId] = getFishDataURL(iconId, 3);
    }
    return this._fishSpriteCache[iconId];
  }

  getFishSilhouetteURL(iconId) {
    if (!this._fishSilhouetteCache) this._fishSilhouetteCache = {};
    if (!this._fishSilhouetteCache[iconId]) {
      this._fishSilhouetteCache[iconId] = getFishSilhouetteDataURL(iconId, 3);
    }
    return this._fishSilhouetteCache[iconId];
  }

  getBloodMoonSpriteURL(scale = 3.5) {
    if (!this._fishSpriteCache) this._fishSpriteCache = {};
    const key = `blood_moon_${scale}`;
    if (!this._fishSpriteCache[key]) {
      this._fishSpriteCache[key] = getBloodMoonFishDataURL(scale);
    }
    return this._fishSpriteCache[key];
  }
}
