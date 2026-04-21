import Phaser from "phaser";
import { SCENE_KEYS } from "./scene.keys";
import { WORLD_ASSET_KEYS } from "../assets/asset-keys";
import { NPC, NPCPath } from "../world/characters/npc";
import { Customer } from "../world/characters/customer";
import { DIRECTION } from "../common/direction";
import { TILE_SIZE } from "../config";
import {
  Coordinate,
  WeekdayParameters,
  Performance,
  ShopParameters,
} from "../types/type";

import {
  calculateRevenue,
  calculateExpenses,
  calculateSupply,
  calculateProfit,
  calculateDemand,
} from "../utils/business";

const CUSTOM_TILED_TYPES = Object.freeze({
  NPC: "npc",
  CUSTOMER: "customer",
  NPC_PATH: "npc_path",
});

const TILED_NPC_PROPERTY = Object.freeze({
  MOVEMENT_PATTERN: "movement_pattern",
  FRAME: "frame",
  NPC_TYPE: "type",
});

export class GameScene extends Phaser.Scene {
  //_______________________________________NPC Variables
  #backgroundNpcs: NPC[] = [];

  #roadNpcs: NPC[] = [];
  #npcPathOne: NPCPath[] = [];
  #npcPathTwo: NPCPath[] = [];
  #positionOne: Coordinate = { x: 0, y: 0 };
  #positionTwo: Coordinate = { x: 0, y: 0 };
  #creationTime: number = Phaser.Math.Between(500, 1500);

  #customerNpcs: Customer[] = [];
  #customerPath: NPCPath[] = [];
  #customerPositionOne: Coordinate = { x: 0, y: 0 };
  #customerPositionTwo: Coordinate = { x: 0, y: 0 };
  // This value decides the interval between a customer instance being created
  #customerCreationTime: number = Phaser.Math.Between(2000, 3000);

  private eventListenerAdded: boolean = false;
  //______________________________________

  private currentDay: number = 0;
  private currentWeek: number = 1;
  private randomEventDays: number[] = [2, 3, 5]; // Define the days for random events
  // Used for tracking the current stock of pizzas, if you change this plz change the var in the UI
  private currentStock: number = 0;
  private currentMoney: number = 0;
  private currentPrice: number = 10;
  private customerMoneyText!: Phaser.GameObjects.Text;
  private customerMoneyImage!: Phaser.GameObjects.Image;
  private currentMoneyText!: Phaser.GameObjects.Text;
  private performanceText!: Phaser.GameObjects.Text;
  private currentDayText!: Phaser.GameObjects.Text;
  private currentStockText!: Phaser.GameObjects.Text;
  private currentDaySupplyText!: Phaser.GameObjects.Text;
  private weekParameters: WeekdayParameters[] = [];
  private currentPerformance: Performance[] = [];
  private lastWeekPerformance: Performance[] = [];
  private currentDayDemand: number = 0;
  private shopParameters: ShopParameters = {
    workerCost: 0,
    workerProductivity: 0,
    baseDemand: 0,
    marketingFactor: 0,
    fixedCosts: 0,
  };

  private currentDaySupply: number = 0;
  private customerGenerationInterval: number = 1000;
  private customersReceived: number = 0;

  private customersGenerated: number = 0;
  constructor() {
    super({
      key: SCENE_KEYS.GAME_SCENE,
    });
  }

  preload() {
    this.load.json("questions", "assets/questions.json"); // Ensure the correct path to your questions.json
    this.load.json("random-events", "assets/random-events.json"); // Ensure the correct path to your questions.json
    this.load.image("button", "assets/button.png");
    this.load.image("button-hover", "assets/button-hover.png");
    this.load.image("menu-background", "assets/menu-background.png");
    this.load.image("pizza", "assets/SliceOfPizza.png");
    this.load.image("coin", "assets/coin.png");
    this.load.image("stock", "assets/stock-image.png");
  }

  create() {
    // Reset all npc arrays

    this.currentDay = 0;
    this.currentWeek = 1; // Initialize the currentWeek
    this.weekParameters = this.registry.get("weekParameters");
    this.lastWeekPerformance =
      this.registry.get("lastWeekPerformance") || ([] as Performance[]);
    this.shopParameters = this.registry.get("shopParameters") || {
      workerCost: 0,
      workerProductivity: 10,
      baseDemand: 0,
      marketingFactor: 0,
      fixedCosts: 0,
    }; // These are the shop upgrades
    this.currentStock = this.registry.get("stock");

    const map = this.make.tilemap({ key: WORLD_ASSET_KEYS.MAP_LEVEL });
    this.add.image(0, 0, WORLD_ASSET_KEYS.MAP, 0).setOrigin(0);

    // create background npcs
    this.#createBackgroundNPCs(map);

    // create road npcs
    this.#getRoadNPCData(map);

    // create customer npcs
    this.#getCustomerData(map);

    if (!this.eventListenerAdded) {
      this.eventListenerAdded = true;
      this.events.on(
        "resume",
        (scene: any, data: { clearCustomers: boolean }) => {
          if (data.clearCustomers) {
            this.#customerNpcs.forEach((customer) => {
              customer._phaserGameObject.destroy();
            });
            this.#customerNpcs = [];
            this.simulateDay();
          }
        }
      );
    }

    // Add UI elements in top left corner
    const stats = this.add.image(20, 20, "menu-background").setOrigin(0);
    stats.setScale(0.2, 0.15);

    // Create a Graphics object
    const graphics = this.add.graphics();

    const lineHeight = 1; // Adjust the height of the line as needed
    const lineColor = 0x000000; // Adjust the color of the line as needed

    // Draw a horizontal line
    graphics.lineStyle(lineHeight, lineColor);
    graphics.beginPath();
    graphics.moveTo(
      stats.x + stats.displayWidth * 0.3,
      stats.y + stats.displayHeight / 3
    ); // Start at the bottom-left corner of 'stats'
    graphics.lineTo(
      stats.x + stats.displayWidth * 0.85,
      stats.y + stats.displayHeight / 3
    ); // Draw horizontally to the right
    graphics.closePath();
    graphics.stroke();

    this.customerMoneyText = this.add
      .text(510, 400, `+${this.currentPrice}`, {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "IBM Plex Mono",
      })
      .setVisible(false);
    this.customerMoneyImage = this.add
      .image(560, 412, "coin")
      .setVisible(false);

    // Add text to show the current day
    this.currentDayText = this.add.text(75, 35, `Day: ${this.currentDay}`, {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: "IBM Plex Mono",
    });

    // Make text bold

    // Add image next to stock text
    const stockImage = this.add.image(125, 83, "stock");
    stockImage.setScale(0.025, 0.025);

    // Add text to show the current weekly stock
    this.currentStockText = this.add.text(145, 75, `${this.currentStock}`, {
      fontSize: "22px",
      color: "#ffffff",
      fontFamily: "IBM Plex Mono",
    });

    const pizzaImage = this.add.image(55, 85, "pizza");
    pizzaImage.setScale(0.15, 0.15);

    // Add text to show the current stock of pizzas
    this.currentDaySupplyText = this.add.text(
      75,
      75,
      `${this.currentDaySupply}`,
      {
        fontSize: "22px",
        color: "#ffffff",
        fontFamily: "IBM Plex Mono",
      }
    );

    // Add image to show the current money
    const currentMoneyImage = this.add.image(50, 120, "coin");

    // Add text & coin to show the current money
    this.currentMoneyText = this.add.text(75, 110, `${this.currentMoney}`, {
      fontSize: "22px",
      color: "#ffffff",
      fontFamily: "IBM Plex Mono",
    });



    this.simulateDay();

    // Time out condition to transition to win scene
    // this.time.delayedCall(5000, () => {
    //     this.scene.start(SCENE_KEYS.WIN_SCENE);
    // });

    // Listen for correct answer to increment money
    this.events.on("correctAnswer", (amount: number) => {
        this.increaseMoney(amount);
    });
  }

  // Method for increasing money after getting a question right
  private increaseMoney(amount: number) {
    this.currentMoney += amount;
    this.currentMoneyText.setText(`${this.currentMoney}`);
  }

  // Method to filter questions based on the current week
  private filterQuestionsByWeek(week: number): any[] {
    const questions = this.cache.json.get("questions");
    console.log(`Filtering questions for week: ${week}`);
    const filteredQuestions = questions.filter((q: any) => q.weekRange.includes(week));
    console.log(`Filtered Questions for week ${week}:`, filteredQuestions);
    return filteredQuestions;
}


private triggerRandomEvent() {
  console.log("Random event triggered");

  // Retrieve the random events data
  const events = this.cache.json.get("random-events");
  if (!events) {
      console.error("Failed to load random events data.");
      return;
  }

  // Select a random event index
  const chosenEventIndex = Phaser.Math.Between(0, events.length - 1);
  const eventData = events[chosenEventIndex];

  // Process the event
  this.processEvent(eventData);

  // Pause the game scene and launch the random event popup scene
  this.scene.pause(SCENE_KEYS.GAME_SCENE);
  this.scene.launch(SCENE_KEYS.RANDOM_EVENT_POPUPS_SCENE, { eventData });
}

private askQuestion() {
  console.log("Ask Question triggered for day 1");

  // Retrieve the current week from the registry
  const currentWeek = this.registry.get("currentWeek");
  console.log(`Current Week: ${currentWeek}`);

  // Filter questions based on the current week
  const questionsForThisWeek = this.filterQuestionsByWeek(currentWeek);

  if (questionsForThisWeek.length > 0) {
    console.log(`Questions for week ${currentWeek}:`, questionsForThisWeek);
    // Display the question in your question popup scene or use it as needed
    this.scene.pause(SCENE_KEYS.GAME_SCENE);
    this.scene.launch(SCENE_KEYS.QUESTION_POPUPS_SCENE, { questions: questionsForThisWeek });
  } else {
    console.log(`No questions found for week ${currentWeek}`);
  }
}



  // Method to process a random event
  private processEvent(eventData: any) {
    if (eventData.coins) {
      this.currentMoney += eventData.coins;
      this.currentMoneyText.setText(`${this.currentMoney}`);
    }
    if (eventData.pizzas) {
      this.currentStock += eventData.pizzas;
      this.currentStockText.setText(`${this.currentStock}`);
    }
  }

  // Simulates the calculations that would be run for a SINGLE day in the game
  private simulateDay() {
    // Recursively loop through the week
    if (this.currentDay >= 7) {
      this.endSimulation();
      this.currentWeek++; // Increment the week at the end of each week
      //this.registry.set("currentWeek", this.currentWeek); // Update the currentWeek in the registry
      console.log(`New week started: Week ${this.currentWeek}`); // Log the new week value
      return;
    }
  
    // Ask the question on the first day
    if (this.currentDay === 0) {
      this.askQuestion();
    }
    // Check if today is a random event day
    if (this.randomEventDays.includes(this.currentDay)) {
      this.triggerRandomEvent();
  }

    this.currentMoney = 0;
    this.customersGenerated = 0;
    this.customersReceived = 0;

    const dayParameters = this.weekParameters[this.currentDay];
    const workers = dayParameters.workers;
    const price = dayParameters.price;

    this.currentPrice = dayParameters.price / 10;
    this.customerMoneyText.setText(`${this.currentPrice}`)

    const supply = calculateSupply(
      workers,
      this.shopParameters.workerProductivity ?? 10 // By default, each worker can make 10 pizzas in a day
    );

    // Stock and supply handling
    if ((this.currentStock - supply) < 0) {
      this.currentDaySupply = this.currentStock;
      this.currentStock = 0;
    } else {
      this.currentDaySupply = supply;
      // Decrement stock
      this.currentStock = this.currentStock - this.currentDaySupply;
    }
    this.currentDaySupplyText.setText(this.currentDaySupply.toString());
    this.currentStockText.setText(`${this.currentStock}`);

    console.log(
      "Workers: ",
      workers,
      "Supply: ",
      supply,
      "Workers Productivity: ",
      this.shopParameters.workerProductivity
    );

    // If no last week performance then just set to this weeks supply and demand
    const previousWeekdayPerformance =
      this.lastWeekPerformance[this.currentDay] === undefined
        ? { demand: Phaser.Math.Between(150, 250), supply: 100, profit: 0 }
        : this.lastWeekPerformance[this.currentDay];

    const demand = calculateDemand(price);

    this.currentDayDemand = demand;

    this.customerGenerationInterval = Math.min(
      10000 / demand + Phaser.Math.Between(-500, 500),
      500
    ); // 10s per day divided by demand (bounded between 1 and 20)

    const revenue = calculateRevenue(demand, supply, price / 10);
    const expenses = calculateExpenses(
      workers,
      50,
      this.shopParameters.fixedCosts ?? 10 // Fixed cost, should increase as we buy more shop upgrades
    );
    const profit = calculateProfit(revenue, expenses);

    console.log(
      "Revenue: ",
      revenue,
      "Expenses: ",
      expenses,
      "Profit: ",
      profit
    );

    console.log(
      `Day ${this.currentDay} - Supply: ${supply}, Demand: ${demand}`
    );

    const stockQuantity: number = this.currentStock;

    this.currentPerformance[this.currentDay] = {
      supply,
      demand,
      profit,
      expenses,
      revenue,
      stockQuantity,
    };

    this.currentDay++;
    this.currentDayText.setText(`Day: ${this.currentDay}`);
    this.registry.set("currentDay", this.currentDay);
  }

  private endSimulation() {
    this.#backgroundNpcs = [];
    this.#roadNpcs = [];
    this.#customerNpcs = [];

    console.log("Simulation ended");
    console.log(this.currentPerformance);
    // Save the current performance to the registry
    this.registry.set("currentWeekPerformance", this.currentPerformance);
    this.scene.pause(SCENE_KEYS.GAME_SCENE);
    this.scene.launch(SCENE_KEYS.WEEK_SUMMARY_SCENE);
  }

  update(time: DOMHighResTimeStamp) {
    this.#backgroundNpcs.forEach((npc) => {
      npc.update(time);
    });
    this.#roadNpcs.forEach((npc) => {
      if (npc.isNpcType === "road") {
        if (npc.isFinished) {
          // Pop current npc when finished moving across road
          this.#roadNpcs.shift();
        }
      }
      npc.update(time);
    });
    this.#customerNpcs.forEach((customer) => {
      if (customer === undefined) {
        return;
      }
      if (
        customer.currentMoney != 0 &&
        customer.isFinished &&
        this.currentDaySupply > 0
      ) {
        //Update game current money for user
        this.currentMoney += customer.currentMoney;
        this.currentMoneyText.setText(`${this.currentMoney}`);

        // Pop current customer out of customer array when money is received
        this.#customerNpcs.shift();

        // Increment customers received
        this.customersReceived++;
        console.log("Customers received", this.customersReceived);

        this.currentDaySupply--;
        this.currentDaySupplyText.setText(this.currentDaySupply.toString());

        // Display UI text
        this.customerMoneyText.setVisible(true);
        this.customerMoneyImage.setVisible(true);
        this.time.delayedCall(200, () => {
          this.customerMoneyText.setVisible(false);
          this.customerMoneyImage.setVisible(false);
        });
      }
      if (customer._phaserGameObject.anims !== undefined) {
        customer.update(time);
      }
    });

    // Perodically create npcs (for decoration)
    if (this.#creationTime < time) {
      this.#generateRoadNPC();
      this.#creationTime = time + Phaser.Math.Between(1000, 3000);
    }

    // Perodically create customers IF current stock > 0
    if (this.currentDaySupply > 0) {
      if (this.#customerCreationTime < time) {
        // Generate a customer npc instance and push into customer npc array
        if (this.customersGenerated < this.currentDayDemand) {
          this.#generateCustomer();
          this.customersGenerated++;
          console.log("Generated customer", this.customersGenerated);
        }
        this.#customerCreationTime = time + this.customerGenerationInterval;
        if (this.customersReceived >= this.currentDayDemand) {
          console.log("Day ended");
          this.scene.pause(SCENE_KEYS.GAME_SCENE);
          this.scene.launch(SCENE_KEYS.POPUP_SCENE, {
            day: this.currentDay,
            supply: this.currentDaySupply,
            demand: this.currentDayDemand,
            stock: this.currentStock,
          });
        }
        this.currentStockText.setText(`${this.currentStock}`);
        this.customerMoneyText.setVisible(false);
        this.customerMoneyImage.setVisible(false);
      }
    } else {
      this.customersReceived = 0;
      console.log("Day ended");
      this.scene.pause(SCENE_KEYS.GAME_SCENE);
      this.scene.launch(SCENE_KEYS.POPUP_SCENE, {
        day: this.currentDay,
        supply: this.currentDaySupply,
        demand: this.currentDayDemand,
        stock: this.currentStock,
      });
      this.currentStockText.setText(`${this.currentStock}`);
      this.customerMoneyText.setVisible(false);
      this.customerMoneyImage.setVisible(false);
    }
  }

  #generateCustomer() {
    // Generate random character/frame
    const npcFrame: number = Phaser.Math.Between(0, 8) * 10;

    // Generate random path option
    const npcPathOption: boolean = Math.random() < 0.5;

    // create npc instance with given parameters
    const customer = new Customer({
      scene: this,
      position: npcPathOption
        ? this.#customerPositionOne
        : this.#customerPositionTwo,
      direction: DIRECTION.DOWN,
      frame: npcFrame,
      origin: { x: 0, y: 0 },
      npcPath: this.#customerPath,
      movementPattern: "LEFT",
      npcName: npcFrame / 10,
      npcMoney: this.currentPrice,
    });

    this.#customerNpcs.push(customer);
  }

  #getCustomerData(map: Phaser.Tilemaps.Tilemap) {
    // Get npc layers from metadata (level.json)
    const customerLayers = map
      .getObjectLayerNames()
      .filter((layerName) => layerName.includes("CUSTOMER"));

    // Get each layer name for that layer
    customerLayers.forEach((layerName) => {
      const layer = map.getObjectLayer(layerName);
      const npcObject = layer.objects.find((obj) => {
        return obj.type === CUSTOM_TILED_TYPES.CUSTOMER;
      });
      if (
        !npcObject ||
        npcObject.x === undefined ||
        npcObject.y === undefined
      ) {
        return;
      }
      //get path objects for npc
      const pathObjects = layer.objects.filter((obj) => {
        return obj.type === CUSTOM_TILED_TYPES.NPC_PATH;
      });
      const npcPath: NPCPath[] = [
        { x: npcObject.x, y: npcObject.y - TILE_SIZE },
      ];
      pathObjects.forEach((obj) => {
        if (obj.x === undefined || obj.y === undefined) {
          return;
        }
        npcPath[parseInt(obj.name, 10)] = {
          x: obj.x,
          y: obj.y - TILE_SIZE,
        };
      });

      if (layer.name === "NPCS/CUSTOMER1") {
        this.#customerPositionOne = {
          x: npcObject.x,
          y: npcObject.y - TILE_SIZE,
        };
      } else if (layer.name === "NPCS/CUSTOMER2") {
        this.#customerPositionTwo = {
          x: npcObject.x,
          y: npcObject.y - TILE_SIZE,
        };
      }
      this.#customerPath = npcPath;
    });
  }

  //_________________________________________________________ BACKGROUND NPC
  /**
   * Creates an npc instance, using predefined params for a road type npc
   */
  #generateRoadNPC() {
    // Generate random character/frame
    const npcFrame: number = Phaser.Math.Between(0, 8) * 10;

    // Generate random path option
    const npcPathOption: boolean = Math.random() < 0.5;

    // create npc instance with given parameters
    const npc = new NPC({
      scene: this,
      position: npcPathOption ? this.#positionOne : this.#positionTwo,
      direction: DIRECTION.DOWN,
      frame: npcFrame,
      origin: { x: 0, y: 0 },
      npcPath: npcPathOption ? this.#npcPathOne : this.#npcPathTwo,
      npcType: "road",
      movementPattern: "LEFT",
      npcName: npcFrame / 10,
    });

    // push road npc instance into road npc array
    this.#roadNpcs.push(npc);
  }

  /**
   * Get data for a road type npc
   *
   * @param map
   */
  #getRoadNPCData(map: Phaser.Tilemaps.Tilemap) {
    // Get npc layers from metadata (level.json)
    const npcLayers = map
      .getObjectLayerNames()
      .filter((layerName) => layerName.includes("NPC"));

    // Get each layer name for that layer
    npcLayers.forEach((layerName) => {
      const layer = map.getObjectLayer(layerName);
      const npcObject = layer.objects.find((obj) => {
        return obj.type === CUSTOM_TILED_TYPES.NPC;
      });
      if (
        !npcObject ||
        npcObject.x === undefined ||
        npcObject.y === undefined
      ) {
        return;
      }
      //get path objects for npc
      const pathObjects = layer.objects.filter((obj) => {
        return obj.type === CUSTOM_TILED_TYPES.NPC_PATH;
      });
      const npcPath: NPCPath[] = [
        { x: npcObject.x, y: npcObject.y - TILE_SIZE },
      ];
      pathObjects.forEach((obj) => {
        if (obj.x === undefined || obj.y === undefined) {
          return;
        }
        npcPath[parseInt(obj.name, 10)] = {
          x: obj.x,
          y: obj.y - TILE_SIZE,
        };
      });

      if (layer.name === "NPCS/NPC1") {
        this.#npcPathOne = npcPath;
        this.#positionOne = {
          x: npcObject.x,
          y: npcObject.y - TILE_SIZE,
        };
      } else if (layer.name === "NPCS/NPC6") {
        this.#npcPathTwo = npcPath;
        this.#positionTwo = {
          x: npcObject.x,
          y: npcObject.y - TILE_SIZE,
        };
      }
    });
  }

  #createBackgroundNPCs(map: Phaser.Tilemaps.Tilemap) {
    // Get npc layers from metadata (level.json)
    const npcLayers = map
      .getObjectLayerNames()
      .filter((layerName) => layerName.includes("NPC"));

    // Get each layer name for that layer
    npcLayers.forEach((layerName) => {
      const layer = map.getObjectLayer(layerName);
      const npcObject = layer.objects.find((obj) => {
        return obj.type === CUSTOM_TILED_TYPES.NPC;
      });
      if (
        !npcObject ||
        npcObject.x === undefined ||
        npcObject.y === undefined
      ) {
        return;
      }
      //get path objects for npc
      const pathObjects = layer.objects.filter((obj) => {
        return obj.type === CUSTOM_TILED_TYPES.NPC_PATH;
      });
      const npcPath: NPCPath[] = [
        { x: npcObject.x, y: npcObject.y - TILE_SIZE },
      ];
      pathObjects.forEach((obj) => {
        if (obj.x === undefined || obj.y === undefined) {
          return;
        }
        npcPath[parseInt(obj.name, 10)] = {
          x: obj.x,
          y: obj.y - TILE_SIZE,
        };
      });

      // get npc frame to load specific sprite character
      const npcFrame =
        (npcObject.properties || []).find(
          (property: { name: string }) =>
            property.name === TILED_NPC_PROPERTY.FRAME
        )?.value || "0";

      // get npc movement pattern
      const npcMovement =
        (npcObject.properties || []).find(
          (property: { name: string }) =>
            property.name === TILED_NPC_PROPERTY.MOVEMENT_PATTERN
        )?.value || "IDLE";

      const npcType =
        (npcObject.properties || []).find(
          (property: { name: string }) =>
            property.name === TILED_NPC_PROPERTY.NPC_TYPE
        )?.value || "background";

      // create npc instance with given parameters
      const npc = new NPC({
        scene: this,
        position: { x: npcObject.x, y: npcObject.y - TILE_SIZE },
        direction: DIRECTION.DOWN,
        frame: parseInt(npcFrame, 10),
        origin: { x: 0, y: 0 },
        npcPath,
        npcType: npcType,
        movementPattern: npcMovement,
        npcName: parseInt(npcFrame, 10) / 10,
      });

      // push npc instance into npc array
      if (npcType === "background") {
        this.#backgroundNpcs.push(npc);
      }
    });
  }
}
