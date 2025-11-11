// Minimal event bus for cross-component updates (no deps)
type Payload = any
type Listener = (payload: Payload) => void

const listeners = new Set<Listener>()

export function onDataChanged(fn: Listener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function offDataChanged(fn: Listener) {
  listeners.delete(fn)
}

export function emitDataChanged(payload: Payload = null) {
  for (const fn of Array.from(listeners)) {
    try { fn(payload) } catch {}
  }
}

// Back-compat aliases
export const onDataChange = onDataChanged
export const emitDataChange = emitDataChanged
export const offDataChange = offDataChanged
