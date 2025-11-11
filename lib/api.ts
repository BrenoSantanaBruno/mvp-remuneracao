// lib/api.ts
import { emitDataChanged } from './events'

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

/** GET tipado */
export async function getJSON<T>(path: string): Promise<T> {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`)
    return res.json() as Promise<T>
}

/** POST tipado (R = resposta, B = body) */
export async function postJSON<R = any, B = any>(path: string, body: B): Promise<R> {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`)
    const data = (await res.json()) as R
    try { emitDataChanged(data) } catch {}
    return data
}

/** DELETE simples (dispara evento para recarregar listas) */
export async function delJSON(path: string): Promise<void> {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`
    const res = await fetch(url, { method: "DELETE" })
    if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status} - ${url}`)
    try { emitDataChanged(null) } catch {}
}
