import { useMargemPro } from '../../state/AppContext'
import { FLOW_STEPS, type FlowStep } from '../../state/types'
import { Stepper } from '../ui/Stepper'
import { FlowProduto } from './FlowProduto'
import { FlowPrecificacao } from './FlowPrecificacao'
import { FlowRecomendacao } from './FlowRecomendacao'
import { FlowSimulacao } from './FlowSimulacao'
import { FlowApresentacao } from './FlowApresentacao'
import { FlowCampanhas } from './FlowCampanhas'
import { ArrowLeftIcon } from '../Icons'
import { ArrowRightIcon, SaveIcon } from '../PresentationIcons'
import { AlertIcon } from '../Icons'

export function FlowShell() {
  const { state, actions, recalcNeeded } = useMargemPro()
  const currentStep = state.flow.step
  const currentIndex = FLOW_STEPS.findIndex((s) => s.id === currentStep)

  function goNext() {
    if (currentIndex < FLOW_STEPS.length - 1) {
      const next = FLOW_STEPS[currentIndex + 1].id
      if (next === 'precificacao') {
        actions.patchProduct({})
      }
      actions.setStep(next)
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      actions.setStep(FLOW_STEPS[currentIndex - 1].id)
    }
  }

  function handleStepClick(step: FlowStep) {
    actions.setStep(step)
  }

  function saveProgress() {
    actions.patchProduct({})
    actions.setStep(currentStep)
    if (state.flow.product.cost > 0) {
      const product = { ...state.flow.product }
      if (!product.id) {
        product.id = ''
      }
      actions.saveProduct({ ...product, id: product.id || undefined as never })
    }
  }

  const isFirst = currentIndex === 0
  const isLast = currentIndex === FLOW_STEPS.length - 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900">Fluxo Guiado</h2>
        <p className="mt-1 text-slate-500">
          Do produto ao anúncio, passo a passo. Seus dados acompanham você em todas as etapas.
        </p>
      </div>

      {/* Progress */}
      <div className="card p-4">
        <Stepper currentStep={currentStep} onStepClick={handleStepClick} />
      </div>

      {/* Recalc warning */}
      {recalcNeeded && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 animate-fade-in">
          <AlertIcon className="mt-0.5 w-4 h-4 flex-shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800">
            Os dados do produto foram alterados após a última simulação. Os valores da oferta podem estar desatualizados — volte à etapa de Simulação para recalcular.
          </p>
        </div>
      )}

      {/* Step content */}
      <div className="animate-slide-up">
        {currentStep === 'produto' && <FlowProduto />}
        {currentStep === 'precificacao' && <FlowPrecificacao />}
        {currentStep === 'recomendacao' && <FlowRecomendacao />}
        {currentStep === 'simulacao' && <FlowSimulacao />}
        {currentStep === 'apresentacao' && <FlowApresentacao />}
        {currentStep === 'campanhas' && <FlowCampanhas />}
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <button
          onClick={goBack}
          disabled={isFirst}
          className="btn-secondary disabled:opacity-40"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Voltar
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={saveProgress}
            className="btn-secondary"
          >
            <SaveIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Salvar progresso</span>
            <span className="sm:hidden">Salvar</span>
          </button>

          {!isLast && (
            <button onClick={goNext} className="btn-primary">
              Avançar
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
