import { SparkleIcon } from './Icons'

export function Offers() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Ofertas</h2>
        <p className="mt-1 text-slate-500">
          Crie ofertas promocionais sem comprometer sua rentabilidade.
        </p>
      </div>

      <div className="card flex flex-col items-center justify-center p-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
          <SparkleIcon className="w-7 h-7 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Em breve</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Aqui você poderá criar ofertas para atrair clientes, aumentar o ticket médio e vender produtos parados —
          sempre sabendo o impacto no seu lucro.
        </p>
        <p className="mt-3 text-xs text-slate-400">
          Use a calculadora por enquanto para simular descontos e entender sua margem.
        </p>
      </div>
    </div>
  )
}
