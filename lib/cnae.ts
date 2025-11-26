export type Cnae = { codigo: string; descricao: string }

export async function searchCnaes(search = "", page = 1, limit = 20): Promise<{ items: Cnae[]; page: number; totalPages: number }> {
  const params = new URLSearchParams({ search, page: String(page), limit: String(limit) })
  const res = await fetch(`/api/cnaes?${params.toString()}`)
  if (!res.ok) throw new Error("Erro ao buscar CNAE")
  return res.json()
}
