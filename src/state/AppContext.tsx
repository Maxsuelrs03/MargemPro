import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { calculatePricing, type PricingResult } from '../lib/pricing'
import { STORAGE_KEYS, load, save } from './persistence'
import {
  type FlowDraft,
  type FlowStep,
  type Product,
  type SavedOffer,
  type CampaignDraft,
  createEmptyFlow,
  productSignature,
} from './types'
import type { MessageFormData } from '../lib/messageGenerator'
import type { ObjectiveId } from '../lib/strategyTypes'
import { uid } from '../lib/id'

interface AppState {
  flow: FlowDraft
  products: Product[]
  offers: SavedOffer[]
  favorites: string[]
}

type Action =
  | { type: 'FLOW_SET_STEP'; step: FlowStep }
  | { type: 'FLOW_PATCH_PRODUCT'; patch: Partial<Product> }
  | { type: 'FLOW_SET_OBJECTIVE'; objective: ObjectiveId | null }
  | { type: 'FLOW_SELECT_STRATEGY'; strategyId: string | null }
  | { type: 'FLOW_SET_FIELD_VALUES'; values: Record<string, string> }
  | { type: 'FLOW_SET_SIM_RESULT'; result: SavedOffer['simResult'] | null }
  | { type: 'FLOW_SET_PRESENTATION'; data: MessageFormData }
  | { type: 'FLOW_SET_CAMPAIGN'; draft: CampaignDraft | null }
  | { type: 'FLOW_RESET' }
  | { type: 'FLOW_LOAD'; draft: FlowDraft }
  | { type: 'PRODUCT_CREATE'; product: Product }
  | { type: 'PRODUCT_UPDATE'; product: Product }
  | { type: 'PRODUCT_DELETE'; id: string }
  | { type: 'OFFER_CREATE'; offer: SavedOffer }
  | { type: 'OFFER_UPDATE'; offer: SavedOffer }
  | { type: 'OFFER_DELETE'; id: string }
  | { type: 'FAVORITE_TOGGLE'; id: string }
  | { type: 'IMPORT_DATA'; products: Product[]; offers: SavedOffer[] }

function init(): AppState {
  const flow = load<FlowDraft | null>(STORAGE_KEYS.flow, null)
  const products = load<Product[]>(STORAGE_KEYS.products, [])
  const offers = load<SavedOffer[]>(STORAGE_KEYS.offers, [])
  const favorites = load<string[]>(STORAGE_KEYS.favorites, [])
  return {
    flow: flow ?? createEmptyFlow(),
    products,
    offers,
    favorites,
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'FLOW_SET_STEP':
      return { ...state, flow: { ...state.flow, step: action.step } }
    case 'FLOW_PATCH_PRODUCT':
      return { ...state, flow: { ...state.flow, product: { ...state.flow.product, ...action.patch, updatedAt: new Date().toISOString() } } }
    case 'FLOW_SET_OBJECTIVE':
      return { ...state, flow: { ...state.flow, objective: action.objective } }
    case 'FLOW_SELECT_STRATEGY':
      return { ...state, flow: { ...state.flow, selectedStrategyId: action.strategyId } }
    case 'FLOW_SET_FIELD_VALUES':
      return { ...state, flow: { ...state.flow, fieldValues: action.values } }
    case 'FLOW_SET_SIM_RESULT':
      return { ...state, flow: { ...state.flow, simResult: action.result } }
    case 'FLOW_SET_PRESENTATION':
      return { ...state, flow: { ...state.flow, presentation: action.data } }
    case 'FLOW_SET_CAMPAIGN':
      return { ...state, flow: { ...state.flow, campaignDraft: action.draft } }
    case 'FLOW_RESET':
      return { ...state, flow: createEmptyFlow() }
    case 'FLOW_LOAD':
      return { ...state, flow: action.draft }
    case 'PRODUCT_CREATE':
      return { ...state, products: [...state.products, action.product] }
    case 'PRODUCT_UPDATE':
      return { ...state, products: state.products.map((p) => (p.id === action.product.id ? action.product : p)) }
    case 'PRODUCT_DELETE':
      return { ...state, products: state.products.filter((p) => p.id !== action.id) }
    case 'OFFER_CREATE':
      return { ...state, offers: [...state.offers, action.offer] }
    case 'OFFER_UPDATE':
      return { ...state, offers: state.offers.map((o) => (o.id === action.offer.id ? action.offer : o)) }
    case 'OFFER_DELETE':
      return { ...state, offers: state.offers.filter((o) => o.id !== action.id) }
    case 'FAVORITE_TOGGLE':
      return {
        ...state,
        favorites: state.favorites.includes(action.id)
          ? state.favorites.filter((f) => f !== action.id)
          : [...state.favorites, action.id],
      }
    case 'IMPORT_DATA':
      return { ...state, products: [...state.products, ...action.products], offers: [...state.offers, ...action.offers] }
    default:
      return state
  }
}

interface MargemProContextValue {
  state: AppState
  pricingResult: PricingResult | null
  recalcNeeded: boolean
  actions: {
    setStep: (step: FlowStep) => void
    patchProduct: (patch: Partial<Product>) => void
    setObjective: (objective: ObjectiveId | null) => void
    selectStrategy: (strategyId: string | null) => void
    setFieldValues: (values: Record<string, string>) => void
    setSimResult: (result: SavedOffer['simResult'] | null) => void
    setPresentation: (data: MessageFormData) => void
    setCampaign: (draft: CampaignDraft | null) => void
    resetFlow: () => void
    loadFlow: (draft: FlowDraft) => void
    saveProduct: (product: Product) => void
    deleteProduct: (id: string) => void
    saveOffer: (offer: SavedOffer) => void
    deleteOffer: (id: string) => void
    toggleFavorite: (id: string) => void
    newProduct: () => Product
    newOffer: (partial: Partial<SavedOffer>) => SavedOffer
    importData: (products: Product[], offers: SavedOffer[]) => void
  }
}

const MargemProContext = createContext<MargemProContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  useEffect(() => { save(STORAGE_KEYS.flow, state.flow) }, [state.flow])
  useEffect(() => { save(STORAGE_KEYS.products, state.products) }, [state.products])
  useEffect(() => { save(STORAGE_KEYS.offers, state.offers) }, [state.offers])
  useEffect(() => { save(STORAGE_KEYS.favorites, state.favorites) }, [state.favorites])

  const pricingResult = useMemo<PricingResult | null>(() => {
    const p = state.flow.product
    if (p.cost <= 0 || p.marginPercent <= 0) return null
    const divisor = 1 - p.feePercent / 100 - p.marginPercent / 100
    if (divisor <= 0) return null
    return calculatePricing({
      cost: p.cost,
      additionalCosts: p.additionalCosts,
      feePercent: p.feePercent,
      feeFixed: p.feeFixed,
      marginPercent: p.marginPercent,
    })
  }, [state.flow.product])

  const recalcNeeded = useMemo(() => {
    if (!state.flow.simResult) return false
    const currentSig = productSignature(state.flow.product)
    return state.flow.pricingSignature !== '' && state.flow.pricingSignature !== currentSig
  }, [state.flow.simResult, state.flow.pricingSignature, state.flow.product])

  const actions = useMemo<MargemProContextValue['actions']>(() => ({
    setStep: (step) => dispatch({ type: 'FLOW_SET_STEP', step }),
    patchProduct: (patch) => dispatch({ type: 'FLOW_PATCH_PRODUCT', patch }),
    setObjective: (objective) => dispatch({ type: 'FLOW_SET_OBJECTIVE', objective }),
    selectStrategy: (strategyId) => dispatch({ type: 'FLOW_SELECT_STRATEGY', strategyId }),
    setFieldValues: (values) => dispatch({ type: 'FLOW_SET_FIELD_VALUES', values }),
    setSimResult: (result) => dispatch({ type: 'FLOW_SET_SIM_RESULT', result }),
    setPresentation: (data) => dispatch({ type: 'FLOW_SET_PRESENTATION', data }),
    setCampaign: (draft) => dispatch({ type: 'FLOW_SET_CAMPAIGN', draft }),
    resetFlow: () => dispatch({ type: 'FLOW_RESET' }),
    loadFlow: (draft) => dispatch({ type: 'FLOW_LOAD', draft }),
    saveProduct: (product) => {
      if (product.id) {
        dispatch({ type: 'PRODUCT_UPDATE', product })
      } else {
        dispatch({ type: 'PRODUCT_CREATE', product: { ...product, id: uid() } })
      }
    },
    deleteProduct: (id) => dispatch({ type: 'PRODUCT_DELETE', id }),
    saveOffer: (offer) => {
      if (offer.id) {
        dispatch({ type: 'OFFER_UPDATE', offer })
      } else {
        dispatch({ type: 'OFFER_CREATE', offer: { ...offer, id: uid() } })
      }
    },
    deleteOffer: (id) => dispatch({ type: 'OFFER_DELETE', id }),
    toggleFavorite: (id) => dispatch({ type: 'FAVORITE_TOGGLE', id }),
    newProduct: () => {
      const now = new Date().toISOString()
      return { id: '', name: '', type: '', cost: 0, additionalCosts: 0, feePercent: 0, feeFixed: 0, marginPercent: 30, createdAt: now, updatedAt: now }
    },
    newOffer: (partial) => {
      const now = new Date().toISOString()
      return { id: '', productName: '', strategyId: '', strategyName: '', fieldValues: {}, simResult: null as never, productSignature: '', createdAt: now, updatedAt: now, ...partial }
    },
    importData: (products, offers) => dispatch({ type: 'IMPORT_DATA', products, offers }),
  }), [])

  const value = useMemo(() => ({ state, pricingResult, recalcNeeded, actions }), [state, pricingResult, recalcNeeded, actions])

  return <MargemProContext.Provider value={value}>{children}</MargemProContext.Provider>
}

export function useMargemPro(): MargemProContextValue {
  const ctx = useContext(MargemProContext)
  if (!ctx) throw new Error('useMargemPro deve ser usado dentro de <AppProvider>')
  return ctx
}
