import { useState, useRef, useMemo, useCallback } from 'react'
import { useMargemPro } from '../../state/AppContext'
import {
  type AdFormatId,
  type CampaignStyleId,
  adFormats,
  stylePresets,
} from '../../lib/campaignData'
import { formatCurrency } from '../../lib/format'
import { CopyIcon, DownloadIcon } from '../Icons'
import { parseNumber } from '../../lib/numbers'

interface CampaignDraftLocal {
  format: AdFormatId
  styleId: CampaignStyleId
  title: string
  body: string
  price: string
  originalPrice: string
  discountPercent: string
  cta: string
  primaryColor: string
  secondaryColor: string
}

function createEmptyDraft(): CampaignDraftLocal {
  return {
    format: 'stories',
    styleId: 'promotional',
    title: '',
    body: '',
    price: '',
    originalPrice: '',
    discountPercent: '',
    cta: 'Chama no WhatsApp para garantir!',
    primaryColor: '#2563eb',
    secondaryColor: '#10b981',
  }
}

export function CampaignStudio() {
  return <CampaignStudioInner flowMode={false} />
}

export function CampaignStudioInner({ flowMode: _flowMode }: { flowMode: boolean }) {
  const { state, pricingResult } = useMargemPro()
  const [copied, setCopied] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const initialDraft = useMemo<CampaignDraftLocal>(() => {
    const empty = createEmptyDraft()
    const sim = state.flow.simResult
    const product = state.flow.product
    if (sim) {
      empty.price = String(sim.offerPrice.toFixed(2))
      empty.originalPrice = String(sim.normalPrice.toFixed(2))
      empty.discountPercent = sim.customerSavingsPercent > 0 ? sim.customerSavingsPercent.toFixed(0) : ''
      empty.title = product.name || 'Oferta especial'
      empty.body = state.flow.presentation.benefit || ''
    } else if (pricingResult) {
      empty.price = pricingResult.suggestedPrice.toFixed(2)
      empty.title = product.name || 'Produto'
    }
    return empty
  }, [state.flow.simResult, state.flow.product, state.flow.presentation, pricingResult])

  const [draft, setDraft] = useState<CampaignDraftLocal>(initialDraft)

  const update = useCallback(<K extends keyof CampaignDraftLocal>(key: K, value: CampaignDraftLocal[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }, [])

  const currentFormat = adFormats.find((f) => f.id === draft.format) || adFormats[0]
  const currentStyle = stylePresets.find((s) => s.id === draft.styleId) || stylePresets[0]

  const priceNum = parseNumber(draft.price)
  const originalNum = parseNumber(draft.originalPrice)
  const discountNum = parseNumber(draft.discountPercent)
  const effectiveDiscount = discountNum > 0 ? discountNum : (originalNum > priceNum && originalNum > 0 ? ((originalNum - priceNum) / originalNum) * 100 : 0)

  function handleCopyText() {
    const text = `${draft.title}\n\n${draft.body}\n\nDe ${formatCurrency(originalNum)} por ${formatCurrency(priceNum)}\n${draft.cta}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleExportPNG() {
    if (!previewRef.current) return
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `margempro-${draft.format}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch {
      // html-to-image not installed — fallback: copy text
      handleCopyText()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Estúdio de Campanhas</h2>
        <p className="mt-1 text-slate-500">
          Crie anúncios visuais para suas ofertas em diferentes formatos e estilos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-4">
          {/* Format selector */}
          <div className="card p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Formato</h3>
            <div className="flex flex-wrap gap-2">
              {adFormats.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => update('format', fmt.id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    draft.format === fmt.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style selector */}
          <div className="card p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Estilo visual</h3>
            <div className="flex flex-wrap gap-2">
              {stylePresets.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    update('styleId', st.id)
                    update('primaryColor', st.primary)
                    update('secondaryColor', st.secondary)
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    draft.styleId === st.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text inputs */}
          <div className="card p-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conteúdo do anúncio</h3>
            <div>
              <label className="input-label" htmlFor="cs-title">Título</label>
              <input id="cs-title" type="text" value={draft.title} onChange={(e) => update('title', e.target.value)} placeholder="Nome do produto" className="input-field" />
            </div>
            <div>
              <label className="input-label" htmlFor="cs-body">Texto / Benefício</label>
              <textarea id="cs-body" value={draft.body} onChange={(e) => update('body', e.target.value)} placeholder="Descreva o benefício principal" className="input-field min-h-[60px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label" htmlFor="cs-price">Preço da oferta</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input id="cs-price" type="text" inputMode="decimal" value={draft.price} onChange={(e) => update('price', e.target.value)} className="input-field pl-11" />
                </div>
              </div>
              <div>
                <label className="input-label" htmlFor="cs-orig">Preço normal</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input id="cs-orig" type="text" inputMode="decimal" value={draft.originalPrice} onChange={(e) => update('originalPrice', e.target.value)} className="input-field pl-11" />
                </div>
              </div>
            </div>
            <div>
              <label className="input-label" htmlFor="cs-cta">Chamada para ação</label>
              <input id="cs-cta" type="text" value={draft.cta} onChange={(e) => update('cta', e.target.value)} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label" htmlFor="cs-color1">Cor de destaque</label>
                <input id="cs-color1" type="color" value={draft.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="w-full h-10 rounded-lg border border-slate-200" />
              </div>
              <div>
                <label className="input-label" htmlFor="cs-color2">Cor secundária</label>
                <input id="cs-color2" type="color" value={draft.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} className="w-full h-10 rounded-lg border border-slate-200" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleCopyText} className="btn-secondary flex-1">
              <CopyIcon className="w-4 h-4" />
              {copied ? 'Copiado!' : 'Copiar texto'}
            </button>
            <button onClick={handleExportPNG} className="btn-primary flex-1">
              <DownloadIcon className="w-4 h-4" />
              Exportar PNG
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-500">Prévia do anúncio ({currentFormat.ratio})</h3>
          <div className="flex justify-center rounded-xl bg-slate-100 p-6">
            <AdPreview ref={previewRef} draft={draft} format={currentFormat} style={currentStyle} priceNum={priceNum} originalNum={originalNum} effectiveDiscount={effectiveDiscount} />
          </div>
          <p className="text-center text-xs text-slate-400">
            Prévia renderizada no app. A exportação PNG gera a imagem real para download.
          </p>
        </div>
      </div>
    </div>
  )
}

interface AdPreviewProps {
  draft: CampaignDraftLocal
  format: typeof adFormats[number]
  style: typeof stylePresets[number]
  priceNum: number
  originalNum: number
  effectiveDiscount: number
}

const AdPreview = (() => {
  const component = (props: AdPreviewProps, ref: React.Ref<HTMLDivElement>) => {
    const { draft, format, style, priceNum, originalNum, effectiveDiscount } = props
    const scale = 0.7
    const w = format.width * scale
    const h = format.height * scale

    if (draft.format === 'whatsapp') {
      return (
        <div ref={ref} style={{ width: w, background: '#e5ddd5', borderRadius: 12, overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ background: '#075e54', padding: '8px 12px', color: '#fff', fontSize: 13, fontWeight: 600 }}>Loja</div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 10, maxWidth: '90%', fontSize: 12, color: '#333' }}>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>{draft.title}</p>
              <p style={{ marginBottom: 6 }}>{draft.body}</p>
              {originalNum > 0 && priceNum > 0 && (
                <p style={{ marginBottom: 4 }}>
                  <span style={{ textDecoration: 'line-through', color: '#999', marginRight: 6 }}>{formatCurrency(originalNum)}</span>
                  <span style={{ fontWeight: 700, color: style.primary }}>{formatCurrency(priceNum)}</span>
                </p>
              )}
              <p style={{ fontSize: 11, color: '#666', marginTop: 6 }}>{draft.cta}</p>
            </div>
          </div>
        </div>
      )
    }

    const bg = style.bg
    const cardBg = style.cardBg
    const textColor = style.textOnBg
    const cardText = style.textOnCard
    const isVertical = format.height > format.width
    const isWide = format.width > format.height

    return (
      <div ref={ref} style={{
        width: w,
        height: h,
        background: bg,
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        color: textColor,
      }}>
        {/* Badge */}
        {style.showBadge && effectiveDiscount > 0 && (
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: style.primary,
            color: '#fff',
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 14 * style.fontScale,
            fontWeight: 700,
            zIndex: 2,
          }}>
            -{effectiveDiscount.toFixed(0)}%
          </div>
        )}

        {/* Image placeholder */}
        <div style={{
          flex: isWide ? 'none' : '1',
          height: isWide ? '60%' : undefined,
          background: `linear-gradient(135deg, ${style.primary}22, ${style.secondary}22)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isVertical ? 120 : 'auto',
        }}>
          <div style={{ textAlign: 'center', color: style.primary, opacity: 0.4, fontSize: 12 }}>
            Espaço para foto do produto
          </div>
        </div>

        {/* Content */}
        <div style={{
          padding: 16,
          background: cardBg,
          color: cardText,
          flex: isWide ? 'none' : 'none',
        }}>
          <h3 style={{ fontSize: 18 * style.fontScale, fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>
            {draft.title || 'Título do anúncio'}
          </h3>
          {draft.body && (
            <p style={{ fontSize: 13 * style.fontScale, opacity: 0.7, marginBottom: 10, lineHeight: 1.4 }}>
              {draft.body}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
            {originalNum > 0 && (
              <span style={{ fontSize: 14 * style.fontScale, textDecoration: 'line-through', opacity: 0.5 }}>
                {formatCurrency(originalNum)}
              </span>
            )}
            <span style={{ fontSize: 24 * style.fontScale, fontWeight: 700, color: style.primary }}>
              {formatCurrency(priceNum)}
            </span>
          </div>
          <div style={{
            background: style.primary,
            color: '#fff',
            borderRadius: 8,
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: 14 * style.fontScale,
            fontWeight: 600,
          }}>
            {draft.cta}
          </div>
        </div>
      </div>
    )
  }
  return Object.assign(
    (props: AdPreviewProps & { ref?: React.Ref<HTMLDivElement> }) => component(props, (props as { ref?: React.Ref<HTMLDivElement> }).ref || null),
    { displayName: 'AdPreview' }
  ) as React.ForwardRefExoticComponent<AdPreviewProps & React.RefAttributes<HTMLDivElement>>
})()
