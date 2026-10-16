import { useMemo, useState, useCallback } from 'react'
import { useMargemPro } from '../../state/AppContext'
import { copyTemplates, channels, styles, type ChannelId, type StyleId } from '../../lib/copywritingData'
import { generateMessages } from '../../lib/messageGenerator'
import { CopyIcon } from '../Icons'
import { EditIcon } from '../PresentationIcons'

export function FlowApresentacao() {
  const { state, actions } = useMargemPro()
  const form = state.flow.presentation
  const simResult = state.flow.simResult
  const product = state.flow.product

  // Auto-fill from flow data if form is empty
  const autoFilled = useMemo(() => {
    const updated = { ...form }
    if (!updated.productName && product.name) updated.productName = product.name
    if (!updated.productType && product.type) updated.productType = product.type
    if (!updated.normalPrice && simResult) updated.normalPrice = String(simResult.normalPrice || '')
    if (!updated.promoPrice && simResult) updated.promoPrice = String(simResult.offerPrice || '')
    if (!updated.quantity && simResult) updated.quantity = String(simResult.unitCount || '')
    return updated
  }, [form, product, simResult])

  const updateField = useCallback((key: keyof typeof autoFilled, value: string) => {
    actions.setPresentation({ ...autoFilled, [key]: value })
  }, [actions, autoFilled])

  const messages = useMemo(() => {
    if (!autoFilled.productName.trim()) return []
    return generateMessages(autoFilled, copyTemplates)
  }, [autoFilled])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function copy(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="flex items-start gap-2">
          <CopyIcon className="mt-0.5 w-5 h-5 flex-shrink-0 text-primary-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Apresentação comercial</h3>
            <p className="mt-1 text-xs text-slate-500">
              Os dados do produto e da oferta foram preenchidos automaticamente. Ajuste o canal e o estilo, edite os textos e copie.
            </p>
          </div>
        </div>
      </div>

      {/* Quick controls */}
      <div className="card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="input-label" htmlFor="fa-channel">Canal</label>
            <select
              id="fa-channel"
              value={autoFilled.channel}
              onChange={(e) => updateField('channel', e.target.value as ChannelId)}
              className="input-field"
            >
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label" htmlFor="fa-style">Estilo</label>
            <select
              id="fa-style"
              value={autoFilled.style}
              onChange={(e) => updateField('style', e.target.value as StyleId)}
              className="input-field"
            >
              {styles.map((st) => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="input-label" htmlFor="fa-name">Produto</label>
            <input id="fa-name" type="text" value={autoFilled.productName} onChange={(e) => updateField('productName', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="input-label" htmlFor="fa-benefit">Benefício</label>
            <input id="fa-benefit" type="text" value={autoFilled.benefit} onChange={(e) => updateField('benefit', e.target.value)} placeholder="Principal benefício" className="input-field" />
          </div>
          <div>
            <label className="input-label" htmlFor="fa-normal">Preço normal</label>
            <input id="fa-normal" type="text" value={autoFilled.normalPrice} onChange={(e) => updateField('normalPrice', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="input-label" htmlFor="fa-promo">Preço promocional</label>
            <input id="fa-promo" type="text" value={autoFilled.promoPrice} onChange={(e) => updateField('promoPrice', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* Generated messages */}
      {messages.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-900">Mensagens geradas ({messages.length})</h3>
          {messages.map((msg) => {
            const isEditing = editingId === msg.templateId
            const content = editedContent[msg.templateId] ?? msg.fullText
            const copyId = `fa-msg-${msg.templateId}`
            return (
              <div key={msg.templateId} className="card p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{msg.templateName}</h4>
                    <span className="text-xs text-slate-400">{channels.find((c) => c.id === msg.channel)?.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setEditingId(null)
                        } else {
                          setEditingId(msg.templateId)
                          setEditedContent((prev) => ({ ...prev, [msg.templateId]: msg.fullText }))
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <EditIcon className="w-3.5 h-3.5" />
                      {isEditing ? 'Concluir' : 'Editar'}
                    </button>
                    <button
                      onClick={() => copy(copyId, content)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      <CopyIcon className="w-3.5 h-3.5" />
                      {copiedId === copyId ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
                {isEditing ? (
                  <textarea
                    value={content}
                    onChange={(e) => setEditedContent((prev) => ({ ...prev, [msg.templateId]: e.target.value }))}
                    className="input-field min-h-[120px] font-mono text-sm"
                  />
                ) : (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{content}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {messages.length === 0 && (
        <div className="card flex flex-col items-center justify-center p-8 text-center">
          <p className="text-sm font-medium text-slate-500">
            Preencha o nome do produto para gerar as mensagens.
          </p>
        </div>
      )}
    </div>
  )
}
