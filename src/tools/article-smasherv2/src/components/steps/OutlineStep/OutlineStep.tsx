import React from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { RefreshCw, List, Plus, Trash2 } from 'lucide-react';

const OutlineStep: React.FC = () => {
  const { title, selectedKeywords } = useArticleWizard();
  
  // Sample outline points
  const [outlinePoints, setOutlinePoints] = React.useState([
    "Introduction to WordPress Security",
    "Common WordPress Security Vulnerabilities",
    "Essential Security Plugins for WordPress",
    "Hardening WordPress Configuration",
    "Regular Maintenance and Updates",
    "Backup Strategies for WordPress",
    "Monitoring and Responding to Security Threats",
    "Conclusion and Next Steps"
  ]);
  
  const [newPoint, setNewPoint] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  
  const addOutlinePoint = () => {
    if (newPoint.trim()) {
      setOutlinePoints([...outlinePoints, newPoint.trim()]);
      setNewPoint('');
    }
  };
  
  const removeOutlinePoint = (index: number) => {
    setOutlinePoints(outlinePoints.filter((_, i) => i !== index));
  };
  
  const regenerateOutline = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate new outline based on title and keywords
      const newOutline = [
        `Introduction to ${title}`,
        "Understanding the Core Concepts",
        "Key Benefits and Advantages",
        "Common Challenges and Solutions",
        "Best Practices and Implementation Tips",
        "Case Studies and Real-World Examples",
        "Tools and Resources",
        "Conclusion and Next Steps"
      ];
      
      setOutlinePoints(newOutline);
      setIsGenerating(false);
    }, 1500);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">Article Outline</h3>
        <button 
          onClick={regenerateOutline} 
          className="btn btn-ghost text-sm py-1 px-3 flex items-center"
          disabled={isGenerating}
        >
          <RefreshCw className={`mr-1 ${isGenerating ? 'animate-spin' : ''}`} size={14} />
          {isGenerating ? 'Generating...' : 'Regenerate'}
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">
        Create an outline for your article. This will help structure your content and improve readability.
      </p>
      
      {/* Topic and Keywords Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Topic</h4>
          <p className="text-sm text-gray-800">{title || "No topic selected"}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">Target Keywords</h4>
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
      </div>
      
      {/* Outline Editor */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <List className="mr-2 text-primary" size={16} />
          Outline Points
        </h4>
        
        <div className="space-y-2 mb-4">
          {outlinePoints.map((point, index) => (
            <div key={index} className="flex items-center group">
              <div className="w-6 text-center text-gray-400">{index + 1}.</div>
              <div className="flex-grow px-2 py-1 bg-gray-50 rounded-lg text-sm text-gray-800">
                {point}
              </div>
              <button
                onClick={() => removeOutlinePoint(index)}
                className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center">
          <div className="w-6 text-center text-gray-400">
            <Plus size={16} className="mx-auto" />
          </div>
          <input
            type="text"
            value={newPoint}
            onChange={(e) => setNewPoint(e.target.value)}
            placeholder="Add a new outline point..."
            className="flex-grow px-2 py-1 bg-gray-50 rounded-lg text-sm border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary"
            onKeyDown={(e) => e.key === 'Enter' && addOutlinePoint()}
          />
          <button
            onClick={addOutlinePoint}
            className="ml-2 px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark"
            disabled={!newPoint.trim()}
          >
            Add
          </button>
        </div>
      </div>
      
      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Outline Tips</h4>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Start with an engaging introduction that hooks the reader</li>
          <li>Include your main keyword in at least one heading</li>
          <li>Structure your content logically, from basic to advanced concepts</li>
          <li>Include a conclusion that summarizes key points</li>
          <li>Aim for 5-8 main sections for a comprehensive article</li>
        </ul>
      </div>
    </div>
  );
};

export default OutlineStep;