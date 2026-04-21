import Phaser from "phaser";
import { SCENE_KEYS } from "./scene.keys";

export class TitleScene extends Phaser.Scene {
  private titleSound!: Phaser.Sound.BaseSound;
  constructor() {
    super("TITLE_SCENE");
  }

  preload() {
    this.load.image("bg", "assets/title-page-bg.png");
    this.load.image("title", "assets/temp-logo.png");
    this.load.image("shop", "assets/shop.png");
    this.load.audio("bgm", "/assets/audio/bgm.mp3");
    this.load.audio("title-sound","/assets/audio/title-sound.mp3")
  }

  create() {
    const canvasWidth = this.sys.canvas.width;
    const canvasHeight = this.sys.canvas.height;

    this.titleSound = this.sound.add("title-sound");

    // Add background image
    const background = this.add.image(0, 0, "bg").setOrigin(0, 0);
    const shop = this.add.image(-canvasWidth, 450, "shop").setScale(1.79);

    // Add title logo
    const logo = this.add
      .image(448, -canvasHeight, "title")
      .setOrigin(0.5, 0.5)
      .setScale(0.8);

    // Add "Click to Start" text
    const startText = this.add
      .text(448, 870, "Click to Start", {
        fontSize: "32px",
        color: "black",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0);
    
      // Animate shop to slide in from the left
    this.tweens.add({
      targets: shop,
      x: 448,
      duration: 200,
      ease: "Power2",
      delay: 200,
    });

    // Animate logo to slide in from the top
    this.tweens.add({
      targets: logo,
      y: 180,
      duration: 200,
      ease: "Power2",
      delay: 400,
      onComplete: () => {
        this.titleSound.play();
      },
    });

    // Fade in "Click to Start" text after slide-in
    this.tweens.add({
      targets: startText,
      alpha: 1,
      duration: 400,
      delay: 700,
      ease: "Power2",
    });

    // Make the entire scene interactive
    this.input.on("pointerdown", () => {
      this.scene.start(SCENE_KEYS.MENU_SCENE);
    });

    this.sound.add("bgm", { loop: true });
    this.sound.volume = 0.2;
    this.sound.play("bgm", { loop: true });
  }

  update() {}
}
