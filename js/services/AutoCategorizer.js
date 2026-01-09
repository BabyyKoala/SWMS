import { norm, levenshtein } from "../utils/helpers.js";

export default class AutoCategorizer {
  constructor(categoryManager) {
    this.catManager = categoryManager;
    this.km = {
      organik: ["sisa", "sayur", "kulit", "daun", "makanan", "organic", "buah"],
      plastik: [
        "botol",
        "plastik",
        "gelas plastik",
        "cling",
        "bungkus",
        "sachet",
      ],
      kertas: ["kertas", "koran", "majalah", "karton", "kardus"],
      kaca: ["kaca", "botol kaca", "gelas"],
      logam: ["kaleng", "blik", "logam", "besi"],
      b3: ["baterai", "battery", "lampu", "obat", "cat", "chemical", "limbah"],
    };
  }

  categorize(name) {
    const s = norm(name || "");
    if (!s) return "b3";
    for (const [cat, keys] of Object.entries(this.km)) {
      for (const k of keys) if (s.includes(norm(k))) return cat;
    }
    for (const c of this.catManager.all()) if (s.includes(norm(c))) return c;
    let best = { dist: Infinity, cat: "b3" };
    for (const [cat, keys] of Object.entries(this.km)) {
      for (const k of keys) {
        const d = levenshtein(s, norm(k));
        if (d < best.dist) {
          best = { dist: d, cat };
        }
      }
    }
    if (best.dist <= Math.max(2, Math.floor(s.length * 0.4))) return best.cat;
    return "b3";
  }
}
