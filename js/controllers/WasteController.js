import { uid, nowLocale } from "../utils/helpers.js";
import WasteRepository from "../services/WasteRepository.js";

export default class WasteController {
  constructor({ manager, autoCat, predictor, ui }) {
    this.manager = manager;
    this.autoCat = autoCat;
    this.predictor = predictor;
    this.ui = ui;
  }

  async addFromInput(name, weight, selectedCategory) {
    const n = name.trim();
    if (n.length < 3) throw new Error("Nama sampah minimal 3 karakter.");

    const w = Number(weight);
    if (isNaN(w) || w <= 0) throw new Error("Berat harus angka > 0.");

    const category = selectedCategory || this.autoCat.categorize(n);

    const item = {
      id: uid("w"),
      name: n,
      weight: w,
      category,
      timestamp: nowLocale(),
    };

    await WasteRepository.add(item);
    this.manager.addWaste(item);
    this.manager.save();
    this.ui.refreshAll();
  }

  async removeById(id) {
    await WasteRepository.removeById(id);
    this.manager.removeById(id);
    this.manager.save();
    this.ui.refreshAll();
  }

  async removeAll() {
    await WasteRepository.removeAll();
    this.manager.removeAll();
    this.manager.save();
    this.ui.refreshAll();
  }
}
