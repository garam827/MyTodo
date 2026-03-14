const STORAGE_KEY = 'mytodo_tasks';

export function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn('localStorage 저장 실패:', e);
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
