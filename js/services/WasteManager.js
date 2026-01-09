import StorageService from "./StorageService.js";
import { OrganicWaste, NonOrganicWaste } from "../models/WasteItem.js";

export default class WasteManager {
  constructor(storageKey = "swm_data_v3", pointsKey = "swm_points_v3") {
    this.key = storageKey;
    this.pointsKey = pointsKey;
    this.data = [];
    this.points = 0;
    this.load();
  }

  load() {
    const raw = StorageService.load(this.key, []);
    this.data = (raw || []).map((d) => {
      if (d.category === "organik")
        return Object.assign(new OrganicWaste({}), d);
      return Object.assign(new NonOrganicWaste({}), d);
    });
    this.points = StorageService.load(this.pointsKey, 0) || 0;
  }

  save() {
    StorageService.save(this.key, this.data);
    StorageService.save(this.pointsKey, this.points);
  }

  addWasteFromDB(item) {
    this.data.push(item);
  }

  addWaste(item) {
    this.data.push(item);

    const base = 10;
    let bonus = 0;

    const len = this.data.length;
    if (len > 1 && this.data[len - 2].category === item.category) {
      bonus = 20;
    }

    this.addPoints(base + bonus);
    this.save();

    return { base, bonus };
  }

  removeById(id) {
    this.data = this.data.filter((d) => d.id !== id);
    this.save();
  }

  removeAll() {
    this.data = [];
    this.points = 0;
    this.save();
  }

  getTotalWeight() {
    return this.data.reduce((acc, cur) => acc + Number(cur.weight || 0), 0);
  }

  getItemCount() {
    return this.data.length;
  }

  getWeightByCategory() {
    const map = {};
    this.data.forEach((d) => {
      map[d.category] = (map[d.category] || 0) + Number(d.weight || 0);
    });
    return map;
  }

  addPoints(n) {
    this.points = (this.points || 0) + n;
    this.save();
  }
}
