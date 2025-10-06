import React, { useState } from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { RefreshCw, Image as ImageIcon, Check, X, ArrowLeft, ArrowRight } from 'lucide-react';

const ImageStep: React.FC = () => {
  const { title, images, setImages, goToNextStep, goToPreviousStep } = useArticleWizard();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  // Toggle image selection
  const toggleImageSelection = (id: string) => {
    setImages(
      images.map(img =>
        img.id === id ? { ...img, isSelected: !img.isSelected } : img
      )
    );
  };
  
  // Set image type (featured or section)
  const setImageType = (id: string, type: string) => {
    setImages(
      images.map(img =>
        img.id === id ? { ...img, type } : img
      )
    );
  };
  
  // Generate new images
  const generateImages = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Sample new images
      const newImages = [
        {
          id: `img${images.length + 1}`,
          url: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          alt: 'WordPress Security Dashboard',
          caption: 'Modern WordPress security dashboard interface',
          isSelected: false,
          type: 'section'
        },
        {
          id: `img${images.length + 2}`,
          url: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          alt: 'Secure Coding',
          caption: 'Secure coding practices for WordPress development',
          isSelected: false,
          type: 'section'
        }
      ];
      
      setImages([...images, ...newImages]);
      setIsGenerating(false);
      setPrompt('');
    }, 2000);
  };
  
  // Get selected images
  const getSelectedImages = () => {
    return images.filter(img => img.isSelected);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">Image Generation</h3>
        <button 
          onClick={() => setIsGenerating(false)}
          className="btn btn-ghost text-sm py-1 px-3 flex items-center"
        >
          <RefreshCw className="mr-1" size={14} />
          Regenerate
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">
        Generate and select images for your article using DALL-E 3.
      </p>
      
      {/* Image Generation Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <ImageIcon className="mr-2 text-primary" size={16} />
          Generate Images
        </h4>
        
        <div className="mb-3">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Image Prompt
          </label>
          <div className="relative">
            <input
              type="text"
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`E.g., ${title || 'WordPress security dashboard with lock icons'}`}
              className="input pr-24"
            />
            <button
              onClick={generateImages}
              disabled={isGenerating}
              className="absolute right-2 top-2 bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary-dark"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="inline-block mr-1 animate-spin" size={14} />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Describe the image you want to generate. Be specific for better results.
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <h5 className="text-xs font-medium text-blue-800 mb-1">Prompt Tips</h5>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>Include details about style, perspective, and lighting</li>
            <li>Specify if you want illustrations, photos, or 3D renders</li>
            <li>Mention colors and mood you want to convey</li>
            <li>Avoid requesting copyrighted characters or brands</li>
          </ul>
        </div>
      </div>
      
      {/* Generated Images */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-gray-700">Generated Images</h4>
          <span className="text-xs text-gray-500">{getSelectedImages().length} selected</span>
        </div>
        
        {isGenerating ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <RefreshCw className="animate-spin mx-auto mb-3 text-primary" size={24} />
            <p className="text-gray-600">Generating images...</p>
            <p className="text-xs text-gray-500 mt-1">This may take a minute</p>
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className={`bg-white rounded-lg border overflow-hidden ${
                  image.isSelected ? 'border-primary' : 'border-gray-200'
                }`}
              >
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => toggleImageSelection(image.id)}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                      image.isSelected
                        ? 'bg-primary text-white'
                        : 'bg-white/80 text-gray-700 hover:bg-white'
                    }`}
                  >
                    {image.isSelected ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                </div>
                
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-sm font-medium text-gray-800">{image.alt}</h5>
                    {image.isSelected && (
                      <div className="flex text-xs">
                        <button
                          onClick={() => setImageType(image.id, 'featured')}
                          className={`px-2 py-1 rounded-l-md ${
                            image.type === 'featured'
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Featured
                        </button>
                        <button
                          onClick={() => setImageType(image.id, 'section')}
                          className={`px-2 py-1 rounded-r-md ${
                            image.type === 'section'
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Section
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600">{image.caption}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-2">No images generated yet</p>
            <p className="text-sm text-gray-500">
              Use the form above to generate images for your article.
            </p>
          </div>
        )}
      </div>
    </div>
    
    {/* Navigation Buttons */}
    <div className="flex justify-between mt-8">
      <button
        onClick={() => useArticleWizard().goToPreviousStep()}
        className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-lg"
      >
        Back
      </button>
      <button
        onClick={() => useArticleWizard().goToNextStep()}
        className="btn btn-primary py-2 px-6 rounded-lg"
      >
        Continue
      </button>
    </div>
    
    {/* Navigation Buttons */}
    <div className="flex justify-between mt-8">
      <button
        onClick={goToPreviousStep}
        className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 py-2 px-4 rounded-lg flex items-center"
      >
        <ArrowLeft className="mr-2" size={16} />
        Back
      </button>
      <button
        onClick={goToNextStep}
        className="btn btn-primary py-2 px-6 rounded-lg flex items-center"
      >
        Continue
        <ArrowRight className="ml-2" size={16} />
      </button>
    </div>
  );
};

// Plus icon component
const Plus = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default ImageStep;