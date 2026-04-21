import { Coordinate } from "../types/type";
import { DIRECTION, Direction } from "../common/direction.js";
import { TILE_SIZE } from "../config";

export function getTargetPositionFromGameObjectPositionAndDirection(
  currentPosition: Coordinate,
  direction: Direction
) {
  const targetPosition = { ...currentPosition };
  switch (direction) {
    case DIRECTION.DOWN:
      targetPosition.y += TILE_SIZE;
      break;
    case DIRECTION.UP:
      targetPosition.y -= TILE_SIZE;
      break;
    case DIRECTION.LEFT:
      targetPosition.x -= TILE_SIZE;
      break;
    case DIRECTION.RIGHT:
      targetPosition.x += TILE_SIZE;
      break;
    case DIRECTION.NONE:
      break;
    default:
      break;
  }
  return targetPosition;
}
