import React from 'react';
import { useArticleWizard } from '../../contexts/ArticleWizardContext';
import { Copy, Code, Share2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import ArticleContent from './ArticleContent';
import ImageBank from './ImageBank';

const CompleteArticle: React.FC = () => {
  const { 
    title, 
    htmlOutput, 
    images
  } = useArticleWizard();
  
  // Get selected images
  const getSelectedImages = () => {
    return images.filter(img => img.isSelected);
  };
  
  // Handle drag and drop
  const onDragEnd = (result: DropResult) => {
    // Implement drag and drop logic here
    console.log('Drag ended', result);
  };
  
  // Copy text to clipboard
  const copyTextToClipboard = () => {
    if (!htmlOutput) return;
    
    // Convert HTML to plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlOutput;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Text copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };
  
  // Copy HTML to clipboard
  const copyHtmlToClipboard = () => {
    if (!htmlOutput) return;
    
    navigator.clipboard.writeText(htmlOutput)
      .then(() => {
        alert('HTML copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy HTML: ', err);
      });
  };
  
  return (
    <div className="complete-article-container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Complete Article</h3>
        <div className="flex space-x-2">
          <button 
            onClick={copyTextToClipboard}
            className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 p-2 rounded-lg"
            title="Copy text"
          >
            <Copy size={18} />
          </button>
          <button 
            onClick={copyHtmlToClipboard}
            className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 p-2 rounded-lg"
            title="Copy HTML"
          >
            <Code size={18} />
          </button>
          <button 
            className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 p-2 rounded-lg"
            title="Share"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content area */}
          <div className="flex-grow">
            <ArticleContent title={title} content={htmlOutput} />
          </div>
          
          {/* Image bank */}
          <div className="md:w-64 flex-shrink-0">
            <ImageBank images={getSelectedImages()} />
          </div>
        </div>
      </DragDropContext>
      
      <div className="mt-6 flex justify-between">
        <button 
          onClick={() => window.history.back()}
          className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-lg"
        >
          Back to Summary
        </button>
        <button 
          className="btn btn-primary py-2 px-6 rounded-lg"
        >
          Publish
        </button>
      </div>
    </div>
  );
};

export default CompleteArticle;