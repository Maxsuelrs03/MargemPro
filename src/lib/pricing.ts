export interface PricingInput {
  cost: number
  additionalCosts: number
  feePercent: number
  feeFixed: number
  marginPercent: number
}

export interface PricingResult {
  totalCost: number
  feeAmount: number
  priceBeforeMargin: number
  suggestedPrice: number
  profit: number
  marginPercent: number
  markupPercent: number
}

export interface DiscountResult {
  originalPrice: number
  discountPercent: number
  discountValue: number
  finalPrice: number
  feeAmount: number
  totalCost: number
  profit: number
  marginPercent: number
}

export function calculatePricing(input: PricingInput): PricingResult {
  const { cost, additionalCosts, feePercent, feeFixed, marginPercent } = input

  const totalCost = cost + additionalCosts

  // The seller wants a net margin after fees.
  // Price must cover: totalCost + fees + profit
  // fees = price * (feePercent/100) + feeFixed
  // profit = price * (marginPercent/100)
  // price = totalCost + price*(feePercent/100) + feeFixed + price*(marginPercent/100)
  // price * (1 - feePercent/100 - marginPercent/100) = totalCost + feeFixed
  const divisor = 1 - feePercent / 100 - marginPercent / 100

  let suggestedPrice: number
  if (divisor <= 0) {
    // Margins and fees exceed 100% — not viable
    suggestedPrice = NaN
  } else {
    suggestedPrice = (totalCost + feeFixed) / divisor
  }

  const feeAmount = suggestedPrice * (feePercent / 100) + feeFixed
  const priceBeforeMargin = totalCost + feeAmount
  const profit = suggestedPrice - priceBeforeMargin
  const actualMargin = suggestedPrice > 0 ? (profit / suggestedPrice) * 100 : 0
  const markupPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0

  return {
    totalCost,
    feeAmount,
    priceBeforeMargin,
    suggestedPrice,
    profit,
    marginPercent: actualMargin,
    markupPercent,
  }
}

export function calculateDiscount(
  originalPrice: number,
  discountPercent: number,
  totalCost: number,
  feePercent: number,
  feeFixed: number,
): DiscountResult {
  const discountValue = originalPrice * (discountPercent / 100)
  const finalPrice = originalPrice - discountValue
  const feeAmount = finalPrice * (feePercent / 100) + feeFixed
  const profit = finalPrice - feeAmount - totalCost
  const marginPercent = finalPrice > 0 ? (profit / finalPrice) * 100 : 0

  return {
    originalPrice,
    discountPercent,
    discountValue,
    finalPrice,
    feeAmount,
    totalCost,
    profit,
    marginPercent,
  }
}

export type MarginStatus = 'good' | 'low' | 'warning' | 'loss'

export function getMarginStatus(marginPercent: number): MarginStatus {
  if (marginPercent < 0) return 'loss'
  if (marginPercent < 5) return 'warning'
  if (marginPercent < 15) return 'low'
  return 'good'
}
