import type { OfferSimResult } from '../lib/offerSimulation'
import type { MessageFormData } from '../lib/messageGenerator'
import type { ObjectiveId } from '../lib/strategyTypes'

export type FlowStep =
  | 'produto'
  | 'precificacao'
  | 'recomendacao'
  | 'simulacao'
  | 'apresentacao'
  | 'campanhas'

export const FLOW_STEPS: { id: FlowStep; label: string; shortLabel: string }[] = [
  { id: 'produto', label: 'Produto', shortLabel: 'Produto' },
  { id: 'precificacao', label: 'Precificação', shortLabel: 'Preço' },
  { id: 'recomendacao', label: 'Recomendação', shortLabel: 'Ofertas' },
  { id: 'simulacao', label: 'Simulação', shortLabel: 'Simular' },
  { id: 'apresentacao', label: 'Apresentação', shortLabel: 'Texto' },
  { id: 'campanhas', label: 'Campanhas', shortLabel: 'Anúncio' },
]

export interface Product {
  id: string
  name: string
  type?: string
  cost: number
  additionalCosts: number
  feePercent: number
  feeFixed: number
  marginPercent: number
  createdAt: string
  updatedAt: string
}

export interface SavedOffer {
  id: string
  productId?: string
  productName: string
  strategyId: string
  strategyName: string
  fieldValues: Record<string, string>
  simResult: OfferSimResult
  presentation?: MessageFormData
  productSignature: string
  createdAt: string
  updatedAt: string
}

export interface CampaignDraft {
  format: string
  styleId: string
  title: string
  body: string
  price: string
  originalPrice: string
  discountPercent: string
  cta: string
  primaryColor: string
  secondaryColor: string
}

export interface FlowDraft {
  step: FlowStep
  product: Product
  objective: ObjectiveId | null
  selectedStrategyId: string | null
  fieldValues: Record<string, string>
  simResult: OfferSimResult | null
  presentation: MessageFormData
  campaignDraft: CampaignDraft | null
  startedAt: string
  pricingSignature: string
}

export function createEmptyProduct(): Product {
  const now = new Date().toISOString()
  return {
    id: '',
    name: '',
    type: '',
    cost: 0,
    additionalCosts: 0,
    feePercent: 0,
    feeFixed: 0,
    marginPercent: 30,
    createdAt: now,
    updatedAt: now,
  }
}

export function createEmptyFlow(): FlowDraft {
  return {
    step: 'produto',
    product: createEmptyProduct(),
    objective: null,
    selectedStrategyId: null,
    fieldValues: {},
    simResult: null,
    presentation: {
      productName: '',
      productType: '',
      normalPrice: '',
      promoPrice: '',
      benefit: '',
      audience: '',
      objective: '',
      deadline: '',
      quantity: '',
      channel: 'whatsapp',
      style: 'direto',
    },
    campaignDraft: null,
    startedAt: new Date().toISOString(),
    pricingSignature: '',
  }
}

export function productSignature(p: Pick<Product, 'cost' | 'additionalCosts' | 'feePercent' | 'feeFixed' | 'marginPercent'>): string {
  return `${p.cost}|${p.additionalCosts}|${p.feePercent}|${p.feeFixed}|${p.marginPercent}`
}
