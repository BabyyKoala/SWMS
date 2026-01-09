export default class WasteItem {
  constructor({
    id = `w_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    name = "",
    weight = 0,
    category = "b3",
    timestamp = new Date().toLocaleString(),
  } = {}) {
    this.id = id;
    this.name = name;
    this.weight = Number(weight);
    this.category = category;
    this.timestamp = timestamp;
  }

  infoString() {
    return `Nama: ${this.name}\nKategori: ${this.category}\nBerat: ${this.weight} kg\nWaktu: ${this.timestamp}`;
  }
}

export class OrganicWaste extends WasteItem {
  constructor(data = {}) {
    super({ ...data, category: "organik" });
    this.isBiodegradable = true;
  }
  decompositionInfo() {
    return "Perkiraan dekomposisi: 2–6 bulan (bergantung kondisi).";
  }
}

export class NonOrganicWaste extends WasteItem {
  constructor(data = {}) {
    super(data);
    this.isBiodegradable = false;
  }
  decompositionInfo() {
    return "Perkiraan dekomposisi: bisa bertahun-tahun (bergantung material).";
  }
}
