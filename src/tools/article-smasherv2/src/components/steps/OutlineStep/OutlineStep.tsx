import React, { useEffect, useState } from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { usePrompt } from '../../../contexts/PromptContext';
import { RefreshCw, List, Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { OutlineItem } from '../../../types';

const OutlineStep: React.FC = () => {
  const { 
    title, 
    selectedKeywords, 
    outline,
    setOutline,
    generating,
    setGenerating,
    generateOutline
  } = useArticleWizard();
  
  const { prompts, settings } = usePrompt();
  
  // Get the outline prompt template
  const outlinePrompts = prompts.filter(p => p.category === 'outline');
  const outlinePrompt = outlinePrompts.length > 0 ? outlinePrompts[0] : null;
  
  const [newPoint, setNewPoint] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Convert flat outline points to hierarchical structure for display
  const [flatOutlinePoints, setFlatOutlinePoints] = useState<string[]>([]);
  
  // Effect to flatten outline for simple display
  useEffect(() => {
    if (outline && outline.length > 0) {
      const flattenOutline = (items: OutlineItem[], prefix = ''): string[] => {
        return items.reduce((acc: string[], item) => {
          const itemPrefix = prefix ? `${prefix}.${item.level}` : `${item.level}`;
          acc.push(`${itemPrefix}. ${item.title}`);
          
          if (item.children && item.children.length > 0) {
            acc.push(...flattenOutline(item.children, itemPrefix));
          }
          
          return acc;
        }, []);
      };
      
      setFlatOutlinePoints(flattenOutline(outline));
    } else {
      setFlatOutlinePoints([]);
    }
  }, [outline]);
  
  const toggleItemExpanded = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const addOutlinePoint = () => {
    if (newPoint.trim()) {
      // Create a new outline item
      const newItem: OutlineItem = {
        id: `outline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: newPoint.trim(),
        level: 1,
        children: []
      };
      
      // Add to the outline
      setOutline([...outline, newItem]);
      setNewPoint('');
    }
  };
  
  const removeOutlineItem = (id: string) => {
    // Recursive function to filter out the item and its children
    const filterOutItem = (items: OutlineItem[]): OutlineItem[] => {
      return items.filter(item => {
        if (item.id === id) return false;
        
        if (item.children && item.children.length > 0) {
          item.children = filterOutItem(item.children);
        }
        
        return true;
      });
    };
    
    setOutline(filterOutItem(outline));
  };
  
  const handleGenerateOutline = async () => {
    if (title && selectedKeywords.length > 0) {
      await generateOutline(title, selectedKeywords);
    }
  };
  
  // Recursive function to render outline items
  const renderOutlineItems = (items: OutlineItem[], level = 0) => {
    return items.map((item, index) => (
      <div key={item.id} className="ml-4">
        <div className="flex items-center group my-2">
          {item.children && item.children.length > 0 ? (
            <button
              onClick={() => toggleItemExpanded(item.id)}
              className="mr-1 text-gray-500 hover:text-gray-700"
            >
              {expandedItems[item.id] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <div className="w-4 h-4 mr-1"></div>
          )}
          
          <div className="flex-grow px-2 py-1 bg-gray-50 rounded-lg text-sm text-gray-800">
            {item.title}
          </div>
          
          <button
            onClick={() => removeOutlineItem(item.id)}
            className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        {item.children && item.children.length > 0 && expandedItems[item.id] && (
          <div className="ml-4 border-l-2 border-gray-200 pl-2">
            {renderOutlineItems(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">Article Outline</h3>
        <button 
          onClick={handleGenerateOutline} 
          className="btn btn-ghost text-sm py-1 px-3 flex items-center"
          disabled={generating || !title || selectedKeywords.length === 0}
        >
          <RefreshCw className={`mr-1 ${generating ? 'animate-spin' : ''}`} size={14} />
          {generating ? 'Generating...' : 'Generate Outline'}
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
        
        {generating ? (
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Generating outline...</span>
          </div>
        ) : outline.length > 0 ? (
          <div className="space-y-1 mb-4">
            {renderOutlineItems(outline)}
          </div>
        ) : (
          <div className="text-center py-4 mb-4">
            <p className="text-gray-500">No outline points yet</p>
            <p className="text-sm text-gray-400">
              Click "Generate Outline" or add points manually below
            </p>
          </div>
        )}
        
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