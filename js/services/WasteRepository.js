const BASE_URL = "/Smart Waste Management_PBO/api";

async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Response bukan JSON: " + text);
  }
}

export default class WasteRepository {
  static async getAll() {
    const res = await fetch(`${BASE_URL}/waste_get.php`);
    return await safeJson(res);
  }

  static async add(data) {
    const res = await fetch(`${BASE_URL}/waste_add.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await safeJson(res);
  }

  static async removeById(id) {
    const res = await fetch(`${BASE_URL}/waste_delete.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return await safeJson(res);
  }

  static async removeAll() {
    const res = await fetch(`${BASE_URL}/waste_clear.php`, {
      method: "POST",
    });
    return await safeJson(res);
  }
}
