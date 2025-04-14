import React, { useState } from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { RefreshCw, FileText, Sliders, ChevronRight } from 'lucide-react';

const ContentStep: React.FC = () => {
  const { title, selectedKeywords, htmlOutput, setHtmlOutput, generating, setGenerating } = useArticleWizard();
  
  const [showSettings, setShowSettings] = useState(false);
  const [contentLength, setContentLength] = useState('medium');
  const [contentTone, setContentTone] = useState('informative');
  const [includeStats, setIncludeStats] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  
  // Sample content
  const sampleContent = `
    <h1>Ultimate Guide to WordPress Security</h1>
    
    <p>WordPress powers over 40% of all websites on the internet, making it a prime target for hackers and malicious actors. In this comprehensive guide, we'll explore essential WordPress security measures to keep your website safe and secure.</p>
    
    <h2>Common WordPress Security Vulnerabilities</h2>
    
    <p>WordPress sites face several common security threats:</p>
    
    <ul>
      <li><strong>Outdated software</strong>: Running outdated versions of WordPress core, themes, or plugins</li>
      <li><strong>Weak credentials</strong>: Using easily guessable usernames and passwords</li>
      <li><strong>Vulnerable plugins</strong>: Installing poorly coded or unmaintained plugins</li>
      <li><strong>Brute force attacks</strong>: Automated attempts to guess login credentials</li>
      <li><strong>SQL injection</strong>: Exploiting vulnerabilities to insert malicious SQL code</li>
    </ul>
    
    <h2>Essential Security Plugins for WordPress</h2>
    
    <p>These security plugins can significantly enhance your WordPress site's protection:</p>
    
    <ol>
      <li><strong>Wordfence Security</strong>: Provides a firewall, malware scanner, and login security features</li>
      <li><strong>Sucuri Security</strong>: Offers malware scanning, security hardening, and post-hack security actions</li>
      <li><strong>iThemes Security</strong>: Includes 30+ ways to secure and protect your WordPress site</li>
      <li><strong>All In One WP Security & Firewall</strong>: A comprehensive security solution with an easy-to-use interface</li>
    </ol>
    
    <h2>Hardening WordPress Configuration</h2>
    
    <p>Beyond plugins, these configuration changes can strengthen your WordPress security:</p>
    
    <ul>
      <li>Change the default database prefix from "wp_" to something unique</li>
      <li>Disable file editing through the WordPress admin</li>
      <li>Implement SSL encryption (HTTPS) for your entire site</li>
      <li>Set proper file permissions (typically 644 for files and 755 for directories)</li>
      <li>Hide your WordPress version number from public view</li>
    </ul>
    
    <h2>Regular Maintenance and Updates</h2>
    
    <p>Consistent maintenance is crucial for WordPress security:</p>
    
    <ul>
      <li>Update WordPress core as soon as security releases are available</li>
      <li>Keep all themes and plugins updated to their latest versions</li>
      <li>Remove any unused themes and plugins</li>
      <li>Regularly scan your site for malware and suspicious activity</li>
      <li>Monitor your site's error logs for unusual patterns</li>
    </ul>
    
    <h2>Conclusion</h2>
    
    <p>WordPress security is not a one-time setup but an ongoing process. By implementing the strategies outlined in this guide, you can significantly reduce the risk of your site being compromised. Remember that security is about layers of protection – the more security measures you implement, the better protected your WordPress site will be.</p>
  `;
  
  const generateContent = () => {
    setGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setHtmlOutput(sampleContent);
      setGenerating(false);
    }, 3000);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">Content Generation</h3>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="btn btn-ghost text-sm py-1 px-3 flex items-center"
        >
          <Sliders className="mr-1" size={14} />
          Settings
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">
        Generate high-quality content based on your topic, keywords, and outline.
      </p>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Content Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Length
              </label>
              <select
                value={contentLength}
                onChange={(e) => setContentLength(e.target.value)}
                className="input text-sm"
              >
                <option value="short">Short (~500 words)</option>
                <option value="medium">Medium (~1000 words)</option>
                <option value="long">Long (~1500 words)</option>
                <option value="comprehensive">Comprehensive (~2000+ words)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Tone
              </label>
              <select
                value={contentTone}
                onChange={(e) => setContentTone(e.target.value)}
                className="input text-sm"
              >
                <option value="informative">Informative</option>
                <option value="conversational">Conversational</option>
                <option value="professional">Professional</option>
                <option value="persuasive">Persuasive</option>
                <option value="technical">Technical</option>
              </select>
            </div>
          </div>
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeStats"
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="includeStats" className="ml-2 text-sm text-gray-700">
                Include statistics and data points
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeExamples"
                checked={includeExamples}
                onChange={(e) => setIncludeExamples(e.target.checked)}
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="includeExamples" className="ml-2 text-sm text-gray-700">
                Include examples and case studies
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Preview */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="text-primary mr-2" size={18} />
            <h4 className="text-sm font-medium text-gray-700">Article Content</h4>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <span>Keywords: {selectedKeywords.length}</span>
            <ChevronRight size={14} className="mx-1" />
            <span>Estimated Reading Time: 5 min</span>
          </div>
        </div>
        
        {htmlOutput ? (
          <div className="p-4 prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: htmlOutput }} />
          </div>
        ) : generating ? (
          <div className="p-8 text-center">
            <RefreshCw className="animate-spin mx-auto mb-3 text-primary" size={24} />
            <p className="text-gray-600">Generating your content...</p>
            <p className="text-xs text-gray-500 mt-1">This may take a minute or two</p>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-2">No content generated yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Click the button below to generate content based on your topic, keywords, and outline.
            </p>
            <button
              onClick={generateContent}
              className="btn btn-primary py-2 px-4 text-sm"
            >
              Generate Content
            </button>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      {htmlOutput && (
        <div className="flex justify-end space-x-2">
          <button
            onClick={generateContent}
            className="btn btn-outline py-2 px-4 text-sm flex items-center"
            disabled={generating}
          >
            {generating ? (
              <>
                <RefreshCw className="mr-2 animate-spin" size={14} />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2" size={14} />
                Regenerate
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentStep;