import Phaser from "phaser";
import { SCENE_KEYS } from "./scene.keys";

export class AboutScene extends Phaser.Scene {
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
    super(SCENE_KEYS.ABOUT_SCENE);
  }

  preload() {
    this.load.image("logo", "assets/SliceOfPizza.png");
    this.load.image("background", "assets/menu-background.png");
    this.load.image("button", "assets/button.png");
    this.load.image("button-hover", "assets/button-hover.png");
  }

  create() {
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

    const title = this.add.text(448, 200, "About Pizza Shop", {
      fontSize: "64px",
      color: "#ffffff",
    });

    title.setOrigin(0.5);

    // Add main text
    const mainText = this.add.text(
      448,
      448,
      " Welcome to the Pizza Shop\n In this game you will manage your pizza shop\n and make decisions about your business.\n You must learn and apply business principles to succeed\n" +
        " In order to win, you must reach\n the target and avoid bankruptcy while dealing with \n random events, both good and bad.\n Good Luck!",
      {
        fontSize: "24px",
        color: "#ffffff",
      }
    );

    mainText.setOrigin(0.5);

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
