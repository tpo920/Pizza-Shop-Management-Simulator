export type NpcIdleFrameConfig = {
  LEFT: number;
  RIGHT: number;
  UP: number;
  DOWN: number;
  NONE: number;
};

export type Coordinate = {
  x: number;
  y: number;
};

export type Animation = {
  key: string;
  frames: number[];
  frameRate: number;
  repeat: number;
  delay: number;
  yoyo: boolean;
  assetKey: string;
};

export interface Performance {
  supply: number;
  demand: number;
  profit: number;
  expenses: number;
  revenue: number;
  stockQuantity: number;
}

export interface WeekdayParameters {
  workers: number;
  price: number;
}

export interface ShopParameters {
  workerCost: number;
  workerProductivity: number;
  baseDemand: number;
  marketingFactor: number;
  fixedCosts: number;
}
