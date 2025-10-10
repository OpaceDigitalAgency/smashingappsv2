import React, { useState } from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { CheckCircle, FileText, Image as ImageIcon, Tag, FileDown, Eye, FileCode, ChevronDown } from 'lucide-react';

const PublishStep: React.FC = () => {
  const { 
    title, 
    selectedKeywords, 
    htmlOutput, 
    images,
    setShowComplete
  } = useArticleWizard();
  
  // State for form values
  const [status, setStatus] = useState('publish');
  const [category, setCategory] = useState('wordpress');
  const [author, setAuthor] = useState('admin');
  const [tags, setTags] = useState('');
  
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

      {/* Image Bank Preview */}
      {getSelectedImages().length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <ImageIcon className="mr-2 text-primary" size={16} />
            Selected Images
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {getSelectedImages().map((image) => (
              <div key={image.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="relative">
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(image.alt || 'Image')}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="text-gray-400" size={24} />
                    </div>
                  )}
                  <div className="absolute top-1 right-1 bg-primary text-white text-xs px-2 py-0.5 rounded">
                    {image.type === 'featured' ? 'Featured' : 'Section'}
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate">{image.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Publishing Options */}
      <div className="bg-white rounded-lg shadow-md border border-indigo-100 mb-4 overflow-hidden">
        {/* Card Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Publishing Options</h3>
        </div>
        
        {/* Card Content */}
        <div className="p-5 space-y-6">
          {/* First row of dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                >
                  <option value="publish">Publish immediately</option>
                  <option value="draft">Save as draft</option>
                  <option value="schedule">Schedule publication</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                >
                  <option value="wordpress">WordPress</option>
                  <option value="ai">Artificial Intelligence</option>
                  <option value="content">Content Marketing</option>
                  <option value="seo">SEO</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Second row of dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Author Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <div className="relative">
                <select 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="contributor">Contributor</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Tags Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Add tags separated by commas"
                  className="w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Tag className="absolute left-3 top-2.5 text-indigo-500" size={16} />
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            {/* Preview Button */}
            <button 
              onClick={handlePublish}
              className="flex-1 bg-indigo-600 text-white rounded-lg font-medium py-2 px-4 flex items-center justify-center hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
            >
              <Eye className="mr-2 h-4 w-4" />
              <span>Preview Complete Article</span>
            </button>
            
            {/* Export HTML Button */}
            <button 
              className="flex-1 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium py-2 px-4 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <FileDown className="mr-2 h-4 w-4" />
              <span>Export as HTML</span>
            </button>
            
            {/* Export Markdown Button */}
            <button 
              className="flex-1 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium py-2 px-4 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <FileCode className="mr-2 h-4 w-4" />
              <span>Export as Markdown</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishStep;