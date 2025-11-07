    export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

export async function getJSON(path: string) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`)
  return res.json()
}

export async function postJSON(path: string, body: unknown) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`)
  return res.json()
}
