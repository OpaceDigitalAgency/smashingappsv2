import React from 'react';
import { useArticleWizard } from '../contexts/ArticleWizardContext';
import MainLayout from './layout/MainLayout';
import TopicStep from './steps/TopicStep/TopicStepWithNav';
import KeywordStep from './steps/KeywordStep/KeywordStep';
import OutlineStep from './steps/OutlineStep/OutlineStep';
import ContentStep from './steps/ContentStep/ContentStep';
import ImageStep from './steps/ImageStep/ImageStepWithNav';
import PublishStep from './steps/PublishStep/PublishStep';
import CompleteArticle from './complete/CompleteArticle';

const ArticleWizard: React.FC = () => {
  const { currentStep, showComplete } = useArticleWizard();
  
  return (
    <MainLayout>
      {!showComplete ? (
        <>
          {currentStep === 1 && <TopicStep />}
          {currentStep === 2 && <KeywordStep />}
          {currentStep === 3 && <OutlineStep />}
          {currentStep === 4 && <ContentStep />}
          {currentStep === 5 && <ImageStep />}
          {currentStep === 6 && <PublishStep />}
        </>
      ) : (
        <CompleteArticle />
      )}
    </MainLayout>
  );
};

export default ArticleWizard;