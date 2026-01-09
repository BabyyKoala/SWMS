import { escapeHtml } from "../utils/helpers.js";

export class TableRenderer {
  constructor(tbody) {
    this.tbody = tbody;
  }

  render(manager, onDelete, onDetail, filter = {}) {
    this.tbody.innerHTML = "";

    let rows = [...manager.data];

    if (filter.category) {
      rows = rows.filter((x) => x.category === filter.category);
    }

    if (filter.keyword) {
      const k = filter.keyword.toLowerCase();
      rows = rows.filter((x) => x.name.toLowerCase().includes(k));
    }

    if (filter.minWeight && filter.minWeight > 0) {
      rows = rows.filter((x) => x.weight >= filter.minWeight);
    }

    switch (filter.sort) {
      case "oldest":
        rows.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case "heaviest":
        rows.sort((a, b) => b.weight - a.weight);
        break;
      case "lightest":
        rows.sort((a, b) => a.weight - b.weight);
        break;
      default:
        rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    rows.forEach((item, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td>${item.weight} kg</td>
        <td>${item.timestamp}</td>
       <td class="action-cell">
          <button class="action-btn detail" title="Lihat detail">ℹ️</button>
          <button class="action-btn delete" title="Hapus data">🗑️</button>
        </td>
      `;

      const btnDelete = tr.querySelector(".action-btn.delete");
      const btnDetail = tr.querySelector(".action-btn.detail");

      if (btnDelete) {
        btnDelete.addEventListener("click", () => {
          if (!confirm("Hapus data ini?")) return;
          onDelete(item.id);
        });
      }

      if (btnDetail) {
        btnDetail.addEventListener("click", () => {
          onDetail(index);
        });
      }

      this.tbody.appendChild(tr);
    });
  }
}

export class KPIRenderer {
  constructor(
    totalEl,
    countEl,
    organikEl,
    predictionEl,
    capacityBarEl,
    capacityDisplayEl
  ) {
    this.totalEl = totalEl;
    this.countEl = countEl;
    this.organikEl = organikEl;
    this.predictionEl = predictionEl;
    this.capacityBarEl = capacityBarEl;
    this.capacityDisplayEl = capacityDisplayEl;
  }

  render(kpiModel, predictor, capacityKg) {
    this.totalEl.innerText = `${kpiModel.total.toFixed(2)} kg`;
    this.countEl.innerText = kpiModel.itemCount;
    this.organikEl.innerText = `${kpiModel.organikPercent}%`;
    const fill = predictor.predictFillPercent();
    const estDays = predictor.estimateDaysToFull();
    this.predictionEl.innerText = `${fill.toFixed(0)}% (±${estDays} hari)`;
    this.capacityBarEl.style.width = `${Math.min(100, fill)}%`;
    this.capacityDisplayEl.innerText = `${capacityKg} kg`;
  }
}

export class ChartRenderer {
  constructor(pieCtx, realtimeCtx) {
    this.pie = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderColor: "#fff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
      },
    });

    this.realtime = new Chart(realtimeCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [{ label: "Berat (kg)", data: [], fill: true, tension: 0.3 }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { display: false } },
      },
    });

    this.realtimeBuffer = [];
  }

  updatePie(model, paletteFn) {
    this.pie.data.labels = model.labels.map(
      (l) => l.charAt(0).toUpperCase() + l.slice(1)
    );
    this.pie.data.datasets[0].data = model.data;
    this.pie.data.datasets[0].backgroundColor = model.labels.map((_, i) =>
      paletteFn(i)
    );
    this.pie.update();
  }

  pushRealtime(v) {
    const now = new Date();
    const label = now.toLocaleTimeString();
    this.realtimeBuffer.push({ t: label, v });
    if (this.realtimeBuffer.length > 20) this.realtimeBuffer.shift();
    this.realtime.data.labels = this.realtimeBuffer.map((x) => x.t);
    this.realtime.data.datasets[0].data = this.realtimeBuffer.map((x) => x.v);
    this.realtime.update();
  }
}

export class CategoryCardRenderer {
  constructor(containerEl) {
    this.containerEl = containerEl;
  }

  render(categories) {
    this.containerEl.innerHTML = "";
    const info = {
      organik: {
        icon: "🥬",
        title: "Organik",
        desc: "Sisa makanan & bahan organik yang mudah terurai.",
        examples: ["Sisa sayur", "Buah busuk"],
        decay: "2–6 bulan",
      },
      anorganik: {
        icon: "🗳️",
        title: "Anorganik",
        desc: "Sampah non-biodegradable umum.",
        examples: ["Serpihan plastik", "Karet"],
        decay: "Bervariasi",
      },
      plastik: {
        icon: "🧴",
        title: "Plastik",
        desc: "Kemasan plastik yang bisa/dapat didaur ulang.",
        examples: ["Botol PET", "Plastik sachet"],
        decay: "Bertahun-tahun",
      },
      kertas: {
        icon: "📄",
        title: "Kertas",
        desc: "Kertas, kardus, koran untuk daur ulang.",
        examples: ["Karton", "Koran"],
        decay: "Beberapa bulan",
      },
      logam: {
        icon: "🔩",
        title: "Logam",
        desc: "Kaleng & logam lain untuk pengepul.",
        examples: ["Kaleng"],
        decay: "Tahan lama",
      },
      kaca: {
        icon: "🍾",
        title: "Kaca",
        desc: "Botol kaca dan pecahan kaca.",
        examples: ["Botol kaca"],
        decay: "Tahan lama",
      },
      b3: {
        icon: "☣️",
        title: "B3 (Berbahaya)",
        desc: "Limbah berbahaya: baterai, obat, cat, dll.",
        examples: ["Baterai", "Obat kadaluarsa"],
        decay: "Sangat berbahaya",
      },
    };

    categories.forEach((cat) => {
      const d = info[cat] || {
        icon: "📦",
        title: cat,
        desc: "Deskripsi",
        examples: [],
        decay: "-",
      };
      const div = document.createElement("div");
      div.className = `waste-card ${cat}`;
      div.innerHTML = `
        <div class="icon">${d.icon}</div>
        <h3>${d.title}</h3>
        <div class="tagline">${d.desc}</div>
        <div class="desc"><strong>Contoh:</strong> ${d.examples.join(
          ", "
        )}</div>
        <div class="decay">Waktu urai: ${d.decay}</div>
      `;
      this.containerEl.appendChild(div);
    });
  }
}
