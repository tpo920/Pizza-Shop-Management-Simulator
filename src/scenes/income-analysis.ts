import Phaser from "phaser";
import { SCENE_KEYS } from './scene.keys';

export class IncomeAnalysisScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENE_KEYS.INCOME_ANALYSIS });
    }

    preload() {
        this.load.image("background", "assets/menu-background.png");
    }

    create(data) {
        const background = this.add.image(448, 448, 'background');
        
        // Retrieve additional financial data
        const totalRevenue = data.totalRevenue;
        const totalExpenses = data.totalExpenses;
        const grossProfit = data.totalProfit;
        const tax = data.tax;
        const netProfit = data.netProfit;
    
        this.add.text(448, 100, 'Income Analysis Overview', {
            fontSize: '48px',
            color: '#ffffff',
        }).setOrigin(0.5);
    
        this.add.text(448, 190, 'Actual Income Statement', {
            fontSize: '23px',
            color: '#ffffff',
        }).setOrigin(0.5);
    
        const graphics = this.add.graphics();

        // Aligned text arrays for actual income statement
        const labels = [
            'Total Revenue:', 'Total Expenses:', 'Gross Profit:', 'Tax (20%):', 'Net Profit:'
        ];
    
        const values = [
            `$${totalRevenue}`, `$${totalExpenses}`, `$${grossProfit}`, `$${tax}`, `$${netProfit}`
        ];

        // Max width for labels to calculate alignment
        const maxLabelWidth = Math.max(...labels.map(label => label.length));
    
        const baseTextStyle = { fontSize: '18px', color: '#ffffff' };
        const boldTextStyle = { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' };
    
        // Actual Income Statement Table
        this.drawTable(graphics, 230, 230, 390, 300, 0xffffff, 0x000000); 
        for (let i = 0; i < labels.length; i++) {
            const textStyle = (labels[i] === 'Total Revenue:' || labels[i] === 'Total Expenses:' || labels[i] === 'Gross Profit:' || labels[i] === 'Net Profit:') ? boldTextStyle : baseTextStyle;
            this.add.text(235, 250 + i * 30, labels[i], textStyle).setOrigin(0, 0.5);
            this.add.text(600, 250 + i * 30, values[i], textStyle).setOrigin(1, 0.5);
        }
    
        // Back button
        const backButton = this.add.graphics();
        this.drawRounded(backButton, 448, 750, 300, 50, 25, 0x000000, 0xffffff, 0xcccccc);
        const buttonText = this.add.text(448, 750, 'Back', {
            fontSize: '20px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    
        backButton.setInteractive(new Phaser.Geom.Rectangle(448 - 150, 750 - 25, 300, 50), Phaser.Geom.Rectangle.Contains);
        backButton.on('pointerover', () => {
            backButton.clear();
            this.drawRounded(backButton, 448, 750, 300, 50, 25, 0x000000, 0xffffff, 0x5B63AB);
        });
        backButton.on('pointerout', () => {
            backButton.clear();
            this.drawRounded(backButton, 448, 750, 300, 50, 25, 0x000000, 0xffffff, 0xffffff);
        });
        backButton.on('pointerdown', () => {
            this.scene.start(SCENE_KEYS.WIN_SCENE);
        });
    }
    

    drawTable(graphics, x, y, width, height, borderColor, fillColor) {
        graphics.lineStyle(2, borderColor);
        graphics.fillStyle(fillColor);
        graphics.fillRoundedRect(x, y, width, height, 10);
        graphics.strokeRoundedRect(x, y, width, height, 10);
    }
    
    
    drawRounded(graphics, x, y, width, height, radius, borderColor, fillColor, hoverColor?) {
        graphics.lineStyle(2, borderColor);
        if (hoverColor !== undefined) {
            graphics.fillStyle(hoverColor);
        } else {
            graphics.fillStyle(fillColor);
        }
        graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
        graphics.strokeRoundedRect(x - width / 2, y - height / 2, width, height, radius);
    }
}
