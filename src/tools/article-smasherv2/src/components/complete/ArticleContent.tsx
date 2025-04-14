import React from 'react';
import { Droppable } from 'react-beautiful-dnd';

interface ImageItem {
  id: string;
  url: string;
  alt: string;
  caption: string;
  isSelected: boolean;
  type?: string;
}

interface ArticleContentProps {
  title: string;
  content: string;
  imagePositions: Record<string, string>;
  images: ImageItem[];
}

const ArticleContent: React.FC<ArticleContentProps> = ({ title, content, imagePositions, images }) => {
  // Function to render content sections with droppable areas
  const renderContentWithDroppableAreas = () => {
    if (!content) {
      // Use sample content if no content is provided
      return renderSampleContent();
    }

    // Split content by headers to create sections
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const sections = [];
    let currentSection = document.createElement('div');
    let sectionIndex = 0;
    
    // Process all child nodes
    Array.from(tempDiv.childNodes).forEach((node) => {
      const isHeader = node.nodeName === 'H1' || node.nodeName === 'H2' || node.nodeName === 'H3';
      
      if (isHeader && currentSection.childNodes.length > 0) {
        // Add the current section
        sections.push({
          id: `section-${sectionIndex}`,
          content: currentSection.innerHTML
        });
        sectionIndex++;
        currentSection = document.createElement('div');
      }
      
      // Clone the node to the current section
      currentSection.appendChild(node.cloneNode(true));
    });
    
    // Add the last section if it has content
    if (currentSection.childNodes.length > 0) {
      sections.push({
        id: `section-${sectionIndex}`,
        content: currentSection.innerHTML
      });
    }
    
    // Render sections with droppable areas
    return sections.map((section, index) => {
      const sectionId = `content-section-${index}`;
      const droppedImage = Object.entries(imagePositions).find(([imageId, dropId]) => dropId === sectionId);
      
      return (
        <div key={section.id} className="mb-6">
          <Droppable droppableId={sectionId}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`prose prose-sm max-w-none ${snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-300 p-4 rounded-lg' : ''}`}
              >
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
                
                {/* Visual indicator for dragging images */}
                {!snapshot.isDraggingOver && !droppedImage && (
                  <div className="drag-indicator">
                    <div className="drag-indicator-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                    <p>Drag and drop an image here</p>
                  </div>
                )}
                
                {/* Show dropped image if any */}
                {droppedImage && (
                  <div className="my-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    {images.find(img => img.id === droppedImage[0]) && (
                      <figure className="drop-success-animation">
                        <img 
                          src={images.find(img => img.id === droppedImage[0])?.url} 
                          alt={images.find(img => img.id === droppedImage[0])?.alt || 'Article image'} 
                          className="w-full rounded-lg"
                        />
                        <figcaption className="text-sm text-gray-500 mt-2 text-center">
                          {images.find(img => img.id === droppedImage[0])?.caption || 'Image caption'}
                        </figcaption>
                      </figure>
                    )}
                  </div>
                )}
                
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      );
    });
  };
  
  // Sample content for preview
  const renderSampleContent = () => {
    const sections = [
      {
        id: 'intro',
        content: `<p>WordPress powers over 40% of all websites on the internet, making it a prime target for hackers and malicious actors. In this comprehensive guide, we'll explore essential WordPress security measures to keep your website safe and secure.</p>`
      },
      {
        id: 'vulnerabilities',
        content: `<h2>Common WordPress Security Vulnerabilities</h2>
          <p>WordPress sites face several common security threats:</p>
          <ul>
            <li><strong>Outdated software</strong>: Running outdated versions of WordPress core, themes, or plugins</li>
            <li><strong>Weak credentials</strong>: Using easily guessable usernames and passwords</li>
            <li><strong>Vulnerable plugins</strong>: Installing poorly coded or unmaintained plugins</li>
            <li><strong>Brute force attacks</strong>: Automated attempts to guess login credentials</li>
            <li><strong>SQL injection</strong>: Exploiting vulnerabilities to insert malicious SQL code</li>
          </ul>`
      },
      {
        id: 'plugins',
        content: `<h2>Essential Security Plugins for WordPress</h2>
          <p>These security plugins can significantly enhance your WordPress site's protection:</p>
          <ol>
            <li><strong>Wordfence Security</strong>: Provides a firewall, malware scanner, and login security features</li>
            <li><strong>Sucuri Security</strong>: Offers malware scanning, security hardening, and post-hack security actions</li>
            <li><strong>iThemes Security</strong>: Includes 30+ ways to secure and protect your WordPress site</li>
            <li><strong>All In One WP Security & Firewall</strong>: A comprehensive security solution with an easy-to-use interface</li>
          </ol>`
      },
      {
        id: 'conclusion',
        content: `<h2>Conclusion</h2>
          <p>WordPress security is not a one-time setup but an ongoing process. By implementing the strategies outlined in this guide, you can significantly reduce the risk of your site being compromised.</p>`
      }
    ];
    
    return sections.map((section, index) => {
      const sectionId = `content-section-${index}`;
      const droppedImage = Object.entries(imagePositions).find(([imageId, dropId]) => dropId === sectionId);
      
      return (
        <div key={section.id} className="mb-6">
          <Droppable droppableId={sectionId}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`prose prose-sm max-w-none ${snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-300 p-4 rounded-lg' : ''}`}
              >
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
                
                {/* Visual indicator for dragging images */}
                {!snapshot.isDraggingOver && !droppedImage && (
                  <div className="drag-indicator">
                    <div className="drag-indicator-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                    <p>Drag and drop an image here</p>
                  </div>
                )}
                
                {/* Show dropped image if any */}
                {droppedImage && (
                  <div className="my-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    {images.find(img => img.id === droppedImage[0]) && (
                      <figure className="drop-success-animation">
                        <img 
                          src={images.find(img => img.id === droppedImage[0])?.url} 
                          alt={images.find(img => img.id === droppedImage[0])?.alt || 'Article image'} 
                          className="w-full rounded-lg"
                        />
                        <figcaption className="text-sm text-gray-500 mt-2 text-center">
                          {images.find(img => img.id === droppedImage[0])?.caption || 'Image caption'}
                        </figcaption>
                      </figure>
                    )}
                  </div>
                )}
                
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      );
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{title || 'Ultimate Guide to WordPress Security'}</h1>
      
      {/* Render content with droppable areas */}
      {renderContentWithDroppableAreas()}
    </div>
  );
};

export default ArticleContent;