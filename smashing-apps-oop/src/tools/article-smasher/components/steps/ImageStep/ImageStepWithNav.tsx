import React, { useState, useEffect } from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { usePrompt } from '../../../contexts/PromptContext';
import { RefreshCw, Image as ImageIcon, Check, X, ArrowLeft, ArrowRight, Plus as PlusIcon, AlertCircle } from 'lucide-react';
import AICore from '../../../../../../core/AICore';
import { ModelInfo } from '../../../../../../core/registry/ModelRegistry';

const ImageStep: React.FC = () => {
  const {
    title,
    selectedKeywords,
    images,
    setImages,
    generating,
    setGenerating,
    generateImages,
    goToNextStep,
    goToPreviousStep
  } = useArticleWizard();
  
  const { prompts, settings, updateSettings } = usePrompt();
  
  // Get the image prompt template
  const imagePrompts = prompts.filter(p => p.category === 'image');
  const imagePrompt = imagePrompts.length > 0 ? imagePrompts[0] : null;
  
  const [prompt, setPrompt] = useState('');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [imageModels, setImageModels] = useState<ModelInfo[]>([]);
  const [chatModels, setChatModels] = useState<ModelInfo[]>([]);
  const [selectedImageModel, setSelectedImageModel] = useState<string>('');
  const [textModel, setTextModel] = useState<string>(settings.defaultModel);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  // Load available models from AI-Core
  useEffect(() => {
    const aiCore = AICore.getInstance();

    // Get available image models (only from configured providers)
    const availableImageModels = aiCore.getAvailableImageModels();
    setImageModels(availableImageModels);

    // Get available chat models (only from configured providers)
    const availableChatModels = aiCore.getAvailableChatModels();
    setChatModels(availableChatModels);

    // Set default image model if available
    if (availableImageModels.length > 0) {
      const aiSettings = aiCore.getSettings();
      setSelectedImageModel(aiSettings.defaultImageModel || availableImageModels[0].id);
    }
  }, []);

  // Set default prompt based on title - improved version
  useEffect(() => {
    if (title && !prompt) {
      setPrompt(`Create an image for ${title}`);
    }
  }, [title]);
  
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
  
  // Handle generate images
  const handleGenerateImages = async () => {
    if (title && selectedKeywords.length > 0) {
      await generateImages(title, selectedKeywords, selectedImageModel);
    }
  };
  
  // Handle text model change
  const handleTextModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setTextModel(newModel);
    updateSettings({ ...settings, defaultModel: newModel });
  };
  
  // Handle image model change
  const handleImageModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedImageModel(e.target.value);
  };
  
  // Get selected images
  const getSelectedImages = () => {
    return images.filter(img => img.isSelected);
  };
  
  // Generate suggested prompts based on title and keywords using AI
  const generateSuggestedPrompts = async () => {
    if (!title) return;

    setIsGeneratingSuggestions(true);

    try {
      // Use AI to generate better image prompts
      const aiCore = AICore.getInstance();
      const promptText = `Generate 4 detailed image prompts for an article titled "${title}" about ${selectedKeywords.join(', ')}. Each prompt should be specific and suitable for AI image generation. Return only the prompts, one per line, without numbering or bullets.`;

      const response = await aiCore.sendTextRequest(
        textModel,
        [{ role: 'user', content: promptText }],
        { maxTokens: 500, temperature: 0.8 },
        'article-smasher-image-prompts'
      );

      if (response.choices && response.choices.length > 0) {
        const content = response.choices[0].message.content;
        const prompts = content
          .split('\n')
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 10 && !p.match(/^\d+[\.\)]/))
          .slice(0, 4);

        setSuggestedPrompts(prompts);
      }
    } catch (error) {
      console.error('Error generating suggested prompts:', error);
      // Fallback to simple suggestions
      const suggestions = [
        `${title} in a modern, professional style`,
        `Illustration of ${title} with clean, minimalist design`,
        `3D render of ${title} concept with vibrant colors`,
        `${title} with ${selectedKeywords[0] || ''} theme, photorealistic`
      ];
      setSuggestedPrompts(suggestions);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };
  
  // Use suggested prompt
  const useSuggestedPrompt = (suggestion: string) => {
    setPrompt(suggestion);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">Image Generation</h3>
        <button
          onClick={generateSuggestedPrompts}
          disabled={isGeneratingSuggestions}
          className="btn btn-ghost text-sm py-1 px-3 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`mr-1 ${isGeneratingSuggestions ? 'animate-spin' : ''}`} size={14} />
          {isGeneratingSuggestions ? 'Generating...' : 'Suggest Prompts'}
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">
        Generate and select images for your article using AI image generation.
      </p>
      
      {/* Model Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Model Selection</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div>
            <label htmlFor="textModel" className="block text-sm font-medium text-gray-700 mb-1">
              Text Generation Model
            </label>
            <select
              id="textModel"
              value={textModel}
              onChange={handleTextModelChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {chatModels.length > 0 ? (
                chatModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))
              ) : (
                <option value="">No chat models available - Configure API keys in settings</option>
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Model used for generating article content and prompts
            </p>
          </div>
          
          <div>
            <label htmlFor="imageModel" className="block text-sm font-medium text-gray-700 mb-1">
              Image Generation Model
            </label>
            <select
              id="imageModel"
              value={selectedImageModel}
              onChange={handleImageModelChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={imageModels.length === 0}
            >
              {imageModels.length > 0 ? (
                imageModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))
              ) : (
                <option value="">No image models available - Configure API keys for providers with image generation</option>
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Model used for generating images
            </p>
          </div>
        </div>
      </div>
      
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
              onClick={handleGenerateImages}
              disabled={generating || !prompt.trim()}
              className="absolute right-2 top-2 bg-primary text-white px-3 py-1 rounded-md text-sm hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {generating ? (
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
        
        {/* Suggested Prompts */}
        {suggestedPrompts.length > 0 && (
          <div className="mb-3">
            <h5 className="text-xs font-medium text-gray-700 mb-2">Suggested Prompts:</h5>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => useSuggestedPrompt(suggestion)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-md transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
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
        
        {generating ? (
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
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        // Handle image loading errors
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(image.alt)}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <div className="text-center p-4">
                        <AlertCircle className="mx-auto mb-2 text-red-500" size={24} />
                        <p className="text-sm text-red-500">Image generation failed</p>
                        {image.error && (
                          <p className="text-xs text-gray-500 mt-1">{image.error}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => toggleImageSelection(image.id)}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                      image.isSelected
                        ? 'bg-primary text-white'
                        : 'bg-white/80 text-gray-700 hover:bg-white'
                    }`}
                  >
                    {image.isSelected ? <Check size={16} /> : <PlusIcon size={16} />}
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
    </div>
  );
};

export default ImageStep;