import Phaser from "phaser";
import { SCENE_KEYS } from "./scene.keys";

export class SettingsScene extends Phaser.Scene {
  drawRounded(
    graphics: {
      lineStyle: (arg0: number, arg1: any) => void;
      fillStyle: (arg0: any) => void;
      fillRoundedRect: (
        arg0: number,
        arg1: number,
        arg2: any,
        arg3: any,
        arg4: any
      ) => void;
      strokeRoundedRect: (
        arg0: number,
        arg1: number,
        arg2: any,
        arg3: any,
        arg4: any
      ) => void;
    },
    x: number,
    y: number,
    width: number,
    height: number,
    radius: any,
    borderColor: any,
    fillColor: any,
    hoverColor?: any
  ) {
    graphics.lineStyle(2, borderColor);
    if (hoverColor !== undefined) {
      graphics.fillStyle(hoverColor);
    } else {
      graphics.fillStyle(fillColor);
    }
    graphics.fillRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      radius
    );
    graphics.strokeRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      radius
    );
  }

  constructor() {
    super(SCENE_KEYS.SETTINGS_SCENE);
  }

  preload() {
    this.load.image("logo", "assets/SliceOfPizza.png");
    this.load.image("background", "assets/menu-background.png");
    this.load.image("button", "assets/button.png");
    this.load.image("button-hover", "assets/button-hover.png");
    this.load.audio("title-sound", "/assets/audio/title-sound.mp3");
    this.load.audio("bgm", "/assets/audio/bgm.mp3");
  }

  create() {
    if (!this.registry.get("music")) {
      this.registry.set("music", true);
    }
    this.sound.add("effect", { loop: false });
    const background = this.add.image(448, 448, "background");

    const backPizza = this.add.image(50, 85, "logo");
    backPizza.setRotation(-Math.PI / 2);
    backPizza.setVisible(false);
    backPizza.setScale(0.5);

    const backButton = this.add.image(200, 100, "button");
    backButton.setScale(0.3, 0.5);

    backButton.setInteractive();
    backButton.on("pointerover", () => {
      backButton.setTexture("button-hover");
      backPizza.setVisible(true);
    });
    backButton.on("pointerout", () => {
      backButton.setTexture("button");
      backPizza.setVisible(false);
    });

    backButton.on("pointerdown", () => {
      this.sound.play("effect");
      this.scene.start(SCENE_KEYS.MENU_SCENE);
    });

    const backButtonText = this.add.text(200, 100, "Back", {
      fontSize: "24px",
      color: "#ffffff",
    });

    backButtonText.setOrigin(0.5);

    const title = this.add.text(448, 200, "Settings", {
      fontSize: "64px",
      color: "#ffffff",
    });

    title.setOrigin(0.5);

    const musicButton = this.add.image(448, 448, "button");

    musicButton.setInteractive();
    musicButton.on("pointerover", () => {
      musicButton.setTexture("button-hover");
    });
    musicButton.on("pointerout", () => {
      musicButton.setTexture("button");
    });

    // Add main text
    const musicText = this.add.text(
      448,
      448,
      `Music: ${this.registry.get("music") ? "On" : "Off"}`,
      {
        fontSize: "24px",
        color: "#ffffff",
      }
    );

    musicText.setOrigin(0.5);

    musicButton.on("pointerdown", () => {
      this.registry.set("music", !this.registry.get("music"));
      musicText.setText(`Music: ${this.registry.get("music") ? "On" : "Off"}`);
      if (this.registry.get("music")) {
        this.sound.play("bgm");
      } else {
        this.sound.removeAll();
      }
    });

    this.tweens.add({
      // target the three pizzas
      targets: [backPizza],
      x: 20,
      duration: 400,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }
}
