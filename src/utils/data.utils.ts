import Phaser from "phaser";
import { DATA_ASSET_KEYS } from "../assets/asset-keys.js";
import { Animation } from "../types/type.js";

export class DataUtils {
  static getAnimations(scene: Phaser.Scene) {
    const data: Animation[] = scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS);
    return data;
  }
}
