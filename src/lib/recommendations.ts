import { calculateDiscount } from './pricing'
import { strategies } from './strategyData'
import { objectives, type ObjectiveId, type Strategy, type CategoryId } from './strategyTypes'

export interface RecommendationInput {
  cost: number
  totalCost: number
  suggestedPrice: number
  marginPercent: number
  feePercent: number
  feeFixed: number
  objective: ObjectiveId | null
  hasComplementaryProducts?: boolean
  isStagnantStock?: boolean
  isNewProduct?: boolean
}

export interface Recommendation {
  strategy: Strategy
  score: number
  reasons: string[]
  fitLabel: 'ideal' | 'bom' | 'arriscado'
}

function maxSafeDiscountPercent(
  price: number,
  totalCost: number,
  feePercent: number,
  feeFixed: number,
  minMargin: number = 12,
): number {
  for (let d = 1; d <= 80; d++) {
    const r = calculateDiscount(price, d, totalCost, feePercent, feeFixed)
    if (r.marginPercent < minMargin) {
      return d - 1
    }
  }
  return 80
}

export function recommendStrategies(input: RecommendationInput, limit = 5): Recommendation[] {
  const maxDiscount = maxSafeDiscountPercent(
    input.suggestedPrice,
    input.totalCost,
    input.feePercent,
    input.feeFixed,
  )

  const results: Recommendation[] = []

  for (const strategy of strategies) {
    const reasons: string[] = []
    let score = 0

    // 1. Objective match
    if (input.objective && strategy.objectives.includes(input.objective)) {
      score += 30
      const objInfo = objectives.find((o) => o.id === input.objective)
      reasons.push(`Combina com o objetivo "${objInfo?.label ?? input.objective}".`)
    }

    // 2. Margin-based scoring
    if (input.marginPercent >= 45) {
      if (strategy.category === 'B') {
        score += 15
        reasons.push('Sua margem é alta o suficiente para combos sem perder rentabilidade.')
      }
      if (strategy.category === 'C') {
        score += 12
        reasons.push('Margem confortável permite agregar benefícios sem descontar.')
      }
      if (strategy.category === 'A') {
        score += 5
      }
    } else if (input.marginPercent >= 15 && input.marginPercent < 45) {
      if (strategy.category === 'A') {
        score += 5
        reasons.push('Descontos moderados são viáveis com sua margem atual.')
      }
      if (strategy.category === 'D') {
        score += 8
      }
    } else if (input.marginPercent < 15 && input.marginPercent >= 0) {
      if (strategy.category === 'A') {
        score -= 20
        reasons.push('Sua margem está baixa — descontos podem gerar prejuízo.')
      }
      if (strategy.category === 'D') {
        score += 15
        reasons.push('Estratégias de girar estoque podem ajudar a recuperar capital parado.')
      }
      if (strategy.category === 'C') {
        score += 8
      }
    } else if (input.marginPercent < 0) {
      if (strategy.category === 'A') {
        score -= 40
        reasons.push('Atenção: seu produto está com prejuízo. Qualquer desconto agrava a perda.')
      }
      if (strategy.category === 'D') {
        score += 10
      }
    }

    // 3. Feasibility check for discount strategies
    const isDiscountStrategy = strategy.category === 'A'
    if (isDiscountStrategy && maxDiscount < 10) {
      score -= 15
      reasons.push(`Com sua margem atual, o desconto máximo seguro é apenas ${maxDiscount}%.`)
    }

    // 4. Context hints
    if (input.isStagnantStock && strategy.category === 'D') {
      score += 25
      reasons.push('Ideal para girar estoque parado.')
    }
    if (input.isNewProduct && strategy.id === 'lancamento-produto') {
      score += 25
      reasons.push('Estratégia específica para lançamentos.')
    }
    if (input.hasComplementaryProducts && (strategy.id === 'combo-complementares' || strategy.id === 'kit-preco-fechado' || strategy.id === 'produto-com-acessorio')) {
      score += 20
      reasons.push('Você indicou que tem produtos complementares — combos são uma boa opção.')
    }

    // 5. Base score so every strategy gets considered
    score += 10

    // Determine fit
    let fitLabel: Recommendation['fitLabel'] = 'arriscado'
    if (score >= 55) fitLabel = 'ideal'
    else if (score >= 35) fitLabel = 'bom'

    if (reasons.length === 0) {
      reasons.push('Estratégia disponível no Banco de Ofertas.')
    }

    results.push({ strategy, score, reasons, fitLabel })
  }

  // 6. Penalize category duplication
  const sorted = [...results].sort((a, b) => b.score - a.score)
  const seenCategories = new Map<CategoryId, number>()
  for (const rec of sorted) {
    const count = seenCategories.get(rec.strategy.category) || 0
    if (count >= 2) {
      rec.score -= 8
    }
    seenCategories.set(rec.strategy.category, count + 1)
  }

  // Re-sort and take top N
  const finalSorted = sorted.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.strategy.number - b.strategy.number
  })

  return finalSorted.slice(0, limit)
}
