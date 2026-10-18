import { useEffect, useState } from 'react'
import { numberToInputText, parseNumber, sanitizeNumericInput } from '../../lib/numbers'

interface DecimalInputProps {
  id?: string
  /** Valor numérico guardado no estado do app. */
  value: number
  /** Chamado a cada digitação, já com o número interpretado. */
  onValueChange: (value: number) => void
  placeholder?: string
  className?: string
}

/**
 * Campo numérico que guarda o texto digitado separado do número.
 *
 * Por que existe: converter o texto para número a cada tecla e voltar o número
 * para o campo apaga o separador decimal ("12," vira "12"), o que impede
 * digitar valores como 12,50. Aqui o texto fica no campo enquanto o usuário
 * digita, e o número é enviado ao estado em paralelo.
 */
export function DecimalInput({ id, value, onValueChange, placeholder, className }: DecimalInputProps) {
  const [text, setText] = useState(() => numberToInputText(value))

  // Se o valor mudar por fora (botões de margem, outro produto carregado),
  // atualiza o texto. Se o texto digitado já representa esse valor, não mexe,
  // para não apagar a vírgula no meio da digitação.
  useEffect(() => {
    if (parseNumber(text) !== value) {
      setText(numberToInputText(value))
    }
  }, [value])

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => {
        const next = sanitizeNumericInput(e.target.value)
        setText(next)
        onValueChange(parseNumber(next))
      }}
      placeholder={placeholder}
      className={className}
    />
  )
}
