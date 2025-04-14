import React from 'react';

interface ArticleContentProps {
  title: string;
  content: string;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ title, content }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{title || 'Ultimate Guide to WordPress Security'}</h1>
      
      {content ? (
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
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
          
          <h2>Conclusion</h2>
          
          <p>WordPress security is not a one-time setup but an ongoing process. By implementing the strategies outlined in this guide, you can significantly reduce the risk of your site being compromised.</p>
        </div>
      )}
    </div>
  );
};

export default ArticleContent;