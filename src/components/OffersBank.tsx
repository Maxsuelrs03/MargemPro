import { useState, useMemo } from 'react'
import {
  type Strategy,
  type StrategyField,
  type ObjectiveId,
  strategies,
  objectives,
  getStrategiesByObjective,
} from '../lib/strategies'
import { simulateOffer, type OfferSimResult } from '../lib/offerSimulation'
import { type MarginStatus } from '../lib/pricing'
import {
  AlertIcon,
  CheckCircleIcon,
  TrendingDownIcon,
  InfoIcon,
  ArrowLeftIcon,
  CopyIcon,
  PercentIcon,
  LayersIcon,
  GiftIcon,
  FireIcon,
  HeartIcon,
  TrendingUpIcon,
  BoxIcon,
  TargetIcon,
  LightbulbIcon,
  RefreshIcon,
  TagIcon,
} from './Icons'

const statusConfig: Record<MarginStatus, { label: string; bg: string; text: string; border: string }> = {
  good: { label: 'Margem saudável', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  low: { label: 'Margem baixa', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  warning: { label: 'Margem muito baixa', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  loss: { label: 'Prejuízo!', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

const strategyIconMap: Record<string, typeof TagIcon> = {
  'desconto-direto': PercentIcon,
  'leve-mais-por-menos': LayersIcon,
  'combos-kits': BoxIcon,
  'desconto-progressivo': TrendingUpIcon,
  'brinde-estrategico': GiftIcon,
  'aumentar-ticket': TrendingUpIcon,
  'queima-estoque': FireIcon,
  'clientes-recorrentes': HeartIcon,
}

type View = 'list' | 'simulate'

export function OffersBank() {
  const [view, setView] = useState<View>('list')
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [filterObjective, setFilterObjective] = useState<ObjectiveId | 'all'>('all')

  function handleSelectStrategy(strategy: Strategy) {
    setSelectedStrategy(strategy)
    setView('simulate')
  }

  function handleBack() {
    setView('list')
    setSelectedStrategy(null)
  }

  if (view === 'simulate' && selectedStrategy) {
    return (
      <OfferSimulator
        strategy={selectedStrategy}
        onBack={handleBack}
      />
    )
  }

  return (
    <OffersList
      filterObjective={filterObjective}
      onFilterChange={setFilterObjective}
      onSelectStrategy={handleSelectStrategy}
    />
  )
}

function OffersList({
  filterObjective,
  onFilterChange,
  onSelectStrategy,
}: {
  filterObjective: ObjectiveId | 'all'
  onFilterChange: (obj: ObjectiveId | 'all') => void
  onSelectStrategy: (s: Strategy) => void
}) {
  const filteredStrategies = useMemo(() => {
    if (filterObjective === 'all') return strategies
    return getStrategiesByObjective(filterObjective)
  }, [filterObjective])

  const selectedObjectiveInfo = objectives.find((o) => o.id === filterObjective)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Banco de Ofertas</h2>
        <p className="mt-1 text-slate-500">
          Estratégias prontas para criar ofertas que vendem sem comprometer seu lucro.
        </p>
      </div>

      {/* Objective filter */}
      <div className="card p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <TargetIcon className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-slate-700">Qual é o seu objetivo?</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              filterObjective === 'all'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            Todas as estratégias
          </button>
          {objectives.map((obj) => (
            <button
              key={obj.id}
              onClick={() => onFilterChange(obj.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                filterObjective === obj.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {obj.label}
            </button>
          ))}
        </div>
        {selectedObjectiveInfo && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-primary-50 p-3 animate-fade-in">
            <LightbulbIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-primary-600" />
            <p className="text-xs text-primary-800">
              {selectedObjectiveInfo.description} As estratégias abaixo podem ajudar com esse objetivo —
              os resultados dependem do seu produto, preço e público.
            </p>
          </div>
        )}
      </div>

      {/* Strategy cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredStrategies.map((strategy) => {
          const Icon = strategyIconMap[strategy.id] || TagIcon
          return (
            <div
              key={strategy.id}
              className="card flex flex-col p-5 transition-all hover:shadow-md animate-slide-up"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{strategy.name}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">{strategy.objective}</p>
                </div>
              </div>

              <div className="mb-3 flex-1 space-y-2">
                <div className="flex items-start gap-2">
                  <InfoIcon className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                  <p className="text-xs text-slate-500">{strategy.howItWorks}</p>
                </div>
                <div className="flex items-start gap-2">
                  <LightbulbIcon className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                  <p className="text-xs text-slate-500">{strategy.example}</p>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {strategy.businessTypes.map((type) => (
                  <span
                    key={type}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
                  >
                    {type}
                  </span>
                ))}
              </div>

              <button
                onClick={() => onSelectStrategy(strategy)}
                className="btn-primary w-full"
              >
                Simular esta oferta
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OfferSimulator({ strategy, onBack }: { strategy: Strategy; onBack: () => void }) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const Icon = strategyIconMap[strategy.id] || TagIcon

  const simResult = useMemo<OfferSimResult | null>(() => {
    const hasAllRequired = strategy.fields.every((field) => {
      if (!field.required) return true
      const val = fieldValues[field.id]
      if (!val || val.trim() === '') return false
      return true
    })
    if (!hasAllRequired) return null
    return simulateOffer(strategy.id, fieldValues)
  }, [strategy, fieldValues])

  function updateField(id: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [id]: value }))
  }

  function handleReset() {
    setFieldValues({})
  }

  function handleCopy() {
    if (!simResult) return
    const lines = simResult.details.map((d) => `${d.label}: ${d.value}`)
    const text = `${strategy.name}\n\n${lines.join('\n')}\n\nCriado no MargemPro`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button + title */}
      <div>
        <button
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Voltar para estratégias
        </button>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{strategy.name}</h2>
            <p className="mt-0.5 text-slate-500">{strategy.objective}</p>
          </div>
        </div>
      </div>

      {/* How it works + example */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-4">
          <div className="mb-2 flex items-center gap-2">
            <InfoIcon className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Como funciona</h3>
          </div>
          <p className="text-sm text-slate-500">{strategy.howItWorks}</p>
        </div>
        <div className="card p-4">
          <div className="mb-2 flex items-center gap-2">
            <LightbulbIcon className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Exemplo de aplicação</h3>
          </div>
          <p className="text-sm text-slate-500">{strategy.example}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input form */}
        <div className="card animate-slide-up p-5 sm:p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Monte sua oferta
            </h3>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              Limpar
            </button>
          </div>

          <div className="space-y-4">
            {strategy.fields.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                value={fieldValues[field.id] || ''}
                onChange={(v) => updateField(field.id, v)}
              />
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {!simResult && (
            <div className="card flex h-full flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <TargetIcon className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">
                Preencha os campos obrigatórios para ver o resultado da sua oferta.
              </p>
            </div>
          )}

          {simResult && (
            <div className="space-y-4 animate-slide-up">
              {/* Summary card */}
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-5 py-6 text-white">
                  <p className="text-sm font-medium text-primary-100">Preço da oferta</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                    {formatCurrency(simResult.offerPrice)}
                  </p>
                  {simResult.customerSavings > 0 && (
                    <p className="mt-1.5 text-sm text-primary-100">
                      Cliente economiza {formatCurrency(simResult.customerSavings)}{' '}
                      ({simResult.customerSavingsPercent.toFixed(0)}%)
                    </p>
                  )}
                  <button
                    onClick={handleCopy}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/25"
                  >
                    <CopyIcon className="w-3.5 h-3.5" />
                    {copied ? 'Copiado!' : 'Copiar oferta'}
                  </button>
                </div>

                <div className="space-y-3 p-5">
                  {/* Status badge */}
                  <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${statusConfig[simResult.status].bg} ${statusConfig[simResult.status].border}`}>
                    {simResult.status === 'good' && <CheckCircleIcon className={`w-5 h-5 ${statusConfig[simResult.status].text}`} />}
                    {(simResult.status === 'low' || simResult.status === 'warning') && <AlertIcon className={`w-5 h-5 ${statusConfig[simResult.status].text}`} />}
                    {simResult.status === 'loss' && <TrendingDownIcon className={`w-5 h-5 ${statusConfig[simResult.status].text}`} />}
                    <span className={`text-sm font-medium ${statusConfig[simResult.status].text}`}>
                      {statusConfig[simResult.status].label}
                    </span>
                  </div>

                  {/* Key metrics */}
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

                  {/* Detailed breakdown */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    {simResult.details.map((detail, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between text-sm ${
                          detail.highlight ? 'font-semibold' : ''
                        }`}
                      >
                        <span className={detail.highlight ? 'text-slate-900' : 'text-slate-500'}>
                          {detail.label}
                        </span>
                        <span className={detail.highlight ? 'text-slate-900' : 'text-slate-600'}>
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 border-t border-slate-100 pt-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <BoxIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">{simResult.unitCount} unidade(s)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {simResult.warnings.length > 0 && (
                <div className="space-y-2 animate-fade-in">
                  {simResult.warnings.map((warning, i) => {
                    const isLoss = simResult.status === 'loss'
                    return (
                      <div
                        key={i}
                        className={`flex items-start gap-2 rounded-lg p-3 ${
                          isLoss ? 'bg-red-50' : 'bg-amber-50'
                        }`}
                      >
                        <AlertIcon
                          className={`mt-0.5 w-4 h-4 flex-shrink-0 ${
                            isLoss ? 'text-red-600' : 'text-amber-600'
                          }`}
                        />
                        <p className={`text-xs ${isLoss ? 'text-red-800' : 'text-amber-800'}`}>
                          {warning}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Info note */}
              <div className="flex items-start gap-2 rounded-lg bg-primary-50 p-3">
                <InfoIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-primary-600" />
                <p className="text-xs text-primary-800">
                  O faturamento ({formatCurrency(simResult.revenue)}) não é o seu lucro.
                  O lucro já considera custos, taxas e despesas.
                  {simResult.customerSavings > 0 && (
                    <> A economia do cliente é de {formatCurrency(simResult.customerSavings)}.</>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: StrategyField
  value: string
  onChange: (v: string) => void
}) {
  const isCurrency = field.type === 'currency'
  const isPercent = field.type === 'percent'
  const isInteger = field.type === 'integer'

  return (
    <div>
      <label className="input-label" htmlFor={`field-${field.id}`}>
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative">
        {isCurrency && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
        )}
        <input
          id={`field-${field.id}`}
          type="text"
          inputMode={isInteger ? 'numeric' : 'decimal'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`input-field ${isCurrency ? 'pl-11' : ''} ${isPercent ? 'pr-9' : ''}`}
        />
        {isPercent && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
        )}
      </div>
      {field.helpText && (
        <p className="mt-1.5 text-xs text-slate-400">{field.helpText}</p>
      )}
    </div>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
