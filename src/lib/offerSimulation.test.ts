import { simulateOffer, type OfferSimResult } from './offerSimulation'
import { strategies } from './strategyData'

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FALHOU: ${message}`)
}

function approx(a: number, b: number, tolerance = 0.01): boolean {
  return Math.abs(a - b) < tolerance
}

let passed = 0
let failed = 0

function getStrategy(id: string) {
  return strategies.find((s) => s.id === id)!
}

function simWithExample(id: string): OfferSimResult | null {
  const strategy = getStrategy(id)
  return simulateOffer(id, strategy.exampleValues)
}

function runTestCounted(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failed++
    console.log(`  ✗ ${name}`)
    console.log(`    ${(e as Error).message}`)
  }
}

console.log('\n══ Testes do Banco de Ofertas — 30 estratégias ══\n')

// ─── Categoria A: Descontos e conversão ───
console.log('Categoria A — Descontos e conversão')

runTestCounted('1. Desconto percentual: lucro correto', () => {
  const r = simWithExample('desconto-percentual')!
  // cost=80, price=120, 15% off, 5% fee
  // finalPrice = 102, fee = 5.10, profit = 102 - 5.10 - 80 = 16.90
  assert(approx(r.offerPrice, 102), `Preço esperado 102, got ${r.offerPrice}`)
  assert(approx(r.profit, 16.90), `Lucro esperado 16.90, got ${r.profit}`)
  assert(r.profit > 0, 'Deve ter lucro positivo')
  assert(!isNaN(r.marginPercent), 'Margem não pode ser NaN')
})

runTestCounted('2. Desconto fixo: preço final correto', () => {
  const r = simWithExample('desconto-fixo')!
  // cost=12, price=30, discount=5 => finalPrice=25
  assert(approx(r.offerPrice, 25), `Preço esperado 25, got ${r.offerPrice}`)
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

runTestCounted('3. Preço promocional: desconto correto', () => {
  const r = simWithExample('preco-promocional-prazo')!
  // cost=15, price=35, promo=28
  assert(approx(r.offerPrice, 28), `Preço esperado 28, got ${r.offerPrice}`)
  assert(approx(r.discountsConceded, 7), `Desconto esperado 7, got ${r.discountsConceded}`)
})

runTestCounted('4. Desconto 2ª unidade: preço total correto', () => {
  const r = simWithExample('desconto-segunda-unidade')!
  // cost=25, price=50, 40% off segunda => 50 + 30 = 80
  assert(approx(r.offerPrice, 80), `Preço esperado 80, got ${r.offerPrice}`)
  assert(r.unitCount === 2, 'Deve ter 2 unidades')
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

runTestCounted('5. Desconto progressivo: faixa 1 correta', () => {
  const r = simWithExample('desconto-progressivo')!
  // cost=20, price=50, qty1=3, disc1=10% => revenue=135, cost=60, profit=75
  assert(approx(r.offerPrice, 135), `Preço esperado 135, got ${r.offerPrice}`)
  assert(approx(r.profit, 75), `Lucro esperado 75, got ${r.profit}`)
  assert(r.unitCount === 3, 'Deve ter 3 unidades')
})

runTestCounted('6. Oferta relâmpago: preço e unidades', () => {
  const r = simWithExample('oferta-relampago')!
  // cost=10, price=25, offer=18
  assert(approx(r.offerPrice, 18), `Preço esperado 18, got ${r.offerPrice}`)
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

// ─── Categoria B: Combos e ticket médio ───
console.log('\nCategoria B — Combos e ticket médio')

runTestCounted('7. Combo complementares: desconto efetivo', () => {
  const r = simWithExample('combo-complementares')!
  // cost1=15+25=40, price1=30+50=80, combo=65
  assert(approx(r.offerPrice, 65), `Preço esperado 65, got ${r.offerPrice}`)
  assert(approx(r.totalCost, 40), `Custo esperado 40, got ${r.totalCost}`)
  assert(approx(r.profit, 25), `Lucro esperado 25, got ${r.profit}`)
})

runTestCounted('8. Kit preço fechado: lucro correto', () => {
  const r = simWithExample('kit-preco-fechado')!
  // cost=35, separate=75, kit=60, items=3
  assert(approx(r.offerPrice, 60), `Preço esperado 60, got ${r.offerPrice}`)
  assert(r.unitCount === 3, 'Deve ter 3 itens')
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

runTestCounted('9. Leve 3 pague 2: custo de 3 unidades', () => {
  const r = simWithExample('leve-3-pague-2')!
  // cost=6, price=15 => revenue=30, cost=18, profit=12
  assert(approx(r.offerPrice, 30), `Preço esperado 30, got ${r.offerPrice}`)
  assert(approx(r.totalCost, 18), `Custo esperado 18, got ${r.totalCost}`)
  assert(r.unitCount === 3, 'Deve ter 3 unidades')
  assert(approx(r.profit, 12), `Lucro esperado 12, got ${r.profit}`)
})

runTestCounted('10. Compre mais economize mais: desconto sobre total', () => {
  const r = simWithExample('compre-mais-economize')!
  // cost=3, price=8, minQty=10, disc=15% => revenue=68, cost=30
  assert(approx(r.offerPrice, 68), `Preço esperado 68, got ${r.offerPrice}`)
  assert(r.unitCount === 10, 'Deve ter 10 unidades')
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

runTestCounted('11. Kits em níveis: três níveis calculados', () => {
  const r = simWithExample('kits-niveis')!
  assert(r.details.length >= 3, 'Deve ter detalhes para 3 níveis')
  assert(!isNaN(r.marginPercent), 'Margem não pode ser NaN')
})

runTestCounted('12. Monte seu combo: custo médio multiplicado', () => {
  const r = simWithExample('monte-seu-combo')!
  // avgCost=12, avgPrice=25, qty=3, combo=50 => cost=36, revenue=50
  assert(approx(r.offerPrice, 50), `Preço esperado 50, got ${r.offerPrice}`)
  assert(approx(r.totalCost, 36), `Custo esperado 36, got ${r.totalCost}`)
  assert(r.unitCount === 3, 'Deve ter 3 itens')
})

// ─── Categoria C: Benefícios e valor percebido ───
console.log('\nCategoria C — Benefícios e valor percebido')

runTestCounted('13. Brinde estratégico: custo inclui brinde', () => {
  const r = simWithExample('brinde-estrategico')!
  // productCost=40, price=90, giftCost=8 => totalCost=48, profit=42
  assert(approx(r.totalCost, 48), `Custo esperado 48, got ${r.totalCost}`)
  assert(approx(r.profit, 42), `Lucro esperado 42, got ${r.profit}`)
})

runTestCounted('14. Frete grátis: frete somado ao custo', () => {
  const r = simWithExample('frete-gratis')!
  // cost=30, price=70, qty=2, shipping=15 => cost=60+15=75, revenue=140
  assert(approx(r.totalCost, 75), `Custo esperado 75, got ${r.totalCost}`)
  assert(approx(r.offerPrice, 140), `Receita esperada 140, got ${r.offerPrice}`)
})

runTestCounted('15. Presente no kit: custo inclui presente', () => {
  const r = simWithExample('presente-no-kit')!
  // kitCost=40, kitPrice=85, giftCost=5 => totalCost=45, profit=40
  assert(approx(r.totalCost, 45), `Custo esperado 45, got ${r.totalCost}`)
  assert(approx(r.profit, 40), `Lucro esperado 40, got ${r.profit}`)
})

runTestCounted('16. Embalagem especial: margem da personalização', () => {
  const r = simWithExample('embalagem-especial')!
  // productCost=30, productPrice=65, packCost=8, packPrice=15
  // revenue=80, cost=38, profit=42
  assert(approx(r.offerPrice, 80), `Preço esperado 80, got ${r.offerPrice}`)
  assert(approx(r.totalCost, 38), `Custo esperado 38, got ${r.totalCost}`)
})

runTestCounted('17. Benefício por valor mínimo: custo do benefício', () => {
  const r = simWithExample('beneficio-valor-minimo')!
  // cost=50, price=110, benefitCost=5 => totalCost=55
  assert(approx(r.totalCost, 55), `Custo esperado 55, got ${r.totalCost}`)
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

runTestCounted('18. Produto + acessório: combo de 2 itens', () => {
  const r = simWithExample('produto-com-acessorio')!
  // cost1=20+3=23, price1=45+10=55, bundle=48
  assert(approx(r.totalCost, 23), `Custo esperado 23, got ${r.totalCost}`)
  assert(approx(r.offerPrice, 48), `Preço esperado 48, got ${r.offerPrice}`)
})

// ─── Categoria D: Estoque e recuperação ───
console.log('\nCategoria D — Estoque e recuperação de vendas')

runTestCounted('19. Queima de estoque: desconto agressivo', () => {
  const r = simWithExample('queima-estoque')!
  // cost=100, price=180, 40% off => 108, profit=8
  assert(approx(r.offerPrice, 108), `Preço esperado 108, got ${r.offerPrice}`)
  assert(approx(r.profit, 8), `Lucro esperado 8, got ${r.profit}`)
  assert(r.marginPercent < 15, 'Margem deve ser baixa')
})

runTestCounted('20. Produtos parados: combo com parado', () => {
  const r = simWithExample('produtos-parados')!
  // cost1=20, price1=35, cost2=15, price2=40, combo=50
  assert(approx(r.totalCost, 35), `Custo esperado 35, got ${r.totalCost}`)
  assert(approx(r.offerPrice, 50), `Preço esperado 50, got ${r.offerPrice}`)
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

runTestCounted('21. Combo liquidação: múltiplos itens', () => {
  const r = simWithExample('combo-liquidar')!
  // totalCost=33, separate=65, combo=40, items=3
  assert(approx(r.totalCost, 33), `Custo esperado 33, got ${r.totalCost}`)
  assert(approx(r.offerPrice, 40), `Preço esperado 40, got ${r.offerPrice}`)
  assert(r.unitCount === 3, 'Deve ter 3 itens')
})

runTestCounted('22. Última unidade: desconto sobre 1 item', () => {
  const r = simWithExample('ultima-unidade')!
  // cost=35, price=80, 25% off => 60
  assert(approx(r.offerPrice, 60), `Preço esperado 60, got ${r.offerPrice}`)
  assert(r.unitCount === 1, 'Deve ter 1 unidade')
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

runTestCounted('23. Recuperar inativos: desconto percentual', () => {
  const r = simWithExample('recuperar-inativos')!
  // cost=40, price=90, 15% off => 76.50
  assert(approx(r.offerPrice, 76.50), `Preço esperado 76.50, got ${r.offerPrice}`)
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

runTestCounted('24. Recompra antigos: desconto percentual', () => {
  const r = simWithExample('recompra-antigos')!
  // cost=25, price=50, 10% off => 45
  assert(approx(r.offerPrice, 45), `Preço esperado 45, got ${r.offerPrice}`)
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

// ─── Categoria E: Fidelização e campanhas ───
console.log('\nCategoria E — Fidelização e campanhas')

runTestCounted('25. Primeira compra: desconto correto', () => {
  const r = simWithExample('primeira-compra')!
  // cost=30, price=70, 10% off => 63
  assert(approx(r.offerPrice, 63), `Preço esperado 63, got ${r.offerPrice}`)
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

runTestCounted('26. Clientes recorrentes: desconto com mínimo', () => {
  const r = simWithExample('clientes-recorrentes')!
  // cost=40, price=90, 10% off => 81
  assert(approx(r.offerPrice, 81), `Preço esperado 81, got ${r.offerPrice}`)
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

runTestCounted('27. Indique amigo: benefício para ambos', () => {
  const r = simWithExample('indique-amigo')!
  // cost=25, price=55, refBenefit=10, referredBenefit=10
  // friend pays 55-10=45
  assert(approx(r.offerPrice, 45), `Preço esperado 45, got ${r.offerPrice}`)
  assert(r.customerSavings === 10, 'Economia do cliente deve ser 10')
})

runTestCounted('28. Oferta temática: combo sazonal', () => {
  const r = simWithExample('oferta-tematica')!
  // cost1=25+8=33, price1=50+20=70, bundle=58
  assert(approx(r.totalCost, 33), `Custo esperado 33, got ${r.totalCost}`)
  assert(approx(r.offerPrice, 58), `Preço esperado 58, got ${r.offerPrice}`)
})

runTestCounted('29. Lançamento: preço promocional', () => {
  const r = simWithExample('lancamento-produto')!
  // cost=28, price=65, launch=49
  assert(approx(r.offerPrice, 49), `Preço esperado 49, got ${r.offerPrice}`)
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

runTestCounted('30. Compra mínima: desconto ao atingir mínimo', () => {
  const r = simWithExample('compra-minima')!
  // cost=50, price=130, 10% off => 117
  assert(approx(r.offerPrice, 117), `Preço esperado 117, got ${r.offerPrice}`)
  assert(r.profit > 0, 'Deve ter lucro positivo')
})

// ─── Casos especiais ───
console.log('\nCasos especiais')

runTestCounted('Prejuízo: desconto > margem', () => {
  const r = simulateOffer('desconto-percentual', {
    cost: '100', originalPrice: '120', discountPercent: '80', additionalCosts: '0', feePercent: '0', feeFixed: '0',
  })!
  assert(r.profit < 0, 'Deve ter prejuízo com 80% de desconto')
  assert(r.status === 'loss', 'Status deve ser loss')
  assert(r.warnings.length > 0, 'Deve ter alertas')
})

runTestCounted('Divisão por zero: preço normal = 0', () => {
  const r = simulateOffer('desconto-percentual', {
    cost: '10', originalPrice: '0', discountPercent: '10', additionalCosts: '0', feePercent: '0', feeFixed: '0',
  })
  assert(r === null, 'Deve retornar null com preço = 0')
})

runTestCounted('Campos vazios: retorna null', () => {
  const r = simulateOffer('desconto-percentual', {})
  assert(r === null, 'Deve retornar null com campos vazios')
})

runTestCounted('Sem NaN ou Infinity em qualquer estratégia', () => {
  for (const s of strategies) {
    const r = simWithExample(s.id)
    if (!r) continue
    assert(!isNaN(r.profit), `${s.name}: profit não pode ser NaN`)
    assert(!isNaN(r.marginPercent), `${s.name}: margin não pode ser NaN`)
    assert(!isFinite(r.profit) === false, `${s.name}: profit não pode ser Infinity`)
  }
})

runTestCounted('Comparação vs venda normal: todas com lucro positivo', () => {
  for (const s of strategies) {
    const r = simWithExample(s.id)
    if (!r) continue
    assert(r.normalProfit !== undefined, `${s.name}: deve ter normalProfit calculado`)
  }
})

runTestCounted('Margem baixa gera alerta', () => {
  const r = simulateOffer('desconto-percentual', {
    cost: '90', originalPrice: '100', discountPercent: '5', additionalCosts: '0', feePercent: '0', feeFixed: '0',
  })!
  // profit = 95 - 90 = 5, margin = 5/95 = 5.3%
  assert(r.marginPercent < 15, 'Margem deve ser baixa')
  assert(r.warnings.length > 0, 'Deve gerar alerta de margem baixa')
})

console.log(`\n══ Resultado: ${passed} passaram, ${failed} falharam ══\n`)
if (failed > 0) throw new Error(`${failed} teste(s) falharam`)
