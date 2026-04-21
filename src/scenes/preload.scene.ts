import Phaser from "phaser";
import { SCENE_KEYS } from "./scene.keys";
import {
  CHARACTER_ASSET_KEYS,
  DATA_ASSET_KEYS,
  WORLD_ASSET_KEYS,
} from "../assets/asset-keys";
import { DataUtils } from "../utils/data.utils";
import { Animation } from "../types/type";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  preload() {
    // Load json data
    this.load.json(
      DATA_ASSET_KEYS.ANIMATIONS,
      "/assets/pizza-game/data/animations.json"
    );

    this.load.json(
      DATA_ASSET_KEYS.QUESTIONS,
      "/assets/questions.json"
    );

    this.load.json(
      DATA_ASSET_KEYS.RANDOM_EVENTS,
      "/assets/random-events.json"
    );

    // Load world assets
    this.load.image(
      WORLD_ASSET_KEYS.MAP,
      "/assets/pizza-game/background/gameBackground.png"
    );
    this.load.tilemapTiledJSON(
      WORLD_ASSET_KEYS.MAP_LEVEL,
      "/assets/pizza-game/data/level.json"
    );
    this.load.image(
      WORLD_ASSET_KEYS.MAP_COLLISION,
      "/assets/pizza-game/background/collision.png"
    );

    // Load character images
    this.load.spritesheet(
      CHARACTER_ASSET_KEYS.PLAYER,
      "/assets/pizza-game/axulart/character/custom.png",
      {
        frameWidth: 64,
        frameHeight: 88,
      }
    );

    this.load.spritesheet(
      CHARACTER_ASSET_KEYS.NPC,
      "/assets/pizza-game/parabellum-games/characters.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    this.load.spritesheet(
      CHARACTER_ASSET_KEYS.CUSTOMER,
      "/assets/pizza-game/parabellum-games/characters.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    // Load audio
    this.load.audio("bgm", "/assets/audio/bgm.mp3");
    this.load.audio("effect", "/assets/audio/menu_sound_effect.mp3");
    this.load.audio("title-sound", "/assets/audio/title-sound.mp3");
  }

  create() {
    console.log(`[${PreloadScene.name}:create] invoked`);
    // Json file -> animations
    this.#createAnimations();

    this.registry.set("tutorial", true);

    // Start scene;
    this.scene.start(SCENE_KEYS.TITLE_SCENE);
  }

  #createAnimations() {
    const animations = DataUtils.getAnimations(this);
    animations.forEach((animation: Animation) => {
      const frames = animation.frames
        ? this.anims.generateFrameNumbers(animation.assetKey, {
            frames: animation.frames,
          })
        : this.anims.generateFrameNumbers(animation.assetKey, { frames: [] });
      this.anims.create({
        key: animation.key,
        frames: frames,
        frameRate: animation.frameRate,
        repeat: animation.repeat,
        delay: animation.delay,
        yoyo: animation.yoyo,
      });
    });
  }
}
