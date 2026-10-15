import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  type Strategy,
  type StrategyField,
  type CategoryId,
  type ObjectiveId,
  categories,
  objectives,
} from '../lib/strategyTypes'
import { strategies } from '../lib/strategyData'
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
  GiftIcon,
  FireIcon,
  HeartIcon,
  TrendingUpIcon,
  BoxIcon,
  TargetIcon,
  LightbulbIcon,
  RefreshIcon,
  TagIcon,
  SearchIcon,
  StarIcon,
  StarFilledIcon,
  CopyPlusIcon,
  ScaleIcon,
  ChevronDownIcon,
} from './Icons'

const statusConfig: Record<MarginStatus, { label: string; bg: string; text: string; border: string }> = {
  good: { label: 'Margem saudável', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  low: { label: 'Margem baixa', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  warning: { label: 'Margem muito baixa', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  loss: { label: 'Prejuízo!', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

const categoryIconMap: Record<CategoryId, typeof TagIcon> = {
  A: PercentIcon,
  B: BoxIcon,
  C: GiftIcon,
  D: FireIcon,
  E: HeartIcon,
}

const FAVORITES_KEY = 'margempro-favorites'

type View = 'list' | 'detail'

export interface SavedSimulation {
  strategyId: string
  strategyName: string
  fieldValues: Record<string, string>
  result: OfferSimResult
}

export function OffersBank() {
  const [view, setView] = useState<View>('list')
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [comparisons, setComparisons] = useState<SavedSimulation[]>([])

  const handleSelectStrategy = useCallback((strategy: Strategy) => {
    setSelectedStrategy(strategy)
    setView('detail')
  }, [])

  const handleBack = useCallback(() => {
    setView('list')
    setSelectedStrategy(null)
  }, [])

  const handleAddComparison = useCallback((sim: SavedSimulation) => {
    setComparisons((prev) => {
      if (prev.length >= 2) return [prev[1], sim]
      return [...prev, sim]
    })
  }, [])

  const handleRemoveComparison = useCallback((index: number) => {
    setComparisons((prev) => prev.filter((_, i) => i !== index))
  }, [])

  if (view === 'detail' && selectedStrategy) {
    return (
      <StrategyDetail
        strategy={selectedStrategy}
        onBack={handleBack}
        onAddComparison={handleAddComparison}
      />
    )
  }

  return (
    <OffersList
      onSelectStrategy={handleSelectStrategy}
      comparisons={comparisons}
      onRemoveComparison={handleRemoveComparison}
    />
  )
}

function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) setFavorites(new Set(JSON.parse(stored)))
    } catch {
      // ignore
    }
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  return { favorites, toggleFavorite }
}

function OffersList({
  onSelectStrategy,
  comparisons,
  onRemoveComparison,
}: {
  onSelectStrategy: (s: Strategy) => void
  comparisons: SavedSimulation[]
  onRemoveComparison: (index: number) => void
}) {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all')
  const [filterObjective, setFilterObjective] = useState<ObjectiveId | 'all'>('all')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { favorites, toggleFavorite } = useFavorites()

  const filtered = useMemo(() => {
    return strategies.filter((s: Strategy) => {
      if (showFavoritesOnly && !favorites.has(s.id)) return false
      if (filterCategory !== 'all' && s.category !== filterCategory) return false
      if (filterObjective !== 'all' && !s.objectives.includes(filterObjective)) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const haystack = `${s.name} ${s.shortName} ${s.objective} ${s.howItWorks} ${s.example} ${s.businessTypes.join(' ')}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [search, filterCategory, filterObjective, showFavoritesOnly, favorites])

  const groupedByCategory = useMemo(() => {
    const map = new Map<CategoryId, Strategy[]>()
    for (const s of filtered) {
      if (!map.has(s.category)) map.set(s.category, [])
      map.get(s.category)!.push(s)
    }
    return map
  }, [filtered])

  const selectedObjectiveInfo = objectives.find((o) => o.id === filterObjective)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Banco de Ofertas</h2>
        <p className="mt-1 text-slate-500">
          30 estratégias prontas para criar ofertas que vendem sem comprometer seu lucro.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, palavra-chave ou tipo de negócio..."
          className="input-field pl-12"
        />
      </div>

      {/* Filters */}
      <div className="card space-y-4 p-4 sm:p-5">
        {/* Category filter */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Categoria</h3>
          <div className="flex flex-wrap gap-2">
            <FilterButton active={filterCategory === 'all'} onClick={() => setFilterCategory('all')}>
              Todas
            </FilterButton>
            {categories.map((cat) => {
              const Icon = categoryIconMap[cat.id]
              return (
                <FilterButton
                  key={cat.id}
                  active={filterCategory === cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                >
                  <Icon className="w-4 h-4 inline mr-1 -mt-0.5" />
                  {cat.shortLabel}
                </FilterButton>
              )
            })}
          </div>
        </div>

        {/* Objective filter */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Objetivo</h3>
          <div className="flex flex-wrap gap-2">
            <FilterButton active={filterObjective === 'all'} onClick={() => setFilterObjective('all')}>
              Todos
            </FilterButton>
            {objectives.map((obj) => (
              <FilterButton
                key={obj.id}
                active={filterObjective === obj.id}
                onClick={() => setFilterObjective(obj.id)}
              >
                {obj.label}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Favorites toggle */}
        <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              showFavoritesOnly
                ? 'border-amber-400 bg-amber-50 text-amber-700'
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {showFavoritesOnly ? <StarFilledIcon className="w-4 h-4 text-amber-500" /> : <StarIcon className="w-4 h-4" />}
            {showFavoritesOnly ? 'Mostrando favoritos' : 'Só favoritos'}
          </button>
          <span className="text-xs text-slate-400">{filtered.length} estratégia(s)</span>
        </div>

        {selectedObjectiveInfo && (
          <div className="flex items-start gap-2 rounded-lg bg-primary-50 p-3 animate-fade-in">
            <LightbulbIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-primary-600" />
            <p className="text-xs text-primary-800">
              {selectedObjectiveInfo.description} As estratégias abaixo podem ajudar — os resultados
              dependem do seu produto, preço e público.
            </p>
          </div>
        )}
      </div>

      {/* Comparison view */}
      {comparisons.length > 0 && (
        <ComparisonView comparisons={comparisons} onRemove={onRemoveComparison} />
      )}

      {/* Strategy cards grouped by category */}
      {filtered.length === 0 && (
        <div className="card flex flex-col items-center justify-center p-10 text-center">
          <SearchIcon className="mb-3 w-10 h-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">
            Nenhuma estratégia encontrada com esses filtros.
          </p>
        </div>
      )}

      {[...groupedByCategory.entries()].map(([catId, catStrategies]) => {
        const cat = categories.find((c) => c.id === catId)!
        const CatIcon = categoryIconMap[catId]
        return (
          <div key={catId}>
            <div className="mb-3 flex items-center gap-2">
              <CatIcon className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">{cat.label}</h3>
              <span className="text-sm text-slate-400">({catStrategies.length})</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catStrategies.map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  isFavorite={favorites.has(strategy.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelect={onSelectStrategy}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'border-primary-500 bg-primary-50 text-primary-700'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  )
}

function StrategyCard({
  strategy,
  isFavorite,
  onToggleFavorite,
  onSelect,
}: {
  strategy: Strategy
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onSelect: (s: Strategy) => void
}) {
  const cat = categories.find((c) => c.id === strategy.category)!
  return (
    <div className="card flex flex-col p-5 transition-all hover:shadow-md animate-slide-up">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
            {strategy.number}
          </span>
          <div className="flex-1">
            <h3 className="font-semibold leading-tight text-slate-900">{strategy.name}</h3>
            <span className="text-xs font-medium text-primary-600">{cat.shortLabel}</span>
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(strategy.id)}
          className="flex-shrink-0 rounded-lg p-1 text-slate-300 transition-colors hover:text-amber-400"
          aria-label="Favoritar"
        >
          {isFavorite ? <StarFilledIcon className="w-4 h-4 text-amber-400" /> : <StarIcon className="w-4 h-4" />}
        </button>
      </div>

      <p className="mb-3 flex-1 text-sm text-slate-500">{strategy.objective}</p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {strategy.businessTypes.slice(0, 3).map((type) => (
          <span key={type} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {type}
          </span>
        ))}
        {strategy.businessTypes.length > 3 && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400">
            +{strategy.businessTypes.length - 3}
          </span>
        )}
      </div>

      <button onClick={() => onSelect(strategy)} className="btn-primary w-full">
        Abrir e simular
      </button>
    </div>
  )
}

function StrategyDetail({
  strategy,
  onBack,
  onAddComparison,
}: {
  strategy: Strategy
  onBack: () => void
  onAddComparison: (sim: SavedSimulation) => void
}) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('simulator')
  const [duplicated, setDuplicated] = useState(false)

  const cat = categories.find((c) => c.id === strategy.category)!

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

  const updateField = useCallback((id: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [id]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setFieldValues({})
  }, [])

  const handleRestoreExample = useCallback(() => {
    setFieldValues({ ...strategy.exampleValues })
  }, [strategy])

  const handleCopy = useCallback(() => {
    if (!simResult) return
    const lines = simResult.details.map((d) => `${d.label}: ${d.value}`)
    const text = `${strategy.name}\n\n${lines.join('\n')}\n\nCriado no MargemPro`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [simResult, strategy])

  const handleDuplicate = useCallback(() => {
    if (!simResult) return
    onAddComparison({
      strategyId: strategy.id,
      strategyName: strategy.name,
      fieldValues: { ...fieldValues },
      result: simResult,
    })
    setDuplicated(true)
    setTimeout(() => setDuplicated(false), 2000)
  }, [simResult, strategy, fieldValues, onAddComparison])

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back + title */}
      <div>
        <button
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Voltar para o banco de ofertas
        </button>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-600">
            {strategy.number}
          </span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">{strategy.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">
                {cat.label}
              </span>
              <p className="text-sm text-slate-500">{strategy.objective}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable content sections */}
      <div className="space-y-3">
        <ExpandableSection
          id="howitworks"
          title="Como funciona"
          icon={<InfoIcon className="w-4 h-4 text-slate-400" />}
          expanded={expandedSection === 'howitworks'}
          onToggle={toggleSection}
        >
          <p className="text-sm text-slate-600">{strategy.howItWorks}</p>
        </ExpandableSection>

        <ExpandableSection
          id="when"
          title="Quando usar e quando evitar"
          icon={<TargetIcon className="w-4 h-4 text-slate-400" />}
          expanded={expandedSection === 'when'}
          onToggle={toggleSection}
        >
          <div className="space-y-3">
            <div className="rounded-lg bg-green-50 p-3">
              <p className="mb-1 text-xs font-semibold text-green-700">Quando usar</p>
              <p className="text-sm text-green-800">{strategy.whenToUse}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="mb-1 text-xs font-semibold text-red-700">Quando evitar</p>
              <p className="text-sm text-red-800">{strategy.whenToAvoid}</p>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection
          id="steps"
          title="Passo a passo"
          icon={<LightbulbIcon className="w-4 h-4 text-slate-400" />}
          expanded={expandedSection === 'steps'}
          onToggle={toggleSection}
        >
          <ol className="space-y-2">
            {strategy.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-600">{step}</span>
              </li>
            ))}
          </ol>
        </ExpandableSection>

        <ExpandableSection
          id="example"
          title="Exemplo prático"
          icon={<LightbulbIcon className="w-4 h-4 text-slate-400" />}
          expanded={expandedSection === 'example'}
          onToggle={toggleSection}
        >
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">{strategy.example}</p>
            <p className="mt-2 text-xs text-slate-400">Exemplo ilustrativo. Resultados podem variar conforme seu produto e público.</p>
          </div>
        </ExpandableSection>
      </div>

      {/* Simulator */}
      <ExpandableSection
        id="simulator"
        title="Simulador financeiro"
        icon={<TrendingUpIcon className="w-4 h-4 text-slate-400" />}
        expanded={expandedSection === 'simulator'}
        onToggle={toggleSection}
      >
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Input form */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Monte sua oferta
              </h4>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRestoreExample}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
                >
                  <RefreshIcon className="w-3.5 h-3.5" />
                  Exemplo
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
                >
                  <RefreshIcon className="w-3.5 h-3.5" />
                  Limpar
                </button>
              </div>
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
                  Preencha os campos obrigatórios para ver o resultado.
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
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/25"
                      >
                        <CopyIcon className="w-3.5 h-3.5" />
                        {copied ? 'Copiado!' : 'Copiar resumo'}
                      </button>
                      <button
                        onClick={handleDuplicate}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/25"
                      >
                        <CopyPlusIcon className="w-3.5 h-3.5" />
                        {duplicated ? 'Adicionada!' : 'Comparar'}
                      </button>
                    </div>
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
                        <div key={i} className={`flex items-center justify-between text-sm ${detail.highlight ? 'font-semibold' : ''}`}>
                          <span className={detail.highlight ? 'text-slate-900' : 'text-slate-500'}>{detail.label}</span>
                          <span className={detail.highlight ? 'text-slate-900' : 'text-slate-600'}>{detail.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-100 pt-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <BoxIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500">{simResult.unitCount} unidade(s)</span>
                      </div>
                      {simResult.profitPerUnit > 0 && simResult.unitCount > 1 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-500">{formatCurrency(simResult.profitPerUnit)}/un.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {simResult.warnings.length > 0 && (
                  <div className="space-y-2 animate-fade-in">
                    {simResult.warnings.map((warning, i) => {
                      const isLoss = simResult.status === 'loss'
                      return (
                        <div key={i} className={`flex items-start gap-2 rounded-lg p-3 ${isLoss ? 'bg-red-50' : 'bg-amber-50'}`}>
                          <AlertIcon className={`mt-0.5 w-4 h-4 flex-shrink-0 ${isLoss ? 'text-red-600' : 'text-amber-600'}`} />
                          <p className={`text-xs ${isLoss ? 'text-red-800' : 'text-amber-800'}`}>{warning}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Info note */}
                <div className="flex items-start gap-2 rounded-lg bg-primary-50 p-3">
                  <InfoIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-primary-600" />
                  <p className="text-xs text-primary-800">
                    O faturamento bruto ({formatCurrency(simResult.grossRevenue)}) não é o seu lucro.
                    O lucro já desconta custos, taxas e despesas.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ExpandableSection>

      {/* Tips */}
      <ExpandableSection
        id="tips"
        title="Sugestões para melhorar a oferta"
        icon={<LightbulbIcon className="w-4 h-4 text-slate-400" />}
        expanded={expandedSection === 'tips'}
        onToggle={toggleSection}
      >
        <ul className="space-y-2">
          {strategy.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircleIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-green-500" />
              <span className="text-sm text-slate-600">{tip}</span>
            </li>
          ))}
        </ul>
      </ExpandableSection>

      {/* Metrics */}
      <ExpandableSection
        id="metrics"
        title="Indicadores para acompanhar"
        icon={<TrendingUpIcon className="w-4 h-4 text-slate-400" />}
        expanded={expandedSection === 'metrics'}
        onToggle={toggleSection}
      >
        <div className="flex flex-wrap gap-2">
          {strategy.metrics.map((metric, i) => (
            <span key={i} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
              {metric}
            </span>
          ))}
        </div>
      </ExpandableSection>

      {/* Common mistakes */}
      <ExpandableSection
        id="mistakes"
        title="Erros comuns e alertas"
        icon={<AlertIcon className="w-4 h-4 text-slate-400" />}
        expanded={expandedSection === 'mistakes'}
        onToggle={toggleSection}
      >
        <ul className="space-y-2">
          {strategy.commonMistakes.map((mistake, i) => (
            <li key={i} className="flex items-start gap-2">
              <AlertIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-amber-500" />
              <span className="text-sm text-slate-600">{mistake}</span>
            </li>
          ))}
        </ul>
      </ExpandableSection>

      {/* Recommended action */}
      <div className="card flex items-start gap-3 border-primary-200 bg-primary-50 p-4">
        <TargetIcon className="mt-0.5 w-5 h-5 flex-shrink-0 text-primary-600" />
        <div>
          <h3 className="text-sm font-semibold text-primary-900">Ação recomendada</h3>
          <p className="mt-1 text-sm text-primary-800">{strategy.recommendedAction}</p>
        </div>
      </div>
    </div>
  )
}

function ExpandableSection({
  id,
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  id: string
  title: string
  icon: React.ReactNode
  expanded: boolean
  onToggle: (id: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        </div>
        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="animate-fade-in border-t border-slate-100 p-4">
          {children}
        </div>
      )}
    </div>
  )
}

function ComparisonView({
  comparisons,
  onRemove,
}: {
  comparisons: SavedSimulation[]
  onRemove: (index: number) => void
}) {
  return (
    <div className="card p-4 sm:p-5 animate-slide-up">
      <div className="mb-4 flex items-center gap-2">
        <ScaleIcon className="w-5 h-5 text-primary-600" />
        <h3 className="text-sm font-semibold text-slate-700">Comparação de ofertas</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {comparisons.map((sim, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">{sim.strategyName}</h4>
              <button
                onClick={() => onRemove(i)}
                className="text-xs text-slate-400 hover:text-red-500"
              >
                Remover
              </button>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Preço da oferta</span>
                <span className="font-medium text-slate-900">{formatCurrency(sim.result.offerPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Lucro</span>
                <span className={`font-medium ${sim.result.profit >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                  {formatCurrency(sim.result.profit)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Margem</span>
                <span className="font-medium text-slate-900">{sim.result.marginPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Unidades</span>
                <span className="font-medium text-slate-900">{sim.result.unitCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Economia do cliente</span>
                <span className="font-medium text-slate-900">{formatCurrency(sim.result.customerSavings)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                <span className="text-slate-500">Lucro vs normal</span>
                <span className={`font-medium ${sim.result.profitDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {sim.result.profitDifference >= 0 ? '+' : ''}{formatCurrency(sim.result.profitDifference)}
                </span>
              </div>
            </div>
            <div className={`mt-2 rounded-md px-2 py-1 text-xs font-medium ${statusConfig[sim.result.status].bg} ${statusConfig[sim.result.status].text}`}>
              {statusConfig[sim.result.status].label}
            </div>
          </div>
        ))}
      </div>
      {comparisons.length === 1 && (
        <p className="mt-3 text-xs text-slate-400">
          Adicione outra simulação para comparar lado a lado.
        </p>
      )}
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
      {field.helpText && <p className="mt-1.5 text-xs text-slate-400">{field.helpText}</p>}
    </div>
  )
}

function formatCurrency(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
