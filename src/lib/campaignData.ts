export type AdFormatId =
  | 'stories'
  | 'feed-square'
  | 'feed-vertical'
  | 'facebook'
  | 'tiktok'
  | 'whatsapp'

export interface AdFormat {
  id: AdFormatId
  label: string
  ratio: string
  width: number
  height: number
}

export const adFormats: AdFormat[] = [
  { id: 'stories', label: 'Stories', ratio: '9:16', width: 360, height: 640 },
  { id: 'feed-square', label: 'Feed Quadrado', ratio: '1:1', width: 400, height: 400 },
  { id: 'feed-vertical', label: 'Feed Vertical', ratio: '4:5', width: 360, height: 450 },
  { id: 'facebook', label: 'Facebook', ratio: '1.91:1', width: 400, height: 209 },
  { id: 'tiktok', label: 'TikTok', ratio: '9:16', width: 360, height: 640 },
  { id: 'whatsapp', label: 'WhatsApp', ratio: 'mensagem', width: 360, height: 480 },
]

export type CampaignStyleId = 'minimalist' | 'promotional' | 'elegant' | 'product-focused'

export interface CampaignStyle {
  id: CampaignStyleId
  label: string
  bg: string
  cardBg: string
  primary: string
  secondary: string
  textOnBg: string
  textOnCard: string
  fontScale: number
  showBadge: boolean
}

export const stylePresets: CampaignStyle[] = [
  {
    id: 'minimalist',
    label: 'Minimalista',
    bg: '#f8fafc',
    cardBg: '#ffffff',
    primary: '#1e2a4a',
    secondary: '#64748b',
    textOnBg: '#1e293b',
    textOnCard: '#0f172a',
    fontScale: 1,
    showBadge: false,
  },
  {
    id: 'promotional',
    label: 'Promocional',
    bg: '#1e2a4a',
    cardBg: '#ffffff',
    primary: '#dc2626',
    secondary: '#f59e0b',
    textOnBg: '#ffffff',
    textOnCard: '#0f172a',
    fontScale: 1.1,
    showBadge: true,
  },
  {
    id: 'elegant',
    label: 'Elegante',
    bg: '#0f172a',
    cardBg: '#1e293b',
    primary: '#c4a854',
    secondary: '#94a3b8',
    textOnBg: '#e2e8f0',
    textOnCard: '#f1f5f9',
    fontScale: 0.95,
    showBadge: false,
  },
  {
    id: 'product-focused',
    label: 'Foco no produto',
    bg: '#ffffff',
    cardBg: '#f8fafc',
    primary: '#2563eb',
    secondary: '#10b981',
    textOnBg: '#0f172a',
    textOnCard: '#0f172a',
    fontScale: 1,
    showBadge: true,
  },
]
