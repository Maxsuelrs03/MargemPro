import { calculateDiscount, getMarginStatus, type MarginStatus } from './pricing'
import { parseNumber } from './numbers'

export interface OfferDetailLine {
  label: string
  value: string
  highlight?: boolean
}

export interface OfferSimResult {
  grossRevenue: number
  discountsConceded: number
  revenueAfterDiscount: number
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
  profitPerUnit: number
  normalProfit: number
  profitDifference: number
  minPriceForMargin: number | null
  details: OfferDetailLine[]
  warnings: string[]
}

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function money(v: number): string {
  if (isNaN(v) || !isFinite(v)) return '—'
  return fmt.format(v)
}

function safeDiv(a: number, b: number): number {
  if (b === 0) return 0
  return a / b
}

export function simulateOffer(
  strategyId: string,
  rawFields: Record<string, string | number>,
): OfferSimResult | null {
  const f: Record<string, number> = {}
  for (const [k, v] of Object.entries(rawFields)) {
    f[k] = parseNumber(v)
  }

  switch (strategyId) {
    case 'desconto-percentual':
    case 'queima-estoque':
    case 'ultima-unidade':
      return simPercentDiscount(f)
    case 'desconto-fixo':
      return simFixedDiscount(f)
    case 'preco-promocional-prazo':
    case 'oferta-relampago':
      return simPromoPrice(f)
    case 'desconto-segunda-unidade':
      return simSecondUnit(f)
    case 'desconto-progressivo':
      return simProgressive(f)
    case 'combo-complementares':
    case 'produto-com-acessorio':
    case 'produtos-parados':
    case 'oferta-tematica':
      return simCombo(f)
    case 'combo-liquidar':
      return simKit(f)
    case 'kit-preco-fechado':
      return simKit(f)
    case 'leve-3-pague-2':
      return simLeve3Pague2(f)
    case 'compre-mais-economize':
      return simCompreMais(f)
    case 'kits-niveis':
      return simKitsNiveis(f)
    case 'monte-seu-combo':
      return simMonteCombo(f)
    case 'brinde-estrategico':
      return simBrinde(f)
    case 'frete-gratis':
      return simFreteGratis(f)
    case 'presente-no-kit':
      return simPresenteKit(f)
    case 'embalagem-especial':
      return simEmbalagem(f)
    case 'beneficio-valor-minimo':
      return simBeneficioValor(f)
    case 'recuperar-inativos':
    case 'recompra-antigos':
    case 'primeira-compra':
    case 'clientes-recorrentes':
    case 'compra-minima':
      return simPercentDiscountWithMin(f)
    case 'indique-amigo':
      return simIndiqueAmigo(f)
    case 'lancamento-produto':
      return simPromoPrice(f)
    default:
      return null
  }
}

interface BuildParams {
  grossRevenue: number
  discountsConceded: number
  totalCost: number
  feeAmount: number
  unitCount: number
  normalPrice: number
  offerPrice: number
  normalProfit: number
  targetMarginPercent?: number
  extraDetails?: OfferDetailLine[]
  extraWarnings?: string[]
}

function buildResult(p: BuildParams): OfferSimResult {
  const revenueAfterDiscount = p.grossRevenue - p.discountsConceded
  const profit = revenueAfterDiscount - p.feeAmount - p.totalCost
  const marginPercent = revenueAfterDiscount > 0 ? safeDiv(profit, revenueAfterDiscount) * 100 : 0
  const status = getMarginStatus(marginPercent)
  const customerSavings = p.normalPrice - p.offerPrice
  const customerSavingsPercent = p.normalPrice > 0 ? safeDiv(customerSavings, p.normalPrice) * 100 : 0
  const profitPerUnit = p.unitCount > 0 ? safeDiv(profit, p.unitCount) : 0
  const profitDifference = profit - p.normalProfit

  let minPriceForMargin: number | null = null
  if (p.targetMarginPercent !== undefined && p.targetMarginPercent > 0) {
    const feePercentRatio = p.grossRevenue > 0 ? safeDiv(p.feeAmount, p.grossRevenue) : 0
    const divisor = 1 - feePercentRatio - p.targetMarginPercent / 100
    if (divisor > 0) {
      minPriceForMargin = safeDiv(p.totalCost, divisor)
    }
  }

  const warnings: string[] = []
  if (profit < 0) {
    warnings.push(`Esta oferta gera prejuízo de ${money(Math.abs(profit))} por venda. Considere ajustar o desconto ou o preço.`)
  } else if (marginPercent < 5) {
    warnings.push(`A margem está muito baixa (${marginPercent.toFixed(1)}%). O lucro é de apenas ${money(profit)} por venda.`)
  } else if (marginPercent < 15) {
    warnings.push(`A margem está baixa (${marginPercent.toFixed(1)}%). Avalie se vale a pena para o seu objetivo.`)
  }
  if (profitDifference < 0 && profit >= 0) {
    warnings.push(`Com esta oferta, você ganha ${money(Math.abs(profitDifference))} a menos por venda em comparação com a venda normal.`)
  }
  if (p.extraWarnings) warnings.push(...p.extraWarnings)

  const details: OfferDetailLine[] = [
    { label: 'Preço normal', value: money(p.normalPrice) },
    { label: 'Preço da oferta', value: money(p.offerPrice), highlight: true },
  ]
  if (p.discountsConceded > 0) {
    details.push({ label: 'Descontos concedidos', value: '- ' + money(p.discountsConceded) })
  }
  details.push({ label: 'Economia do cliente', value: money(customerSavings) })
  if (p.feeAmount > 0) {
    details.push({ label: 'Taxas', value: '- ' + money(p.feeAmount) })
  }
  details.push({ label: 'Custo total', value: money(p.totalCost) })
  if (p.extraDetails) details.push(...p.extraDetails)
  details.push({ label: 'Faturamento bruto', value: money(p.grossRevenue) })
  details.push({ label: 'Receita após descontos', value: money(revenueAfterDiscount) })
  details.push({ label: 'Lucro estimado', value: money(profit), highlight: true })
  details.push({ label: 'Margem de lucro', value: marginPercent.toFixed(1) + '%', highlight: true })
  if (profitDifference !== 0) {
    details.push({ label: 'Diferença vs venda normal', value: (profitDifference >= 0 ? '+' : '') + money(profitDifference) })
  }
  if (minPriceForMargin !== null && minPriceForMargin > p.offerPrice) {
    details.push({ label: 'Preço mínimo para 15% margem', value: money(minPriceForMargin) })
  }

  return {
    grossRevenue: p.grossRevenue,
    discountsConceded: p.discountsConceded,
    revenueAfterDiscount,
    totalCost: p.totalCost,
    feeAmount: p.feeAmount,
    profit,
    marginPercent,
    status,
    unitCount: p.unitCount,
    customerSavings,
    customerSavingsPercent,
    normalPrice: p.normalPrice,
    offerPrice: p.offerPrice,
    profitPerUnit,
    normalProfit: p.normalProfit,
    profitDifference,
    minPriceForMargin,
    details,
    warnings,
  }
}

function calcFee(revenue: number, feePercent: number, feeFixed: number): number {
  return revenue * (feePercent / 100) + feeFixed
}

// ─── Strategy 1, 19, 22: Percent discount ───
function simPercentDiscount(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const discountPercent = f.discountPercent || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || discountPercent <= 0) return null

  const disc = calculateDiscount(originalPrice, discountPercent, cost + additionalCosts, feePercent, feeFixed)
  const normalProfit = originalPrice - calcFee(originalPrice, feePercent, feeFixed) - cost - additionalCosts

  return buildResult({
    grossRevenue: originalPrice,
    discountsConceded: disc.discountValue,
    totalCost: cost + additionalCosts,
    feeAmount: disc.feeAmount,
    unitCount: 1,
    normalPrice: originalPrice,
    offerPrice: disc.finalPrice,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [{ label: 'Desconto aplicado', value: discountPercent.toFixed(0) + '%' }],
  })
}

// ─── Strategy 2: Fixed discount ───
function simFixedDiscount(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const discountValue = f.discountValue || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || discountValue <= 0) return null

  const finalPrice = Math.max(0, originalPrice - discountValue)
  const feeAmount = calcFee(finalPrice, feePercent, feeFixed)
  const totalCost = cost + additionalCosts
  const normalProfit = originalPrice - calcFee(originalPrice, feePercent, feeFixed) - totalCost
  const effectivePercent = originalPrice > 0 ? (discountValue / originalPrice) * 100 : 0

  return buildResult({
    grossRevenue: originalPrice,
    discountsConceded: discountValue,
    totalCost,
    feeAmount,
    unitCount: 1,
    normalPrice: originalPrice,
    offerPrice: finalPrice,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [{ label: 'Desconto equivalente', value: effectivePercent.toFixed(1) + '%' }],
  })
}

// ─── Strategy 3, 6, 29: Promo/flash/launch price ───
function simPromoPrice(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const promoPrice = f.promoPrice || f.offerPrice || f.launchPrice || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || promoPrice <= 0) return null

  const feeAmount = calcFee(promoPrice, feePercent, feeFixed)
  const totalCost = cost + additionalCosts
  const discountValue = originalPrice - promoPrice
  const normalProfit = originalPrice - calcFee(originalPrice, feePercent, feeFixed) - totalCost

  let extraWarning: string | undefined
  if ('stockLimit' in f && f.stockLimit > 0) {
    const totalProfit = (promoPrice - feeAmount - totalCost) * Math.round(f.stockLimit)
    extraWarning = `Lucro total estimado com ${Math.round(f.stockLimit)} unidades: ${money(totalProfit)}.`
  }

  return buildResult({
    grossRevenue: originalPrice,
    discountsConceded: discountValue,
    totalCost,
    feeAmount,
    unitCount: 1,
    normalPrice: originalPrice,
    offerPrice: promoPrice,
    normalProfit,
    targetMarginPercent: 15,
    extraWarnings: extraWarning ? [extraWarning] : undefined,
  })
}

// ─── Strategy 4: Second unit discount ───
function simSecondUnit(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const secondDiscount = f.secondUnitDiscount || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || secondDiscount <= 0) return null

  const secondPrice = originalPrice * (1 - secondDiscount / 100)
  const revenue = originalPrice + secondPrice
  const feeAmount = calcFee(revenue, feePercent, feeFixed)
  const totalCost = (cost + additionalCosts) * 2
  const normalPrice = originalPrice * 2
  const normalProfit = normalPrice - calcFee(normalPrice, feePercent, feeFixed) - totalCost

  return buildResult({
    grossRevenue: normalPrice,
    discountsConceded: normalPrice - revenue,
    totalCost,
    feeAmount,
    unitCount: 2,
    normalPrice,
    offerPrice: revenue,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [
      { label: '1ª unidade', value: money(originalPrice) },
      { label: '2ª unidade', value: money(secondPrice) + ` (${secondDiscount.toFixed(0)}% off)` },
    ],
  })
}

// ─── Strategy 5: Progressive discount ───
function simProgressive(f: Record<string, number>): OfferSimResult | null {
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

  const unitCost = cost + additionalCosts
  const tier1Revenue = originalPrice * qty1 * (1 - disc1 / 100)
  const tier1Cost = unitCost * qty1
  const tier1Fee = calcFee(tier1Revenue, feePercent, feeFixed)
  const tier1Profit = tier1Revenue - tier1Fee - tier1Cost
  const tier1Margin = tier1Revenue > 0 ? safeDiv(tier1Profit, tier1Revenue) * 100 : 0

  const tier2Revenue = qty2 >= qty1 && disc2 > disc1 ? originalPrice * qty2 * (1 - disc2 / 100) : 0
  const tier2Cost = qty2 >= qty1 && disc2 > disc1 ? unitCost * qty2 : 0
  const tier2Fee = tier2Revenue > 0 ? calcFee(tier2Revenue, feePercent, feeFixed) : 0
  const tier2Profit = tier2Revenue > 0 ? tier2Revenue - tier2Fee - tier2Cost : 0
  const tier2Margin = tier2Revenue > 0 ? safeDiv(tier2Profit, tier2Revenue) * 100 : 0

  const normalPrice = originalPrice * qty1
  const normalProfit = normalPrice - calcFee(normalPrice, feePercent, feeFixed) - tier1Cost

  const result = buildResult({
    grossRevenue: normalPrice,
    discountsConceded: normalPrice - tier1Revenue,
    totalCost: tier1Cost,
    feeAmount: tier1Fee,
    unitCount: qty1,
    normalPrice,
    offerPrice: tier1Revenue,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [
      { label: `Faixa 1: ${qty1} un. ${disc1}% off`, value: money(tier1Revenue) + ` (${tier1Margin.toFixed(1)}%)` },
    ],
  })

  if (tier2Revenue > 0) {
    result.details.push({
      label: `Faixa 2: ${qty2} un. ${disc2}% off`,
      value: money(tier2Revenue) + ` (${tier2Margin.toFixed(1)}%)`,
    })
    if (tier2Profit < 0) {
      result.warnings.push(`A faixa 2 (${qty2} unidades) gera prejuízo. Considere reduzir o desconto ou aumentar a quantidade mínima.`)
    }
  }

  return result
}

// ─── Strategies 7, 18, 20, 21, 28: Two-product combo ───
function simCombo(f: Record<string, number>): OfferSimResult | null {
  const cost1 = f.cost1 || 0
  const price1 = f.price1 || 0
  const cost2 = f.cost2 || 0
  const price2 = f.price2 || 0
  const comboPrice = f.comboPrice || f.bundlePrice || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost1 <= 0 || price1 <= 0 || cost2 <= 0 || price2 <= 0 || comboPrice <= 0) return null

  const totalCost = cost1 + cost2 + additionalCosts
  const feeAmount = calcFee(comboPrice, feePercent, feeFixed)
  const normalPrice = price1 + price2
  const normalProfit = normalPrice - calcFee(normalPrice, feePercent, feeFixed) - totalCost
  const effectiveDiscount = normalPrice > 0 ? ((normalPrice - comboPrice) / normalPrice) * 100 : 0

  return buildResult({
    grossRevenue: normalPrice,
    discountsConceded: normalPrice - comboPrice,
    totalCost,
    feeAmount,
    unitCount: 2,
    normalPrice,
    offerPrice: comboPrice,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [
      { label: 'Preço dos produtos separados', value: money(normalPrice) },
      { label: 'Desconto efetivo do combo', value: effectiveDiscount.toFixed(1) + '%' },
    ],
  })
}

// ─── Strategy 8: Kit with fixed price ───
function simKit(f: Record<string, number>): OfferSimResult | null {
  const totalCost = f.totalCost || 0
  const totalSeparatePrice = f.totalSeparatePrice || 0
  const kitPrice = f.kitPrice || f.comboPrice || 0
  const itemCount = Math.round(f.itemCount || 0)
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (totalCost <= 0 || totalSeparatePrice <= 0 || kitPrice <= 0 || itemCount < 1) return null

  const fullCost = totalCost + additionalCosts
  const feeAmount = calcFee(kitPrice, feePercent, feeFixed)
  const normalProfit = totalSeparatePrice - calcFee(totalSeparatePrice, feePercent, feeFixed) - fullCost
  const effectiveDiscount = totalSeparatePrice > 0 ? ((totalSeparatePrice - kitPrice) / totalSeparatePrice) * 100 : 0

  return buildResult({
    grossRevenue: totalSeparatePrice,
    discountsConceded: totalSeparatePrice - kitPrice,
    totalCost: fullCost,
    feeAmount,
    unitCount: itemCount,
    normalPrice: totalSeparatePrice,
    offerPrice: kitPrice,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [
      { label: 'Itens no kit', value: String(itemCount) },
      { label: 'Desconto efetivo', value: effectiveDiscount.toFixed(1) + '%' },
    ],
  })
}

// ─── Strategy 9: Leve 3 pague 2 ───
function simLeve3Pague2(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0) return null

  const unitCost = cost + additionalCosts
  const totalCost = unitCost * 3
  const revenue = originalPrice * 2
  const feeAmount = calcFee(revenue, feePercent, feeFixed)
  const normalPrice = originalPrice * 3
  const normalProfit = normalPrice - calcFee(normalPrice, feePercent, feeFixed) - totalCost

  return buildResult({
    grossRevenue: normalPrice,
    discountsConceded: originalPrice,
    totalCost,
    feeAmount,
    unitCount: 3,
    normalPrice,
    offerPrice: revenue,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [
      { label: 'Paga', value: '2 unidades' },
      { label: 'Leva', value: '3 unidades' },
      { label: 'Custo da unidade grátis', value: money(cost) },
    ],
  })
}

// ─── Strategy 10: Compre mais, economize mais ───
function simCompreMais(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const minQty = Math.round(f.minQty || 0)
  const discountPercent = f.discountPercent || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || minQty < 2 || discountPercent <= 0) return null

  const unitCost = cost + additionalCosts
  const totalCost = unitCost * minQty
  const normalPrice = originalPrice * minQty
  const revenue = normalPrice * (1 - discountPercent / 100)
  const feeAmount = calcFee(revenue, feePercent, feeFixed)
  const normalProfit = normalPrice - calcFee(normalPrice, feePercent, feeFixed) - totalCost

  return buildResult({
    grossRevenue: normalPrice,
    discountsConceded: normalPrice - revenue,
    totalCost,
    feeAmount,
    unitCount: minQty,
    normalPrice,
    offerPrice: revenue,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [
      { label: 'Quantidade mínima', value: String(minQty) },
      { label: 'Preço por unidade na oferta', value: money(revenue / minQty) },
    ],
  })
}

// ─── Strategy 11: Kits in levels ───
function simKitsNiveis(f: Record<string, number>): OfferSimResult | null {
  const costBasic = f.costBasic || 0
  const priceBasic = f.priceBasic || 0
  const costInter = f.costInter || 0
  const priceInter = f.priceInter || 0
  const costPremium = f.costPremium || 0
  const pricePremium = f.pricePremium || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (costBasic <= 0 || priceBasic <= 0 || costInter <= 0 || priceInter <= 0 || costPremium <= 0 || pricePremium <= 0) return null

  const levels = [
    { name: 'Básico', cost: costBasic, price: priceBasic },
    { name: 'Intermediário', cost: costInter, price: priceInter },
    { name: 'Premium', cost: costPremium, price: pricePremium },
  ]

  const details: OfferDetailLine[] = levels.map((l) => {
    const fee = calcFee(l.price, feePercent, feeFixed)
    const profit = l.price - fee - l.cost
    const margin = l.price > 0 ? safeDiv(profit, l.price) * 100 : 0
    return { label: `Kit ${l.name}`, value: `${money(l.price)} (${margin.toFixed(1)}%)` }
  })

  // Use intermediate as primary result
  const mid = levels[1]
  const feeAmount = calcFee(mid.price, feePercent, feeFixed)
  const profit = mid.price - feeAmount - mid.cost
  const margin = mid.price > 0 ? safeDiv(profit, mid.price) * 100 : 0
  const status = getMarginStatus(margin)

  return {
    grossRevenue: mid.price,
    discountsConceded: 0,
    revenueAfterDiscount: mid.price,
    totalCost: mid.cost,
    feeAmount,
    profit,
    marginPercent: margin,
    status,
    unitCount: 3,
    customerSavings: 0,
    customerSavingsPercent: 0,
    normalPrice: mid.price,
    offerPrice: mid.price,
    profitPerUnit: profit,
    normalProfit: profit,
    profitDifference: 0,
    minPriceForMargin: null,
    details: [
      ...details,
      { label: 'Faturamento (kit intermediário)', value: money(mid.price) },
      { label: 'Lucro (kit intermediário)', value: money(profit), highlight: true },
      { label: 'Margem (kit intermediário)', value: margin.toFixed(1) + '%', highlight: true },
    ],
    warnings: levels.filter((l) => {
      const fee = calcFee(l.price, feePercent, feeFixed)
      return l.price - fee - l.cost < 0
    }).map((l) => `O kit ${l.name} gera prejuízo. Ajuste o preço ou os itens.`),
  }
}

// ─── Strategy 12: Monte seu combo ───
function simMonteCombo(f: Record<string, number>): OfferSimResult | null {
  const avgCost = f.avgCost || 0
  const avgPrice = f.avgPrice || 0
  const itemCount = Math.round(f.itemCount || 0)
  const comboPrice = f.comboPrice || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (avgCost <= 0 || avgPrice <= 0 || itemCount < 2 || comboPrice <= 0) return null

  const totalCost = avgCost * itemCount
  const feeAmount = calcFee(comboPrice, feePercent, feeFixed)
  const normalPrice = avgPrice * itemCount
  const normalProfit = normalPrice - calcFee(normalPrice, feePercent, feeFixed) - totalCost
  const effectiveDiscount = normalPrice > 0 ? ((normalPrice - comboPrice) / normalPrice) * 100 : 0

  return buildResult({
    grossRevenue: normalPrice,
    discountsConceded: normalPrice - comboPrice,
    totalCost,
    feeAmount,
    unitCount: itemCount,
    normalPrice,
    offerPrice: comboPrice,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [
      { label: 'Itens no combo', value: String(itemCount) },
      { label: 'Desconto efetivo', value: effectiveDiscount.toFixed(1) + '%' },
    ],
  })
}

// ─── Strategy 13: Brinde estratégico ───
function simBrinde(f: Record<string, number>): OfferSimResult | null {
  const productCost = f.productCost || 0
  const productPrice = f.productPrice || 0
  const giftCost = f.giftCost || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (productCost <= 0 || productPrice <= 0 || giftCost <= 0) return null

  const totalCost = productCost + giftCost + additionalCosts
  const feeAmount = calcFee(productPrice, feePercent, feeFixed)
  const normalProfit = productPrice - calcFee(productPrice, feePercent, feeFixed) - productCost - additionalCosts
  const equivalentDiscount = productPrice > 0 ? (giftCost / productPrice) * 100 : 0

  return buildResult({
    grossRevenue: productPrice,
    discountsConceded: 0,
    totalCost,
    feeAmount,
    unitCount: 1,
    normalPrice: productPrice,
    offerPrice: productPrice,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [
      { label: 'Custo do brinde', value: money(giftCost) },
      { label: 'Equivalente a desconto de', value: equivalentDiscount.toFixed(1) + '%' },
    ],
  })
}

// ─── Strategy 14: Frete grátis ───
function simFreteGratis(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const quantity = Math.round(f.quantity || 0)
  const shippingCost = f.shippingCost || 0
  const minPurchase = f.minPurchase || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || quantity < 1 || shippingCost <= 0) return null

  const revenue = originalPrice * quantity
  const totalCost = cost * quantity + shippingCost
  const feeAmount = calcFee(revenue, feePercent, feeFixed)
  const normalProfit = revenue - calcFee(revenue, feePercent, feeFixed) - cost * quantity

  const warnings: string[] = []
  if (minPurchase > 0 && revenue < minPurchase) {
    warnings.push(`A receita (${money(revenue)}) está abaixo do valor mínimo de ${money(minPurchase)} para frete grátis. Ajuste a quantidade ou o valor mínimo.`)
  }

  return buildResult({
    grossRevenue: revenue,
    discountsConceded: 0,
    totalCost,
    feeAmount,
    unitCount: quantity,
    normalPrice: revenue,
    offerPrice: revenue,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [
      { label: 'Frete subsidiado', value: money(shippingCost) },
      { label: 'Valor mínimo para frete grátis', value: money(minPurchase) },
    ],
    extraWarnings: warnings,
  })
}

// ─── Strategy 15: Presente no kit ───
function simPresenteKit(f: Record<string, number>): OfferSimResult | null {
  const kitCost = f.kitCost || 0
  const kitPrice = f.kitPrice || 0
  const giftCost = f.giftCost || 0
  const itemCount = Math.round(f.itemCount || 0)
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (kitCost <= 0 || kitPrice <= 0 || giftCost <= 0) return null

  const totalCost = kitCost + giftCost
  const feeAmount = calcFee(kitPrice, feePercent, feeFixed)
  const normalProfit = kitPrice - calcFee(kitPrice, feePercent, feeFixed) - kitCost

  return buildResult({
    grossRevenue: kitPrice,
    discountsConceded: 0,
    totalCost,
    feeAmount,
    unitCount: itemCount + 1,
    normalPrice: kitPrice,
    offerPrice: kitPrice,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [
      { label: 'Custo do presente', value: money(giftCost) },
      { label: 'Custo sem o presente seria', value: money(kitCost) },
    ],
  })
}

// ─── Strategy 16: Embalagem especial ───
function simEmbalagem(f: Record<string, number>): OfferSimResult | null {
  const productCost = f.productCost || 0
  const productPrice = f.productPrice || 0
  const packagingCost = f.packagingCost || 0
  const packagingPrice = f.packagingPrice || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (productCost <= 0 || productPrice <= 0 || packagingCost <= 0 || packagingPrice <= 0) return null

  const revenue = productPrice + packagingPrice
  const totalCost = productCost + packagingCost
  const feeAmount = calcFee(revenue, feePercent, feeFixed)
  const normalProfit = productPrice - calcFee(productPrice, feePercent, feeFixed) - productCost
  const packagingMargin = packagingPrice - packagingCost

  return buildResult({
    grossRevenue: revenue,
    discountsConceded: 0,
    totalCost,
    feeAmount,
    unitCount: 1,
    normalPrice: productPrice,
    offerPrice: revenue,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [
      { label: 'Valor da personalização', value: money(packagingPrice) },
      { label: 'Custo da embalagem', value: money(packagingCost) },
      { label: 'Margem da personalização', value: money(packagingMargin) },
    ],
  })
}

// ─── Strategy 17: Benefício por valor mínimo ───
function simBeneficioValor(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const benefitCost = f.benefitCost || 0
  const minPurchase = f.minPurchase || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || benefitCost <= 0) return null

  const totalCost = cost + benefitCost
  const feeAmount = calcFee(originalPrice, feePercent, feeFixed)
  const normalProfit = originalPrice - calcFee(originalPrice, feePercent, feeFixed) - cost

  const warnings: string[] = []
  if (minPurchase > 0 && originalPrice < minPurchase) {
    warnings.push(`O preço (${money(originalPrice)}) está abaixo do valor mínimo de ${money(minPurchase)}. O benefício só deve ser entregue se a compra atingir o mínimo.`)
  }

  return buildResult({
    grossRevenue: originalPrice,
    discountsConceded: 0,
    totalCost,
    feeAmount,
    unitCount: 1,
    normalPrice: originalPrice,
    offerPrice: originalPrice,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [
      { label: 'Custo do benefício', value: money(benefitCost) },
      { label: 'Valor mínimo de compra', value: money(minPurchase) },
    ],
    extraWarnings: warnings,
  })
}

// ─── Strategies 23, 24, 25, 26, 30: Percent discount with optional min purchase ───
function simPercentDiscountWithMin(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const discountPercent = f.discountPercent || 0
  const minPurchase = f.minPurchase || 0
  const additionalCosts = f.additionalCosts || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || discountPercent <= 0) return null

  const disc = calculateDiscount(originalPrice, discountPercent, cost + additionalCosts, feePercent, feeFixed)
  const normalProfit = originalPrice - calcFee(originalPrice, feePercent, feeFixed) - cost - additionalCosts

  const warnings: string[] = []
  if (minPurchase > 0 && disc.finalPrice < minPurchase) {
    warnings.push(`O preço com desconto (${money(disc.finalPrice)}) fica abaixo da compra mínima de ${money(minPurchase)}. Ajuste o desconto ou a compra mínima.`)
  }

  return buildResult({
    grossRevenue: originalPrice,
    discountsConceded: disc.discountValue,
    totalCost: cost + additionalCosts,
    feeAmount: disc.feeAmount,
    unitCount: 1,
    normalPrice: originalPrice,
    offerPrice: disc.finalPrice,
    normalProfit,
    targetMarginPercent: 15,
    extraDetails: [{ label: 'Desconto aplicado', value: discountPercent.toFixed(0) + '%' }],
    extraWarnings: warnings,
  })
}

// ─── Strategy 27: Indique um amigo ───
function simIndiqueAmigo(f: Record<string, number>): OfferSimResult | null {
  const cost = f.cost || 0
  const originalPrice = f.originalPrice || 0
  const referrerBenefit = f.referrerBenefit || 0
  const referredBenefit = f.referredBenefit || 0
  const feePercent = f.feePercent || 0
  const feeFixed = f.feeFixed || 0

  if (cost <= 0 || originalPrice <= 0 || referrerBenefit <= 0 || referredBenefit <= 0) return null

  const friendPrice = Math.max(0, originalPrice - referredBenefit)
  const feeAmount = calcFee(friendPrice, feePercent, feeFixed)
  const totalCost = cost
  const profit = friendPrice - feeAmount - totalCost
  const normalProfit = originalPrice - calcFee(originalPrice, feePercent, feeFixed) - cost

  // For referrer: benefit is a discount on their next purchase
  const details: OfferDetailLine[] = [
    { label: 'Amigo indicado paga', value: money(friendPrice), highlight: true },
    { label: 'Benefício do amigo', value: money(referredBenefit) },
    { label: 'Benefício de quem indicou', value: money(referrerBenefit) + ' (próxima compra)' },
    { label: 'Custo total (amigo)', value: money(totalCost) },
    { label: 'Lucro na compra do amigo', value: money(profit), highlight: true },
    { label: 'Margem na compra do amigo', value: (friendPrice > 0 ? safeDiv(profit, friendPrice) * 100 : 0).toFixed(1) + '%', highlight: true },
    { label: 'Lucro vs venda normal', value: (profit >= normalProfit ? '+' : '') + money(profit - normalProfit) },
  ]

  const warnings: string[] = []
  if (profit < 0) {
    warnings.push(`A compra do amigo indicado gera prejuízo de ${money(Math.abs(profit))}. Considere reduzir o benefício.`)
  }
  // Check referrer's next purchase impact
  const referrerNextProfit = (originalPrice - referrerBenefit) - calcFee(originalPrice - referrerBenefit, feePercent, feeFixed) - cost
  if (referrerNextProfit < 0) {
    warnings.push(`A próxima compra de quem indicou (com benefício de ${money(referrerBenefit)}) gera prejuízo. Considere um benefício menor.`)
  }

  return {
    grossRevenue: originalPrice,
    discountsConceded: referredBenefit,
    revenueAfterDiscount: friendPrice,
    totalCost,
    feeAmount,
    profit,
    marginPercent: friendPrice > 0 ? safeDiv(profit, friendPrice) * 100 : 0,
    status: getMarginStatus(friendPrice > 0 ? safeDiv(profit, friendPrice) * 100 : 0),
    unitCount: 1,
    customerSavings: referredBenefit,
    customerSavingsPercent: originalPrice > 0 ? safeDiv(referredBenefit, originalPrice) * 100 : 0,
    normalPrice: originalPrice,
    offerPrice: friendPrice,
    profitPerUnit: profit,
    normalProfit,
    profitDifference: profit - normalProfit,
    minPriceForMargin: null,
    details,
    warnings,
  }
}
