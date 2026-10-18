import type { ChannelId, StyleId, CopyTemplate } from './copywritingData'
import { tryParseNumber } from './numbers'

export interface MessageFormData {
  productName: string
  productType: string
  normalPrice: string
  promoPrice: string
  benefit: string
  audience: string
  objective: string
  deadline: string
  quantity: string
  channel: ChannelId
  style: StyleId
  // Optional fields for specific templates
  brinde?: string
  complemento?: string
  ocasiao?: string
  parcelas?: string
  descontoPix?: string
}

export interface GeneratedMessage {
  templateId: string
  templateName: string
  channel: ChannelId
  content: string
  cta: string
  fullText: string
}

function formatPrice(value: string): string {
  const num = tryParseNumber(value)
  if (num === null) return value
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

function calcSavings(normal: string, promo: string): string {
  const n = tryParseNumber(normal)
  const p = tryParseNumber(promo)
  if (n === null || p === null || n <= p) return ''
  const diff = n - p
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(diff)
}

const styleTone: Record<StyleId, { prefix: string; suffix: string }> = {
  direto: { prefix: '', suffix: '' },
  elegante: { prefix: '', suffix: '' },
  descontraido: { prefix: '', suffix: '' },
  consultivo: { prefix: '', suffix: '' },
}

function fillTemplate(template: string, data: MessageFormData): string {
  const savings = calcSavings(data.normalPrice, data.promoPrice)
  const replacements: Record<string, string> = {
    produto: data.productName || '[nome do produto]',
    precoNormal: data.normalPrice ? formatPrice(data.normalPrice) : '[preço normal]',
    precoPromo: data.promoPrice ? formatPrice(data.promoPrice) : '[preço promocional]',
    beneficio: data.benefit || '[principal benefício]',
    publico: data.audience || '[público-alvo]',
    prazo: data.deadline || '[prazo da promoção]',
    quantidade: data.quantity || '[quantidade]',
    economia: savings || '[economia]',
    brinde: data.brinde || '[brinde]',
    complemento: data.complemento || '[produto complementar]',
    ocasiao: data.ocasiao || '[ocasião]',
    parcelas: data.parcelas || '[parcelas]',
    descontoPix: data.descontoPix || '[desconto Pix]',
  }

  let result = template
  for (const [key, value] of Object.entries(replacements)) {
    result = result.split(`{${key}}`).join(value)
  }
  result = result.replace(styleTone[data.style].prefix, '').trim()
  return result
}

export function generateMessages(data: MessageFormData, templates: CopyTemplate[]): GeneratedMessage[] {
  const channelTemplates = templates.filter((t) => t.channels.includes(data.channel))
  const messages: GeneratedMessage[] = []

  for (const tmpl of channelTemplates) {
    const content = fillTemplate(tmpl.template, data)
    const cta = fillTemplate(tmpl.cta, data)
    const fullText = `${content}\n\n${cta}`
    messages.push({
      templateId: tmpl.id,
      templateName: tmpl.name,
      channel: data.channel,
      content,
      cta,
      fullText,
    })
  }

  return messages
}

export function generateWhatsAppResponse(
  _scenarioId: string,
  responseTemplate: string,
  data: Partial<MessageFormData>,
): string {
  const replacements: Record<string, string> = {
    produto: data.productName || '[nome do produto]',
    precoNormal: data.normalPrice ? formatPrice(data.normalPrice) : '[preço normal]',
    precoPromo: data.promoPrice ? formatPrice(data.promoPrice) : '[preço promocional]',
    beneficio: data.benefit || '[principal benefício]',
    prazo: data.deadline || '[prazo]',
    quantidade: data.quantity || '[quantidade]',
    brinde: data.brinde || '[brinde]',
    parcelas: data.parcelas || '[parcelas]',
    descontoPix: data.descontoPix || '[desconto Pix]',
    diferencial: '[seu diferencial]',
  }

  let result = responseTemplate
  for (const [key, value] of Object.entries(replacements)) {
    result = result.split(`{${key}}`).join(value)
  }
  return result
}
