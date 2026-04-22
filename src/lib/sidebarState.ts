export const LEFT_SIDEBAR_COLLAPSED_STORAGE_KEY = 'left-sidebar-collapsed';
export const RIGHT_PANEL_COLLAPSED_STORAGE_KEY = 'right-panel-collapsed';
export const LEFT_SIDEBAR_COLLAPSED_ATTRIBUTE = 'data-left-sidebar-collapsed';
export const RIGHT_PANEL_COLLAPSED_ATTRIBUTE = 'data-right-panel-collapsed';

function applySidebarStateToDocument(key: string, value: boolean): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  if (key === LEFT_SIDEBAR_COLLAPSED_STORAGE_KEY) {
    root.setAttribute(LEFT_SIDEBAR_COLLAPSED_ATTRIBUTE, String(value));
    root.style.setProperty(
      '--layout-shell-columns',
      value ? '60px 1fr' : '260px 1fr',
    );
  }

  if (key === RIGHT_PANEL_COLLAPSED_STORAGE_KEY) {
    root.setAttribute(RIGHT_PANEL_COLLAPSED_ATTRIBUTE, String(value));
    root.style.setProperty('--right-panel-width', value ? '60px' : '260px');
  }
}

export function readStoredBoolean(
  key: string,
  fallback = false,
): boolean {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key) === 'true';
    applySidebarStateToDocument(key, value);
    return value;
  } catch {
    applySidebarStateToDocument(key, fallback);
    return fallback;
  }
}

export function writeStoredBoolean(key: string, value: boolean): void {
  if (typeof window === 'undefined') return;

  applySidebarStateToDocument(key, value);

  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // localStorage unavailable; keep the current session state only.
  }
}

export function getSidebarStateInitScript(): string {
  return `
    (function () {
      var leftKey = ${JSON.stringify(LEFT_SIDEBAR_COLLAPSED_STORAGE_KEY)};
      var rightKey = ${JSON.stringify(RIGHT_PANEL_COLLAPSED_STORAGE_KEY)};
      var root = document.documentElement;

      function apply(key, value) {
        if (key === leftKey) {
          root.setAttribute(${JSON.stringify(LEFT_SIDEBAR_COLLAPSED_ATTRIBUTE)}, String(value));
          root.style.setProperty('--layout-shell-columns', value ? '60px 1fr' : '260px 1fr');
        }

        if (key === rightKey) {
          root.setAttribute(${JSON.stringify(RIGHT_PANEL_COLLAPSED_ATTRIBUTE)}, String(value));
          root.style.setProperty('--right-panel-width', value ? '60px' : '260px');
        }
      }

      try {
        apply(leftKey, window.localStorage.getItem(leftKey) === 'true');
        apply(rightKey, window.localStorage.getItem(rightKey) === 'true');
      } catch (error) {
        apply(leftKey, false);
        apply(rightKey, false);
      }
    })();
  `;
}
