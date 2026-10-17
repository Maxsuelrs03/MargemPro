import { useMemo } from 'react'
import { useMargemPro } from '../../state/AppContext'
import { formatCurrency, formatPercent } from '../../lib/format'
import { getMarginStatus, type MarginStatus } from '../../lib/pricing'
import { CheckCircleIcon, AlertIcon, TrendingDownIcon, InfoIcon } from '../Icons'

const statusConfig: Record<MarginStatus, { label: string; bg: string; text: string; border: string }> = {
  good: { label: 'Margem saudável', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  low: { label: 'Margem baixa', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  warning: { label: 'Margem muito baixa', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  loss: { label: 'Prejuízo!', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

export function FlowPrecificacao() {
  const { state, pricingResult } = useMargemPro()
  const product = state.flow.product

  const result = useMemo(() => pricingResult, [pricingResult])

  const divisor = 1 - product.feePercent / 100 - product.marginPercent / 100
  const notViable = divisor <= 0
  const status = result && !isNaN(result.suggestedPrice) ? getMarginStatus(result.marginPercent) : null

  return (
    <div className="space-y-5">
      <div className="card p-5 sm:p-6">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Precificação calculada
        </h3>
        <p className="mb-4 text-sm text-slate-500">
          Com base nos dados do produto cadastrado na etapa anterior, veja o preço sugerido e o lucro real.
        </p>

        {!result && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <InfoIcon className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              {notViable
                ? 'A margem e as taxas juntas ultrapassam 100%. Volte e ajuste os valores.'
                : 'Preencha o custo e a margem na etapa Produto para ver o preço sugerido.'}
            </p>
          </div>
        )}

        {result && status && !isNaN(result.suggestedPrice) && (
          <div className="space-y-4 animate-fade-in">
            <div className="overflow-hidden rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 px-5 py-6 text-white">
              <p className="text-sm font-medium text-primary-100">Preço de venda sugerido</p>
              <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                {formatCurrency(result.suggestedPrice)}
              </p>
            </div>

            <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${statusConfig[status].bg} ${statusConfig[status].border}`}>
              {status === 'good' && <CheckCircleIcon className={`w-5 h-5 ${statusConfig[status].text}`} />}
              {(status === 'low' || status === 'warning') && <AlertIcon className={`w-5 h-5 ${statusConfig[status].text}`} />}
              {status === 'loss' && <TrendingDownIcon className={`w-5 h-5 ${statusConfig[status].text}`} />}
              <span className={`text-sm font-medium ${statusConfig[status].text}`}>{statusConfig[status].label}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Lucro por venda</p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">{formatCurrency(result.profit)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Margem real</p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">{formatPercent(result.marginPercent)}</p>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-slate-100 pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Custo do produto</span>
                <span className="font-medium text-slate-700">{formatCurrency(product.cost)}</span>
              </div>
              {product.additionalCosts > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Despesas adicionais</span>
                  <span className="font-medium text-slate-700">{formatCurrency(product.additionalCosts)}</span>
                </div>
              )}
              {result.feeAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Taxas</span>
                  <span className="font-medium text-slate-700">- {formatCurrency(result.feeAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                <span className="font-medium text-slate-700">Custo total</span>
                <span className="font-medium text-slate-700">{formatCurrency(result.totalCost)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-primary-50 p-3">
              <InfoIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-primary-600" />
              <p className="text-xs text-primary-800">
                Avance para a próxima etapa para ver ofertas recomendadas para este produto.
                O desconto máximo compatível com sua margem será calculado automaticamente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
