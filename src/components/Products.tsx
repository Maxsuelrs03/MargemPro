import { useState, useMemo, useCallback } from 'react'
import { useMargemPro } from '../state/AppContext'
import { type Product, type SavedOffer, productSignature, createEmptyProduct } from '../state/types'
import { formatCurrency } from '../lib/format'
import { calculatePricing } from '../lib/pricing'
import { downloadJSON } from '../state/persistence'
import { uid } from '../lib/id'
import { DecimalInput } from './ui/DecimalInput'
import { priceToInputText } from '../lib/numbers'
import {
  PlusIcon,
  SearchIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  AlertIcon,
} from './Icons'
import {
  TrashIcon,
  EditIcon,
  DownloadIcon,
  UploadIcon,
  DuplicateIcon,
} from './PresentationIcons'

type Tab = 'products' | 'offers'

export function Products() {
  const { state, actions } = useMargemPro()
  const [tab, setTab] = useState<Tab>('products')
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return state.products
    const q = search.toLowerCase()
    return state.products.filter((p) => p.name.toLowerCase().includes(q) || (p.type || '').toLowerCase().includes(q))
  }, [state.products, search])

  const filteredOffers = useMemo(() => {
    if (!search.trim()) return state.offers
    const q = search.toLowerCase()
    return state.offers.filter((o) => o.productName.toLowerCase().includes(q) || o.strategyName.toLowerCase().includes(q))
  }, [state.offers, search])

  function handleSaveProduct(product: Product) {
    actions.saveProduct(product)
    setEditingProduct(null)
  }

  function handleNewProduct() {
    setEditingProduct(createEmptyProduct())
  }

  function handleDuplicateProduct(p: Product) {
    const copy: Product = { ...p, id: '', name: `${p.name} (cópia)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    actions.saveProduct(copy)
  }

  function handleExport() {
    downloadJSON({ products: state.products, offers: state.offers }, `margempro-backup-${new Date().toISOString().slice(0, 10)}.json`)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (Array.isArray(data.products) && Array.isArray(data.offers)) {
          actions.importData(
            data.products.map((p: Product) => ({ ...p, id: p.id || uid() })),
            data.offers.map((o: SavedOffer) => ({ ...o, id: o.id || uid() })),
          )
        }
      } catch {
        // ignore invalid file
      }
    }
    reader.readAsText(file)
  }

  function handleReopenOffer(offer: SavedOffer) {
    actions.loadFlow({
      step: 'simulacao',
      product: createEmptyProduct(),
      objective: null,
      selectedStrategyId: offer.strategyId,
      fieldValues: { ...offer.fieldValues },
      simResult: offer.simResult,
      presentation: offer.presentation || {
        productName: offer.productName,
        productType: '',
        normalPrice: priceToInputText(offer.simResult.normalPrice),
        promoPrice: priceToInputText(offer.simResult.offerPrice),
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
      pricingSignature: offer.productSignature,
    })
  }

  if (editingProduct) {
    return <ProductEditor product={editingProduct} onSave={handleSaveProduct} onCancel={() => setEditingProduct(null)} />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Meus Produtos e Ofertas</h2>
        <p className="mt-1 text-slate-500">
          Cadastre produtos, salve ofertas e retome de onde parou. Tudo fica salvo no seu navegador.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('products')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'products' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Produtos ({state.products.length})
        </button>
        <button
          onClick={() => setTab('offers')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'offers' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Ofertas salvas ({state.offers.length})
        </button>
      </div>

      {/* Search + actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="input-field pl-12"
          />
        </div>
        {tab === 'products' && (
          <button onClick={handleNewProduct} className="btn-primary">
            <PlusIcon className="w-4 h-4" />
            Novo produto
          </button>
        )}
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <DownloadIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Backup</span>
          </button>
          <label className="btn-secondary cursor-pointer">
            <UploadIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Importar</span>
            <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Products list */}
      {tab === 'products' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.length === 0 && (
            <div className="card col-span-full flex flex-col items-center justify-center p-10 text-center">
              <SearchIcon className="mb-3 w-10 h-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">
                {state.products.length === 0 ? 'Nenhum produto cadastrado ainda.' : 'Nenhum produto encontrado.'}
              </p>
            </div>
          )}
          {filteredProducts.map((p) => {
            const result = p.cost > 0 && p.marginPercent > 0 ? calculatePricing({ cost: p.cost, additionalCosts: p.additionalCosts, feePercent: p.feePercent, feeFixed: p.feeFixed, marginPercent: p.marginPercent }) : null
            return (
              <div key={p.id} className="card p-5">
                <h3 className="font-semibold text-slate-900">{p.name || 'Sem nome'}</h3>
                {p.type && <span className="text-xs text-slate-400">{p.type}</span>}
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Custo</span><span className="font-medium text-slate-700">{formatCurrency(p.cost)}</span></div>
                  {result && (
                    <>
                      <div className="flex justify-between"><span className="text-slate-500">Preço sugerido</span><span className="font-medium text-slate-700">{formatCurrency(result.suggestedPrice)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Lucro</span><span className="font-medium text-green-600">{formatCurrency(result.profit)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Margem</span><span className="font-medium text-slate-700">{result.marginPercent.toFixed(1)}%</span></div>
                    </>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setEditingProduct(p)} className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                    <EditIcon className="w-3.5 h-3.5 inline mr-1" />
                    Editar
                  </button>
                  <button onClick={() => handleDuplicateProduct(p)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                    <DuplicateIcon className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => actions.deleteProduct(p.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Offers list */}
      {tab === 'offers' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOffers.length === 0 && (
            <div className="card col-span-full flex flex-col items-center justify-center p-10 text-center">
              <SearchIcon className="mb-3 w-10 h-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">
                {state.offers.length === 0 ? 'Nenhuma oferta salva ainda.' : 'Nenhuma oferta encontrada.'}
              </p>
            </div>
          )}
          {filteredOffers.map((o) => {
            const sig = productSignature(state.flow.product)
            const stale = o.productSignature !== sig && state.flow.product.cost > 0
            return (
              <div key={o.id} className="card p-5">
                <h3 className="font-semibold text-slate-900">{o.productName}</h3>
                <span className="text-xs text-primary-600">{o.strategyName}</span>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Preço da oferta</span><span className="font-medium text-slate-700">{formatCurrency(o.simResult.offerPrice)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Lucro</span><span className={`font-medium ${o.simResult.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(o.simResult.profit)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Margem</span><span className="font-medium text-slate-700">{o.simResult.marginPercent.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Criada em</span><span className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</span></div>
                </div>
                {stale && (
                  <div className="mt-2 flex items-center gap-1.5 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
                    <AlertIcon className="w-3 h-3" />
                    Produto alterado — valores podem estar desatualizados
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleReopenOffer(o)} className="flex-1 rounded-lg bg-primary-600 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700">
                    Reabrir
                  </button>
                  <button onClick={() => actions.deleteOffer(o.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Product Editor ──────────────────────────────────────────────────────────

function ProductEditor({ product, onSave, onCancel }: {
  product: Product
  onSave: (p: Product) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<Product>(product)
  const update = useCallback(<K extends keyof Product>(key: K, value: Product[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value, updatedAt: new Date().toISOString() }))
  }, [])

  const result = useMemo(() => {
    if (draft.cost <= 0 || draft.marginPercent <= 0) return null
    const divisor = 1 - draft.feePercent / 100 - draft.marginPercent / 100
    if (divisor <= 0) return null
    return calculatePricing({ cost: draft.cost, additionalCosts: draft.additionalCosts, feePercent: draft.feePercent, feeFixed: draft.feeFixed, marginPercent: draft.marginPercent })
  }, [draft])

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={onCancel} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700">
        <ArrowLeftIcon className="w-4 h-4" />
        Voltar
      </button>

      <div className="card p-5 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {product.id ? 'Editar produto' : 'Novo produto'}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="input-label" htmlFor="pe-name">Nome do produto <span className="text-red-500">*</span></label>
            <input id="pe-name" type="text" value={draft.name} onChange={(e) => update('name', e.target.value)} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="input-label" htmlFor="pe-type">Tipo / segmento</label>
            <input id="pe-type" type="text" value={draft.type || ''} onChange={(e) => update('type', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="input-label" htmlFor="pe-cost">Custo <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <DecimalInput id="pe-cost" value={draft.cost} onValueChange={(v) => update('cost', v)} placeholder="0,00" className="input-field pl-11" />
            </div>
          </div>
          <div>
            <label className="input-label" htmlFor="pe-add">Despesas adicionais</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <DecimalInput id="pe-add" value={draft.additionalCosts} onValueChange={(v) => update('additionalCosts', v)} placeholder="0,00" className="input-field pl-11" />
            </div>
          </div>
          <div>
            <label className="input-label" htmlFor="pe-fee">Taxa (%)</label>
            <div className="relative">
              <DecimalInput id="pe-fee" value={draft.feePercent} onValueChange={(v) => update('feePercent', v)} placeholder="0" className="input-field pr-9" />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
            </div>
          </div>
          <div>
            <label className="input-label" htmlFor="pe-feefix">Taxa fixa</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <DecimalInput id="pe-feefix" value={draft.feeFixed} onValueChange={(v) => update('feeFixed', v)} placeholder="0,00" className="input-field pl-11" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="input-label" htmlFor="pe-margin">Margem desejada (%) <span className="text-red-500">*</span></label>
            <DecimalInput id="pe-margin" value={draft.marginPercent} onValueChange={(v) => update('marginPercent', v)} placeholder="30" className="input-field pr-9" />
          </div>
        </div>

        {result && (
          <div className="mt-4 rounded-lg bg-slate-50 p-4 animate-fade-in">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-xs text-slate-400">Preço sugerido</p><p className="mt-0.5 text-lg font-bold text-slate-900">{formatCurrency(result.suggestedPrice)}</p></div>
              <div><p className="text-xs text-slate-400">Lucro</p><p className="mt-0.5 text-lg font-bold text-green-600">{formatCurrency(result.profit)}</p></div>
              <div><p className="text-xs text-slate-400">Margem</p><p className="mt-0.5 text-lg font-bold text-slate-900">{result.marginPercent.toFixed(1)}%</p></div>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button onClick={() => onSave(draft)} className="btn-primary flex-1">
            <CheckCircleIcon className="w-4 h-4" />
            Salvar produto
          </button>
          <button onClick={onCancel} className="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  )
}
