import { parseNumber, tryParseNumber, numberToInputText, priceToInputText, sanitizeNumericInput } from './numbers'
import { simulateOffer } from './offerSimulation'
import { generateMessages, type MessageFormData } from './messageGenerator'
import { copyTemplates } from './copywritingData'

let passed = 0
let failed = 0

function runTest(name: string, fn: () => void) {
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

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) {
    throw new Error(`${label}: esperado ${JSON.stringify(expected)}, veio ${JSON.stringify(actual)}`)
  }
}

console.log('\n══ Testes de leitura de números (formato brasileiro) ══\n')

console.log('parseNumber')

runTest('números simples e com vírgula decimal', () => {
  const cases: [string, number][] = [
    ['1500', 1500],
    ['12,5', 12.5],
    ['12,50', 12.5],
    ['0,99', 0.99],
    ['0,5', 0.5],
    ['12,', 12],
    [',5', 0.5],
  ]
  for (const [input, expected] of cases) assertEqual(parseNumber(input), expected, `"${input}"`)
})

runTest('milhar com ponto e decimal com vírgula (formato brasileiro)', () => {
  const cases: [string, number][] = [
    ['1.500,00', 1500],
    ['1.234,56', 1234.56],
    ['R$ 2.350,90', 2350.9],
    ['10.000,5', 10000.5],
    ['1.234.567,89', 1234567.89],
  ]
  for (const [input, expected] of cases) assertEqual(parseNumber(input), expected, `"${input}"`)
})

runTest('ponto isolado: milhar quando são 3 dígitos depois, senão decimal', () => {
  const cases: [string, number][] = [
    ['1.500', 1500],
    ['12.345', 12345],
    ['100.000', 100000],
    ['1.234.567', 1234567],
    ['1.5', 1.5],
    ['7.90', 7.9],
    ['12.50', 12.5],
    ['0.500', 0.5],
    ['1234.567', 1234.567],
    ['5.', 5],
  ]
  for (const [input, expected] of cases) assertEqual(parseNumber(input), expected, `"${input}"`)
})

runTest('formato americano com os dois separadores', () => {
  assertEqual(parseNumber('1,234.56'), 1234.56, '"1,234.56"')
  assertEqual(parseNumber('1,234,567'), 1234567, '"1,234,567"')
})

runTest('vazio, texto sem dígitos e valores inválidos valem 0', () => {
  for (const input of ['', '   ', 'abc', 'R$', ',', '.', '-', ',,']) {
    assertEqual(parseNumber(input), 0, `"${input}"`)
  }
  assertEqual(parseNumber(NaN), 0, 'NaN')
  assertEqual(parseNumber(Infinity), 0, 'Infinity')
})

runTest('números passam direto; negativos são aceitos', () => {
  assertEqual(parseNumber(42.5), 42.5, 'number')
  assertEqual(parseNumber('-12,5'), -12.5, '"-12,5"')
  assertEqual(parseNumber('R$ -1.500,00'), -1500, '"R$ -1.500,00"')
})

console.log('\ntryParseNumber')

runTest('devolve null quando não há dígitos', () => {
  assertEqual(tryParseNumber(''), null, 'vazio')
  assertEqual(tryParseNumber('abc'), null, 'texto')
  assertEqual(tryParseNumber('0'), 0, '"0" é zero, não null')
})

console.log('\nTexto de campo ↔ número')

runTest('numberToInputText usa vírgula e volta ao mesmo número', () => {
  for (const n of [12.5, 1.125, 0.5, 1500, 33.333333, 1234.567, 0.1 + 0.2]) {
    assertEqual(parseNumber(numberToInputText(n)), n, `ida e volta de ${n}`)
  }
  assertEqual(numberToInputText(1.125), '1,125', 'texto de 1.125')
  assertEqual(numberToInputText(0), '', 'zero fica vazio')
})

runTest('priceToInputText arredonda para centavos', () => {
  assertEqual(priceToInputText(1.125), '1,13', '1.125')
  assertEqual(priceToInputText(1250), '1250', '1250')
  assertEqual(priceToInputText(99.9), '99,9', '99.9')
})

runTest('sanitizeNumericInput mantém só dígitos, vírgula e ponto', () => {
  assertEqual(sanitizeNumericInput('R$ 1a2,5!'), '12,5', 'colar texto sujo')
})

console.log('\nIntegração: do texto digitado ao resultado')

runTest('simulador: valores com milhar dão o mesmo lucro que sem milhar', () => {
  const base = { discountPercent: '10', feePercent: '0', feeFixed: '0', additionalCosts: '0' }
  const br = simulateOffer('desconto-percentual', { ...base, cost: '1.200,00', originalPrice: '2.500,00' })!
  const plain = simulateOffer('desconto-percentual', { ...base, cost: '1200', originalPrice: '2500' })!
  assertEqual(br.profit, plain.profit, 'lucro')
  assertEqual(br.profit, 1050, 'lucro esperado (2250 - 1200)')
  assertEqual(br.offerPrice, 2250, 'preço da oferta')
})

runTest('texto do anúncio mostra R$ 1.500,00 e não R$ 1,50', () => {
  const data: MessageFormData = {
    productName: 'Sofá', productType: '', normalPrice: '1.500,00', promoPrice: '1.250,00', benefit: 'conforto',
    audience: '', objective: '', deadline: 'hoje', quantity: '', channel: 'whatsapp', style: 'direto',
  }
  const text = generateMessages(data, copyTemplates).map((m) => m.fullText).join('\n').replace(/\s/g, ' ')
  if (!text.includes('R$ 1.500,00')) throw new Error('não encontrou "R$ 1.500,00" nos textos gerados')
  if (text.includes('R$ 1,50')) throw new Error('apareceu "R$ 1,50" (leitura errada do milhar)')
  if (!text.includes('R$ 250,00')) throw new Error('economia deveria ser "R$ 250,00" (1.500 - 1.250)')
})

console.log(`\n══ Resultado: ${passed} passaram, ${failed} falharam ══\n`)
if (failed > 0) throw new Error(`${failed} teste(s) falharam`)
