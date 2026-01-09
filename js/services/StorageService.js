export default class StorageService {
  static load(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error("StorageService.load", e);
      return fallback;
    }
  }
  static save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("StorageService.save", e);
    }
  }
  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("StorageService.remove", e);
    }
  }
}
