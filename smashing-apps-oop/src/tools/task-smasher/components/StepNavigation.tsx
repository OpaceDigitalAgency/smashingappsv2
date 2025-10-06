import React from 'react';
import { 
  FileText, 
  Key, 
  List, 
  PenTool, 
  Image, 
  Send, 
  CheckCircle 
} from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

const steps = [
  { id: 1, title: 'Topic', icon: FileText },
  { id: 2, title: 'Keywords', icon: Key },
  { id: 3, title: 'Outline', icon: List },
  { id: 4, title: 'Content', icon: PenTool },
  { id: 5, title: 'Images', icon: Image },
  { id: 6, title: 'Publish', icon: Send }
];

const StepNavigation: React.FC<StepNavigationProps> = ({ 
  currentStep, 
  completedSteps, 
  onStepClick 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">WordPress AI Content Creation</h2>
        <p className="text-gray-600 text-sm">Step {currentStep} of {steps.length}</p>
      </div>
      
      <div className="grid grid-cols-6 gap-2">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = currentStep === step.id;
          const StepIcon = step.icon;
          
          return (
            <button
              key={step.id}
              onClick={() => {
                // Only allow navigation to completed steps or the current step + 1
                if (isCompleted || step.id === currentStep || step.id === currentStep + 1) {
                  onStepClick(step.id);
                }
              }}
              disabled={!isCompleted && step.id !== currentStep && step.id !== currentStep + 1}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-purple-600 text-white' 
                  : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-400'
                }
                ${(!isCompleted && step.id !== currentStep && step.id !== currentStep + 1) 
                  ? 'cursor-not-allowed opacity-70' 
                  : 'hover:shadow-md'
                }
              `}
            >
              <div className="relative">
                {isCompleted ? (
                  <div className="relative">
                    <StepIcon className="w-6 h-6 mb-1" />
                    <CheckCircle className="w-4 h-4 text-white bg-green-500 rounded-full absolute -top-1 -right-1 border-2 border-white" />
                  </div>
                ) : (
                  <StepIcon className="w-6 h-6 mb-1" />
                )}
              </div>
              <span className="text-xs font-medium">{step.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepNavigation;