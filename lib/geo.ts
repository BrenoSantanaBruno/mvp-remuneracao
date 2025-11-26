export type UF = { sigla: string; nome: string }
export type Cidade = { id: number; nome: string; uf: string }

export async function getUfs(): Promise<UF[]> {
  const res = await fetch("/api/locations/ufs")
  if (!res.ok) throw new Error("Erro ao carregar UFs")
  return res.json()
}

export async function getCitiesByUf(uf: string): Promise<Cidade[]> {
  if (!uf) return []
  const res = await fetch(`/api/locations/ufs/${uf}/cities`)
  if (!res.ok) throw new Error("Erro ao carregar cidades")
  return res.json()
}
