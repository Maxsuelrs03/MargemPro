import { useState, useMemo, useCallback } from 'react'
import {
  type ChannelId,
  type StyleId,
  channels,
  styles,
  copyTemplates,
  whatsappScenarios,
  mentalTriggers,
  closingTechniques,
} from '../lib/copywritingData'
import {
  type MessageFormData,
  generateMessages,
} from '../lib/messageGenerator'
import { strategies } from '../lib/strategyData'
import {
  AlertIcon,
  CheckCircleIcon,
  InfoIcon,
  CopyIcon,
  ChevronDownIcon,
  LightbulbIcon,
  SearchIcon,
  RefreshIcon,
} from './Icons'
import {
  MessageIcon,
  LibraryIcon,
  ChatIcon,
  CameraIcon,
  ShieldIcon,
  ZapIcon,
  EditIcon,
  CheckIcon,
} from './PresentationIcons'

type SectionId =
  | 'criador'
  | 'modelos'
  | 'whatsapp'
  | 'stories'
  | 'objecoes'
  | 'gatilhos'
  | 'fechamento'

interface SectionInfo {
  id: SectionId
  label: string
  shortLabel: string
  icon: typeof MessageIcon
  description: string
}

const sections: SectionInfo[] = [
  { id: 'criador', label: 'Criador de mensagens', shortLabel: 'Criador', icon: MessageIcon, description: 'Gere mensagens personalizadas a partir dos dados da sua oferta.' },
  { id: 'modelos', label: 'Modelos de copywriting', shortLabel: 'Modelos', icon: LibraryIcon, description: 'Biblioteca de textos prontos para adaptar e usar.' },
  { id: 'whatsapp', label: 'WhatsApp e atendimento', shortLabel: 'WhatsApp', icon: ChatIcon, description: 'Respostas prontas para situações reais de venda.' },
  { id: 'stories', label: 'Stories e publicações', shortLabel: 'Stories', icon: CameraIcon, description: 'Textos curtos e posts para o Instagram.' },
  { id: 'objecoes', label: 'Respostas a objeções', shortLabel: 'Objeções', icon: AlertIcon, description: 'Como responder quando o cliente resiste.' },
  { id: 'gatilhos', label: 'Gatilhos mentais', shortLabel: 'Gatilhos', icon: ZapIcon, description: 'Princípios de persuasão aplicados com responsabilidade.' },
  { id: 'fechamento', label: 'Fechamento e CTA', shortLabel: 'Fechamento', icon: CheckCircleIcon, description: 'Técnicas para concluir a venda e chamar o cliente à ação.' },
]

// ─── Função auxiliar de cópia ────────────────────────────────────────────────

function useCopyToClipboard() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }, [])

  return { copiedId, copy }
}

// ─── Componente principal ────────────────────────────────────────────────────

export function OfferPresentation() {
  const [section, setSection] = useState<SectionId>('criador')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Apresentação de Ofertas</h2>
        <p className="mt-1 text-slate-500">
          Transforme suas ofertas em mensagens de venda claras e prontas para usar no Instagram e WhatsApp.
        </p>
      </div>

      {/* Section tabs */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => {
            const Icon = s.icon
            const active = section === s.id
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Section content */}
      {section === 'criador' && <MessageCreator />}
      {section === 'modelos' && <TemplateLibrary />}
      {section === 'whatsapp' && <WhatsAppSection />}
      {section === 'stories' && <StoriesSection />}
      {section === 'objecoes' && <ObjectionsSection />}
      {section === 'gatilhos' && <MentalTriggersSection />}
      {section === 'fechamento' && <ClosingSection />}
    </div>
  )
}

// ─── 1. Criador de mensagens ─────────────────────────────────────────────────

function MessageCreator() {
  const { copiedId, copy } = useCopyToClipboard()
  const [showOfferImport, setShowOfferImport] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<Record<string, string>>({})

  const [form, setForm] = useState<MessageFormData>({
    productName: '',
    productType: '',
    normalPrice: '',
    promoPrice: '',
    benefit: '',
    audience: '',
    objective: '',
    deadline: '',
    quantity: '',
    channel: 'whatsapp',
    style: 'direto',
  })

  const updateField = useCallback(<K extends keyof MessageFormData>(key: K, value: MessageFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  const generatedMessages = useMemo(() => {
    if (!form.productName.trim() || (!form.normalPrice && !form.promoPrice)) return []
    return generateMessages(form, copyTemplates)
  }, [form])

  const importFromOffer = useCallback((strategyId: string) => {
    const strategy = strategies.find((s) => s.id === strategyId)
    if (!strategy) return
    const ev = strategy.exampleValues
    setForm((prev) => ({
      ...prev,
      productName: strategy.shortName,
      productType: strategy.businessTypes[0] || '',
      normalPrice: ev.originalPrice || ev.price1 || ev.totalSeparatePrice || '',
      promoPrice: ev.promoPrice || ev.offerPrice || ev.comboPrice || ev.kitPrice || ev.bundlePrice || '',
      quantity: ev.stockLimit || ev.itemCount || ev.minQty || ev.qtyTier1 || '',
    }))
    setShowOfferImport(false)
  }, [])

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Offer integration banner */}
      <div className="card border-primary-200 bg-primary-50 p-4">
        <div className="flex items-start gap-3">
          <InfoIcon className="mt-0.5 w-5 h-5 flex-shrink-0 text-primary-600" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-primary-900">Importar do Banco de Ofertas</h3>
            <p className="mt-1 text-xs text-primary-800">
              Selecione uma oferta já criada para preencher automaticamente os dados do produto, preço e quantidade.
            </p>
            <button
              onClick={() => setShowOfferImport(!showOfferImport)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-700"
            >
              {showOfferImport ? 'Fechar lista' : 'Escolher oferta'}
            </button>
          </div>
        </div>
      </div>

      {/* Offer import list */}
      {showOfferImport && (
        <div className="card p-4 animate-fade-in">
          <div className="mb-3 flex items-center gap-2">
            <SearchIcon className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Ofertas disponíveis</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-80 overflow-y-auto">
            {strategies.map((s) => (
              <button
                key={s.id}
                onClick={() => importFromOffer(s.id)}
                className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-primary-300 hover:bg-primary-50"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-500">
                  {s.number}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{s.shortName}</p>
                  <p className="text-xs text-slate-400">{s.objective.slice(0, 50)}...</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="card p-5 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Dados da oferta
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="input-label" htmlFor="mc-product">
              Nome do produto <span className="text-red-500">*</span>
            </label>
            <input
              id="mc-product"
              type="text"
              value={form.productName}
              onChange={(e) => updateField('productName', e.target.value)}
              placeholder="Ex: Blusa de algodão premium"
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="mc-type">Tipo de produto ou segmento</label>
            <input
              id="mc-type"
              type="text"
              value={form.productType}
              onChange={(e) => updateField('productType', e.target.value)}
              placeholder="Ex: Roupas, cosméticos, acessórios..."
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="mc-normal">Preço normal</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <input
                id="mc-normal"
                type="text"
                inputMode="decimal"
                value={form.normalPrice}
                onChange={(e) => updateField('normalPrice', e.target.value)}
                placeholder="0,00"
                className="input-field pl-11"
              />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="mc-promo">Preço promocional</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <input
                id="mc-promo"
                type="text"
                inputMode="decimal"
                value={form.promoPrice}
                onChange={(e) => updateField('promoPrice', e.target.value)}
                placeholder="0,00"
                className="input-field pl-11"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="input-label" htmlFor="mc-benefit">
              Principal benefício do produto
            </label>
            <input
              id="mc-benefit"
              type="text"
              value={form.benefit}
              onChange={(e) => updateField('benefit', e.target.value)}
              placeholder="Ex: Tecido que não encolhe, duração de 12h, aroma que fixa..."
              className="input-field"
            />
            <p className="mt-1.5 text-xs text-slate-400">Descreva um benefício real do produto, não invente características.</p>
          </div>

          <div>
            <label className="input-label" htmlFor="mc-audience">Público-alvo</label>
            <input
              id="mc-audience"
              type="text"
              value={form.audience}
              onChange={(e) => updateField('audience', e.target.value)}
              placeholder="Ex: Mulheres 25-40, mães, jovens fitness..."
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="mc-objective">Objetivo da oferta</label>
            <input
              id="mc-objective"
              type="text"
              value={form.objective}
              onChange={(e) => updateField('objective', e.target.value)}
              placeholder="Ex: Atrair novos clientes, girar estoque..."
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="mc-deadline">Prazo da promoção</label>
            <input
              id="mc-deadline"
              type="text"
              value={form.deadline}
              onChange={(e) => updateField('deadline', e.target.value)}
              placeholder="Ex: sexta 23h59, 48h, enquanto durar..."
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="mc-quantity">Quantidade disponível</label>
            <input
              id="mc-quantity"
              type="text"
              inputMode="numeric"
              value={form.quantity}
              onChange={(e) => updateField('quantity', e.target.value)}
              placeholder="Ex: 20 unidades"
              className="input-field"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="mc-channel">Canal de divulgação</label>
            <select
              id="mc-channel"
              value={form.channel}
              onChange={(e) => updateField('channel', e.target.value as ChannelId)}
              className="input-field"
            >
              {channels.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label" htmlFor="mc-style">Estilo de comunicação</label>
            <select
              id="mc-style"
              value={form.style}
              onChange={(e) => updateField('style', e.target.value as StyleId)}
              className="input-field"
            >
              {styles.map((st) => (
                <option key={st.id} value={st.id}>{st.label}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-400">
              {styles.find((s) => s.id === form.style)?.description}
            </p>
          </div>
        </div>

        {/* Optional fields */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Campos opcionais (para modelos específicos)
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="input-label" htmlFor="mc-brinde">Brinde (se houver)</label>
              <input
                id="mc-brinde"
                type="text"
                value={form.brinde || ''}
                onChange={(e) => updateField('brinde', e.target.value)}
                placeholder="Ex: Amostra grátis, embalagem especial..."
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label" htmlFor="mc-complemento">Produto complementar</label>
              <input
                id="mc-complemento"
                type="text"
                value={form.complemento || ''}
                onChange={(e) => updateField('complemento', e.target.value)}
                placeholder="Ex: Hidratante combinando..."
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label" htmlFor="mc-ocasiao">Ocasião (para campanhas)</label>
              <input
                id="mc-ocasiao"
                type="text"
                value={form.ocasiao || ''}
                onChange={(e) => updateField('ocasiao', e.target.value)}
                placeholder="Ex: Dia das Mães, Black Friday..."
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label" htmlFor="mc-parcelas">Parcelas / desconto Pix</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="mc-parcelas"
                  type="text"
                  inputMode="numeric"
                  value={form.parcelas || ''}
                  onChange={(e) => updateField('parcelas', e.target.value)}
                  placeholder="12x"
                  className="input-field"
                />
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.descontoPix || ''}
                  onChange={(e) => updateField('descontoPix', e.target.value)}
                  placeholder="5% Pix"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setForm({
            productName: '', productType: '', normalPrice: '', promoPrice: '',
            benefit: '', audience: '', objective: '', deadline: '', quantity: '',
            channel: 'whatsapp', style: 'direto',
          })}
          className="btn-secondary mt-4 w-full sm:w-auto"
        >
          <RefreshIcon className="w-4 h-4" />
          Limpar campos
        </button>
      </div>

      {/* Generated messages */}
      {generatedMessages.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <MessageIcon className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Mensagens geradas ({generatedMessages.length})
            </h3>
          </div>
          {generatedMessages.map((msg) => {
            const isEditing = editingMessageId === msg.templateId
            const content = editedContent[msg.templateId] ?? msg.fullText
            const copyId = `msg-${msg.templateId}`

            return (
              <div key={msg.templateId} className="card p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{msg.templateName}</h4>
                    <span className="text-xs text-slate-400">
                      {channels.find((c) => c.id === msg.channel)?.label}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setEditingMessageId(null)
                        } else {
                          setEditingMessageId(msg.templateId)
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

      {generatedMessages.length === 0 && form.productName.trim() && (
        <div className="card flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <MessageIcon className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            Preencha pelo menos o nome do produto e um preço para gerar as mensagens.
          </p>
        </div>
      )}

      {generatedMessages.length === 0 && !form.productName.trim() && (
        <div className="card flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <MessageIcon className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            Preencha os dados da oferta acima para gerar mensagens personalizadas.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── 2. Biblioteca de modelos ────────────────────────────────────────────────

function TemplateLibrary() {
  const { copiedId, copy } = useCopyToClipboard()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const categories = useMemo(() => {
    const set = new Set(copyTemplates.map((t) => t.category))
    return ['all', ...Array.from(set)]
  }, [])

  const filtered = useMemo(() => {
    return copyTemplates.filter((t) => {
      if (filterCategory !== 'all' && t.category !== filterCategory) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!t.name.toLowerCase().includes(q) &&
            !t.whenToUse.toLowerCase().includes(q) &&
            !t.template.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [search, filterCategory])

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, uso ou conteúdo..."
          className="input-field pl-12"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              filterCategory === cat
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'Todas' : cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card flex flex-col items-center justify-center p-10 text-center">
          <SearchIcon className="mb-3 w-10 h-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Nenhum modelo encontrado.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((tmpl) => {
          const expanded = expandedId === tmpl.id
          const copyId = `tmpl-${tmpl.id}`
          const filledTemplate = tmpl.template
          return (
            <div key={tmpl.id} className="card p-5 transition-all hover:shadow-md">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{tmpl.name}</h3>
                  <span className="text-xs font-medium text-primary-600">{tmpl.category}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tmpl.channels.map((ch) => (
                    <span key={ch} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                      {channels.find((c) => c.id === ch)?.shortLabel}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mb-3 text-sm text-slate-500">{tmpl.whenToUse}</p>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="whitespace-pre-wrap text-sm text-slate-700">{filledTemplate}</p>
              </div>

              {expanded && (
                <div className="mt-3 animate-fade-in">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Chamada para ação:</p>
                  <p className="text-sm text-slate-600">{tmpl.cta}</p>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => copy(copyId, `${tmpl.template}\n\n${tmpl.cta}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                  {copiedId === copyId ? 'Copiado!' : 'Copiar modelo'}
                </button>
                <button
                  onClick={() => setExpandedId(expanded ? null : tmpl.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
                >
                  <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  {expanded ? 'Recolher' : 'Ver CTA'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 3. WhatsApp e atendimento ───────────────────────────────────────────────

function WhatsAppSection() {
  const { copiedId, copy } = useCopyToClipboard()
  const [selectedId, setSelectedId] = useState(whatsappScenarios[0].id)
  const selected = whatsappScenarios.find((s) => s.id === selectedId)!
  const [editedResponse, setEditedResponse] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const copyId = `whatsapp-${selected.id}`

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Situation list */}
        <div className="lg:col-span-1">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Situações de atendimento
          </h3>
          <div className="space-y-2">
            {whatsappScenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => { setSelectedId(sc.id); setIsEditing(false); setEditedResponse('') }}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selectedId === sc.id
                    ? 'border-primary-500 bg-primary-50 text-primary-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <p className="text-sm font-medium">{sc.situation}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Response detail */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h3 className="mb-1 text-base font-semibold text-slate-900">{selected.situation}</h3>

            <div className="mb-4 rounded-lg bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <LightbulbIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-amber-600" />
                <p className="text-xs text-amber-800">{selected.tip}</p>
              </div>
            </div>

            <div className="mb-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Resposta sugerida</p>
              {isEditing ? (
                <textarea
                  value={editedResponse}
                  onChange={(e) => setEditedResponse(e.target.value)}
                  className="input-field min-h-[120px] font-mono text-sm"
                />
              ) : (
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="whitespace-pre-wrap text-sm text-slate-700">
                    {editedResponse || selected.response}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false)
                  } else {
                    setEditedResponse(selected.response)
                    setIsEditing(true)
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <EditIcon className="w-4 h-4" />
                {isEditing ? 'Concluir edição' : 'Editar resposta'}
              </button>
              <button
                onClick={() => copy(copyId, editedResponse || selected.response)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <CopyIcon className="w-4 h-4" />
                {copiedId === copyId ? 'Copiado!' : 'Copiar resposta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 4. Stories e publicações ────────────────────────────────────────────────

function StoriesSection() {
  const { copiedId, copy } = useCopyToClipboard()
  const storiesTemplates = copyTemplates.filter((t) => t.channels.includes('stories'))
  const pubTemplates = copyTemplates.filter((t) => t.channels.includes('publicacao'))

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stories */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <CameraIcon className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-bold text-slate-900">Textos para Stories</h3>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Textos curtos e diretos, ideais para o formato vertical do Instagram Stories.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {storiesTemplates.map((tmpl) => {
            const copyId = `story-${tmpl.id}`
            return (
              <div key={tmpl.id} className="card p-5">
                <h4 className="mb-2 text-sm font-semibold text-slate-900">{tmpl.name}</h4>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{tmpl.template}</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-slate-400">CTA: {tmpl.cta}</p>
                </div>
                <button
                  onClick={() => copy(copyId, `${tmpl.template}\n\n${tmpl.cta}`)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                  {copiedId === copyId ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Publicações */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <LibraryIcon className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-bold text-slate-900">Textos para publicações do feed</h3>
        </div>
        <p className="mb-4 text-sm text-slate-500">
          Postagens mais estruturadas, com espaço para contexto e descrição completa.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {pubTemplates.map((tmpl) => {
            const copyId = `pub-${tmpl.id}`
            return (
              <div key={tmpl.id} className="card p-5">
                <h4 className="mb-2 text-sm font-semibold text-slate-900">{tmpl.name}</h4>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{tmpl.template}</p>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-slate-400">CTA: {tmpl.cta}</p>
                </div>
                <button
                  onClick={() => copy(copyId, `${tmpl.template}\n\n${tmpl.cta}`)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                  {copiedId === copyId ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── 5. Respostas a objeções ─────────────────────────────────────────────────

function ObjectionsSection() {
  const objectionScenarios = whatsappScenarios.filter((s) =>
    ['produto-caro', 'pede-desconto', 'vai-pensar', 'compara-produto', 'indeciso', 'interesse-sem-conclusao'].includes(s.id)
  )
  const { copiedId, copy } = useCopyToClipboard()

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="card p-4">
        <div className="flex items-start gap-2">
          <InfoIcon className="mt-0.5 w-5 h-5 flex-shrink-0 text-primary-600" />
          <p className="text-sm text-primary-800">
            Cada objeção é uma oportunidade de entender o que o cliente precisa. As respostas abaixo são referências — adapte para a sua realidade e nunca prometa condições que você não pode cumprir.
          </p>
        </div>
      </div>

      {objectionScenarios.map((sc) => {
        const copyId = `obj-${sc.id}`
        return (
          <div key={sc.id} className="card p-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">{sc.situation}</h3>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-sm text-slate-700">{sc.response}</p>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
              <LightbulbIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-amber-600" />
              <p className="text-xs text-amber-800">{sc.tip}</p>
            </div>
            <button
              onClick={() => copy(copyId, sc.response)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <CopyIcon className="w-3.5 h-3.5" />
              {copiedId === copyId ? 'Copiado!' : 'Copiar resposta'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── 6. Gatilhos mentais ─────────────────────────────────────────────────────

function MentalTriggersSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="card p-4">
        <div className="flex items-start gap-2">
          <ShieldIcon className="mt-0.5 w-5 h-5 flex-shrink-0 text-green-600" />
          <p className="text-sm text-green-800">
            Gatilhos mentais são princípios de persuasão. Usados com honestidade, ajudam o cliente a decidir. Usados de forma enganosa, destroem confiança. Use apenas o que for verdadeiro no seu negócio.
          </p>
        </div>
      </div>

      {mentalTriggers.map((trigger) => {
        const expanded = expandedId === trigger.id
        return (
          <div key={trigger.id} className="card overflow-hidden">
            <button
              onClick={() => setExpandedId(expanded ? null : trigger.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <ZapIcon className="w-5 h-5 text-primary-600" />
                <h3 className="text-sm font-semibold text-slate-900">{trigger.name}</h3>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            {expanded && (
              <div className="animate-fade-in border-t border-slate-100 p-5 space-y-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Princípio</p>
                  <p className="text-sm text-slate-600">{trigger.principle}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-green-700">Quando usar</p>
                  <p className="text-sm text-green-800">{trigger.whenToUse}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-slate-500">Exemplo</p>
                  <p className="text-sm text-slate-700">{trigger.example}</p>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
                  <AlertIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-red-600" />
                  <p className="text-xs text-red-800">{trigger.warning}</p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── 7. Fechamento e CTA ─────────────────────────────────────────────────────

function ClosingSection() {
  const { copiedId, copy } = useCopyToClipboard()

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="card p-4">
        <div className="flex items-start gap-2">
          <CheckCircleIcon className="mt-0.5 w-5 h-5 flex-shrink-0 text-primary-600" />
          <p className="text-sm text-primary-800">
            O fechamento é o momento de ajudar o cliente a agir. As técnicas abaixo funcionam melhor quando o cliente já entendeu o valor — não pule etapas.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {closingTechniques.map((tech) => {
          const copyId = `close-${tech.id}`
          return (
            <div key={tech.id} className="card p-5">
              <div className="mb-2 flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-slate-900">{tech.name}</h3>
              </div>
              <p className="mb-3 text-sm text-slate-500">{tech.description}</p>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm text-slate-700">{tech.example}</p>
              </div>
              <button
                onClick={() => copy(copyId, tech.example)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <CopyIcon className="w-3.5 h-3.5" />
                {copiedId === copyId ? 'Copiado!' : 'Copiar exemplo'}
              </button>
            </div>
          )
        })}
      </div>

      {/* CTA collection */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-slate-900">Chamadas para ação rápidas</h3>
        <div className="card p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              'Chama no WhatsApp e reserva o seu: [link]',
              'É só clicar no link da bio para garantir.',
              'Responda "quero" que eu separo o seu.',
              'Quantidade limitada — garanta enquanto tem.',
              'Só até [prazo]. Depois volta ao preço normal.',
              'Quer que eu reserve um para você? É sem compromisso.',
            ].map((cta, i) => {
              const copyId = `cta-${i}`
              return (
                <button
                  key={i}
                  onClick={() => copy(copyId, cta)}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-primary-300 hover:bg-primary-50"
                >
                  <span className="text-sm text-slate-700">{cta}</span>
                  <CopyIcon className="w-4 h-4 flex-shrink-0 text-slate-400" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
