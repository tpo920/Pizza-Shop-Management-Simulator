import Phaser from "phaser";
import { SCENE_KEYS } from "./scene.keys";

export class TutorialScene extends Phaser.Scene {
  private priceBox!: Phaser.GameObjects.Rectangle;
  private workerBox!: Phaser.GameObjects.Rectangle;
  private explanationText!: Phaser.GameObjects.Text;
  private nextButton!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;
  private tutorialLines: string[] = [];
  private currentLineIndex: number = 0;

  
  private textBoxBg=0x738c2f;

  constructor() {
    super(SCENE_KEYS.TUTORIAL_SCENE);
  }

  preload(){
    this.load.image("pizza-character", "assets/pizza-character.png");
  }

  getText(): string[] | undefined {
    if (this.registry.get("currentWeek")) {
      switch (this.registry.get("currentWeek")) {
        case 1:
          return [
            "Welcome to Pizza Shop! Your first task is to set the prices of your pizzas.",
            "Adjusting price will impact your sales volume and profit margins.",
            "Higher prices mean more profit per pizza but fewer sales, while lower prices attract more customers but lower profit per pizza.",
            "Find the right balance to succeed!"
          ];
        case 2:
          return [
            "This graph displays the supply and demand for the previous week.",
            "The supply bar shows the number of pizzas you made each day. The demand bar shows the number of pizzas customers wanted to buy.",
            "If demand exceeds supply, you missed out on potential sales. If supply exceeds demand, you have extra pizzas that went unsold.",
            "Use this data to adjust your production and pricing strategy for next week.",
            "Aim to align your supply closely with the demand to maximize profits."
          ];
        case 3:
          return [
            "Workers determine the number of pizzas produced daily. Increasing workers boosts production capacity but raises costs." 
            ,"Optimize worker numbers to match demand and control expenses.",
            "Plan strategically: hire more workers during peak demand periods, but reduce workforce during slower weeks to maximize profitability."
          ];
      }
    } else {
      return ;
    }
  }

  create(data: { priceX: number; priceY: number }) {
    // Retrieve data passed from the management scene
    const { priceX, priceY } = data;
    const currentWeek = this.registry.get("currentWeek");

    if (currentWeek === 1) {
      const border = this.add.graphics();
      border.lineStyle(4, this.textBoxBg); // Set the border color and thickness
      border.strokeRoundedRect(550, 340, 190, 120, 12); // Set the radius for rounded corners
    }

    if (currentWeek === 3) {
      const workerBorder = this.add.graphics();
      workerBorder.lineStyle(4, this.textBoxBg); // Set the border color and thickness
      workerBorder.strokeRoundedRect(530, 140, 220, 120, 12); // Set the radius for rounded corners
    }

    if(currentWeek === 2){
      const graphBorder = this.add.graphics();
      graphBorder.lineStyle(4,this.textBoxBg);
      graphBorder.strokeRoundedRect(140,140,320,320,12);
    }

    this.priceBox = this.add.rectangle(priceX, priceY, 150, 50, 0xff0000, 0); // Adjust dimensions as needed
    this.priceBox.setOrigin(0.5);

    this.workerBox = this.add.rectangle(
      priceX,
      priceY + 150,
      150,
      120,
      0x000000,
      0
    ); // Adjust dimensions as needed
    this.workerBox.setOrigin(0.5);

    this.tutorialLines = this.getText() || [];
    this.currentLineIndex = 0;

    if (this.tutorialLines.length > 0) {
      this.explanationText = this.add.text(450, 540, this.tutorialLines[this.currentLineIndex], {
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 480 },
      });
      this.explanationText.setBackgroundColor("black");
      this.explanationText.setPadding(10, 10, 10, 10);
      this.explanationText.setOrigin(0.5);

      this.add.image(140, 500, "pizza-character", 0).setOrigin(0).setScale(0.2,0.2);

      this.nextButton = this.add.text(450, 650, "Next>>", {
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
        backgroundColor: "black",
        padding: { x: 10, y: 5 }
      });
      this.nextButton.setOrigin(0.5);
      this.nextButton.setInteractive(); // Make the button interactive
      this.nextButton.on("pointerup", this.showNextLine, this); // Listen for pointerup event

      if (this.tutorialLines.length === 1) {
        this.startButton = this.add.text(450, 650, "Start!", {
          fontSize: "20px",
          color: "#ffffff",
          align: "center",
          backgroundColor: "#738c2f",
          padding: { x: 10, y: 5 }
        });
        this.startButton.setOrigin(0.5);
        this.startButton.setInteractive(); // Make the button interactive
        this.startButton.on("pointerup", this.finishTutorial, this); // Listen for pointerup event
      }
    }else{
      this.finishTutorial();
    }
  }


  showNextLine() {
    this.currentLineIndex++;
    if (this.currentLineIndex < this.tutorialLines.length - 1) {
      this.explanationText.setText(this.tutorialLines[this.currentLineIndex]);
    } else {
      this.explanationText.setText(this.tutorialLines[this.currentLineIndex]);
      this.nextButton.destroy();
      this.startButton = this.add.text(450, 650,"Start!", {
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
        backgroundColor:"#738c2f",
        padding: { x: 10, y: 5 }
      });
      this.startButton.setOrigin(0.5);
      this.startButton.setInteractive(); // Make the button interactive
      this.startButton.on("pointerup", this.finishTutorial, this); // Listen for pointerup event
    }
  }

  finishTutorial() {
    this.scene.stop(SCENE_KEYS.TUTORIAL_SCENE);
    this.scene.resume(SCENE_KEYS.MANAGEMENT_SCENE);
  }
}
