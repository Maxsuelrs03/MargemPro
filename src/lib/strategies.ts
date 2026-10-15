export type StrategyId =
  | 'desconto-direto'
  | 'leve-mais-por-menos'
  | 'combos-kits'
  | 'desconto-progressivo'
  | 'brinde-estrategico'
  | 'aumentar-ticket'
  | 'queima-estoque'
  | 'clientes-recorrentes'

export type ObjectiveId =
  | 'atrair-clientes'
  | 'aumentar-ticket'
  | 'girar-estoque'
  | 'vender-complementares'
  | 'incentivar-recompra'

export interface StrategyField {
  id: string
  label: string
  type: 'currency' | 'percent' | 'integer'
  placeholder: string
  required: boolean
  helpText?: string
}

export interface Strategy {
  id: StrategyId
  name: string
  shortName: string
  objective: string
  howItWorks: string
  example: string
  businessTypes: string[]
  fields: StrategyField[]
  objectives: ObjectiveId[]
}

export const strategies: Strategy[] = [
  {
    id: 'desconto-direto',
    name: 'Desconto Direto',
    shortName: 'Desconto Direto',
    objective: 'Atrair clientes com um preço menor por tempo limitado.',
    howItWorks:
      'Você reduz o preço de um produto por um percentual fixo. O cliente vê o preço original riscado e o novo preço, sentindo que está aproveitando uma oportunidade.',
    example:
      'Uma blusa que custa R$ 80 para o cliente por R$ 120. Você aplica 15% de desconto: o cliente paga R$ 102 e você ainda lucra.',
    businessTypes: ['Roupas', 'Cosméticos', 'Acessórios', 'Presentes', 'Produtos variados'],
    objectives: ['atrair-clientes', 'girar-estoque'],
    fields: [
      { id: 'cost', label: 'Custo do produto', type: 'currency', placeholder: '0,00', required: true },
      { id: 'originalPrice', label: 'Preço de venda normal', type: 'currency', placeholder: '0,00', required: true },
      { id: 'discountPercent', label: 'Desconto (%)', type: 'percent', placeholder: '15', required: true },
      { id: 'additionalCosts', label: 'Despesas adicionais', type: 'currency', placeholder: '0,00', required: false, helpText: 'Embalagem, frete, etc.' },
      { id: 'feePercent', label: 'Taxa sobre a venda (%)', type: 'percent', placeholder: '0', required: false, helpText: 'Cartão, marketplace, etc.' },
      { id: 'feeFixed', label: 'Taxa fixa por venda', type: 'currency', placeholder: '0,00', required: false },
    ],
  },
  {
    id: 'leve-mais-por-menos',
    name: 'Leve Mais por Menos',
    shortName: 'Leve Mais por Menos',
    objective: 'Fazer o cliente levar mais unidades pagando um pouco mais, mas com economia por item.',
    howItWorks:
      'O cliente leva uma quantidade maior por um preço total com desconto. O valor por unidade fica menor, mas o lucro total da venda aumenta.',
    example:
      'Perfume que custa R$ 30 e vende por R$ 60. Oferta: leve 2 por R$ 100. O cliente economiza R$ 20, mas você lucra R$ 40 no total.',
    businessTypes: ['Cosméticos', 'Roupas', 'Acessórios', 'Presentes', 'Produtos variados'],
    objectives: ['aumentar-ticket', 'girar-estoque'],
    fields: [
      { id: 'cost', label: 'Custo por unidade', type: 'currency', placeholder: '0,00', required: true },
      { id: 'originalPrice', label: 'Preço normal por unidade', type: 'currency', placeholder: '0,00', required: true },
      { id: 'quantity', label: 'Quantidade na oferta', type: 'integer', placeholder: '2', required: true },
      { id: 'bundlePrice', label: 'Preço total da oferta', type: 'currency', placeholder: '0,00', required: true },
      { id: 'additionalCosts', label: 'Despesas adicionais por unidade', type: 'currency', placeholder: '0,00', required: false },
      { id: 'feePercent', label: 'Taxa sobre a venda (%)', type: 'percent', placeholder: '0', required: false },
      { id: 'feeFixed', label: 'Taxa fixa por venda', type: 'currency', placeholder: '0,00', required: false },
    ],
  },
  {
    id: 'combos-kits',
    name: 'Combos e Kits',
    shortName: 'Combos e Kits',
    objective: 'Vender produtos complementares juntos por um preço único.',
    howItWorks:
      'Você junta dois ou mais produtos que combinam entre si e oferece o conjunto por um preço menor do que comprá-los separadamente. O cliente sente que está levando mais por menos.',
    example:
      'Kit skincare: sabonete (custa R$ 15, vende por R$ 30) + hidratante (custa R$ 25, vende por R$ 50). Separado: R$ 80. Combo: R$ 65.',
    businessTypes: ['Cosméticos', 'Presentes', 'Roupas', 'Acessórios', 'Produtos variados'],
    objectives: ['aumentar-ticket', 'vender-complementares'],
    fields: [
      { id: 'cost1', label: 'Custo do produto 1', type: 'currency', placeholder: '0,00', required: true },
      { id: 'price1', label: 'Preço normal do produto 1', type: 'currency', placeholder: '0,00', required: true },
      { id: 'cost2', label: 'Custo do produto 2', type: 'currency', placeholder: '0,00', required: true },
      { id: 'price2', label: 'Preço normal do produto 2', type: 'currency', placeholder: '0,00', required: true },
      { id: 'comboPrice', label: 'Preço do combo', type: 'currency', placeholder: '0,00', required: true },
      { id: 'additionalCosts', label: 'Despesas adicionais', type: 'currency', placeholder: '0,00', required: false },
      { id: 'feePercent', label: 'Taxa sobre a venda (%)', type: 'percent', placeholder: '0', required: false },
      { id: 'feeFixed', label: 'Taxa fixa por venda', type: 'currency', placeholder: '0,00', required: false },
    ],
  },
  {
    id: 'desconto-progressivo',
    name: 'Desconto Progressivo',
    shortName: 'Desconto Progressivo',
    objective: 'Oferecer condições melhores conforme o cliente compra mais unidades.',
    howItWorks:
      'O desconto aumenta por faixas de quantidade. Quanto mais o cliente leva, maior o desconto por unidade. Isso incentiva compras maiores sem dar desconto máximo desde o início.',
    example:
      'Camiseta que custa R$ 20 e vende por R$ 50. Leve 1: R$ 50. Leve 3: 10% off (R$ 135). Leve 5: 20% off (R$ 200). O cliente economiza mais levando mais.',
    businessTypes: ['Roupas', 'Cosméticos', 'Acessórios', 'Produtos variados'],
    objectives: ['aumentar-ticket', 'girar-estoque'],
    fields: [
      { id: 'cost', label: 'Custo por unidade', type: 'currency', placeholder: '0,00', required: true },
      { id: 'originalPrice', label: 'Preço normal por unidade', type: 'currency', placeholder: '0,00', required: true },
      { id: 'qtyTier1', label: 'Quantidade faixa 1', type: 'integer', placeholder: '3', required: true },
      { id: 'discountTier1', label: 'Desconto faixa 1 (%)', type: 'percent', placeholder: '10', required: true },
      { id: 'qtyTier2', label: 'Quantidade faixa 2', type: 'integer', placeholder: '5', required: true },
      { id: 'discountTier2', label: 'Desconto faixa 2 (%)', type: 'percent', placeholder: '20', required: true },
      { id: 'additionalCosts', label: 'Despesas adicionais por unidade', type: 'currency', placeholder: '0,00', required: false },
      { id: 'feePercent', label: 'Taxa sobre a venda (%)', type: 'percent', placeholder: '0', required: false },
      { id: 'feeFixed', label: 'Taxa fixa por venda', type: 'currency', placeholder: '0,00', required: false },
    ],
  },
  {
    id: 'brinde-estrategico',
    name: 'Brinde Estratégico',
    shortName: 'Brinde Estratégico',
    objective: 'Oferecer um item adicional como incentivo para fechar a compra.',
    howItWorks:
      'Em vez de dar desconto no preço, você inclui um produto de baixo custo como brinde. O cliente sente que ganhou algo extra, e você gasta menos do que daria em desconto.',
    example:
      'Vestido que custa R$ 40 e vende por R$ 90. Brinde: agenda que custa R$ 8. Você gasta R$ 48 no total e recebe R$ 90. Lucro de R$ 42 sem reduzir o preço.',
    businessTypes: ['Presentes', 'Cosméticos', 'Roupas', 'Acessórios', 'Produtos variados'],
    objectives: ['atrair-clientes', 'aumentar-ticket', 'girar-estoque'],
    fields: [
      { id: 'productCost', label: 'Custo do produto principal', type: 'currency', placeholder: '0,00', required: true },
      { id: 'productPrice', label: 'Preço de venda do produto', type: 'currency', placeholder: '0,00', required: true },
      { id: 'giftCost', label: 'Custo do brinde', type: 'currency', placeholder: '0,00', required: true },
      { id: 'additionalCosts', label: 'Despesas adicionais', type: 'currency', placeholder: '0,00', required: false },
      { id: 'feePercent', label: 'Taxa sobre a venda (%)', type: 'percent', placeholder: '0', required: false },
      { id: 'feeFixed', label: 'Taxa fixa por venda', type: 'currency', placeholder: '0,00', required: false },
    ],
  },
  {
    id: 'aumentar-ticket',
    name: 'Oferta para Aumentar o Ticket Médio',
    shortName: 'Aumentar Ticket',
    objective: 'Estimular o cliente a gastar mais adicionando um segundo item com desconto.',
    howItWorks:
      'O cliente já decidiu comprar um produto. Você oferece um segundo item com desconto se comprado junto. O valor total da venda aumenta, e o desconto extra sai apenas do segundo item.',
    example:
      'Cliente compra bolsa por R$ 120 (custa R$ 60). Você oferece uma carteira por R$ 40 ao invés de R$ 70 (custa R$ 25). Total: R$ 160. Custo: R$ 85. Lucro: R$ 75.',
    businessTypes: ['Acessórios', 'Roupas', 'Cosméticos', 'Presentes', 'Produtos variados'],
    objectives: ['aumentar-ticket', 'vender-complementares'],
    fields: [
      { id: 'cost1', label: 'Custo do produto principal', type: 'currency', placeholder: '0,00', required: true },
      { id: 'price1', label: 'Preço do produto principal', type: 'currency', placeholder: '0,00', required: true },
      { id: 'cost2', label: 'Custo do produto complementar', type: 'currency', placeholder: '0,00', required: true },
      { id: 'price2', label: 'Preço normal do complementar', type: 'currency', placeholder: '0,00', required: true },
      { id: 'upsellPrice', label: 'Preço do complementar na oferta', type: 'currency', placeholder: '0,00', required: true },
      { id: 'additionalCosts', label: 'Despesas adicionais', type: 'currency', placeholder: '0,00', required: false },
      { id: 'feePercent', label: 'Taxa sobre a venda (%)', type: 'percent', placeholder: '0', required: false },
      { id: 'feeFixed', label: 'Taxa fixa por venda', type: 'currency', placeholder: '0,00', required: false },
    ],
  },
  {
    id: 'queima-estoque',
    name: 'Queima de Estoque',
    shortName: 'Queima de Estoque',
    objective: 'Vender produtos parados com desconto maior, mesmo que o lucro seja menor.',
    howItWorks:
      'Você aplica um desconto agressivo em produtos que não estão saindo. O objetivo é recuperar o dinheiro investido e liberar espaço, mesmo com margem baixa. Use com cuidado para não ter prejuízo.',
    example:
      'Casaco de inverno parado há meses: custou R$ 100, preço original R$ 180. Queima: 40% off, vende por R$ 108. Lucro pequeno de R$ 8, mas o dinheiro volta e o espaço libera.',
    businessTypes: ['Roupas', 'Cosméticos', 'Acessórios', 'Presentes', 'Produtos variados'],
    objectives: ['girar-estoque'],
    fields: [
      { id: 'cost', label: 'Custo do produto', type: 'currency', placeholder: '0,00', required: true },
      { id: 'originalPrice', label: 'Preço normal', type: 'currency', placeholder: '0,00', required: true },
      { id: 'discountPercent', label: 'Desconto (%)', type: 'percent', placeholder: '40', required: true },
      { id: 'additionalCosts', label: 'Despesas adicionais', type: 'currency', placeholder: '0,00', required: false },
      { id: 'feePercent', label: 'Taxa sobre a venda (%)', type: 'percent', placeholder: '0', required: false },
      { id: 'feeFixed', label: 'Taxa fixa por venda', type: 'currency', placeholder: '0,00', required: false },
    ],
  },
  {
    id: 'clientes-recorrentes',
    name: 'Oferta para Clientes Recorrentes',
    shortName: 'Clientes Recorrentes',
    objective: 'Recompensar quem já comprou antes para incentivar novas compras.',
    howItWorks:
      'Você oferece um desconto exclusivo para clientes que já compraram com você antes. Isso fortalece a relação e faz a pessoa voltar a comprar em vez de ir para a concorrência.',
    example:
      'Cliente comprou uma vez. Você oferece 10% off na próxima compra acima de R$ 50. Ela volta, gasta R$ 80 e paga R$ 72. Você fideliza e ainda lucra.',
    businessTypes: ['Cosméticos', 'Roupas', 'Acessórios', 'Presentes', 'Produtos variados'],
    objectives: ['incentivar-recompra', 'atrair-clientes'],
    fields: [
      { id: 'cost', label: 'Custo do produto', type: 'currency', placeholder: '0,00', required: true },
      { id: 'originalPrice', label: 'Preço normal', type: 'currency', placeholder: '0,00', required: true },
      { id: 'discountPercent', label: 'Desconto para o cliente (%)', type: 'percent', placeholder: '10', required: true },
      { id: 'minPurchase', label: 'Compra mínima para o desconto', type: 'currency', placeholder: '50,00', required: false },
      { id: 'additionalCosts', label: 'Despesas adicionais', type: 'currency', placeholder: '0,00', required: false },
      { id: 'feePercent', label: 'Taxa sobre a venda (%)', type: 'percent', placeholder: '0', required: false },
      { id: 'feeFixed', label: 'Taxa fixa por venda', type: 'currency', placeholder: '0,00', required: false },
    ],
  },
]

export interface ObjectiveInfo {
  id: ObjectiveId
  label: string
  description: string
}

export const objectives: ObjectiveInfo[] = [
  {
    id: 'atrair-clientes',
    label: 'Atrair novos clientes',
    description: 'Chamar a atenção de quem ainda não comprou de você com uma oferta irresistível.',
  },
  {
    id: 'aumentar-ticket',
    label: 'Aumentar o valor de cada pedido',
    description: 'Fazer o cliente levar mais itens ou produtos mais caros em cada compra.',
  },
  {
    id: 'girar-estoque',
    label: 'Girar estoque parado',
    description: 'Vender produtos que estão parados há muito tempo e liberar espaço e dinheiro.',
  },
  {
    id: 'vender-complementares',
    label: 'Vender produtos complementares',
    description: 'Juntar produtos que combinam para o cliente levar tudo de uma vez.',
  },
  {
    id: 'incentivar-recompra',
    label: 'Incentivar a recompra',
    description: 'Fazer clientes que já compraram voltarem a comprar com você.',
  },
]

export function getStrategiesByObjective(objId: ObjectiveId): Strategy[] {
  return strategies.filter((s) => s.objectives.includes(objId))
}
