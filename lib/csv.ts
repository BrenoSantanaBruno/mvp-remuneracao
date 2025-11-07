export function downloadCSV(filename: string, rows: any[]) {
  const headers = Object.keys(rows[0] ?? {})
  const escape = (v: any) =>
    typeof v === "string" ? JSON.stringify(v) : JSON.stringify(v ?? "")
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape((r as any)[h])).join(",")),
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
