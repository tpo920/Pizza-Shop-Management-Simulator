import Phaser from "phaser";
import { SCENE_KEYS } from "./scene.keys";

export class MainMenu extends Phaser.Scene {
  constructor() {
    super("MENU_SCENE");
  }

  preload() {
    this.load.image("logo", "assets/SliceOfPizza.png");
    this.load.image("background", "assets/menu-background.png");
    this.load.image("button", "assets/button.png");
    this.load.image("button-hover", "assets/button-hover.png");
  }

  create() {
    const background = this.add.image(448, 448, "background");

    const title = this.add.text(448, 200, "Pizza Shop", {
      fontSize: "64px",
      color: "#ffffff",

      // You can add other font styles as needed
    });

    this.sound.add("effect", { loop: false });

    title.setOrigin(0.5);

    //Load logo and rotate it
    const startPizza = this.add.image(150, 325, "logo");
    startPizza.setRotation(-Math.PI / 2);
    startPizza.setVisible(false);

    const startButton = this.add.image(
      this.sys.canvas.width / 2,
      350,
      "button"
    );
    startButton.displayWidth = this.sys.canvas.width / 2;
    startButton.displayHeight = this.sys.canvas.height / 10;

    //Change the button color when hovered
    startButton.setInteractive();
    startButton.on("pointerover", () => {
      startButton.setTexture("button-hover");
      startPizza.setVisible(true);
    });

    //Change the button color back when not hovered
    startButton.on("pointerout", () => {
      startButton.setTexture("button");
      startPizza.setVisible(false);
    });

    // Load next scene on click
    startButton.on("pointerdown", () => {
      this.sound.play("effect");
      this.scene.start(SCENE_KEYS.MANAGEMENT_SCENE);
    });

    const startButtonText = this.add.text(
      startButton.x, // Position the text at the center of the button
      startButton.y,
      "Start Game",
      {
        fontSize: "24px",
        color: "#ffffff",
        // You can add other font styles as needed
      }
    );

    // Center the text within the button
    startButtonText.setOrigin(0.5);

    const aboutPizza = this.add.image(150, 425, "logo");
    aboutPizza.setRotation(-Math.PI / 2);
    aboutPizza.setVisible(false);

    const aboutButton = this.add.image(
      this.sys.canvas.width / 2,
      450,
      "button"
    );
    aboutButton.displayWidth = this.sys.canvas.width / 2;
    aboutButton.displayHeight = this.sys.canvas.height / 10;
    const settingsButton = this.add.image(
      this.sys.canvas.width / 2,
      550,
      "button"
    );

    //Change the button color when hovered
    aboutButton.setInteractive();
    aboutButton.on("pointerover", () => {
      aboutButton.setTexture("button-hover");
      aboutPizza.setVisible(true);
    });

    //Change the button color back when not hovered
    aboutButton.on("pointerout", () => {
      aboutButton.setTexture("button");
      aboutPizza.setVisible(false);
    });

    aboutButton.on("pointerdown", () => {
      this.sound.play("effect");
      this.scene.start(SCENE_KEYS.ABOUT_SCENE);
    });

    const aboutButtonText = this.add.text(
      aboutButton.x, // Position the text at the center of the button
      aboutButton.y,
      "About",
      {
        fontSize: "24px",
        color: "#ffffff",
        // You can add other font styles as needed
      }
    );

    // Center the text within the button
    aboutButtonText.setOrigin(0.5);

    const settingsPizza = this.add.image(150, 525, "logo");
    settingsPizza.setRotation(-Math.PI / 2);
    settingsPizza.setVisible(false);

    settingsButton.displayWidth = this.sys.canvas.width / 2;
    settingsButton.displayHeight = this.sys.canvas.height / 10;

    //Change the button color when hovered
    settingsButton.setInteractive();
    settingsButton.on("pointerover", () => {
      settingsButton.setTexture("button-hover");
      settingsPizza.setVisible(true);
    });

    //Change the button color back when not hovered
    settingsButton.on("pointerout", () => {
      settingsButton.setTexture("button");
      settingsPizza.setVisible(false);
    });

    settingsButton.on("pointerdown", () => {
      this.sound.play("effect");
      this.scene.start(SCENE_KEYS.SETTINGS_SCENE);
    });

    const settingsButtonText = this.add.text(
      settingsButton.x, // Position the text at the center of the button
      settingsButton.y,
      "Settings",
      {
        fontSize: "24px",
        color: "#ffffff",
        // You can add other font styles as needed
      }
    );

    settingsButtonText.setOrigin(0.5);

    this.tweens.add({
      // target the three pizzas
      targets: [startPizza, aboutPizza, settingsPizza],
      x: 100,
      duration: 400,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }
}
