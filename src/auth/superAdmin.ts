const STORAGE_KEY = 'ait.superAdmin';

export interface SuperAdminSession {
  token: string;
  name: string;
  role: 'super_admin';
}

export function loadSuperAdminSession(): SuperAdminSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SuperAdminSession;
    if (!parsed?.token || parsed.role !== 'super_admin') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSuperAdminSession(session: SuperAdminSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSuperAdminSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}
