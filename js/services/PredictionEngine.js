export default class PredictionEngine {
  constructor(manager, capacityKg = 50) {
    this.manager = manager;
    this.capacity = capacityKg;
  }

  predictFillPercent() {
    const total = this.manager.getTotalWeight();
    return Math.min(100, (total / this.capacity) * 100);
  }

  estimateDaysToFull(avgDailyWeight = 1.2) {
    const remaining = this.capacity - this.manager.getTotalWeight();
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / avgDailyWeight);
  }
}
