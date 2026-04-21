import Phaser from "phaser";
import { SCENE_KEYS } from "./scene.keys";
import { Performance } from "../types/type";

interface PerformancePerWeek {
  totalSupply: number;
  totalDemand: number;
  totalProfit: number;
  totalExpenses: number;
  totalRevenue: number;
}

export class WeekSummaryScene extends Phaser.Scene {
  private currentWeekIndex: number;
  private popup!: Phaser.GameObjects.Container;
  private weekTitle!: Phaser.GameObjects.Text;
  private financialInfo!: Phaser.GameObjects.Text;
  private commentsText!: Phaser.GameObjects.Text;
  private startNextWeekButton!: Phaser.GameObjects.Image;
  private finalWeek: number = 7;
  private currentWeekPerformance: Performance[] = [];
  private currentWeekSummary: PerformancePerWeek = {
    totalSupply: 0,
    totalDemand: 0,
    totalProfit: 0,
    totalExpenses: 0,
    totalRevenue: 0,
  };

// Variables to accumulate all weeks' total revenue and expenses
private allWeeksTotalRevenue: number = 0;
private allWeeksTotalExpenses: number = 0;
private allWeeksTotalProfit: number = 0;



  constructor() {
    super("WEEK_SUMMARY_SCENE");
    this.currentWeekIndex = 0;
  }

  preload() {
    // Load button images
    this.load.image("button", "assets/button.png");
    this.load.image("button-hover", "assets/button-hover.png");
  }

  create() {
    // Create the popup UI
    this.createPopup();
    // Display information for the current week
    this.weekTitle.setText(`Week ${this.currentWeekIndex + 1} Summary`);
    this.currentWeekPerformance = this.registry.get("currentWeekPerformance");



    // Calculate the total supply, demand, profit, expenses, and revenue for the week
    this.currentWeekPerformance.forEach((dailyPerformance) => {
      this.currentWeekSummary.totalSupply += dailyPerformance.supply;
      this.currentWeekSummary.totalDemand += dailyPerformance.demand;
      this.currentWeekSummary.totalProfit += dailyPerformance.profit;
      this.currentWeekSummary.totalExpenses += dailyPerformance.expenses;
      this.currentWeekSummary.totalRevenue += dailyPerformance.revenue;
    });


    this.registry.set("totalProfit", this.currentWeekSummary.totalProfit)
    this.displayWeeklySummary(this.currentWeekSummary);


    // Accumulate the total revenue and expenses
    this.allWeeksTotalRevenue += this.currentWeekSummary.totalRevenue;
    this.allWeeksTotalExpenses += this.currentWeekSummary.totalExpenses;
    this.allWeeksTotalProfit += this.currentWeekSummary.totalProfit;
    

  }
  private createPopup() {
    // Destroy existing popup if it exists
    if (this.popup) {
      this.popup.destroy();
    }

    // Create a container for the popup
    this.popup = this.add.container(
      this.sys.canvas.width / 2,
      this.sys.canvas.height / 2
    );

    const popupWidth = this.sys.canvas.width * 0.8;
    const popupHeight = this.sys.canvas.height * 0.8;

    // Add a background to the popup
    const background = this.add.graphics();
    background.fillStyle(0x7460f3, 1);
    background.fillRoundedRect(
      -popupWidth / 2,
      -popupHeight / 2,
      popupWidth,
      popupHeight,
      20
    );
    background.lineStyle(4, 0x000000);
    background.strokeRoundedRect(
      -popupWidth / 2,
      -popupHeight / 2,
      popupWidth,
      popupHeight,
      20
    );
    this.popup.add(background);

    // Add title text for the week summary
    this.weekTitle = this.add
      .text(0, -popupHeight / 2 + 100, "", {
        fontSize: "64px",
        color: "white",
      })
      .setOrigin(0.5);
    this.popup.add(this.weekTitle);

    // Add financial information text
    this.financialInfo = this.add
      .text(-20, -100, "", {
        fontSize: "30px",
        color: "white",
      })
      .setOrigin(0.5, 0.5);
    this.popup.add(this.financialInfo);

    // Add comments text
    this.commentsText = this.add.text(
      -popupWidth / 2 + 100,
      -popupHeight / 2 + 400,
      "",
      {
        fontSize: "24px",
        color: "white",
        wordWrap: { width: popupWidth - 100 },
      }
    );
    this.popup.add(this.commentsText);

    // Add a button to start the next week or show results
    this.startNextWeekButton = this.add
      .image(0, popupHeight / 2 - 100, "button")
      .setScale(0.5, 0.5)
      .setInteractive()
      .on("pointerover", () => {
        this.startNextWeekButton.setTexture("button-hover");
      })
      .on("pointerout", () => {
        this.startNextWeekButton.setTexture("button");
      })
      .on("pointerdown", () => {
        this.currentWeekIndex++;
        if (this.currentWeekIndex < this.finalWeek || this.currentWeekSummary.totalProfit < 1000) {
          this.scene.start(SCENE_KEYS.MANAGEMENT_SCENE);
        } else {
            this.scene.start(SCENE_KEYS.WIN_SCENE, { 
              isWin: this.currentWeekSummary.totalProfit>= 1000, 
              totalRevenue: this.allWeeksTotalRevenue,
              totalExpenses: this.allWeeksTotalExpenses,
              totalProfit: this.allWeeksTotalProfit});
        }
      });

    // Add text on the button
    const buttonText = this.add
      .text(
        0,
        this.startNextWeekButton.y,
        this.currentWeekIndex === this.finalWeek - 1
          ? "Show Results"
          : "Start Next Week >>",
        {
          fontSize: "24px",
          color: "#ffffff",
        }
      )
      .setOrigin(0.5);

    this.popup.add(this.startNextWeekButton);
    this.popup.add(buttonText);
  }

  private generateWeeklyComments(
    weeklyPerformance: PerformancePerWeek
  ): string[] {
    const comments: string[] = [];

    if (
      weeklyPerformance.totalSupply > 1000 &&
      weeklyPerformance.totalDemand > 900
    ) {
      comments.push(
        "Great job! This week saw a high supply of pizzas and strong demand from customers."
      );
    } else if (
      weeklyPerformance.totalSupply > 500 &&
      weeklyPerformance.totalDemand > 400
    ) {
      comments.push(
        "This week had a balanced supply and demand. Keep up the steady performance!"
      );
    } else {
      comments.push(
        "Supply and demand were low this week. Consider strategies to boost production and attract more customers."
      );
    }

    // if (weeklyPerformance.totalRevenue > 10000) {
    //   comments.push("Outstanding! The revenue this week was impressive.");
    // } else if (weeklyPerformance.totalRevenue > 5000) {
    //   comments.push("Good job! This week's revenue was solid.");
    // } else {
    //   comments.push(
    //     "Revenue was lower than expected. Consider revising pricing strategies or increasing sales efforts."
    //   );
    // }

    // if (weeklyPerformance.totalExpenses > 5000) {
    //   comments.push(
    //     "Expenses were high this week. Look for ways to reduce costs and improve profitability."
    //   );
    // } else if (weeklyPerformance.totalExpenses > 2000) {
    //   comments.push(
    //     "Expenses were manageable this week. Keep an eye on costs to maintain profitability."
    //   );
    // } else {
    //   comments.push("Excellent cost management! Expenses were low this week.");
    // }

    if (weeklyPerformance.totalProfit > 3000) {
      comments.push("Fantastic! High profit achieved this week.");
    } else if (weeklyPerformance.totalProfit > 1000) {
      comments.push("Solid performance with a good profit margin.");
    } else {
      comments.push(
        "Profit was low or you incurred a loss. Review your strategy to turn things around next week."
      );
    }

    return comments;
  }
  private formatLine(
    label: string,
    value: string,
    labelWidth: number,
    valueWidth: number
  ): string {
    const paddedLabel = label.padEnd(labelWidth);
    const paddedValue = value.padStart(valueWidth);
    return `${paddedLabel} ${paddedValue}`;
  }

  private displayWeeklySummary(weeklyPerformance: PerformancePerWeek) {
    const labelWidth = 16;
    const valueWidth = 10;
    // Assuming you have a method to set text in your game scene
    this.financialInfo.setText(`
    ${this.formatLine(
      "Total Supply:",
      weeklyPerformance.totalSupply.toString(),
      labelWidth,
      valueWidth
    )}
    ${this.formatLine(
      "Total Demand:",
      weeklyPerformance.totalDemand.toString(),
      labelWidth,
      valueWidth
    )}
    ${this.formatLine(
      "Total Revenue:",
      `$${weeklyPerformance.totalRevenue.toString()}`,
      labelWidth,
      valueWidth
    )}
    ${this.formatLine(
      "Total Expenses:",
      `$${weeklyPerformance.totalExpenses.toString()}`,
      labelWidth,
      valueWidth
    )}
    ${this.formatLine(
      "Total Profit:",
      `$${weeklyPerformance.totalProfit.toString()}`,
      labelWidth,
      valueWidth
    )}
  `);

    const comments = this.generateWeeklyComments(weeklyPerformance);
    this.commentsText.setText(`Comments:\n${comments.join("\n")}`);
  }
}
