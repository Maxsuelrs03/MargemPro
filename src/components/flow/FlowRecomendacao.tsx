import { useMemo } from 'react'
import { useMargemPro } from '../../state/AppContext'
import { recommendStrategies } from '../../lib/recommendations'
import { objectives, categories, type ObjectiveId } from '../../lib/strategyTypes'
import { formatCurrency } from '../../lib/format'
import { ArrowRightIcon } from '../PresentationIcons'
import { TargetIcon, CheckCircleIcon, AlertIcon } from '../Icons'

const fitConfig = {
  ideal: { label: 'Ideal', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircleIcon },
  bom: { label: 'Boa opção', bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200', icon: TargetIcon },
  arriscado: { label: 'Cuidado', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertIcon },
} as const

export function FlowRecomendacao() {
  const { state, pricingResult, actions } = useMargemPro()
  const product = state.flow.product

  const recommendations = useMemo(() => {
    if (!pricingResult || isNaN(pricingResult.suggestedPrice)) return []
    return recommendStrategies({
      cost: product.cost,
      totalCost: pricingResult.totalCost,
      suggestedPrice: pricingResult.suggestedPrice,
      marginPercent: pricingResult.marginPercent,
      feePercent: product.feePercent,
      feeFixed: product.feeFixed,
      objective: state.flow.objective,
    })
  }, [pricingResult, product, state.flow.objective])

  function selectStrategy(strategyId: string) {
    actions.selectStrategy(strategyId)
    actions.setStep('simulacao')
  }

  if (!pricingResult || isNaN(pricingResult.suggestedPrice)) {
    return (
      <div className="card flex flex-col items-center justify-center p-10 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <TargetIcon className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-500">
          Volte às etapas anteriores e preencha o custo e a margem do produto para receber recomendações.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Objective selector */}
      <div className="card p-4 sm:p-5">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Qual é o seu objetivo?</h3>
        <p className="mb-3 text-xs text-slate-400">Isso ajuda a filtrar as melhores estratégias para o seu momento.</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => actions.setObjective(null)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              !state.flow.objective
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            Sem objetivo específico
          </button>
          {objectives.map((obj) => (
            <button
              key={obj.id}
              onClick={() => actions.setObjective(obj.id as ObjectiveId)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                state.flow.objective === obj.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {obj.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-slate-400">Preço sugerido</p>
            <p className="mt-0.5 text-lg font-bold text-slate-900">{formatCurrency(pricingResult.suggestedPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Lucro por venda</p>
            <p className="mt-0.5 text-lg font-bold text-green-600">{formatCurrency(pricingResult.profit)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Margem</p>
            <p className="mt-0.5 text-lg font-bold text-slate-900">{pricingResult.marginPercent.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-slate-900">
          Ofertas recomendadas ({recommendations.length})
        </h3>
        <p className="mb-4 text-sm text-slate-500">
          Ordenadas pela adequação ao seu objetivo e à sua rentabilidade. Clique para abrir a estratégia.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {recommendations.map((rec) => {
            const fit = fitConfig[rec.fitLabel]
            const FitIcon = fit.icon
            const cat = categories.find((c) => c.id === rec.strategy.category)
            return (
              <div key={rec.strategy.id} className="card p-5 transition-all hover:shadow-md">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                      {rec.strategy.number}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900">{rec.strategy.name}</h4>
                      <span className="text-xs font-medium text-primary-600">{cat?.shortLabel}</span>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${fit.bg} ${fit.border} ${fit.text}`}>
                    <FitIcon className="w-3 h-3" />
                    {fit.label}
                  </span>
                </div>

                <p className="mb-3 text-sm text-slate-500">{rec.strategy.objective}</p>

                <ul className="mb-4 space-y-1.5">
                  {rec.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                      {reason}
                    </li>
                  ))}
                </ul>

                <button onClick={() => selectStrategy(rec.strategy.id)} className="btn-primary w-full">
                  Abrir e simular
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
