import React from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { CheckCircle, FileText, Image as ImageIcon, Tag } from 'lucide-react';

const PublishStep: React.FC = () => {
  const { 
    title, 
    selectedKeywords, 
    htmlOutput, 
    images,
    setShowComplete
  } = useArticleWizard();
  
  // Get selected images
  const getSelectedImages = () => {
    return images.filter(img => img.isSelected);
  };
  
  // Handle publish button click
  const handlePublish = () => {
    setShowComplete(true);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">Publish Article</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Review your article and publish it to WordPress or export it for use elsewhere.
      </p>
      
      {/* Article Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <FileText className="mr-2 text-primary" size={16} />
          Article Summary
        </h4>
        
        <div className="space-y-4">
          <div>
            <h5 className="text-xs font-medium text-gray-500 mb-1">Title</h5>
            <p className="text-sm text-gray-800">{title || "No title set"}</p>
          </div>
          
          <div>
            <h5 className="text-xs font-medium text-gray-500 mb-1">Keywords</h5>
            <div className="flex flex-wrap gap-1">
              {selectedKeywords.length > 0 ? (
                selectedKeywords.map((keyword, index) => (
                  <span key={index} className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700">
                    {keyword}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No keywords selected</p>
              )}
            </div>
          </div>
          
          <div>
            <h5 className="text-xs font-medium text-gray-500 mb-1">Content</h5>
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-2" size={16} />
              <span className="text-sm text-gray-800">
                {htmlOutput ? "Content generated successfully" : "No content generated"}
              </span>
            </div>
          </div>
          
          <div>
            <h5 className="text-xs font-medium text-gray-500 mb-1">Images</h5>
            <div className="flex items-center">
              <CheckCircle className={`${getSelectedImages().length > 0 ? 'text-green-500' : 'text-gray-300'} mr-2`} size={16} />
              <span className="text-sm text-gray-800">
                {getSelectedImages().length > 0 
                  ? `${getSelectedImages().length} images selected` 
                  : "No images selected"}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Publishing Options */}
      <div className="bg-primary-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Publishing Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select className="input text-sm">
              <option>Publish immediately</option>
              <option>Save as draft</option>
              <option>Schedule publication</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select className="input text-sm">
              <option>WordPress</option>
              <option>Artificial Intelligence</option>
              <option>Content Marketing</option>
              <option>SEO</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author
            </label>
            <select className="input text-sm">
              <option>Admin</option>
              <option>Editor</option>
              <option>Contributor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Add tags separated by commas"
                className="input pl-8 text-sm"
              />
              <Tag className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <button 
            onClick={handlePublish}
            className="btn btn-primary text-sm py-2 px-4 w-full md:w-auto flex items-center justify-center"
          >
            Preview Complete Article
          </button>
          <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm py-2 px-4 w-full md:w-auto flex items-center justify-center">
            Export as HTML
          </button>
          <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm py-2 px-4 w-full md:w-auto flex items-center justify-center">
            Export as Markdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishStep;