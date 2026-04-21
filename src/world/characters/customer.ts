import { CHARACTER_ASSET_KEYS } from "../../assets/asset-keys";
import { Coordinate } from "../../types/type";
import { Direction, DIRECTION } from "../../common/direction.js";
import { Character } from "./character";

type NpcMovementPattern = keyof typeof NPC_MOVEMENT_PATTERN;
export type NPCPath = Coordinate;

/** @enum {NpcMovementPattern} */
export const NPC_MOVEMENT_PATTERN = Object.freeze({
  IDLE: "IDLE",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  UP: "UP",
  DOWN: "DOWN",
  CLOCKWISE: "CLOCKWISE",
});

type CustomerConfigProps = {
  frame: number;
  npcPath: NPCPath[];
  movementPattern: NpcMovementPattern;
  npcName: number;
  npcMoney: number;
};

type NPCConfig = Omit<
  import("./character").CharacterConfig & CustomerConfigProps,
  "assetKey" | "idleFrameConfig"
>;

export class Customer extends Character {
  // NPC variables
  #npcPath;
  #currentPathIndex: number = 0;
  #movementPattern: NpcMovementPattern = "IDLE";
  #npcName: number = 0;
  #npcMoney: number = 0;
  #isFinished: boolean = false;
  #finishedCount: number = 0;
  #currentMoney: number = 0;

  constructor(config: NPCConfig) {
    super({
      ...config,
      assetKey: CHARACTER_ASSET_KEYS.CUSTOMER,
      origin: { x: 0, y: 0 },
      idleFrameConfig: {
        DOWN: config.frame,
        UP: config.frame + 1,
        NONE: config.frame,
        LEFT: config.frame + 2,
        RIGHT: config.frame + 2,
      },
    });
    this.#npcPath = config.npcPath;
    this.#currentPathIndex = 0;
    this.#movementPattern = config.movementPattern;
    this.#npcName = config.npcName;
    this.#npcMoney = config.npcMoney;
    this._phaserGameObject.setScale(3.7);
  }

  get isFinished() {
    return this.#isFinished;
  }

  get isFinishedCount() {
    return this.#finishedCount;
  }

  get currentMoney() {
    return this.#currentMoney;
  }

  update(time: DOMHighResTimeStamp) {
    if (this._isMoving) {
      return;
    }

    // If npc reaches destination -> update current money for game scene to check
    if (this.#currentPathIndex == this.#npcPath.length - 1) {
      this.#currentMoney = this.#npcMoney;
      this.#isFinished = true;
      this._phaserGameObject.destroy();
      return;
    }

    super.update(time);

    if (this.#movementPattern === NPC_MOVEMENT_PATTERN.IDLE) {
      return;
    }

    let characterDirection: Direction = DIRECTION.NONE;
    let nextPosition = this.#npcPath[this.#currentPathIndex + 1];
    if (nextPosition === undefined) {
      nextPosition = this.#npcPath[0];
      this.#currentPathIndex = 0;
    } else {
      this.#currentPathIndex = this.#currentPathIndex + 1;
    }

    // Check and update position of npc
    if (nextPosition.x > this._phaserGameObject.x) {
      characterDirection = DIRECTION.RIGHT;
    } else if (nextPosition.x < this._phaserGameObject.x) {
      characterDirection = DIRECTION.LEFT;
    } else if (nextPosition.y > this._phaserGameObject.y) {
      characterDirection = DIRECTION.DOWN;
    } else if (nextPosition.y < this._phaserGameObject.y) {
      characterDirection = DIRECTION.UP;
    }

    this.moveCharacter(characterDirection);
  }

  moveCharacter(direction: Direction) {
    super.moveCharacter(direction);

    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        if (
          // Update use config.frame to decide which animation.json to use
          !this._phaserGameObject.anims.isPlaying ||
          this._phaserGameObject.anims.currentAnim?.key !==
            `NPC_${this.#npcName}_${this._direction}`
        ) {
          this._phaserGameObject.play(
            `NPC_${this.#npcName}_${this._direction}`
          );
          this._phaserGameObject.setFlipX(false);
        }
        break;
      case DIRECTION.LEFT:
        if (
          !this._phaserGameObject.anims.isPlaying ||
          this._phaserGameObject.anims.currentAnim?.key !==
            `NPC_${this.#npcName}_${DIRECTION.RIGHT}`
        ) {
          this._phaserGameObject.play(
            `NPC_${this.#npcName}_${DIRECTION.RIGHT}`
          );
          this._phaserGameObject.setFlipX(true);
        }
        break;
      case DIRECTION.NONE:
        break;
      default:
        break;
    }
  }
}
