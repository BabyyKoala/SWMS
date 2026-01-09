import StorageService from "./StorageService.js";
import { norm } from "../utils/helpers.js";

export default class CategoryManager {
  constructor(storageKey = "swm_categories_v3") {
    this.key = storageKey;
    this.defaultCats = [
      "organik",
      "anorganik",
      "plastik",
      "kertas",
      "logam",
      "kaca",
      "b3",
    ];
    this.list = [];
    this.load();
  }

  load() {
    const saved = StorageService.load(this.key, null);
    if (Array.isArray(saved) && saved.length) this.list = saved;
    else {
      this.list = [...this.defaultCats];
      this.save();
    }
  }

  save() {
    StorageService.save(this.key, this.list);
  }

  add(cat) {
    const normalized = norm(cat);
    if (!normalized) return false;
    if (this.list.includes(normalized)) return false;
    this.list.push(normalized);
    this.save();
    return true;
  }

  all() {
    return [...this.list];
  }
}
