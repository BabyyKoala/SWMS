import { uid } from "./utils/helpers.js";

export default class EventBinder {
  constructor({ ui, controllers, dom, auth }) {
    this.ui = ui;
    this.controllers = controllers;
    this.dom = dom;
    this.auth = auth;
    this.sensorInterval = null;
  }

  handleReset() {
    document.getElementById("wasteName").value = "";
    document.getElementById("wasteWeight").value = "0.5";
    document.getElementById("errorMsg").innerText = "";
  }

  setRoleMode() {
    const card = document.getElementById("landingCard");
    if (!card) return;
    card.classList.remove("login-mode");
    card.classList.add("role-mode");
  }

  setLoginMode() {
    const card = document.getElementById("landingCard");
    if (!card) return;
    card.classList.remove("role-mode");
    card.classList.add("login-mode");
  }

  resetLandingToInitial() {
    // reset auth state
    this.auth.clearRole();

    // reset input login
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginError").innerText = "";

    const landing = document.getElementById("landing");
    landing.style.display = "flex";

    const roleButtons = landing.querySelector(".landing-buttons");
    roleButtons.style.display = "flex";
    roleButtons.style.justifyContent = "center";
    roleButtons.style.gap = "12px";

    document.getElementById("loginForm").style.display = "none";
  }

  /* ================= LANDING ================= */
  updateLandingUI() {
    const landing = document.getElementById("landing");
    const roleButtons = landing.querySelector(".landing-buttons");
    const loginForm = document.getElementById("loginForm");

    if (this.auth.hasRole()) {
      roleButtons.style.display = "none";
      loginForm.style.display = "block";
      document.getElementById(
        "loginTitle"
      ).innerText = `Login (${this.auth.selectedRole})`;
    } else {
      roleButtons.style.display = "flex";
      loginForm.style.display = "none";
    }
  }

  resetLoginUI() {
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const error = document.getElementById("loginError");
    const loginForm = document.getElementById("loginForm");

    if (username) username.value = "";
    if (password) password.value = "";
    if (error) error.innerText = "";

    if (loginForm) loginForm.style.display = "none";
  }

  /* ================= BIND EVENT ================= */
  bindAll() {
    const d = this.dom;

    d.btnPetugas.addEventListener("click", () => {
      this.resetLoginUI();
      this.auth.setRole("petugas");
      this.setLoginMode();
      this.updateLandingUI();
    });

    d.btnAdmin.addEventListener("click", () => {
      this.resetLoginUI();
      this.auth.setRole("admin");
      this.setLoginMode();
      this.updateLandingUI();
    });

    // batal login
    d.landingCancel.addEventListener("click", () => {
      this.resetLandingToInitial();
    });

    // login & logout
    d.loginBtn.addEventListener("click", () => this.handleLogin());
    d.logoutBtn.addEventListener("click", () => this.handleLogout());

    // reset input
    d.resetBtn.addEventListener("click", () => this.handleReset());

    // CRUD
    d.addBtn.addEventListener("click", () => this.handleAdd());
    d.clearBtn.addEventListener("click", () => this.handleClearAll());

    // admin view
    d.openAdminView.addEventListener("click", () => this.openAdmin());
    d.backToApp.addEventListener("click", () => this.backToApp());

    // export
    d.exportCsvBtn.addEventListener("click", () => this.exportCsv());
    d.exportExcelBtn.addEventListener("click", () => this.exportExcel());
    d.exportPdfBtn.addEventListener("click", () => this.exportPdf());

    // sensor
    d.toggleSensorSimBtn.addEventListener("click", () => this.toggleSensor());
  }

  /* ================= LOGIN ================= */
  handleLogin() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!this.auth.login(username, password)) {
      document.getElementById("loginError").innerText =
        "Login gagal. Username / password salah.";
      return;
    }

    document.getElementById("landing").style.display = "none";
    document.getElementById("loginForm").style.display = "none";

    if (this.auth.currentUser.role === "admin") {
      document.getElementById("adminApp").style.display = "block";
      document.getElementById("mainApp").style.display = "none";
      document.getElementById("openAdminView").style.display = "inline-block";
    } else {
      document.getElementById("mainApp").style.display = "block";
      document.getElementById("adminApp").style.display = "none";
      document.getElementById("openAdminView").style.display = "none";
    }

    this.ui.refreshAll();
  }

  handleLogout() {
    this.auth.logout();

    document.getElementById("adminApp").style.display = "none";
    document.getElementById("mainApp").style.display = "none";

    this.resetLandingToInitial();
  }

  /* ================= CRUD ================= */
  handleAdd() {
    const errorEl = document.getElementById("errorMsg");
    if (errorEl) errorEl.innerText = "";

    try {
      this.controllers.waste.addFromInput(
        document.getElementById("wasteName").value,
        Number(document.getElementById("wasteWeight").value),
        document.getElementById("wasteCategory").value
      );

      document.getElementById("wasteName").value = "";
      document.getElementById("wasteWeight").value = "0.5";
    } catch (e) {
      if (errorEl) errorEl.innerText = e.message;
    }
  }

  async handleClearAll() {
    if (!confirm("Hapus semua data sampah?")) return;
    await this.controllers.waste.removeAll();
  }

  /* ================= ADMIN ================= */
  openAdmin() {
    if (this.auth.currentUser?.role !== "admin") {
      alert("Hanya admin yang dapat mengakses.");
      return;
    }
    document.getElementById("adminApp").style.display = "block";
    document.getElementById("mainApp").style.display = "none";
  }

  backToApp() {
    document.getElementById("adminApp").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
  }

  /* ================= EXPORT ================= */
  exportCsv() {
    const rows = [["id", "name", "category", "weight", "timestamp"]];
    this.controllers.waste.manager.data.forEach((d) =>
      rows.push([d.id, d.name, d.category, d.weight, d.timestamp])
    );

    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "swm_export.csv";
    a.click();
  }

  exportExcel() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(this.controllers.waste.manager.data);
    XLSX.utils.book_append_sheet(wb, ws, "DataSampah");
    XLSX.writeFile(wb, "swm_export.xlsx");
  }

  exportPdf() {
    const el = document.getElementById("dataArea");
    if (!el) return alert("Tidak ada data.");
    html2pdf().from(el).save("swm_export.pdf");
  }

  /* ================= SENSOR ================= */
  toggleSensor() {
    if (this.sensorInterval) {
      clearInterval(this.sensorInterval);
      this.sensorInterval = null;
      document.getElementById("toggleSensorSimBtn").innerText =
        "Simulasi Sensor";
      return;
    }

    this.sensorInterval = setInterval(() => {
      const pool = ["sisa sayur", "botol plastik", "kertas", "kaleng"];
      const name = pool[Math.floor(Math.random() * pool.length)];
      const weight = Number((Math.random() * 1.5 + 0.1).toFixed(2));
      const category = this.controllers.waste.autoCat.categorize(name);

      this.controllers.waste.manager.addWaste({
        id: uid("w"),
        name,
        weight,
        category,
        timestamp: new Date().toLocaleString(),
      });

      this.controllers.waste.manager.save();
      this.ui.refreshAll();
    }, 3500);

    document.getElementById("toggleSensorSimBtn").innerText =
      "Sensor Simulation: ON";
  }
}
