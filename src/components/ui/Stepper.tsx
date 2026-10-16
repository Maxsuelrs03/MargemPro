import { FLOW_STEPS, type FlowStep } from '../../state/types'

interface StepperProps {
  currentStep: FlowStep
  onStepClick?: (step: FlowStep) => void
}

export function Stepper({ currentStep, onStepClick }: StepperProps) {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {FLOW_STEPS.map((step, i) => {
        const isCompleted = i < currentIndex
        const isCurrent = i === currentIndex
        const isClickable = onStepClick && i <= currentIndex

        return (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isCurrent
                  ? 'bg-primary-600 text-white'
                  : isCompleted
                    ? 'text-primary-700'
                    : 'text-slate-400'
              } ${isClickable && !isCurrent ? 'cursor-pointer hover:bg-slate-50' : ''}`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                isCurrent
                  ? 'bg-white text-primary-600'
                  : isCompleted
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {i + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.shortLabel}</span>
            </button>
            {i < FLOW_STEPS.length - 1 && (
              <div className={`mx-0.5 h-px w-4 ${isCompleted ? 'bg-primary-300' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
