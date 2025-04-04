import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  data: object;
}

/**
 * StructuredData Component
 * 
 * This component adds structured data (JSON-LD) to the page.
 * It helps search engines understand the content of the page and can
 * enable rich snippets in search results.
 * 
 * Props:
 * - data: The structured data object to be serialized as JSON-LD
 */
const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
};

/**
 * Create a breadcrumb structured data object
 * 
 * @param items Array of breadcrumb items with name and url
 * @returns Structured data object for breadcrumbs
 */
export const createBreadcrumbData = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url
    }))
  };
};

/**
 * Create a software application structured data object
 * 
 * @param name Name of the application
 * @param description Description of the application
 * @param url URL of the application
 * @param image Image URL of the application
 * @returns Structured data object for software application
 */
export const createSoftwareAppData = (
  name: string,
  description: string,
  url: string,
  image: string
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': name,
    'description': description,
    'applicationCategory': 'ProductivityApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'operatingSystem': 'Web',
    'url': url,
    'image': image
  };
};

/**
 * Create a FAQ structured data object
 * 
 * @param questions Array of questions and answers
 * @returns Structured data object for FAQ
 */
export const createFAQData = (questions: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions.map(q => ({
      '@type': 'Question',
      'name': q.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': q.answer
      }
    }))
  };
};

export default StructuredData;