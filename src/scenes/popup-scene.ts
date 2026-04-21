import { SCENE_KEYS } from "./scene.keys";

const backgroundColor = 0x7e57c2;

export class PopupScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private descriptionText!: Phaser.GameObjects.Text;
  private closeButton!: Phaser.GameObjects.Text | null;

  constructor() {
    super(SCENE_KEYS.POPUP_SCENE);
  }

  create(data: { day: number; supply: number; demand: number; stock: number }) {
    console.log(data);

    const popup = this.add.container(
      this.sys.canvas.width / 2,
      -this.sys.canvas.height / 2
    );

    const background = this.add.rectangle(
      0,
      0,
      this.sys.canvas.width * 0.8,
      this.sys.canvas.height * 0.8,
      backgroundColor
    );
    popup.add(background);

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

    this.titleText = this.add
      .text(0, -250, "", {
        fontSize: "58px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: this.sys.canvas.width * 0.75 },
      })
      .setOrigin(0.5);
    popup.add(this.titleText);

    this.titleText.setText(`Day ${data.day} Completed!`);

    this.descriptionText = this.add
      .text(0, -150, "", {
        fontSize: "32px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: this.sys.canvas.width * 0.75 },
      })
      .setOrigin(0.5);

    popup.add(this.descriptionText);

    if (data.stock <= 0) {
      this.descriptionText.setText("You ran out of stock for the week!");
    } else if (data.supply === 0) {
      this.descriptionText.setText(
        "You sold out all your supplies for the day!"
      );
    } else {
      this.descriptionText.setText("You had leftover supplies for the day!");
    }

    this.tweens.add({
      targets: popup,
      y: this.sys.canvas.height / 2,
      duration: 500,
      ease: "Power2",
    });

    this.closeButton = this.add
      .text(0, 150, "Next Day", {
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
    this.closeButton.setVisible(true); // Hide initially
    popup.add(this.closeButton);
  }

  closePopup(popup: Phaser.GameObjects.Container) {
    this.tweens.add({
      targets: popup,
      y: -this.sys.canvas.height / 2,
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        this.scene.stop(SCENE_KEYS.QUESTION_POPUPS_SCENE);
        this.scene.resume(SCENE_KEYS.GAME_SCENE, { clearCustomers: true });
      },
    });
  }
}
