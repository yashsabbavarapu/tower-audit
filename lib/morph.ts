/**
 * "Use Tower" morph: the landing CTA and the audit textarea share a
 * view-transition-name, so the browser grows one into the other.
 */
export const MORPH_NAME = "tower-morph";
export const AUDIT_FIELD_ID = "audit-output";

const MORPH_MAX_WAIT = 1500;
let arrived: (() => void) | null = null;

/** Resolves when the audit textarea mounts (or after a safety timeout). */
export function waitForAudit(): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(done, MORPH_MAX_WAIT);
    function done() {
      window.clearTimeout(timer);
      arrived = null;
      resolve();
    }
    arrived = done;
  });
}

/** Called by the audit textarea on mount. A no-op unless a morph is waiting. */
export function signalAuditMounted() {
  arrived?.();
}
