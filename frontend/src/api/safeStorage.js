/**
 * localStorage 접근이 차단된 환경(Edge 엄격 모드 등)에서도
 * 앱이 정상 동작하도록 메모리 폴백을 제공하는 안전한 스토리지 유틸
 */
const memoryStore = {};

function isLocalStorageAvailable() {
  try {
    localStorage.setItem('__test__', '1');
    localStorage.removeItem('__test__');
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isLocalStorageAvailable();

export const safeStorage = {
  getItem(key) {
    try {
      return storageAvailable ? localStorage.getItem(key) : (memoryStore[key] ?? null);
    } catch {
      return memoryStore[key] ?? null;
    }
  },
  setItem(key, value) {
    try {
      if (storageAvailable) localStorage.setItem(key, value);
      else memoryStore[key] = value;
    } catch {
      memoryStore[key] = value;
    }
  },
  removeItem(key) {
    try {
      if (storageAvailable) localStorage.removeItem(key);
      else delete memoryStore[key];
    } catch {
      delete memoryStore[key];
    }
  },
};
