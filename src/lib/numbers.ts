export function parseNumber(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export function formatInput(value: string): string {
  return value
}

/**
 * Mantém só dígitos, vírgula e ponto. Usado em campos numéricos para que o
 * usuário possa digitar "12," ou "0,5" sem que o separador seja apagado.
 */
export function sanitizeNumericInput(raw: string): string {
  return raw.replace(/[^\d.,]/g, '')
}

/** Texto exibido em um campo numérico para um valor já salvo (0 = vazio). */
export function numberToInputText(value: number): string {
  if (!value || !isFinite(value)) return ''
  return String(value).replace('.', ',')
}
