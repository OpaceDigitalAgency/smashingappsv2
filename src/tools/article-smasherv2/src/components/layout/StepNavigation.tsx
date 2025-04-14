import React, { useEffect, useRef } from 'react';
import { useArticleWizard } from '../../contexts/ArticleWizardContext';
import { CheckCircle, FileText, Tag, List, FileText as FileTextIcon, Image as ImageIcon, Send, Check } from 'lucide-react';

interface StepProps {
  isActive: boolean;
  isComplete: boolean;
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const Step: React.FC<StepProps> = ({ isActive, isComplete, number, title, description, icon, onClick }) => {
  return (
    <div className="tooltip">
      <button
        onClick={onClick}
        className={`flex items-center p-2 rounded-lg transition-all ${
          isActive
            ? 'bg-blue-600 text-white'
            : isComplete
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }`}
      >
        <div
          className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
            isActive
              ? 'bg-white text-blue-600'
              : isComplete
              ? 'bg-green-200 text-green-800'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {isComplete ? <CheckCircle size={16} /> : icon}
        </div>
        <span className="text-sm font-medium">{title}</span>
      </button>
      <div className="tooltip-text">
        <p className="font-medium mb-1">{title}</p>
        <p>{description}</p>
      </div>
    </div>
  );
};

const StepNavigation: React.FC = () => {
  const { currentStep, handleStepClick } = useArticleWizard();
  const totalSteps = 6;
  
  // Reference to the active step element
  const activeStepRef = useRef<HTMLDivElement>(null);
  
  // Scroll to active step when it changes
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentStep]);
  
  const steps = [
    {
      number: 1,
      title: "Topic",
      description: "Choose or create a topic for your article",
      icon: <FileText size={16} />
    },
    {
      number: 2,
      title: "Keywords",
      description: "Select relevant keywords for SEO optimization",
      icon: <Tag size={16} />
    },
    {
      number: 3,
      title: "Outline",
      description: "Create a structured outline for your content",
      icon: <List size={16} />
    },
    {
      number: 4,
      title: "Content",
      description: "Generate and edit your article content",
      icon: <FileTextIcon size={16} />
    },
    {
      number: 5,
      title: "Images",
      description: "Add and customize images for your article",
      icon: <ImageIcon size={16} />
    },
    {
      number: 6,
      title: "Publish",
      description: "Review and publish your completed article",
      icon: <Send size={16} />
    }
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-card p-3 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-gray-800">WordPress AI Content Creation</h2>
        <p className="text-gray-600 text-sm">Step {currentStep} of {totalSteps}</p>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div 
            key={step.number} 
            ref={currentStep === step.number ? activeStepRef : null}
          >
            <Step
              isActive={currentStep === step.number}
              isComplete={currentStep > step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
              onClick={() => handleStepClick(step.number)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepNavigation;