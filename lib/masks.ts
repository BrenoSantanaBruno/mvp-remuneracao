export function onlyDigits(v: string): string {
  return (v || "").replace(/\D+/g, "")
}

export function maskCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14)
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 8),
    digits.slice(8, 12),
    digits.slice(12, 14),
  ]
  if (digits.length <= 2) return parts[0]
  if (digits.length <= 5) return `${parts[0]}.${parts[1]}`
  if (digits.length <= 8) return `${parts[0]}.${parts[1]}.${parts[2]}`
  if (digits.length <= 12) return `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3]}`
  return `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3]}-${parts[4]}`
}
