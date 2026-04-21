import Phaser from "phaser";
import { SCENE_KEYS } from "./scene.keys";

export class WinScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.WIN_SCENE });
  }

  preload() {
    this.load.image("trophy", "assets/trophy.png");
    this.load.image("background", "assets/menu-background.png");
    this.load.image("pizza", "assets/SliceofPizza.png");
    this.load.image("sad_face", "assets/sad_face.png");
  }
  create(data: { isWin: boolean; totalRevenue: number, totalExpenses: number, totalProfit: number }) {
    const isWin = data.isWin;
    const totalRevenue = data.totalRevenue || 0; 
    const totalExpenses = data.totalExpenses || 0; 
    const totalProfit = data.totalProfit || 0; 
    const tax = totalProfit * 0.2 || 0; 
    const netProfit = totalProfit - tax || 0; 

    const background = this.add.image(448, 448, "background");

    // "Congratulations" or "Mama Mia!, You Lose!" message
    const titleText = isWin ? "Congratulations!" : "Mama Mia!, You Lose!";
    this.add
      .text(448, 200, titleText, {
        fontSize: "60px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // "You've earned a profit of $XXX" or "You've run out of money!!" message
    // const profit = 1000; // TODO : need to replace with actual profit
    const profitText = isWin
      ? `You've earned a Net profit of $${netProfit}!`
      : "You've run out of money!!";
    this.add
      .text(448, 300, profitText, {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Trophy icon or lose icon
    const trophyImageKey = isWin ? "trophy" : "sad_face";
    const trophyIcon = this.add.image(448, 400, trophyImageKey).setScale(0.5);

    // Shake animation for win only
    if (isWin) {
      this.tweens.add({
        targets: trophyIcon,
        x: "+=5",
        yoyo: true,
        repeat: -1,
        duration: 100,
      });
    }

    // Financial summary box
    const summaryBox = this.add.graphics();
    this.drawRounded(summaryBox, 448, 580, 450, 180, 10, 0x000000, 0x15239e);

    this.add
      .text(448, 530, "Financial Summary", {
        fontSize: "32px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(448, 560, `Total Revenue Earned: $${totalRevenue}`, {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(448, 590, `Total Expenses: $${totalExpenses}`, {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

      this.add
      .text(448, 620, `Gross Profit: $${totalProfit}`, {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(448, 650, `Net Profit: $${netProfit}`, {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // white button for detailed summary
    const summaryButton = this.add.graphics();
    this.drawRounded(
      summaryButton,
      448,
      750,
      300,
      50,
      25,
      0x000000,
      0xffffff,
      0xcccccc
    );
    const buttonText = this.add
      .text(448, 750, "Income Analysis Overview", {
        fontSize: "20px",
        color: "#000000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    summaryButton.setInteractive(
      new Phaser.Geom.Rectangle(448 - 150, 750 - 25, 300, 50),
      Phaser.Geom.Rectangle.Contains
    );
    summaryButton.on("pointerover", () => {
      summaryButton.clear();
      this.drawRounded(
        summaryButton,
        448,
        750,
        300,
        50,
        25,
        0x000000,
        0xffffff,
        0x5b63ab
      );
    });
    summaryButton.on("pointerout", () => {
      summaryButton.clear();
      this.drawRounded(
        summaryButton,
        448,
        750,
        300,
        50,
        25,
        0x000000,
        0xffffff,
        0xffffff
      );
    });
    summaryButton.on("pointerdown", () => {
      this.scene.start(SCENE_KEYS.INCOME_ANALYSIS, {
        totalRevenue,
        totalExpenses,
        totalProfit,
        tax,
        netProfit
    });
    });

    // mock data for income statement scene
    this.data.set("budgetedIncome", {
      sales: 100000,
      service: 10000,
      salaries: 30000,
      rent: 10000,
      utilities: 5000,
      supplies: 2000,
    });

    this.data.set("actualIncome", {
      sales: 95000,
      service: 8000,
      salaries: 28000,
      rent: 10000,
      utilities: 4500,
      supplies: 2500,
    });

    if (isWin) {
      //particle emitter for pizzas
      const pizzaEmitter = this.add.particles("pizza").createEmitter({
        x: { min: 0, max: this.cameras.main.width },
        y: -50,
        lifespan: 3000,
        speedY: { min: 200, max: 300 },
        gravityY: 200,
        quantity: 2,
        frequency: 200,
        scale: { start: 0.2, end: 0.3 },
        rotate: { start: 0, end: 360 },
      });
      pizzaEmitter.start();
    }
  }

  drawRounded(
    graphics,
    x,
    y,
    width,
    height,
    radius,
    borderColor,
    fillColor,
    hoverColor?
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
}
