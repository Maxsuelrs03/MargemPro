import { useMargemPro } from '../../state/AppContext'
import { formatCurrency } from '../../lib/format'
import { DecimalInput } from '../ui/DecimalInput'

export function FlowProduto() {
  const { state, actions } = useMargemPro()
  const product = state.flow.product

  const update = (field: keyof typeof product, value: string | number) => {
    actions.patchProduct({ [field]: value } as never)
  }

  return (
    <div className="space-y-5">
      <div className="card p-5 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Dados do produto
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="input-label" htmlFor="fp-name">
              Nome do produto <span className="text-red-500">*</span>
            </label>
            <input
              id="fp-name"
              type="text"
              value={product.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Ex: Blusa de algodão premium"
              className="input-field"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="input-label" htmlFor="fp-type">Tipo ou segmento</label>
            <input
              id="fp-type"
              type="text"
              value={product.type || ''}
              onChange={(e) => update('type', e.target.value)}
              placeholder="Ex: Roupas, cosméticos, acessórios..."
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="fp-cost">
              Custo do produto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <DecimalInput
                id="fp-cost"
                value={product.cost}
                onValueChange={(v) => update('cost', v)}
                placeholder="0,00"
                className="input-field pl-11"
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="fp-add">Despesas adicionais</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <DecimalInput
                id="fp-add"
                value={product.additionalCosts}
                onValueChange={(v) => update('additionalCosts', v)}
                placeholder="0,00"
                className="input-field pl-11"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Embalagem, frete que você paga, etc.</p>
          </div>

          <div>
            <label className="input-label" htmlFor="fp-fee-pct">Taxa sobre a venda (%)</label>
            <div className="relative">
              <DecimalInput
                id="fp-fee-pct"
                value={product.feePercent}
                onValueChange={(v) => update('feePercent', v)}
                placeholder="0"
                className="input-field pr-9"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Cartão, marketplace, etc.</p>
          </div>

          <div>
            <label className="input-label" htmlFor="fp-fee-fix">Taxa fixa por venda</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <DecimalInput
                id="fp-fee-fix"
                value={product.feeFixed}
                onValueChange={(v) => update('feeFixed', v)}
                placeholder="0,00"
                className="input-field pl-11"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="input-label" htmlFor="fp-margin">
              Margem de lucro desejada <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DecimalInput
                id="fp-margin"
                value={product.marginPercent}
                onValueChange={(v) => update('marginPercent', v)}
                placeholder="30"
                className="input-field pr-9"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Percentual de lucro que você quer sobrar após custos e taxas.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[15, 30, 50].map((v) => (
                <button
                  key={v}
                  onClick={() => update('marginPercent', v)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                >
                  {v === 15 ? 'Mínima' : v === 30 ? 'Padrão' : 'Boa'} ({v}%)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick summary */}
      {product.cost > 0 && (
        <div className="card p-4 animate-fade-in">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-slate-400">Custo total</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">
                {formatCurrency(product.cost + product.additionalCosts)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Taxas</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">
                {product.feePercent}%{product.feeFixed > 0 ? ` + ${formatCurrency(product.feeFixed)}` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Margem alvo</p>
              <p className="mt-0.5 text-lg font-bold text-primary-600">{product.marginPercent}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
