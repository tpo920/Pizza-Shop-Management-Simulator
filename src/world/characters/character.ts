import Phaser from "phaser";
import { DIRECTION, Direction } from "../../common/direction.js";
import { getTargetPositionFromGameObjectPositionAndDirection } from "../../utils/grid-utils.js";
import { Coordinate } from "../../types/type";

type CharacterIdleFrameConfig = {
  LEFT: number;
  RIGHT: number;
  UP: number;
  DOWN: number;
  NONE: number;
};

export type CharacterConfig = {
  scene: Phaser.Scene;
  assetKey: string;
  position: Coordinate;
  direction: Direction;
  origin: Coordinate;
  idleFrameConfig: CharacterIdleFrameConfig;
};

export class Character {
  _scene;
  _phaserGameObject;
  _direction;
  _targetPosition;
  _previousTargetPosition;
  _idleFrameConfig;
  _origin;
  _isMoving;

  constructor(config: CharacterConfig) {
    this._scene = config.scene;
    this._direction = config.direction;
    this._isMoving = false;
    this._targetPosition = { ...config.position };
    this._previousTargetPosition = { ...config.position };
    this._idleFrameConfig = config.idleFrameConfig;
    this._origin = config.origin ? { ...config.origin } : { x: 0, y: 0 };
    this._phaserGameObject = this._scene.add
      .sprite(
        config.position.x,
        config.position.y,
        config.assetKey,
        this._getIdleFrame()
      ) // String = Frame of character
      .setOrigin(this._origin.x, this._origin.y);
  }

  get sprite() {
    return this._phaserGameObject;
  }

  get direction() {
    return this._direction;
  }

  _getIdleFrame() {
    return this._idleFrameConfig[this._direction];
  }

  moveCharacter(direction: Direction) {
    if (this._isMoving) {
      return;
    }
    this._moveSprite(direction);
  }

  update(time: DOMHighResTimeStamp) {
    if (this._isMoving) {
      return;
    }

    // stop current animation and show idle frame
    const idleFrame =
      this._phaserGameObject.anims.currentAnim?.frames[1].frame.name;
    this._phaserGameObject.anims.stop();
    if (!idleFrame) {
      return;
    }
    switch (this._direction) {
      case DIRECTION.DOWN:
      case DIRECTION.LEFT:
      case DIRECTION.RIGHT:
      case DIRECTION.UP:
        this._phaserGameObject.setFrame(idleFrame);
        break;
      case DIRECTION.NONE:
        break;
      default:
        break;
    }
  }

  _moveSprite(direction: Direction) {
    this._direction = direction;
    this._isMoving = true;
    this.#handleSpriteMovement();
  }

  #handleSpriteMovement() {
    if (this.direction === DIRECTION.NONE) {
      return;
    }
    const updatedPosition = getTargetPositionFromGameObjectPositionAndDirection(
      this._targetPosition,
      this._direction
    );
    this._previousTargetPosition = { ...this._targetPosition };
    this._targetPosition.x = updatedPosition.x;
    this._targetPosition.y = updatedPosition.y;

    this._scene.add.tween({
      delay: 0,
      duration: 600,
      y: {
        from: this._phaserGameObject.y,
        start: this._phaserGameObject.y,
        to: this._targetPosition.y,
      },
      x: {
        from: this._phaserGameObject.x,
        start: this._phaserGameObject.x,
        to: this._targetPosition.x,
      },
      targets: this._phaserGameObject,
      onComplete: () => {
        this._isMoving = false;
        this._previousTargetPosition = { ...this._targetPosition };
      },
    });
  }
}
