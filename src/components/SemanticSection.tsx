import React from 'react';

interface SemanticSectionProps {
  as?: 'section' | 'article' | 'main' | 'div' | 'header';
  title?: string;
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  subtitle?: string;
  subtitleAs?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  id?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

/**
 * SemanticSection Component
 * 
 * This component creates a semantically structured section with proper heading hierarchy.
 * It helps maintain good SEO practices by ensuring proper document structure.
 * 
 * Props:
 * - as: The HTML element to use for the section (default: 'section')
 * - title: The title of the section
 * - titleAs: The heading level for the title (default: 'h2')
 * - subtitle: An optional subtitle for the section
 * - subtitleAs: The heading level or element for the subtitle (default: 'h3')
 * - id: An optional ID for the section
 * - className: Additional classes for the section
 * - titleClassName: Additional classes for the title
 * - subtitleClassName: Additional classes for the subtitle
 * - contentClassName: Additional classes for the content wrapper
 * - children: The content of the section
 */
const SemanticSection: React.FC<SemanticSectionProps> = ({
  as = 'section',
  title,
  titleAs = 'h2',
  subtitle,
  subtitleAs = 'h3',
  id,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  contentClassName = '',
  children
}) => {
  const SectionTag = as;
  const TitleTag = titleAs;
  const SubtitleTag = subtitleAs;
  
  return (
    <SectionTag id={id} className={className}>
      {title && subtitle ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <TitleTag className={`${titleClassName}`}>
            {title}
          </TitleTag>
          <SubtitleTag className={`${subtitleClassName}`}>
            {subtitle}
          </SubtitleTag>
        </div>
      ) : title ? (
        <TitleTag className={`${titleClassName}`}>
          {title}
        </TitleTag>
      ) : subtitle ? (
        <SubtitleTag className={`${subtitleClassName}`}>
          {subtitle}
        </SubtitleTag>
      ) : null}
      
      <div className={contentClassName}>
        {children}
      </div>
    </SectionTag>
  );
};

export default SemanticSection;