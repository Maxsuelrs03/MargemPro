export type CategoryId = 'A' | 'B' | 'C' | 'D' | 'E'

export type ObjectiveId =
  | 'atrair-clientes'
  | 'aumentar-ticket'
  | 'girar-estoque'
  | 'vender-complementares'
  | 'incentivar-recompra'

export type FieldType = 'currency' | 'percent' | 'integer'

export interface StrategyField {
  id: string
  label: string
  type: FieldType
  placeholder: string
  required: boolean
  helpText?: string
}

export interface CategoryInfo {
  id: CategoryId
  label: string
  shortLabel: string
  description: string
}

export interface ObjectiveInfo {
  id: ObjectiveId
  label: string
  description: string
}

export interface Strategy {
  id: string
  number: number
  name: string
  shortName: string
  category: CategoryId
  objective: string
  whenToUse: string
  whenToAvoid: string
  howItWorks: string
  steps: string[]
  example: string
  businessTypes: string[]
  fields: StrategyField[]
  exampleValues: Record<string, string>
  objectives: ObjectiveId[]
  tips: string[]
  metrics: string[]
  commonMistakes: string[]
  recommendedAction: string
}

export const categories: CategoryInfo[] = [
  { id: 'A', label: 'Descontos e conversão', shortLabel: 'Descontos', description: 'Reduções de preço para acelerar a decisão de compra.' },
  { id: 'B', label: 'Combos e ticket médio', shortLabel: 'Combos', description: 'Agrupar produtos para aumentar o valor de cada pedido.' },
  { id: 'C', label: 'Benefícios e valor percebido', shortLabel: 'Benefícios', description: 'Agregar valor sem necessariamente reduzir o preço.' },
  { id: 'D', label: 'Estoque e recuperação de vendas', shortLabel: 'Estoque', description: 'Girar produtos parados e recuperar vendas perdidas.' },
  { id: 'E', label: 'Fidelização e campanhas', shortLabel: 'Fidelização', description: 'Construir relacionamento e criar campanhas sazonais.' },
]

export const objectives: ObjectiveInfo[] = [
  { id: 'atrair-clientes', label: 'Atrair novos clientes', description: 'Chamar a atenção de quem ainda não comprou de você.' },
  { id: 'aumentar-ticket', label: 'Aumentar o valor de cada pedido', description: 'Fazer o cliente levar mais itens ou produtos mais caros.' },
  { id: 'girar-estoque', label: 'Girar estoque parado', description: 'Vender produtos parados e liberar espaço e dinheiro.' },
  { id: 'vender-complementares', label: 'Vender produtos complementares', description: 'Juntar produtos que combinam para o cliente levar tudo.' },
  { id: 'incentivar-recompra', label: 'Incentivar a recompra', description: 'Fazer clientes que já compraram voltarem a comprar.' },
]
