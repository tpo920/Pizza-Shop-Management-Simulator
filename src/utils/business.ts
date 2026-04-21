const BASE_DEMAND = 200;

export function calculateRevenue(
  demand: number,
  supply: number,
  price: number
) {
  return Math.min(supply, demand) * price;
}

export function calculateProfit(revenue: number, expenses: number) {
  return revenue - expenses;
}

export function calculateSupply(
  workers: number,
  pizzasPerWorker: number
): number {
  return workers * pizzasPerWorker;
}

function linearMap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Specific function for mapping between Price [200, 10] to Demand [1, 20]
export function calculateDemand(value: number): number {
  return linearMap(value, 200, 10, 1, 20);
}

// export function calculateDemand(
//   price: number,
//   demandSensitivity: number,
//   priorWeekDemand: number
// ): number {
//   const adjustedPrice = price / BASE_DEMAND; // Base demand is 200
//   const currentDemand = (BASE_DEMAND / adjustedPrice) * demandSensitivity; // Demand sensitivity is 1

//   // Get historical demand for the same day last week
//   const previousWeekDemand = priorWeekDemand;

//   // Blend current demand with historical demand using smoothing factor of 0.3
//   const blendedDemand = 0.3 * previousWeekDemand + (1 - 0.3) * currentDemand;

//   return blendedDemand;
// }

// export function calculateRevenue(demand: number, price: number): number {
//   return demand * (price / 100);
// }

export function calculateExpenses(
  workers: number,
  workerCost: number,
  fixedCosts: number
): number {
  return workers * workerCost;
}
