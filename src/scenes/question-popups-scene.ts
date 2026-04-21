import Phaser from "phaser";
import { SCENE_KEYS } from "./scene.keys";

const backgroundColor = 0x7e57c2;

export class QuestionPopupsScene extends Phaser.Scene {
  private questions: any[];
  private questionIndex: number;
  private questionText: Phaser.GameObjects.Text | null;
  private answerBoxes: Phaser.GameObjects.Container[];
  private resultText: Phaser.GameObjects.Text | null;
  private closeButton: Phaser.GameObjects.Text | null;
  private rewardText: Phaser.GameObjects.Text | null;

  constructor() {
    super({
      key: SCENE_KEYS.QUESTION_POPUPS_SCENE,
    });
    this.questions = [];
    this.questionIndex = 0;
    this.questionText = null;
    this.answerBoxes = [];
    this.resultText = null;
    this.closeButton = null;
    this.rewardText = null;
  }

  preload() {
    this.load.json("questions", "assets/questions.json");
    this.load.image("button", "assets/button.png");
    this.load.image("button-hover", "assets/button-hover.png");
    this.load.image("logo", "assets/SliceOfPizza.png");
    this.load.image("coin", "assets/coin.png");
  }

  create(data: { questions: any[] }) {
    this.questions = data.questions;

    if (!this.questions || this.questions.length === 0) {
      console.error("No questions provided.");
      return;
    }

    this.questionIndex = Phaser.Math.Between(0, this.questions.length - 1);

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
    border.lineStyle(4, 0x000000);
    border.strokeRoundedRect(
      -this.sys.canvas.width * 0.4,
      -this.sys.canvas.height * 0.4,
      this.sys.canvas.width * 0.8,
      this.sys.canvas.height * 0.8,
      12
    );
    popup.add(border);

    this.questionText = this.add
      .text(0, -250, "", {
        fontSize: "32px",
        color: "#ffffff",
        wordWrap: { width: this.sys.canvas.width * 0.75 },
      })
      .setOrigin(0.5);
    popup.add(this.questionText);

    this.answerBoxes = [];
    const boxPositions = [
      { x: -150, y: -100 },
      { x: 150, y: -100 },
      { x: -150, y: 50 },
      { x: 150, y: 50 },
    ];
    for (let i = 0; i < 4; i++) {
      const box = this.add.container(boxPositions[i].x, boxPositions[i].y);
      const boxBackground = this.add
        .rectangle(0, 0, 180, 80, 0x444444)
        .setStrokeStyle(2, 0xffffff);
      const boxText = this.add
        .text(0, 0, "", {
          fontSize: "20px",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: 160 },
        })
        .setOrigin(0.5);

      box.add(boxBackground);
      box.add(boxText);
      box.setSize(180, 80);
      box.setInteractive({ useHandCursor: true });
      box.on("pointerover", () => boxBackground.setFillStyle(0x888888));
      box.on("pointerout", () => boxBackground.setFillStyle(0x444444));
      box.on("pointerdown", () => this.checkAnswer(i));
      this.answerBoxes.push(box);
      popup.add(box);
    }

    this.resultText = this.add
      .text(0, 0, "", {
        fontSize: "24px",
        color: "#FFFF00",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.sys.canvas.width * 0.75 },
      })
      .setOrigin(0.5);
    this.resultText.setVisible(false);
    popup.add(this.resultText);

    this.rewardText = this.add
      .text(0, 50, "", {
        fontSize: "24px",
        color: "#00FF00",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.sys.canvas.width * 0.75 },
      })
      .setOrigin(0.5);
    this.rewardText.setVisible(false);
    popup.add(this.rewardText);

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
    this.closeButton.setVisible(false);
    popup.add(this.closeButton);

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

    this.showQuestion();
  }

  showQuestion() {
    if (!this.questionText) return;

    const questionData = this.questions[this.questionIndex];
    this.questionText.setText(questionData.question);
    questionData.answers.forEach((answer: any, index: number) => {
      const boxText = this.answerBoxes[index].getAt(
        1
      ) as Phaser.GameObjects.Text;
      boxText.setText(answer.text);
    });

    this.answerBoxes.forEach((box) => box.setVisible(true));
    this.resultText?.setVisible(false);
    this.rewardText?.setVisible(false);
    this.closeButton?.setVisible(false);
  }

  checkAnswer(index: number) {
    const answer = this.questions[this.questionIndex].answers[index];
    if (answer.correct) {
      this.resultText?.setText("Correct! " + answer.description);

      const reward = 100;
      this.scene
        .get(SCENE_KEYS.GAME_SCENE)
        .events.emit("correctAnswer", reward);

      this.rewardText?.setText(`+${reward} 🪙`);
    } else {
      this.resultText?.setText("Incorrect! " + answer.description);
    }

    this.answerBoxes.forEach((box) => box.setVisible(false));

    this.resultText?.setVisible(true);
    if (answer.correct) {
      this.rewardText?.setVisible(true);
    }
    this.closeButton?.setVisible(true);
  }

  closePopup(popup: Phaser.GameObjects.Container) {
    this.tweens.add({
      targets: popup,
      y: -this.sys.canvas.height / 2,
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        this.scene.stop(SCENE_KEYS.QUESTION_POPUPS_SCENE);
        this.scene.resume(SCENE_KEYS.GAME_SCENE, { clearCustomers: false });
      },
    });
  }
}
