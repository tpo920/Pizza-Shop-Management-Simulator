import Phaser from "phaser";
import { SCENE_KEYS } from "./scene.keys";

// Extracted color from the image (hex code)
const backgroundColor = 0x7e57c2; // Using a sample color matching the provided image

export class RandomEventPopupsScene extends Phaser.Scene {
  private eventData: any; // Define the eventData property
  private eventText: Phaser.GameObjects.Text | null;
  private rewardText: Phaser.GameObjects.Text | null;
  private closeButton: Phaser.GameObjects.Text | null;

  constructor() {
    super({
      key: SCENE_KEYS.RANDOM_EVENT_POPUPS_SCENE,
    });
    this.eventData = null;
    this.eventText = null;
    this.rewardText = null;
    this.closeButton = null;
  }

  init(data: { eventData: any }) {
    this.eventData = data.eventData;
  }

  preload() {
    this.load.image("button", "assets/button.png");
    this.load.image("button-hover", "assets/button-hover.png");
    this.load.image("logo", "assets/SliceOfPizza.png");
  }

  create() {
    // Create the popup container
    const popup = this.add.container(
      this.sys.canvas.width / 2,
      -this.sys.canvas.height / 2
    );

    // Add a background rectangle (using the extracted color)
    const background = this.add.rectangle(
      0,
      0,
      this.sys.canvas.width * 0.8,
      this.sys.canvas.height * 0.8,
      backgroundColor
    );
    popup.add(background);

    // Create a graphics object to draw the border
    const border = this.add.graphics();
    border.lineStyle(4, 0x000000); // Set the border color and thickness
    border.strokeRoundedRect(
      -this.sys.canvas.width * 0.4,
      -this.sys.canvas.height * 0.4,
      this.sys.canvas.width * 0.8,
      this.sys.canvas.height * 0.8,
      12
    ); // Set the radius for rounded corners
    popup.add(border);

    // Create event text
    this.eventText = this.add
      .text(0, -50, this.eventData.description, {
        fontSize: "32px",
        color: "#ffffff",
        wordWrap: { width: this.sys.canvas.width * 0.75 },
      })
      .setOrigin(0.5);
    popup.add(this.eventText);

    // Create reward text
    const rewardMessage = this.getRewardMessage(this.eventData);
    this.rewardText = this.add
      .text(0, 50, rewardMessage, {
        fontSize: "24px",
        color: "#00FF00",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.sys.canvas.width * 0.75 },
      })
      .setOrigin(0.5);
    popup.add(this.rewardText);

    // Create close button
    this.closeButton = this.add
      .text(0, 150, "Close", {
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#888888",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.closeButton.on("pointerdown", () => this.closePopup(popup));
    this.closeButton.on("pointerover", () => {
      this.closeButton?.setStyle({ backgroundColor: "#aaaaaa" });
    });
    this.closeButton.on("pointerout", () => {
      this.closeButton?.setStyle({ backgroundColor: "#888888" });
    });
    popup.add(this.closeButton);

    // Add scattered pizza images at the bottom of the popup
    const pizzaPositions = [
      { x: -250, y: 250 },
      { x: -150, y: 250 },
      { x: -50, y: 250 },
      { x: 50, y: 250 },
      { x: 150, y: 250 },
      { x: 250, y: 250 },
    ];
    pizzaPositions.forEach((position) => {
      const pizza = this.add
        .image(position.x, position.y, "logo")
        .setScale(0.3);
      pizza.setRotation(Phaser.Math.Between(-Math.PI, Math.PI));
      popup.add(pizza);
    });

    this.tweens.add({
      targets: popup,
      y: this.sys.canvas.height / 2,
      duration: 500,
      ease: "Power2",
    });
  }

  getRewardMessage(eventData: any): string {
    let message = "";
    if (eventData.coins) {
      message += `${eventData.coins > 0 ? "+" : ""}${eventData.coins} 🪙 `;
    }
    if (eventData.pizzas) {
      message += `${eventData.pizzas > 0 ? "+" : ""}${eventData.pizzas} 🍕 `;
    }
    return message.trim();
  }

  closePopup(popup: Phaser.GameObjects.Container) {
    this.tweens.add({
      targets: popup,
      y: -this.sys.canvas.height / 2,
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        this.scene.stop(SCENE_KEYS.RANDOM_EVENT_POPUPS_SCENE);
        this.scene.resume(SCENE_KEYS.GAME_SCENE, { clearCustomers: false });
      },
    });
  }
}
