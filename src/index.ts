import Phaser from "phaser";
import { PreloadScene } from "./scenes/preload.scene";
import { SCENE_KEYS } from "./scenes/scene.keys";
import { GameScene } from "./scenes/game-scene";
import { MainMenu } from "./scenes/menu-scene";
import { ManagementScene } from "./scenes/management.scene";
import { QuestionPopupsScene } from "./scenes/question-popups-scene";
import { RandomEventPopupsScene } from "./scenes/random-event-popups-scene";
import { WinScene } from "./scenes/win-scene";
import { TitleScene } from "./scenes/title-scene";
import { IncomeAnalysisScene } from "./scenes/income-analysis";
import { AboutScene } from "./scenes/about-scene";
import { WeekSummaryScene } from "./scenes/week-summary-scene";
import { PopupScene } from "./scenes/popup-scene";
import { TutorialScene } from "./scenes/tutorial-scene";
import { SettingsScene } from "./scenes/settings-scene";
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#fff",
  pixelArt: true,
  scale: {
    width: 896,
    height: 896,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true,
  },
});
game.scene.add(SCENE_KEYS.MENU_SCENE, MainMenu);
game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.GAME_SCENE, GameScene);
game.scene.add(SCENE_KEYS.MANAGEMENT_SCENE, ManagementScene);
game.scene.add(SCENE_KEYS.QUESTION_POPUPS_SCENE, QuestionPopupsScene);
game.scene.add(SCENE_KEYS.RANDOM_EVENT_POPUPS_SCENE, RandomEventPopupsScene);
game.scene.add(SCENE_KEYS.TITLE_SCENE, TitleScene);
game.scene.add(SCENE_KEYS.ABOUT_SCENE, AboutScene);
game.scene.add(SCENE_KEYS.SETTINGS_SCENE, SettingsScene);
game.scene.add(SCENE_KEYS.WEEK_SUMMARY_SCENE, WeekSummaryScene);
game.scene.add(SCENE_KEYS.WIN_SCENE, WinScene);
game.scene.add(SCENE_KEYS.INCOME_ANALYSIS, IncomeAnalysisScene);
game.scene.add(SCENE_KEYS.POPUP_SCENE, PopupScene);
game.scene.add(SCENE_KEYS.TUTORIAL_SCENE, TutorialScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);
