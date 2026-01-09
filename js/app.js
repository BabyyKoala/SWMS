import CategoryManager from "./services/CategoryManager.js";
import AutoCategorizer from "./services/AutoCategorizer.js";
import WasteManager from "./services/WasteManager.js";
import PredictionEngine from "./services/PredictionEngine.js";

import { buildKPIModel, buildChartModel } from "./viewmodels/ViewModels.js";
import {
  TableRenderer,
  KPIRenderer,
  ChartRenderer,
  CategoryCardRenderer,
} from "./views/Renderers.js";
import WasteController from "./controllers/WasteController.js";
import EventBinder from "./EventBinder.js";
import WasteRepository from "./services/WasteRepository.js";

// DOM refs (must match index.html)
const dom = {
  btnPetugas: document.getElementById("btnPetugas"),
  btnAdmin: document.getElementById("btnAdmin"),
  landingCancel: document.getElementById("landingCancel"),
  loginBtn: document.getElementById("loginBtn"),
  addBtn: document.getElementById("addBtn"),
  resetBtn: document.getElementById("resetBtn"),
  clearBtn: document.getElementById("clearBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  openAdminView: document.getElementById("openAdminView"),
  backToApp: document.getElementById("backToApp"),
  saveCapacity: document.getElementById("saveCapacity"),
  adminCapacity: document.getElementById("adminCapacity"),
  importSampleBtn: document.getElementById("importSampleBtn"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
  exportExcelBtn: document.getElementById("exportExcelBtn"),
  exportPdfBtn: document.getElementById("exportPdfBtn"),
  toggleSensorSimBtn: document.getElementById("toggleSensorSimBtn"),
  clearAllBtn: document.getElementById("clearAllBtn"),
  wasteTableBody: document.getElementById("wasteTableBody"),
  pieChart: document.getElementById("pieChart").getContext("2d"),
  realtimeChart: document.getElementById("realtimeChart").getContext("2d"),
  kpiTotal: document.getElementById("kpi-total-weight"),
  kpiCount: document.getElementById("kpi-item-count"),
  kpiOrganik: document.getElementById("kpi-organic-percent"),
  kpiPrediction: document.getElementById("kpi-prediction"),
  capacityBar: document.getElementById("capacityBar"),
  capacityDisplay: document.getElementById("capacityDisplay"),
  cardContainer: document.getElementById("wasteInfoGrid"),
  pointsEl: document.getElementById("points"),
  badgeEl: document.getElementById("badge"),
  pointAnimationArea: document.getElementById("pointAnimationArea"),
  openAdminViewBtn: document.getElementById("openAdminView"),
  filterCategory: document.getElementById("filterCategory"),
  filterKeyword: document.getElementById("filterKeyword"),
  filterMinWeight: document.getElementById("filterMinWeight"),
  filterSort: document.getElementById("filterSort"),
};

// simple auth (demo)
const DEFAULT_USERS = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "petugas", password: "petugas123", role: "petugas" },
];

class Auth {
  constructor() {
    this.currentUser = null;
    this.selectedRole = null;
  }

  setRole(role) {
    this.selectedRole = role;
  }

  clearRole() {
    this.selectedRole = null;
  }

  hasRole() {
    return !!this.selectedRole;
  }

  login(username, password) {
    if (!this.selectedRole) return false;

    const user = DEFAULT_USERS.find(
      (u) =>
        u.username === username &&
        u.password === password &&
        u.role === this.selectedRole
    );

    if (!user) return false;

    this.currentUser = {
      username: user.username,
      role: user.role,
    };
    return true;
  }

  logout() {
    this.currentUser = null;
  }
}

const auth = new Auth();

// instantiate services
const catManager = new CategoryManager();
const manager = new WasteManager();
const autoCat = new AutoCategorizer(catManager);
let predictor = new PredictionEngine(
  manager,
  Number(localStorage.getItem("swm_capacity") || 50)
);

// renderers
const tableRenderer = new TableRenderer(dom.wasteTableBody);
const kpiRenderer = new KPIRenderer(
  dom.kpiTotal,
  dom.kpiCount,
  dom.kpiOrganik,
  dom.kpiPrediction,
  dom.capacityBar,
  dom.capacityDisplay
);
const chartRenderer = new ChartRenderer(dom.pieChart, dom.realtimeChart);
const cardRenderer = new CategoryCardRenderer(dom.cardContainer);

let currentFilter = {
  category: "",
  keyword: "",
  minWeight: 0,
  sort: "latest",
};

// UI facade
const ui = {
  capacity: predictor.capacity,

  // show point animation near pointAnimationArea
  showPointAnimation(total, reason) {
    try {
      const area = dom.pointAnimationArea;
      if (!area) return;
      const el = document.createElement("div");
      el.className = "point-float";
      el.innerText = `+${total}`;
      // optional subtitle / tooltip
      el.title = reason || "";
      // random small horizontal offset to avoid overlap
      el.style.left = `${Math.random() * 40}px`;
      area.appendChild(el);
      // remove after animation
      setTimeout(() => el.remove(), 1100);
    } catch (e) {
      console.error("showPointAnimation error", e);
    }
  },

  refreshAll() {
    // render category options
    renderCategoryOptions();

    // table
    tableRenderer.render(
      manager,
      (id) => wasteController.removeById(id),
      (idx) => {
        const item = manager.data[idx];
        if (!item) return alert("Item tidak ditemukan.");
        let extra = "";
        if (item.category === "organik")
          extra =
            "\n" +
            (item.decompositionInfo ? item.decompositionInfo() : "Organik");
        const rec = getWasteRecommendation(item.category);
        const info = `
        Nama      : ${item.name}
        Kategori  : ${item.category}
        Berat     : ${item.weight} kg
        Waktu     : ${item.timestamp}
        `;
        alert(`${info}\n${extra}\nSaran: ${rec}`);
      },
      currentFilter
    );

    // kpi
    const kpi = buildKPIModel(manager);
    kpiRenderer.render(kpi, predictor, ui.capacity);

    // chart
    chartRenderer.updatePie(
      buildChartModel(manager),
      (i) =>
        [
          "#66bb6a",
          "#2e7d32",
          "#ffb74d",
          "#ff7043",
          "#4db6ac",
          "#81c784",
          "#9575cd",
        ][i % 7]
    );

    // category cards
    cardRenderer.render(catManager.all());

    // admin log
    renderAdminLog();

    // badge/points
    updateBadgeUI();
  },

  pushRealtime(v) {
    chartRenderer.pushRealtime(v);
  },
};

// helper functions used by UI
function renderCategoryOptions() {
  const sel = document.getElementById("wasteCategory");
  if (!sel) return;
  sel.innerHTML = "";
  catManager.all().forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.innerText = c.charAt(0).toUpperCase() + c.slice(1);
    sel.appendChild(opt);
  });
}

function getWasteRecommendation(category) {
  const rec = {
    organik:
      "Komposkan atau gunakan untuk pupuk. Pastikan terpisah dari sampah basah lainnya.",
    anorganik: "Pisahkan untuk daur ulang atau tempat pembuangan tertentu.",
    plastik:
      "Bersihkan & keringkan plastik, kumpulkan berdasarkan jenis (PET/HDPE).",
    kertas:
      "Keringkan, lipat, dan kumpulkan untuk bank sampah/kolektor kertas.",
    kaca: "Pisahkan berdasarkan warna kalau memungkinkan; hindari pecah.",
    logam: "Kumpulkan untuk scrap metal; pisahkan dari sampah lain.",
    b3: "Jangan buang ke tempat sampah biasa. Serahkan ke fasilitas pengelolaan B3.",
  };
  return (
    rec[category] ||
    "Kelompokkan sesuai kategori agar dapat diproses lebih lanjut."
  );
}

function updateBadgeUI() {
  const p = manager.points || 0;
  if (!dom.badgeEl || !dom.pointsEl) return;
  if (p < 50) dom.badgeEl.innerText = "Bronze ♨️";
  else if (p < 120) dom.badgeEl.innerText = "Silver 🥈";
  else if (p < 300) dom.badgeEl.innerText = "Gold 🥇";
  else if (p < 600) dom.badgeEl.innerText = "Platinum 🔱";
  else dom.badgeEl.innerText = "Eco Master 🌍";
  dom.badgeEl.style.background = p > 300 ? "#d1e8d1" : "#ffe082";
  dom.pointsEl.innerText = p;
}

function renderAdminLog() {
  const adminLog = document.getElementById("adminLog");
  if (!adminLog) return;
  adminLog.innerHTML = "";
  const rows = manager.data.slice(-30).reverse();
  rows.forEach((r) => {
    const div = document.createElement("div");
    div.style.padding = "6px";
    div.style.borderBottom = "1px dashed #eee";
    div.innerText = `${r.timestamp} — ${r.name} (${r.category}) ${r.weight} kg`;
    adminLog.appendChild(div);
  });
}

// controllers & binder
const wasteController = new WasteController({
  manager,
  autoCat,
  predictor,
  ui,
});

const binder = new EventBinder({
  ui,
  controllers: { waste: wasteController },
  dom,
  auth,
});
binder.bindAll();

// ===== FILTER EVENTS =====
if (dom.filterCategory) {
  dom.filterCategory.addEventListener("change", () => {
    currentFilter.category = dom.filterCategory.value;
    ui.refreshAll();
  });
}

if (dom.filterKeyword) {
  dom.filterKeyword.addEventListener("input", () => {
    currentFilter.keyword = dom.filterKeyword.value;
    ui.refreshAll();
  });
}

if (dom.filterMinWeight) {
  dom.filterMinWeight.addEventListener("input", () => {
    currentFilter.minWeight = Number(dom.filterMinWeight.value || 0);
    ui.refreshAll();
  });
}

if (dom.filterSort) {
  dom.filterSort.addEventListener("change", () => {
    currentFilter.sort = dom.filterSort.value;
    ui.refreshAll();
  });
}

// ================= LOAD DATA DARI DATABASE (TAMBAHAN BARU) =================
// Menyuntikkan data dari MySQL ke sistem lama TANPA mengubah UI / logika lama
setTimeout(async () => {
  try {
    const dbData = await WasteRepository.getAll();

    dbData.forEach((row) => {
      if (typeof manager.addWasteFromDB === "function") {
        manager.addWasteFromDB({
          id: row.id,
          name: row.name,
          weight: row.weight,
          category: row.category,
          timestamp: row.timestamp,
        });
      }
    });

    ui.refreshAll();
  } catch (err) {
    console.error("DB load error (non-blocking):", err);
  }
}, 0);

// expose minimal global for debugging
window.SWM = { manager, catManager, wasteController, ui, auth };

// initial render
renderCategoryOptions();
ui.refreshAll();
document.getElementById("landing").style.display = "flex";
document.getElementById("mainApp").style.display = "none";
document.getElementById("adminApp").style.display = "none";
