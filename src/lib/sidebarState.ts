export const LEFT_SIDEBAR_COLLAPSED_STORAGE_KEY = 'left-sidebar-collapsed';
export const RIGHT_PANEL_COLLAPSED_STORAGE_KEY = 'right-panel-collapsed';

export function readStoredBoolean(
  key: string,
  fallback = false,
): boolean {
  if (typeof window === 'undefined') return fallback;

  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return fallback;
  }
}

export function writeStoredBoolean(key: string, value: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // localStorage unavailable; keep the current session state only.
  }
}
