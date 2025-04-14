import React from 'react';
import { useArticleWizard } from '../../contexts/ArticleWizardContext';
import { CheckCircle, FileText, Tag, List, FileText as FileTextIcon, Image as ImageIcon, Send } from 'lucide-react';

interface StepProps {
  isActive: boolean;
  isComplete: boolean;
  number: number;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const Step: React.FC<StepProps> = ({ isActive, isComplete, number, title, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center p-2 rounded-lg transition-all ${
        isActive
          ? 'bg-purple-600 text-white'
          : isComplete
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-400'
      }`}
    >
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
          isActive
            ? 'bg-white text-purple-600'
            : isComplete
            ? 'bg-green-200 text-green-800'
            : 'bg-gray-200 text-gray-400'
        }`}
      >
        {isComplete ? <CheckCircle size={16} /> : icon}
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
          icon={<FileText size={16} />}
          onClick={() => handleStepClick(1)}
        />
        <Step
          isActive={currentStep === 2}
          isComplete={currentStep > 2}
          number={2}
          title="Keywords"
          icon={<Tag size={16} />}
          onClick={() => handleStepClick(2)}
        />
        <Step
          isActive={currentStep === 3}
          isComplete={currentStep > 3}
          number={3}
          title="Outline"
          icon={<List size={16} />}
          onClick={() => handleStepClick(3)}
        />
        <Step
          isActive={currentStep === 4}
          isComplete={currentStep > 4}
          number={4}
          title="Content"
          icon={<FileTextIcon size={16} />}
          onClick={() => handleStepClick(4)}
        />
        <Step
          isActive={currentStep === 5}
          isComplete={currentStep > 5}
          number={5}
          title="Images"
          icon={<ImageIcon size={16} />}
          onClick={() => handleStepClick(5)}
        />
        <Step
          isActive={currentStep === 6}
          isComplete={currentStep > 6}
          number={6}
          title="Publish"
          icon={<Send size={16} />}
          onClick={() => handleStepClick(6)}
        />
      </div>
    </div>
  );
};

export default StepNavigation;