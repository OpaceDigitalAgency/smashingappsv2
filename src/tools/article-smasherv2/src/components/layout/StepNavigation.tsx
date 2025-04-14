import React from 'react';
import { useArticleWizard } from '../../contexts/ArticleWizardContext';
import { CheckCircle } from 'lucide-react';

interface StepProps {
  isActive: boolean;
  isComplete: boolean;
  number: number;
  title: string;
  onClick: () => void;
}

const Step: React.FC<StepProps> = ({ isActive, isComplete, number, title, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center p-2 rounded-lg transition-all ${
        isActive
          ? 'bg-primary text-white'
          : isComplete
          ? 'bg-primary-50 text-primary'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
          isActive
            ? 'bg-white text-primary'
            : isComplete
            ? 'bg-primary text-white'
            : 'bg-gray-300 text-gray-600'
        }`}
      >
        {isComplete ? <CheckCircle size={16} /> : <span>{number}</span>}
      </div>
      <span className="text-sm font-medium">{title}</span>
    </button>
  );
};

const StepNavigation: React.FC = () => {
  const { currentStep, handleStepClick } = useArticleWizard();
  const totalSteps = 6;
  
  return (
    <div className="bg-white rounded-xl shadow-card p-3 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-gray-800">WordPress AI Content Creation</h2>
        <p className="text-gray-600 text-sm">Step {currentStep} of {totalSteps}</p>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Step 
          isActive={currentStep === 1}
          isComplete={currentStep > 1}
          number={1}
          title="Topic"
          onClick={() => handleStepClick(1)}
        />
        <Step 
          isActive={currentStep === 2}
          isComplete={currentStep > 2}
          number={2}
          title="Keywords"
          onClick={() => handleStepClick(2)}
        />
        <Step 
          isActive={currentStep === 3}
          isComplete={currentStep > 3}
          number={3}
          title="Outline"
          onClick={() => handleStepClick(3)}
        />
        <Step 
          isActive={currentStep === 4}
          isComplete={currentStep > 4}
          number={4}
          title="Content"
          onClick={() => handleStepClick(4)}
        />
        <Step 
          isActive={currentStep === 5}
          isComplete={currentStep > 5}
          number={5}
          title="Images"
          onClick={() => handleStepClick(5)}
        />
        <Step 
          isActive={currentStep === 6}
          isComplete={currentStep > 6}
          number={6}
          title="Publish"
          onClick={() => handleStepClick(6)}
        />
      </div>
    </div>
  );
};

export default StepNavigation;