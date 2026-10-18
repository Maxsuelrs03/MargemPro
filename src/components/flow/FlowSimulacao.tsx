import { useState, useMemo, useCallback } from 'react'
import { useMargemPro } from '../../state/AppContext'
import { strategies } from '../../lib/strategyData'
import { simulateOffer, type OfferSimResult } from '../../lib/offerSimulation'
import { categories } from '../../lib/strategyTypes'
import { type MarginStatus } from '../../lib/pricing'
import { formatCurrency } from '../../lib/format'
import { numberToInputText } from '../../lib/numbers'
import { productSignature, type SavedOffer } from '../../state/types'
import {
  CheckCircleIcon,
  AlertIcon,
  TrendingDownIcon,
  CopyIcon,
  TargetIcon,
} from '../Icons'
import { SaveIcon } from '../PresentationIcons'

const statusConfig: Record<MarginStatus, { label: string; bg: string; text: string; border: string }> = {
  good: { label: 'Margem saudável', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  low: { label: 'Margem baixa', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  warning: { label: 'Margem muito baixa', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  loss: { label: 'Prejuízo!', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

export function FlowSimulacao() {
  const { state, actions } = useMargemPro()
  const [showStrategyList, setShowStrategyList] = useState(!state.flow.selectedStrategyId)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const selectedStrategy = useMemo(
    () => strategies.find((s) => s.id === state.flow.selectedStrategyId) || null,
    [state.flow.selectedStrategyId],
  )

  const simResult = useMemo<OfferSimResult | null>(() => {
    if (!selectedStrategy) return null
    const hasRequired = selectedStrategy.fields.every((f) => {
      if (!f.required) return true
      const v = state.flow.fieldValues[f.id]
      return v && v.trim() !== ''
    })
    if (!hasRequired) return null
    return simulateOffer(selectedStrategy.id, state.flow.fieldValues)
  }, [selectedStrategy, state.flow.fieldValues])

  const updateField = useCallback((id: string, value: string) => {
    actions.setFieldValues({ ...state.flow.fieldValues, [id]: value })
  }, [actions, state.flow.fieldValues])

  function selectStrategy(strategyId: string) {
    actions.selectStrategy(strategyId)
    actions.setFieldValues({})
    setShowStrategyList(false)
  }

  function handleCopy() {
    if (!simResult || !selectedStrategy) return
    const lines = simResult.details.map((d) => `${d.label}: ${d.value}`)
    const text = `${selectedStrategy.name}\n\n${lines.join('\n')}\n\nCriado no MargemPro`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleSaveOffer() {
    if (!simResult || !selectedStrategy) return
    const sig = productSignature(state.flow.product)
    const offer: SavedOffer = {
      id: '',
      productName: state.flow.product.name || 'Produto sem nome',
      strategyId: selectedStrategy.id,
      strategyName: selectedStrategy.name,
      fieldValues: { ...state.flow.fieldValues },
      simResult,
      productSignature: sig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    actions.saveOffer(offer)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Pre-fill field values from product data
  function prefillFromProduct() {
    if (!selectedStrategy) return
    const p = state.flow.product
    const vals: Record<string, string> = {}
    for (const field of selectedStrategy.fields) {
      if (field.id === 'cost') vals[field.id] = numberToInputText(p.cost)
      else if (field.id === 'additionalCosts') vals[field.id] = numberToInputText(p.additionalCosts)
      else if (field.id === 'feePercent') vals[field.id] = numberToInputText(p.feePercent)
      else if (field.id === 'feeFixed') vals[field.id] = numberToInputText(p.feeFixed)
      else if (field.id === 'originalPrice' && pricingResult) vals[field.id] = String(state.flow.product.cost > 0 ? '' : '')
    }
    actions.setFieldValues(vals)
  }

  const { pricingResult } = useMargemPro()

  return (
    <div className="space-y-5">
      {/* Strategy selector */}
      {showStrategyList ? (
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Escolha uma estratégia</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
            {strategies.map((s) => {
              const cat = categories.find((c) => c.id === s.category)
              return (
                <button
                  key={s.id}
                  onClick={() => selectStrategy(s.id)}
                  className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-primary-300 hover:bg-primary-50"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-500">
                    {s.number}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{s.shortName}</p>
                    <p className="text-xs text-slate-400">{cat?.shortLabel}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        selectedStrategy && (
          <>
            {/* Selected strategy header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-600">
                  {selectedStrategy.number}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedStrategy.name}</h3>
                  <p className="text-sm text-slate-500">{selectedStrategy.objective}</p>
                </div>
              </div>
              <button
                onClick={() => setShowStrategyList(true)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Trocar
              </button>
            </div>

            {/* Simulator form */}
            <div className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Monte sua oferta</h4>
                <button
                  onClick={prefillFromProduct}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  Usar dados do produto
                </button>
              </div>
              <div className="space-y-4">
                {selectedStrategy.fields.map((field) => {
                  const isCurrency = field.type === 'currency'
                  const isPercent = field.type === 'percent'
                  const isInteger = field.type === 'integer'
                  return (
                    <div key={field.id}>
                      <label className="input-label" htmlFor={`fs-${field.id}`}>
                        {field.label}
                        {field.required && <span className="text-red-500"> *</span>}
                      </label>
                      <div className="relative">
                        {isCurrency && (
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                        )}
                        <input
                          id={`fs-${field.id}`}
                          type="text"
                          inputMode={isInteger ? 'numeric' : 'decimal'}
                          value={state.flow.fieldValues[field.id] || ''}
                          onChange={(e) => updateField(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className={`input-field ${isCurrency ? 'pl-11' : ''} ${isPercent ? 'pr-9' : ''}`}
                        />
                        {isPercent && (
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                        )}
                      </div>
                      {field.helpText && <p className="mt-1.5 text-xs text-slate-400">{field.helpText}</p>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Results */}
            {simResult ? (
              <div className="space-y-4 animate-fade-in">
                <div className="card overflow-hidden">
                  <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-5 py-6 text-white">
                    <p className="text-sm font-medium text-primary-100">Preço da oferta</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                      {formatCurrency(simResult.offerPrice)}
                    </p>
                    {simResult.customerSavings > 0 && (
                      <p className="mt-1.5 text-sm text-primary-100">
                        Cliente economiza {formatCurrency(simResult.customerSavings)} ({simResult.customerSavingsPercent.toFixed(0)}%)
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/25"
                      >
                        <CopyIcon className="w-3.5 h-3.5" />
                        {copied ? 'Copiado!' : 'Copiar resumo'}
                      </button>
                      <button
                        onClick={handleSaveOffer}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/25"
                      >
                        <SaveIcon className="w-3.5 h-3.5" />
                        {saved ? 'Oferta salva!' : 'Salvar oferta'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 p-5">
                    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${statusConfig[simResult.status].bg} ${statusConfig[simResult.status].border}`}>
                      {simResult.status === 'good' && <CheckCircleIcon className={`w-5 h-5 ${statusConfig[simResult.status].text}`} />}
                      {(simResult.status === 'low' || simResult.status === 'warning') && <AlertIcon className={`w-5 h-5 ${statusConfig[simResult.status].text}`} />}
                      {simResult.status === 'loss' && <TrendingDownIcon className={`w-5 h-5 ${statusConfig[simResult.status].text}`} />}
                      <span className={`text-sm font-medium ${statusConfig[simResult.status].text}`}>
                        {statusConfig[simResult.status].label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Lucro estimado</p>
                        <p className={`mt-0.5 text-lg font-bold ${simResult.profit >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                          {formatCurrency(simResult.profit)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Margem</p>
                        <p className={`mt-0.5 text-lg font-bold ${simResult.marginPercent < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                          {simResult.marginPercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-100 pt-3">
                      {simResult.details.map((detail, i) => (
                        <div key={i} className={`flex items-center justify-between text-sm ${detail.highlight ? 'font-semibold' : ''}`}>
                          <span className={detail.highlight ? 'text-slate-900' : 'text-slate-500'}>{detail.label}</span>
                          <span className={detail.highlight ? 'text-slate-900' : 'text-slate-600'}>{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {simResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    {simResult.warnings.map((warning, i) => (
                      <div key={i} className={`flex items-start gap-2 rounded-lg p-3 ${simResult.status === 'loss' ? 'bg-red-50' : 'bg-amber-50'}`}>
                        <AlertIcon className={`mt-0.5 w-4 h-4 flex-shrink-0 ${simResult.status === 'loss' ? 'text-red-600' : 'text-amber-600'}`} />
                        <p className={`text-xs ${simResult.status === 'loss' ? 'text-red-800' : 'text-amber-800'}`}>{warning}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="card flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <TargetIcon className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Preencha os campos obrigatórios para ver o resultado da simulação.
                </p>
              </div>
            )}
          </>
        )
      )}
    </div>
  )
}
