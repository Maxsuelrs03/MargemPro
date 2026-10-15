import { calculateDiscount, getMarginStatus, type MarginStatus } from './pricing'

export interface OfferSimResult {
  revenue: number
  totalCost: number
  feeAmount: number
  profit: number
  marginPercent: number
  status: MarginStatus
  unitCount: number
  customerSavings: number
  customerSavingsPercent: number
  normalPrice: number
  offerPrice: number
  details: OfferDetailLine[]
  warnings: string[]
}

export interface OfferDetailLine {
  label: string
  value: string
  highlight?: boolean
}

function parseNum(val: string | number): number {
  if (typeof val === 'number') return val
  const cleaned = val.replace(/[^\d,.-]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export function simulateOffer(
  strategyId: string,
  rawFields: Record<string, string | number>,
): OfferSimResult | null {
  const f: Record<string, number> = {}
  for (const [k, v] of Object.entries(rawFields)) {
    f[k] = parseNum(v)
  }

  switch (strategyId) {
    case 'desconto-direto':
    case 'queima-estoque':
      return simulateDiscountDirect(f)
    case 'leve-mais-por-menos':
      return simulateLeveMais(f)
    case 'combos-kits':
      return simulateCombo(f)
    case 'desconto-progressivo':
      return simulateProgressive(f)
    case 'brinde-estrategico':
      return simulateBrinde(f)
    case 'aumentar-ticket':
      return simulateUpsell(f)
    case 'clientes-recorrentes':
      return simulateRecurring(f)
    default:
      return null
  }
}

function buildResult(params: {
  revenue: number
  totalCost: number
  feeAmount: number
  unitCount: number
  normalPrice: number
  offerPrice: number
  extraDetails?: OfferDetailLine[]
  extraWarnings?: string[]
}): OfferSimResult {
  const profit = params.revenue - params.feeAmount - params.totalCost
  const marginPercent = params.revenue > 0 ? (profit / params.revenue) * 100 : 0
  const status = getMarginStatus(marginPercent)
  const customerSavings = params.normalPrice - params.offerPrice
  const customerSavingsPercent = params.normalPrice > 0 ? (customerSavings / params.normalPrice) * 100 : 0

  const warnings: string[] = []
  if (profit < 0) {
    warnings.push(
      `Esta oferta gera prejuízo de ${formatAbs(profit)} por venda. Considere ajustar o desconto ou o preço.`,
    )
  } else if (marginPercent < 5) {
    warnings.push(
      `A margem está muito baixa (${marginPercent.toFixed(1)}%). O lucro é de apenas ${formatMoney(profit)} por venda.`,
    )
  } else if (marginPercent < 15) {
    warnings.push(
      `A margem está baixa (${marginPercent.toFixed(1)}%). Avalie se vale a pena para o seu objetivo.`,
    )
  }
  if (params.extraWarnings) warnings.push(...params.extraWarnings)

  const details: OfferDetailLine[] = [
    { label: 'Preço normal', value: formatMoney(params.normalPrice) },
    { label: 'Preço da oferta', value: formatMoney(params.offerPrice), highlight: true },
    { label: 'Economia do cliente', value: formatMoney(customerSavings) },
    { label: 'Custo total', value: formatMoney(params.totalCost) },
  ]
  if (params.feeAmount > 0) {
    details.push({ label: 'Taxas', value: '- ' + formatMoney(params.feeAmount) })
  }
  if (params.extraDetails) details.push(...params.extraDetails)
  details.push({ label: 'Faturamento', value: formatMoney(params.revenue) })
  details.push({ label: 'Lucro estimado', value: formatMoney(profit), highlight: true })
  details.push({ label: 'Margem de lucro', value: marginPercent.toFixed(1) + '%', highlight: true })

  return {
    revenue: params.revenue,
    totalCost: params.totalCost,
    feeAmount: params.feeAmount,
    profit,
    marginPercent,
    status,
    unitCount: params.unitCount,
    customerSavings,
    customerSavingsPercent,
    normalPrice: params.normalPrice,
    offerPrice: params.offerPrice,
    details,
    warnings,
  }
}

function formatMoney(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatAbs(v: number): string {
  return formatMoney(Math.abs(v))
}

function simulateDiscountDirect(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const discountPercent = f.discountPercent || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || discountPercent <= 0) return null

  const disc = calculateDiscount(originalPrice, discountPercent, cost + additionalCosts, feePercent, feeFixed)

  return buildResult({
    revenue: disc.finalPrice,
    totalCost: cost + additionalCosts,
    feeAmount: disc.feeAmount,
    unitCount: 1,
    normalPrice: originalPrice,
    offerPrice: disc.finalPrice,
    extraDetails: [
      { label: 'Desconto aplicado', value: discountPercent.toFixed(0) + '%' },
    ],
  })
}

function simulateLeveMais(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const quantity = Math.round(f.quantity || 0)
  const bundlePrice = f.bundlePrice || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || quantity < 2 || bundlePrice <= 0) return null

  const totalCost = (cost + additionalCosts) * quantity
  const feeAmount = bundlePrice * (feePercent / 100) + feeFixed
  const normalPrice = originalPrice * quantity

  return buildResult({
    revenue: bundlePrice,
    totalCost,
    feeAmount,
    unitCount: quantity,
    normalPrice,
    offerPrice: bundlePrice,
    extraDetails: [
      { label: 'Preço por unidade na oferta', value: formatMoney(bundlePrice / quantity) },
      { label: 'Preço normal por unidade', value: formatMoney(originalPrice) },
    ],
  })
}

function simulateCombo(f: Record<string, number>): OfferSimResult | null {
  const cost1 = f.cost1 || 0
  const price1 = f.price1 || 0
  const cost2 = f.cost2 || 0
  const price2 = f.price2 || 0
  const comboPrice = f.comboPrice || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost1 <= 0 || price1 <= 0 || cost2 <= 0 || price2 <= 0 || comboPrice <= 0) return null

  const totalCost = cost1 + cost2 + additionalCosts
  const feeAmount = comboPrice * (feePercent / 100) + feeFixed
  const normalPrice = price1 + price2

  return buildResult({
    revenue: comboPrice,
    totalCost,
    feeAmount,
    unitCount: 2,
    normalPrice,
    offerPrice: comboPrice,
    extraDetails: [
      { label: 'Preço dos produtos separados', value: formatMoney(normalPrice) },
    ],
  })
}

function simulateProgressive(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const qty1 = Math.round(f.qtyTier1 || 0)
  const disc1 = f.discountTier1 || 0
  const qty2 = Math.round(f.qtyTier2 || 0)
  const disc2 = f.discountTier2 || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || qty1 < 2 || disc1 <= 0) return null

  const tier1TotalCost = (cost + additionalCosts) * qty1
  const tier1Revenue = originalPrice * qty1 * (1 - disc1 / 100)
  const tier1Fee = tier1Revenue * (feePercent / 100) + feeFixed
  const tier1Profit = tier1Revenue - tier1Fee - tier1TotalCost
  const tier1Margin = tier1Revenue > 0 ? (tier1Profit / tier1Revenue) * 100 : 0

  const tier2Revenue = qty2 >= qty1 && disc2 > disc1
    ? originalPrice * qty2 * (1 - disc2 / 100)
    : 0
  const tier2TotalCost = qty2 >= qty1 && disc2 > disc1 ? (cost + additionalCosts) * qty2 : 0
  const tier2Fee = tier2Revenue > 0 ? tier2Revenue * (feePercent / 100) + feeFixed : 0
  const tier2Profit = tier2Revenue > 0 ? tier2Revenue - tier2Fee - tier2TotalCost : 0
  const tier2Margin = tier2Revenue > 0 ? (tier2Profit / tier2Revenue) * 100 : 0

  const primaryRevenue = tier1Revenue
  const primaryCost = tier1TotalCost
  const primaryFee = tier1Fee
  const unitCount = qty1

  const result = buildResult({
    revenue: primaryRevenue,
    totalCost: primaryCost,
    feeAmount: primaryFee,
    unitCount,
    normalPrice: originalPrice * qty1,
    offerPrice: tier1Revenue,
    extraDetails: [
      { label: `Faixa 1: ${qty1} un. com ${disc1}% off`, value: formatMoney(tier1Revenue) + ` (${tier1Margin.toFixed(1)}% margem)` },
    ],
  })

  if (tier2Revenue > 0) {
    result.details.push({
      label: `Faixa 2: ${qty2} un. com ${disc2}% off`,
      value: formatMoney(tier2Revenue) + ` (${tier2Margin.toFixed(1)}% margem)`,
    })
    if (tier2Profit < 0) {
      result.warnings.push(
        `A faixa 2 (${qty2} unidades) gera prejuízo. Considere reduzir o desconto ou aumentar a quantidade mínima.`,
      )
    }
  }

  return result
}

function simulateBrinde(f: Record<string, number>): OfferSimResult | null {
  const productCost = f.productCost || 0
  const productPrice = f.productPrice || 0
  const giftCost = f.giftCost || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (productCost <= 0 || productPrice <= 0 || giftCost <= 0) return null

  const totalCost = productCost + giftCost + additionalCosts
  const feeAmount = productPrice * (feePercent / 100) + feeFixed

  const result = buildResult({
    revenue: productPrice,
    totalCost,
    feeAmount,
    unitCount: 1,
    normalPrice: productPrice,
    offerPrice: productPrice,
    extraDetails: [
      { label: 'Custo do brinde', value: formatMoney(giftCost) },
      { label: 'Custo sem o brinde seria', value: formatMoney(productCost + additionalCosts) },
    ],
  })

  // Compare: would a discount be cheaper?
  const discountEquivalent = giftCost
  const equivalentDiscountPercent = productPrice > 0 ? (discountEquivalent / productPrice) * 100 : 0
  if (equivalentDiscountPercent > 0) {
    result.details.push({
      label: 'Equivalente a dar de desconto',
      value: equivalentDiscountPercent.toFixed(1) + '%',
    })
  }

  return result
}

function simulateUpsell(f: Record<string, number>): OfferSimResult | null {
  const cost1 = f.cost1 || 0
  const price1 = f.price1 || 0
  const cost2 = f.cost2 || 0
  const price2 = f.price2 || 0
  const upsellPrice = f.upsellPrice || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost1 <= 0 || price1 <= 0 || cost2 <= 0 || price2 <= 0 || upsellPrice <= 0) return null

  const revenue = price1 + upsellPrice
  const totalCost = cost1 + cost2 + additionalCosts
  const feeAmount = revenue * (feePercent / 100) + feeFixed
  const normalPrice = price1 + price2

  return buildResult({
    revenue,
    totalCost,
    feeAmount,
    unitCount: 2,
    normalPrice,
    offerPrice: revenue,
    extraDetails: [
      { label: 'Produto principal', value: formatMoney(price1) },
      { label: 'Complementar na oferta', value: formatMoney(upsellPrice) + ` (normal: ${formatMoney(price2)})` },
      { label: 'Desconto no complementar', value: price2 > 0 ? ((price2 - upsellPrice) / price2 * 100).toFixed(0) + '%' : '-' },
    ],
  })
}

function simulateRecurring(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const discountPercent = f.discountPercent || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || discountPercent <= 0) return null

  const disc = calculateDiscount(originalPrice, discountPercent, cost + additionalCosts, feePercent, feeFixed)

  const result = buildResult({
    revenue: disc.finalPrice,
    totalCost: cost + additionalCosts,
    feeAmount: disc.feeAmount,
    unitCount: 1,
    normalPrice: originalPrice,
    offerPrice: disc.finalPrice,
    extraDetails: [
      { label: 'Desconto exclusivo', value: discountPercent.toFixed(0) + '%' },
    ],
  })

  if (f.minPurchase > 0 && disc.finalPrice < f.minPurchase) {
    result.warnings.push(
      `O preço com desconto (${formatMoney(disc.finalPrice)}) fica abaixo da compra mínima de ${formatMoney(f.minPurchase)}. Ajuste o desconto ou a compra mínima.`,
    )
  }

  return result
}
