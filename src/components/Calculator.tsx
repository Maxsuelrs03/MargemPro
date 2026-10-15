import { useState, useMemo, useCallback } from 'react'
import { formatCurrency, formatPercent } from '../lib/format'
import { calculatePricing, calculateDiscount, getMarginStatus, type MarginStatus } from '../lib/pricing'
import { AlertIcon, CheckCircleIcon, TrendingDownIcon, InfoIcon, CopyIcon } from './Icons'

const statusConfig: Record<MarginStatus, { label: string; bg: string; text: string; border: string }> = {
  good: { label: 'Margem saudável', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  low: { label: 'Margem baixa', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  warning: { label: 'Margem muito baixa', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  loss: { label: 'Prejuízo!', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

function parseNumber(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function formatInput(value: string): string {
  return value
}

export function Calculator() {
  const [cost, setCost] = useState('')
  const [additionalCosts, setAdditionalCosts] = useState('')
  const [feePercent, setFeePercent] = useState('')
  const [feeFixed, setFeeFixed] = useState('')
  const [marginPercent, setMarginPercent] = useState('30')
  const [discountPercent, setDiscountPercent] = useState('')

  const [copied, setCopied] = useState(false)

  const pricingInput = useMemo(() => ({
    cost: parseNumber(cost),
    additionalCosts: parseNumber(additionalCosts),
    feePercent: parseNumber(feePercent),
    feeFixed: parseNumber(feeFixed),
    marginPercent: parseNumber(marginPercent),
  }), [cost, additionalCosts, feePercent, feeFixed, marginPercent])

  const hasCostInput = pricingInput.cost > 0
  const hasMarginInput = pricingInput.marginPercent > 0

  const result = useMemo(() => {
    if (!hasCostInput || !hasMarginInput) return null
    return calculatePricing(pricingInput)
  }, [pricingInput, hasCostInput, hasMarginInput])

  const divisor = 1 - pricingInput.feePercent / 100 - pricingInput.marginPercent / 100
  const marginNotViable = divisor <= 0

  const discountResult = useMemo(() => {
    if (!result || isNaN(result.suggestedPrice)) return null
    const dp = parseNumber(discountPercent)
    if (dp <= 0) return null
    return calculateDiscount(
      result.suggestedPrice,
      dp,
      result.totalCost,
      pricingInput.feePercent,
      pricingInput.feeFixed,
    )
  }, [result, discountPercent, pricingInput.feePercent, pricingInput.feeFixed])

  const showResults = result && !isNaN(result.suggestedPrice) && !marginNotViable
  const status = showResults ? getMarginStatus(result.marginPercent) : null

  const handleCopy = useCallback(() => {
    if (!showResults) return
    const text = `Preço sugerido: ${formatCurrency(result.suggestedPrice)}
Lucro: ${formatCurrency(result.profit)}
Margem: ${formatPercent(result.marginPercent)}

Calculado no MargemPro`

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [showResults, result])

  function clearAll() {
    setCost('')
    setAdditionalCosts('')
    setFeePercent('')
    setFeeFixed('')
    setMarginPercent('30')
    setDiscountPercent('')
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900">Calculadora de Preços</h2>
        <p className="mt-1 text-slate-500">
          Descubra o preço ideal de venda e veja quanto você realmente lucra em cada venda.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input panel */}
        <div className="card animate-slide-up p-5 sm:p-6 lg:col-span-3">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Dados do produto
          </h3>

          <div className="space-y-4">
            <div>
              <label className="input-label" htmlFor="cost">
                Custo do produto <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                <input
                  id="cost"
                  type="text"
                  inputMode="decimal"
                  value={cost}
                  onChange={(e) => setCost(formatInput(e.target.value))}
                  placeholder="0,00"
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="additionalCosts">
                Despesas adicionais
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                <input
                  id="additionalCosts"
                  type="text"
                  inputMode="decimal"
                  value={additionalCosts}
                  onChange={(e) => setAdditionalCosts(e.target.value)}
                  placeholder="0,00"
                  className="input-field pl-11"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Embalagem, frete que você paga, comissão de vendedor, etc.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="input-label" htmlFor="feePercent">
                  Taxa (%) sobre a venda
                </label>
                <div className="relative">
                  <input
                    id="feePercent"
                    type="text"
                    inputMode="decimal"
                    value={feePercent}
                    onChange={(e) => setFeePercent(e.target.value)}
                    placeholder="0"
                    className="input-field pr-9"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Taxa do cartão, marketplace, etc.
                </p>
              </div>

              <div>
                <label className="input-label" htmlFor="feeFixed">
                  Taxa fixa por venda
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input
                    id="feeFixed"
                    type="text"
                    inputMode="decimal"
                    value={feeFixed}
                    onChange={(e) => setFeeFixed(e.target.value)}
                    placeholder="0,00"
                    className="input-field pl-11"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Taxa fixa da maquininha, por exemplo.
                </p>
              </div>
            </div>

            <div>
              <label className="input-label" htmlFor="margin">
                Margem de lucro desejada <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="margin"
                  type="text"
                  inputMode="decimal"
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(e.target.value)}
                  placeholder="30"
                  className="input-field pr-9"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Percentual de lucro que você quer sobrar após pagar custos e taxas.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { label: 'Margem mínima', value: '15' },
                  { label: 'Padrão', value: '30' },
                  { label: 'Boa margem', value: '50' },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setMarginPercent(preset.value)}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                  >
                    {preset.label} ({preset.value}%)
                  </button>
                ))}
              </div>
            </div>

            <button onClick={clearAll} className="btn-secondary w-full sm:w-auto">
              Limpar campos
            </button>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-2">
          {!showResults && (
            <div className="card flex h-full flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <InfoIcon className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">
                {marginNotViable
                  ? 'A margem e as taxas juntas ultrapassam 100%. Reduza a margem ou as taxas.'
                  : 'Preencha o custo do produto e a margem desejada para ver o resultado.'}
              </p>
            </div>
          )}

          {showResults && result && status && (
            <div className="space-y-4 animate-slide-up">
              {/* Price highlight */}
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-5 py-6 text-white">
                  <p className="text-sm font-medium text-primary-100">Preço de venda sugerido</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                    {formatCurrency(result.suggestedPrice)}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/25"
                  >
                    <CopyIcon className="w-3.5 h-3.5" />
                    {copied ? 'Copiado!' : 'Copiar resultado'}
                  </button>
                </div>

                <div className="space-y-3 p-5">
                  <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${statusConfig[status].bg} ${statusConfig[status].border}`}>
                    {status === 'good' && <CheckCircleIcon className={`w-5 h-5 ${statusConfig[status].text}`} />}
                    {(status === 'low' || status === 'warning') && <AlertIcon className={`w-5 h-5 ${statusConfig[status].text}`} />}
                    {status === 'loss' && <TrendingDownIcon className={`w-5 h-5 ${statusConfig[status].text}`} />}
                    <span className={`text-sm font-medium ${statusConfig[status].text}`}>
                      {statusConfig[status].label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Lucro por venda</p>
                      <p className="mt-0.5 text-lg font-bold text-slate-900">
                        {formatCurrency(result.profit)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Margem real</p>
                      <p className="mt-0.5 text-lg font-bold text-slate-900">
                        {formatPercent(result.marginPercent)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Custo do produto</span>
                      <span className="font-medium text-slate-700">{formatCurrency(pricingInput.cost)}</span>
                    </div>
                    {pricingInput.additionalCosts > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Despesas adicionais</span>
                        <span className="font-medium text-slate-700">{formatCurrency(pricingInput.additionalCosts)}</span>
                      </div>
                    )}
                    {result.feeAmount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Taxas</span>
                        <span className="font-medium text-slate-700">- {formatCurrency(result.feeAmount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-sm">
                      <span className="font-medium text-slate-700">Custo total</span>
                      <span className="font-medium text-slate-700">{formatCurrency(result.totalCost)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-primary-50 p-3">
                    <InfoIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-primary-600" />
                    <p className="text-xs text-primary-800">
                      O preço de {formatCurrency(result.suggestedPrice)} já inclui todos os custos, taxas e o lucro de{' '}
                      {formatCurrency(result.profit)} que você quer obter. O markup sobre o custo é de{' '}
                      {formatPercent(result.markupPercent)}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Discount simulator */}
              <div className="card p-5">
                <h4 className="mb-3 text-sm font-semibold text-slate-900">Simular desconto</h4>
                <div className="relative mb-4">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="0"
                    className="input-field pr-9"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                </div>

                {discountResult && (
                  <div className="animate-fade-in space-y-3">
                    {(() => {
                      const dStatus = getMarginStatus(discountResult.marginPercent)
                      return (
                        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${statusConfig[dStatus].bg} ${statusConfig[dStatus].border}`}>
                          {dStatus === 'good' && <CheckCircleIcon className={`w-5 h-5 ${statusConfig[dStatus].text}`} />}
                          {(dStatus === 'low' || dStatus === 'warning') && <AlertIcon className={`w-5 h-5 ${statusConfig[dStatus].text}`} />}
                          {dStatus === 'loss' && <TrendingDownIcon className={`w-5 h-5 ${statusConfig[dStatus].text}`} />}
                          <span className={`text-sm font-medium ${statusConfig[dStatus].text}`}>
                            {statusConfig[dStatus].label}
                          </span>
                        </div>
                      )
                    })()}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Preço com desconto</p>
                        <p className="mt-0.5 text-lg font-bold text-slate-900">
                          {formatCurrency(discountResult.finalPrice)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Lucro com desconto</p>
                        <p className={`mt-0.5 text-lg font-bold ${discountResult.profit >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                          {formatCurrency(discountResult.profit)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-100 pt-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Preço original</span>
                        <span className="font-medium text-slate-700">{formatCurrency(discountResult.originalPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Desconto dado</span>
                        <span className="font-medium text-orange-600">- {formatCurrency(discountResult.discountValue)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Margem com desconto</span>
                        <span className={`font-medium ${discountResult.marginPercent < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                          {formatPercent(discountResult.marginPercent)}
                        </span>
                      </div>
                    </div>

                    {discountResult.profit < 0 && (
                      <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
                        <AlertIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-red-600" />
                        <p className="text-xs text-red-800">
                          Com este desconto você tem prejuízo de {formatCurrency(Math.abs(discountResult.profit))}{' '}
                          por venda. Considere um desconto menor.
                        </p>
                      </div>
                    )}
                    {discountResult.profit >= 0 && discountResult.marginPercent < 15 && (
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                        <AlertIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-amber-600" />
                        <p className="text-xs text-amber-800">
                          A margem está baixa ({formatPercent(discountResult.marginPercent)}). O lucro é de apenas{' '}
                          {formatCurrency(discountResult.profit)} por venda.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!discountResult && (
                  <p className="text-xs text-slate-400">
                    Digite um percentual de desconto para ver como ele afeta seu lucro.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
