/**
 * FormStepper — Futuristic step indicator with cyan glow
 * Supports validation state: validated steps show ✓, locked steps are not clickable
 */
import { Check } from 'lucide-react';

export const FormStepper = ({ steps = [], currentStep = 0, onStepClick, validatedSteps = {}, lockedSteps = {} }) => {
  return (
    <div className="mb-8">
      <div className="flex w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isFuture = index > currentStep;
          const isValidated = validatedSteps[index] === true;
          const isLocked = lockedSteps[index] === true;

          return (
            <div key={index} className="relative flex flex-col items-center flex-1">
              {index !== 0 && (
                <div className="absolute top-[17px] right-1/2 left-[-50%] h-[2px] bg-midnight-300/40 z-0 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-cyan-500 to-teal-500 ${
                    isCompleted || isCurrent ? 'w-full' : 'w-0'
                  }`} />
                </div>
              )}

              <button
                onClick={() => onStepClick && !isLocked && onStepClick(index)}
                disabled={isLocked}
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${isCompleted && isValidated ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-midnight shadow-glow-cyan/30 cursor-pointer hover:shadow-glow-cyan' : ''}
                  ${isCompleted && !isValidated ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-midnight shadow-amber-500/30 cursor-pointer hover:shadow-amber-500/40' : ''}
                  ${isCurrent ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-midnight ring-[3px] ring-cyan-500/20 shadow-glow-cyan/40' : ''}
                  ${isFuture && !isLocked ? 'bg-midnight-200/60 border border-cyan-500/10 text-glass-500 cursor-pointer hover:border-cyan-500/30' : ''}
                  ${isFuture && isLocked ? 'bg-midnight-200/60 border border-cyan-500/10 text-glass-600 cursor-not-allowed opacity-50' : ''}
                `}
              >
                {isCompleted && isValidated ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <span>{index + 1}</span>}
              </button>

              <span className={`mt-2.5 text-[11px] font-medium text-center leading-tight transition-colors duration-200
                ${isCurrent ? 'text-cyan-400 font-semibold' : ''}
                ${isCompleted && isValidated ? 'text-teal-400' : ''}
                ${isCompleted && !isValidated ? 'text-amber-400' : ''}
                ${isFuture && !isLocked ? 'text-glass-500' : ''}
                ${isFuture && isLocked ? 'text-glass-600 opacity-50' : ''}
              `}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default FormStepper;
