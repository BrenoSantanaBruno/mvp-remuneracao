"use client"

import { useState } from "react"
import { getJSON } from "@/lib/api"
import { downloadCSV } from "@/lib/csv"

export default function ReportButton({
  label,
  path,
  filename,
  className = "",
}: {
  label: string
  path: string
  filename: string
  className?: string
}) {
  const [loading, setLoading] = useState(false)

  const onClick = async () => {
    try {
      setLoading(true)
      const data = await getJSON(path)
      if (!Array.isArray(data)) throw new Error("A resposta não é uma lista.")
      downloadCSV(filename, data)
    } catch (e: any) {
      console.error(e)
      alert(e.message || "Falha ao gerar relatório")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full rounded-md px-4 py-2 font-medium ${className}`}
    >
      {loading ? "Gerando..." : "Gerar Relatório"}
    </button>
  )
}
