import "phaser";
import { SCENE_KEYS } from "./scene.keys";
import { WeekdayParameters, Performance } from "../types/type";

interface HighlightableButtons {
  button: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
}

enum WeekdayShort {
  Sun = 0,
  Mon,
  Tue,
  Wed,
  Thu,
  Fri,
  Sat,
}

enum Weekday {
  Sunday = 0,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

const days = ["M", "T", "W", "T", "F", "S", "S"];

const dummyStock = [100, 100, 100, 100, 100, 100, 100];

const dayList: Phaser.GameObjects.Text[] = [];

const workerCost = 50;

const stockCost = 20;


export class ManagementScene extends Phaser.Scene {
  private currentDay: number = 0;
  private maxStock: number = 100;
  private restockQuantity = 100;
  private budgetValue = 500;

  private daySelect!: Phaser.GameObjects.DOMElement;
  private workersText!: Phaser.GameObjects.Text;
  private priceText!: Phaser.GameObjects.Text;
  private currentDayText!: Phaser.GameObjects.Text;
  private dayPageContainer!: Phaser.GameObjects.Container;
  private generalPageContainer!: Phaser.GameObjects.Container;
  private stockText!: Phaser.GameObjects.Text;
  private budgetText!: Phaser.GameObjects.Text;

  private outline = 0x221862;
  private shadow = 0x3928a0;
  private midtone = 0x4e40a9;
  private highlight = 0x7460f3;
  private lightText = 0x999999;
  private darkText = 0x000000;

  // private canvasWidth = this.game.config.width as number;
  // private canvasHeight = this.game.config.height as number;

  private weekParameters: WeekdayParameters[] = [
    { workers: 1, price: 100 },
    { workers: 1, price: 100 },
    { workers: 1, price: 100 },
    { workers: 1, price: 100 },
    { workers: 1, price: 100 },
    { workers: 1, price: 100 },
    { workers: 1, price: 100 },
  ];

  private weekDayButtons: HighlightableButtons[] = [];
  private generalPageButton!: HighlightableButtons;

  constructor() {
    super(SCENE_KEYS.MANAGEMENT_SCENE);
  }

  preload() {
    this.load.image("background", "assets/menu-background.png");
  }

  create() {
    this.registry.set("weekParameters", this.weekParameters);
    if (this.registry.get("currentWeek") === undefined) {
      this.registry.set("currentWeek", 1);
    } else {
      this.registry.set("currentWeek", this.registry.get("currentWeek") + 1);
    }
    this.sound.add("effect", { loop: false });

    //const background = this.add.image(448, 448, "background");
    this.createBackground();

    //    const summaryBox = this.add.graphics();
    //     this.drawRounded(summaryBox, 448, 580, 450, 150, 10, 0x000000, 0x15239E);

    this.createTopButtons();

    
    this.budgetValue = this.registry.get("totalProfit") ?? 500;

    // this.add
    //     .text(400, 50, "Management Simulation", {
    //         fontSize: "32px",
    //         color: "#fff",
    //     })
    //     .setOrigin(0.5);

    //this.createDaySelector();
    this.createManagementUI();

    this.createGeneralPage();

    this.updateManagementUI();

    if (this.registry.get("tutorial")) {
      this.scene.pause(SCENE_KEYS.MANAGEMENT_SCENE);
      this.scene.launch(SCENE_KEYS.TUTORIAL_SCENE, {
        priceX: 700,
        priceY: 400,
      });
    }
  }

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
    width: any,
    height: any,
    padding: number,
    radius: any,
    borderColor: any,
    fillColor: any,
    hoverColor?: undefined
  ) {
    graphics.lineStyle(2, borderColor);
    if (hoverColor !== undefined) {
      graphics.fillStyle(hoverColor);
    } else {
      graphics.fillStyle(fillColor);
    }
    graphics.fillRoundedRect(
      x - padding / 2,
      y - padding / 2,
      width + padding,
      height + padding,
      radius
    );
    graphics.strokeRoundedRect(
      x - padding / 2,
      y - padding / 2,
      width + padding,
      height + padding,
      radius
    );
  }

  drawTriangle(
    xPosition: number,
    yPosition: number,
    size: number,
    color: number,
    rotation: number = 0
  ) {
    const halfSize = size / 2;
    const height = Math.sqrt(3) * halfSize;
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.beginPath();

    const angle = Phaser.Math.DegToRad(rotation);

    const x1 = xPosition + size * Math.cos(angle);
    const y1 = yPosition + size * Math.sin(angle);
    const x2 = xPosition + size * Math.cos(angle + (2 * Math.PI) / 3);
    const y2 = yPosition + size * Math.sin(angle + (2 * Math.PI) / 3);
    const x3 = xPosition + size * Math.cos(angle + (4 * Math.PI) / 3);
    const y3 = yPosition + size * Math.sin(angle + (4 * Math.PI) / 3);

    graphics.moveTo(x1, y1);
    graphics.lineTo(x2, y2);
    graphics.lineTo(x3, y3);
    graphics.closePath();
    graphics.fillPath();

    return graphics;
  }

  private createBackground() {
    const background = this.add.rectangle(
      this.sys.canvas.width / 2,
      this.sys.canvas.height / 2,
      this.sys.canvas.width,
      this.sys.canvas.height,
      this.shadow
    );
    background.setDepth(-100);
    //const foreground = this.add.rectangle(0, 0, this.sys.canvas.width * 0.8, this.sys.canvas.height * 0.8, this.highlight);
    //backgroundContainer.add(foreground);

    const foregroundSize = 0.85;
    const foreground = this.add.graphics();
    foreground.fillStyle(this.highlight);
    foreground.fillRoundedRect(
      (this.sys.canvas.width * (1 - foregroundSize)) / 2,
      (this.sys.canvas.height * (1 - foregroundSize)) / 2,
      this.sys.canvas.width * foregroundSize,
      this.sys.canvas.height * foregroundSize,
      20
    ); // Set the radius for rounded corners
  }

  private createTopButtons() {
    const xOffset: number = 140;
    const yOffset: number = 50;

    const xSpacing: number = 75;

    const xSize: number = 60;
    const ySize: number = 40;

    for (let i = 0; i < 7; i++) {
      const dayContainer = this.add.container(xOffset + xSpacing * i, yOffset);

      // Background
      const graphics = this.add
        .rectangle(0, 0, xSize, ySize, this.highlight)
        .setStrokeStyle(2, this.outline);
      dayContainer.add(graphics);

      // Text
      const dayButton = this.add
        .text(0, 0, WeekdayShort[i], {
          fontSize: "24px",
          color: "#fff",
        })
        .setOrigin(0.5);
      dayContainer.add(dayButton);

      // Ensure the text is above the graphics
      dayContainer.setDepth(-1);

      dayContainer.setSize(xSize, ySize);
      dayContainer.setInteractive({ useHandCursor: true });
      dayContainer.on("pointerdown", () => {
        this.currentDay = i;
        console.log(this.currentDay);
        this.updateManagementUI();
      });

      this.weekDayButtons[i] = { button: graphics, text: dayButton };
    }

    const generalContainer = this.add.container(
      xOffset + xSpacing * 7.5,
      yOffset
    );

    // Background
    const graphics = this.add
      .rectangle(0, 0, xSize * 2, ySize, this.shadow)
      .setStrokeStyle(2, this.outline);
    generalContainer.add(graphics);

    // Text
    const dayButton = this.add
      .text(0, 0, "General", { fontSize: "24px", color: "#fff" })
      .setOrigin(0.5);
    generalContainer.add(dayButton);

    // Ensure the text is above the graphics
    generalContainer.setDepth(-1);

    generalContainer.setSize(xSize, ySize);
    generalContainer.setInteractive({ useHandCursor: true });
    generalContainer.on("pointerdown", () => {
      this.updateGeneralPage();
    });

    this.generalPageButton = { button: graphics, text: dayButton };
  }

  private createDaySelector() {
    // TODO: Style the select element
    const daySelectHTML = `
      <select id="day-select">
        <option value="0">Sunday</option>
        <option value="1">Monday</option>
        <option value="2">Tuesday</option>
        <option value="3">Wednesday</option>
        <option value="4">Thursday</option>
        <option value="5">Friday</option>
        <option value="6">Saturday</option>
      </select>
    `;

    this.daySelect = this.add.dom(700, 250).createFromHTML(daySelectHTML);
    this.daySelect.addListener("change").on("change", (event: any) => {
      this.currentDay = parseInt(event.target.value);
      this.updateManagementUI();
    });
  }

  private createManagementUI() {
    this.dayPageContainer = this.add.container(0, 0);

    this.currentDayText = this.add.text(100, 100, Weekday[this.currentDay], {
      fontSize: "24px",
      color: "#fff",
    });
    this.dayPageContainer.add(this.currentDayText);

  
    this.registry.set("totalProfit", this.budgetValue);

    this.budgetText = this.add
    .text(630, 100, "Budget:", {
      fontSize: "24px",
      color: "#fff",
      fontStyle:"bold",
    })
    .setOrigin(0.5, 0.5);

    const workersSettingContainer = this.add.container(700, 200);

    const workersLabel = this.add
      .text(-100, 0, "Workers:", {
        fontSize: "24px",
        color: "#fff",
      })
      .setOrigin(0.5, 0.5);
    workersSettingContainer.add(workersLabel);
    this.dayPageContainer.add(workersSettingContainer);

    this.workersText = this.add
      .text(0, 0, this.weekParameters[this.currentDay].workers.toString(), {
        fontSize: "24px",
        color: "#fff",
      })
      .setOrigin(0.5, 0.5);

    workersSettingContainer.add(workersLabel);
    workersSettingContainer.add(this.workersText);
    if (this.registry.get("currentWeek") < 3) {
      workersSettingContainer.setAlpha(0.5);
    }

    //Container
    const workersUpContainer = this.add.container(0, -30);
    workersSettingContainer.add(workersUpContainer);
    //Triangle
    const workersUpTriangle = this.drawTriangle(0, 0, 20, 0xfff849, -90);
    workersUpContainer.add(workersUpTriangle);
    //Clickable
    const workersUpClickable = this.add.rectangle(
      0,
      0,
      30,
      30,
      this.darkText,
      0
    );
    if (this.registry.get("currentWeek") >= 3) {
      workersUpClickable.setInteractive({ useHandCursor: true });
      workersUpClickable.on("pointerdown", () => {
        if (this.weekParameters[this.currentDay].workers < 5) {
          this.weekParameters[this.currentDay].workers++;
          this.budgetValue -= workerCost;
          this.registry.set("totalProfit", this.budgetValue);
          this.updateManagementUI();
        }
      });
    }
    workersUpContainer.add(workersUpClickable);

    //Container
    const workersDownContainer = this.add.container(0, 30);
    workersSettingContainer.add(workersDownContainer);
    //Triangle
    const workersDownTriangle = this.drawTriangle(0, 0, 20, 0xfff849, 90);
    workersDownContainer.add(workersDownTriangle);
    //Clickable
    const workersDownClickable = this.add.rectangle(
      0,
      0,
      30,
      30,
      this.darkText,
      0
    );
    if (this.registry.get("currentWeek") >= 3) {
      workersDownClickable.setInteractive({ useHandCursor: true });
      workersDownClickable.on("pointerdown", () => {
        if (this.weekParameters[this.currentDay].workers > 0) {
          this.weekParameters[this.currentDay].workers--;
          this.budgetValue += workerCost;
          this.registry.set("totalProfit", this.budgetValue);
          this.updateManagementUI();
        }
      });
    }
    workersDownContainer.add(workersDownClickable);

    const priceSettingContainer = this.add.container(700, 400);
    this.dayPageContainer.add(priceSettingContainer);

    const priceLabel = this.add
      .text(-100, 0, "Price:", {
        fontSize: "24px",
        color: "#fff",
      })
      .setOrigin(0.5, 0.5);
    priceSettingContainer.add(priceLabel);

    this.priceText = this.add
      .text(0, 0, this.weekParameters[this.currentDay].price.toString() + "%", {
        fontSize: "24px",
        color: "#fff",
      })
      .setOrigin(0.5, 0.5);
    priceSettingContainer.add(this.priceText);

    //Container
    const priceUpContainer = this.add.container(0, -30);
    priceSettingContainer.add(priceUpContainer);

    //Triangle
    const priceUpTriangle = this.drawTriangle(0, 0, 20, 0xfff849, -90);
    priceUpContainer.add(priceUpTriangle);
    //Clickable
    const priceUpClickable = this.add.rectangle(0, 0, 30, 30, this.darkText, 0);
    priceUpClickable.setInteractive({ useHandCursor: true });
    priceUpClickable.on("pointerdown", () => {
      if (this.weekParameters[this.currentDay].price < 200) {
        this.weekParameters[this.currentDay].price += 10;
        this.updateManagementUI();
      }
    });
    priceUpContainer.add(priceUpClickable);

    //Container
    const priceDownContainer = this.add.container(0, 30);
    priceSettingContainer.add(priceDownContainer);
    //Triangle
    const priceDownTriangle = this.drawTriangle(0, 0, 20, 0xfff849, 90);
    priceDownContainer.add(priceDownTriangle);
    //Clickable
    const priceDownClickable = this.add.rectangle(
      0,
      0,
      30,
      30,
      this.darkText,
      0
    );

    priceDownClickable.setInteractive({ useHandCursor: true });
    priceDownClickable.on("pointerdown", () => {
      if (this.weekParameters[this.currentDay].price > 10) {
        this.weekParameters[this.currentDay].price -= 10;
        this.updateManagementUI();
      }
    });
    priceDownContainer.add(priceDownClickable);
    this.dayPageContainer.add(priceSettingContainer);

    // Create Start Simulation Button
    const startSimulationButton = this.add
      .text(600, 750, "Start Week", {
        fontSize: "24px",
        color: "#fff",
        backgroundColor: "#2C2",
        padding: { x: 10, y: 5 },
      })
      .setInteractive();

    startSimulationButton.on("pointerdown", () => {
      this.registry.set("weekParameters", this.weekParameters);
      this.registry.set("stock", this.restockQuantity); // TODO: set the stock
      this.scene.start(SCENE_KEYS.GAME_SCENE);
    });

    const graphContainer = this.add.container(300, 300);

    const graph = this.add.rectangle(0, 0, 300, 300, this.lightText);
    graphContainer.add(graph);

    // const graphSummaryText = this.add.text(
    //   -150,
    //   180,
    //   "This is a summary of the graph. It will summarise very well. Yes thats right!",
    //   {
    //     fontSize: "20px",
    //     color: "#ffffff",
    //     align: "center",
    //     wordWrap: { width: 300 },
    //   }
    // );
    // graphContainer.add(graphSummaryText);
    this.dayPageContainer.add(graphContainer);
  }

  private updateManagementUI() {
    this.sound.play("effect");

    this.dayPageContainer.setVisible(true);
    this.generalPageContainer.setVisible(false);

    this.budgetText.setText("Budget: $" + this.budgetValue);

    this.workersText.setText(
      this.weekParameters[this.currentDay].workers.toString()
    );
    this.priceText.setText(
      this.weekParameters[this.currentDay].price.toString() + "%"
    );

    this.currentDayText.setText(Weekday[this.currentDay]);

    //Highlight the selected day
    for (let i = 0; i < this.weekDayButtons.length; i++) {
      const obj = this.weekDayButtons[i];
      if (i == this.currentDay) {
        obj.button.fillColor = this.highlight;
      } else {
        obj.button.fillColor = this.shadow;
      }
    }
    this.generalPageButton.button.fillColor = this.shadow;
  }

  private createGeneralPage() {
    this.generalPageContainer = this.add.container(0, 0);

    const upgradeText = this.add.text(600, 200, "Upgrades:", {
      fontSize: "25px",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 300 },
    });
    this.generalPageContainer.add(upgradeText);

    const subUpgradeText = this.add.text(600, 300, "Coming soon!", {
      fontSize: "20px",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 300 },
    });
    this.generalPageContainer.add(subUpgradeText);

    const StockText = this.add.text(150, 100, "Stock:", {
      fontSize: "25px",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 300 },
    });
    this.generalPageContainer.add(StockText);

    this.createGraph();
    this.createSupplyDemandGraph();

    this.createStockButtons();
  }

  private updateGeneralPage() {
    this.sound.play("effect");

    this.dayPageContainer.setVisible(false);
    this.generalPageContainer.setVisible(true);

    this.budgetText.setText("Budget: $" + this.budgetValue);
    

    //Highlight only the general page button
    for (let i = 0; i < this.weekDayButtons.length; i++) {
      const obj = this.weekDayButtons[i];
      obj.button.fillColor = this.shadow;
    }
    this.generalPageButton.button.fillColor = this.highlight;

    this.stockText.setText(this.restockQuantity.toString() + "Kg");
  }

  private createStockButtons() {
    this.restockQuantity = this.registry.get("stock") ?? this.restockQuantity;

    const stockSettingContainer = this.add.container(700, 400);

    this.stockText = this.add
      .text(0, 0, this.restockQuantity.toString() + "Kg", {
        fontSize: "24px",
        color: "#fff",
      })
      .setOrigin(0.5, 0.5);
    stockSettingContainer.add(this.stockText);

    //Container
    const stockUpContainer = this.add.container(0, -30);
    stockSettingContainer.add(stockUpContainer);
    //Triangle
    const stockUpTriangle = this.drawTriangle(0, 0, 20, 0xfff849, -90);
    stockUpContainer.add(stockUpTriangle);
    //Clickable
    const stockUpClickable = this.add.rectangle(0, 0, 30, 30, this.darkText, 0);
    stockUpClickable.setInteractive({ useHandCursor: true });
    stockUpClickable.on("pointerdown", () => {
      if (this.restockQuantity < this.maxStock) {
        this.restockQuantity += 10;

        this.budgetValue -= stockCost;
        this.registry.set("totalProfit", this.budgetValue);
        this.updateGeneralPage();
      }
    });
    stockUpContainer.add(stockUpClickable);

    //Container
    const stockDownContainer = this.add.container(0, 30);
    stockSettingContainer.add(stockDownContainer);
    //Triangle
    const stockDownTriangle = this.drawTriangle(0, 0, 20, 0xfff849, 90);
    stockDownContainer.add(stockDownTriangle);
    //Clickable
    const stockDownClickable = this.add.rectangle(
      0,
      0,
      30,
      30,
      this.darkText,
      0
    );
    stockDownClickable.setInteractive({ useHandCursor: true });
    stockDownClickable.on("pointerdown", () => {
      if (this.restockQuantity > 0) {
        this.restockQuantity -= 10;
        this.updateGeneralPage();

        this.budgetValue += stockCost;
        this.registry.set("totalProfit", this.budgetValue);
      }
    });
    stockDownContainer.add(stockDownClickable);
    this.generalPageContainer.add(stockSettingContainer);
  }

  private createGraph() {
    if (this.registry.get("currentWeekPerformance") != null) {
      const lastWeekPerformance: Performance[] = this.registry.get(
        "currentWeekPerformance"
      );
      for (let i = 0; i < 7; i++) {
        console.log(
          "SUPPLY FOR DAY " + i + " is " + lastWeekPerformance[i].stockQuantity
        );
        dummyStock[i] = lastWeekPerformance[i].stockQuantity;
      }
    }

    const stockGraphContainer = this.add.container(300, 300);
    const stockGraph = this.add.rectangle(0, 0, 300, 300, 0xffffff);
    stockGraphContainer.add(stockGraph);

    // Create a Graphics object
    const dividerGraphics = this.add.graphics();

    // Define line properties

    const lineHeight = 2; // Adjust the height of the line as needed
    const lineColor = 0x7460f3; // Adjust the color of the line as needed
    const dividerHeight = 40;
    const textBuffer = 20;
    const halfHeight = stockGraph.height / 2;
    const halfWidth = stockGraph.width / 2;
    const textY = stockGraph.originY + textBuffer - halfHeight;

    const usableGraphHeight = stockGraph.height - dividerHeight;

    // Draw a horizontal line
    dividerGraphics.lineStyle(lineHeight, lineColor);
    dividerGraphics.beginPath();
    dividerGraphics.moveTo(
      stockGraph.originX - halfWidth,
      stockGraph.originY - halfHeight + dividerHeight
    ); // Start at the center of 'graphContainer'
    dividerGraphics.lineTo(
      stockGraph.x + halfWidth,
      stockGraph.originY - halfHeight + dividerHeight
    ); // Draw horizontally to the right
    dividerGraphics.closePath();
    dividerGraphics.stroke();

    // Add the line to the container
    stockGraphContainer.add(dividerGraphics);

    for (let i = 0; i < days.length; i++) {
      const dayText = this.add.text(
        stockGraph.x +
          textBuffer -
          halfWidth +
          (i * stockGraph.width) / days.length,
        textY,
        days[i],
        {
          fontSize: "20px",
          color: "#000",
        }
      );
      dayText.setOrigin(0.5);
      stockGraphContainer.add(dayText);
      dayList.push(dayText);
    }

    const chartGraphics = this.add.graphics();

    chartGraphics.lineStyle(3, lineColor);
    chartGraphics.beginPath();
    chartGraphics.moveTo(
      stockGraph.x + textBuffer - halfWidth,
      stockGraph.y +
        halfHeight -
        (dummyStock[0] / this.maxStock) * usableGraphHeight
    );
    console.log(stockGraph.x + textBuffer - halfWidth);

    for (let i = 0; i < dayList.length; i++) {
      chartGraphics.lineTo(
        stockGraph.x +
          textBuffer -
          halfWidth +
          (i * stockGraph.width) / days.length,
        stockGraph.y +
          halfHeight -
          (dummyStock[i] / this.maxStock) * usableGraphHeight
      );
    }

    chartGraphics.stroke();
    stockGraphContainer.add(chartGraphics);

    const stockMaxText = this.add.text(70, 180, `${this.maxStock} kg`, {
      fontSize: "20px",
      color: "#ffffff",
    });

    const zeroText = this.add.text(70, 430, "0 kg ", {
      fontSize: "20px",
      color: "#ffffff",
    });

    this.generalPageContainer.add(stockMaxText);
    this.generalPageContainer.add(zeroText);
    this.generalPageContainer.add(stockGraphContainer);
  }
 
  private createSupplyDemandGraph() {
    const blue = 0x5260de;
    const red = 0xdb7676;
    const lastWeekPerformance = this.registry.get("currentWeekPerformance");

    if (!lastWeekPerformance) {
      console.log("No previous week data available");
      const noDataText = this.add.text(
        300, // X position
        300, // Y position
        "No previous week data",
        { fontSize: "22px", color: "#ff0000", fontStyle:"bold" }
      );
      noDataText.setOrigin(0.5); // Center the text
      return;
    }

    const supplyData = [];
    const demandData = [];

    for (let i = 0; i < 7; i++) {
      supplyData.push(lastWeekPerformance[i].supply);
      demandData.push(lastWeekPerformance[i].demand);
      console.log(
        "SUPPLY FOR DAY " + i + " is " + lastWeekPerformance[i].supply
      );
      console.log(
        "DEMAND FOR DAY " + i + " is " + lastWeekPerformance[i].demand
      );
    }

    const supplyDemandGraphContainer = this.add.container(300, 300);
    const graphWidth = 300;
    const graphHeight = 300;
    const barWidth = graphWidth / 14; // 7 days, 2 bars per day

    // Draw background
    const supplyDemandGraph = this.add.rectangle(
      0,
      0,
      graphWidth,
      graphHeight,
      0xffffff
    );
    supplyDemandGraph.setStrokeStyle(2, 0x000000); // border
    supplyDemandGraphContainer.add(supplyDemandGraph);

    const graphics = this.add.graphics({
      lineStyle: { width: 2, color: 0x000000 },
    });

    // Draw X and Y axes
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        -graphWidth / 2,
        graphHeight / 2,
        graphWidth / 2,
        graphHeight / 2
      )
    ); // x-axis
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        -graphWidth / 2,
        graphHeight / 2,
        -graphWidth / 2,
        -graphHeight / 2
      )
    ); // y-axis

    // Calculate scaling factor for the graph based on the max supply/demand value
    const maxValue = Math.max(...supplyData, ...demandData);
    const scaleFactor = (graphHeight - 20) / maxValue;

    // Draw supply and demand bars and add labels
    for (let i = 0; i < 7; i++) {
      const x = -graphWidth / 2 + i * 2 * barWidth;
      const supplyBarHeight = supplyData[i] * scaleFactor;
      const demandBarHeight = demandData[i] * scaleFactor;

      // Draw supply bar
      graphics.fillStyle(blue, 1); // blue color for supply
      graphics.fillRect(
        x,
        graphHeight / 2 - supplyBarHeight,
        barWidth,
        supplyBarHeight
      );

      // Draw demand bar
      graphics.fillStyle(red, 1); // red color for demand
      graphics.fillRect(
        x + barWidth,
        graphHeight / 2 - demandBarHeight,
        barWidth,
        demandBarHeight
      );

      // Add day label
      const dayLabel = this.add.text(
        x + barWidth, // Center between the two bars
        graphHeight / 2 + 10, // Slightly below the x-axis
        WeekdayShort[i],
        { fontSize: "14px", color: "#000000" } // Customize the text style
      );
      dayLabel.setOrigin(0.5); // Center the text horizontally
      supplyDemandGraphContainer.add(dayLabel); // Add labels to the container
    }

    // Add Y-axis labels
    const yAxisValues = [0, maxValue / 2, maxValue];
    yAxisValues.forEach((value) => {
      const y = graphHeight / 2 - value * scaleFactor;
      const yAxisLabel = this.add.text(
        -graphWidth / 2 - 10, // Position it slightly left of the y-axis
        y,
        value.toString(),
        { fontSize: "16px", color: "#000000" }
      );
      yAxisLabel.setOrigin(1, 0.5); // Align the text to the right
      supplyDemandGraphContainer.add(yAxisLabel);
    });

    // Create background rectangle for the key
    const keyBg = this.add.rectangle(
      -graphWidth / 2 + 60, // Adjust X position for better centering
      graphHeight / 2 + 50, // Adjust Y position below the graph
      100,
      50,
      0xffffff
    );
    keyBg.setStrokeStyle(1, 0x000000); // Add a border to the rectangle

    // Add the background rectangle to the container
    supplyDemandGraphContainer.add(keyBg);

    // Add the supply and demand labels
    const keySupply = this.add.text(
      -graphWidth / 2 + 30,
      graphHeight / 2 + 28,
      "Supply",
      { fontSize: "16px", color: "blue", fontStyle: "bold" }
    );

    const keyDemand = this.add.text(
      -graphWidth / 2 + 30,
      graphHeight / 2 + 53,
      "Demand",
      { fontSize: "16px", color: "red", fontStyle: "bold" }
    );

    // Add the text labels to the container
    supplyDemandGraphContainer.add(keySupply);
    supplyDemandGraphContainer.add(keyDemand);

    // Add title to the graph
    const graphTitle = this.add.text(
      0, // X position (centered)
      -graphHeight / 2 - 15,
      "Last Week's Supply and Demand",
      { fontSize: "14px", color: "#000000", fontStyle: "bold" }
    );
    graphTitle.setOrigin(0.5); // Center the text horizontally
    supplyDemandGraphContainer.add(graphTitle);

    const lastWeekParameters = this.registry.get("weekParameters");
    // Add title for last week parameters
    const title = this.add.text(
      300, // X position aligned with the graph
      580, // Y position just below the graph
      "Last Week Parameters",
      {
        fontSize: "24px",
        color: "white",
        fontStyle: "bold",
        fontFamily: "Courier",
      }
    );
    title.setOrigin(0.5); // Center the text horizontally
    this.add.existing(title);

    // Add price and workers information below the graph
    const fixedWidthFontStyle = {
      fontSize: "18px",
      color: "white",
      fontFamily: "Courier",
    };
    const xPosition = 300; // X position aligned with the graph
    const yPositionStart = 610; // Starting Y position
    const lineSpacing = 20; // Space between each line

    for (let i = 0; i < 7; i++) {
      const day = Weekday[i].padEnd(9); // Pad the day names to ensure they have equal length
      const price = `Price: ${lastWeekParameters[i].price}%`.padEnd(10); // Pad the price to ensure consistent spacing
      const workers = `Workers: ${lastWeekParameters[i].workers}`; // Workers information
      const infoText = this.add.text(
        xPosition, // X position aligned with the graph
        yPositionStart + i * lineSpacing, // Y position, line by line
        `${day} ${price} ${workers}`, // Concatenated string with aligned text
        fixedWidthFontStyle // Use fixed-width font style
      );
      infoText.setOrigin(0.5, 0); // Center the text horizontally, top-aligned vertically
      this.add.existing(infoText);
    }

    supplyDemandGraphContainer.add(graphics);
    this.dayPageContainer.add(supplyDemandGraphContainer);
  }
}
