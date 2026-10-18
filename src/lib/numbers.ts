/**
 * Leitura de números digitados no formato brasileiro.
 *
 * Este é o único lugar do app que converte texto em número. Regras:
 *
 * - Se aparecem vírgula e ponto, o que vem por último é o separador decimal
 *   e o outro é separador de milhar: "1.234,56" e "1,234.56" valem 1234,56.
 * - Só vírgula: uma vírgula é decimal ("12,5" = 12,5); várias são milhar.
 * - Só ponto: vários pontos são milhar ("1.234.567"). Um ponto seguido de
 *   exatamente 3 dígitos, com 1 a 3 dígitos não nulos antes, é milhar
 *   ("1.500" = 1500, "12.345" = 12345). Nos demais casos é decimal
 *   ("1.5", "7.90", "0.500" = 0,5).
 * - Símbolos e letras ("R$", espaços) são ignorados. Um "-" antes do
 *   primeiro dígito torna o número negativo.
 */

/** Converte o texto em número, ou devolve null se não houver nenhum dígito. */
export function tryParseNumber(value: string | number): number | null {
  if (typeof value === 'number') return isFinite(value) ? value : null

  const negative = /^[^\d,.]*-/.test(value)
  const cleaned = value.replace(/[^\d,.]/g, '')
  if (!/\d/.test(cleaned)) return null

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  let normalized: string

  if (lastComma !== -1 && lastDot !== -1) {
    const decimalSep = lastComma > lastDot ? ',' : '.'
    const thousandsSep = decimalSep === ',' ? '.' : ','
    normalized = cleaned.split(thousandsSep).join('').replace(decimalSep, '.')
  } else if (lastComma !== -1) {
    const parts = cleaned.split(',')
    normalized = parts.length === 2 ? `${parts[0]}.${parts[1]}` : parts.join('')
  } else if (lastDot !== -1) {
    const parts = cleaned.split('.')
    const looksLikeThousands =
      parts.length > 2 ||
      (parts[1].length === 3 && parts[0].length >= 1 && parts[0].length <= 3 && Number(parts[0]) !== 0)
    normalized = looksLikeThousands ? parts.join('') : cleaned
  } else {
    normalized = cleaned
  }

  const num = parseFloat(normalized)
  if (isNaN(num)) return null
  return negative ? -num : num
}

/** Converte o texto em número; texto vazio ou sem dígitos vale 0. */
export function parseNumber(value: string | number): number {
  return tryParseNumber(value) ?? 0
}

/**
 * Mantém só dígitos, vírgula e ponto. Usado em campos numéricos para que o
 * usuário possa digitar "12," ou "0,5" sem que o separador seja apagado.
 */
export function sanitizeNumericInput(raw: string): string {
  return raw.replace(/[^\d.,]/g, '')
}

/**
 * Texto exibido em um campo numérico para um valor já salvo (0 = vazio).
 * Sempre usa vírgula decimal, para que o texto volte ao mesmo número quando
 * lido por parseNumber ("1.125" seria lido como milhar; "1,125" não).
 */
export function numberToInputText(value: number): string {
  if (!value || !isFinite(value)) return ''
  return String(value).replace('.', ',')
}

/** Mesmo que numberToInputText, arredondando para centavos (preços). */
export function priceToInputText(value: number): string {
  return numberToInputText(Math.round(value * 100) / 100)
}
