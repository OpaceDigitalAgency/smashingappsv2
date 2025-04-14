import React from 'react';
import { useArticleWizard } from '../../contexts/ArticleWizardContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FixedNavigationProps {
  showBackButton?: boolean;
  backButtonText?: string;
  continueButtonText?: string;
  onBackClick?: () => void;
  onContinueClick?: () => void;
  disableContinue?: boolean;
}

const FixedNavigation: React.FC<FixedNavigationProps> = ({
  showBackButton = true,
  backButtonText = 'Back',
  continueButtonText = 'Continue',
  onBackClick,
  onContinueClick,
  disableContinue = false
}) => {
  const { goToPreviousStep, goToNextStep, currentStep } = useArticleWizard();

  // Use provided handlers or default to context navigation
  const handleBackClick = onBackClick || goToPreviousStep;
  const handleContinueClick = onContinueClick || goToNextStep;

  // Hide back button on first step if not explicitly shown
  const shouldShowBackButton = showBackButton && currentStep > 1;

  return (
    <div className="fixed-nav-buttons">
      <div>
        {shouldShowBackButton && (
          <button 
            onClick={handleBackClick}
            className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-lg flex items-center"
          >
            <ArrowLeft className="mr-2" size={16} />
            {backButtonText}
          </button>
        )}
      </div>
      
      <button 
        onClick={handleContinueClick}
        className="btn btn-primary py-2 px-6 rounded-lg flex items-center"
        disabled={disableContinue}
      >
        {continueButtonText}
        <ArrowRight className="ml-2" size={16} />
      </button>
    </div>
  );
};

export default FixedNavigation;