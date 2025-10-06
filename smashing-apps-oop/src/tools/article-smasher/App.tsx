import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  BookOpenText,
  BrainCircuit,
  CheckCircle,
  Cpu,
  Database,
  Edit3,
  Globe,
  Image as ImageIcon,
  Layers,
  MessageSquareText,
  Search,
  Settings,
  Sparkles,
  Star,
  TerminalSquare,
  ListTodo,
  ChevronDown,
  Menu,
  X,
  PenTool,
  FileText,
  ArrowRight,
  Zap,
  Users,
  ArrowUpRight
} from 'lucide-react';
import ArticleWizard from './components/ArticleWizard';
import { ArticleWizardProvider } from './contexts/ArticleWizardContext';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => (
  <div className="card hover:shadow-lg p-6">
    <div className="flex items-center mb-4">
      <div className="bg-primary-50 p-3 rounded-full mr-4">
        <Icon className="text-primary" size={24} />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ number, title, description, icon: Icon }) => (
  <div className="flex mb-6">
    <div className="flex-shrink-0 mr-4">
      <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
        {number}
      </div>
    </div>
    <div className="card flex-grow p-5">
      <div className="flex items-center mb-2">
        <Icon className="text-primary mr-2" size={20} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

interface FAQProps {
  question: string;
  answer: string;
}

const FAQ: React.FC<FAQProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left font-medium text-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <ChevronDown
          size={20}
          className={`text-primary transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="mt-2 text-gray-600 text-sm">
          {answer}
        </div>
      )}
    </div>
  );
};

// SVG Illustration for hero section
const HeroIllustration = () => (
  <svg 
    width="100%" 
    height="100%" 
    viewBox="0 0 500 400" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="max-w-full h-auto"
  >
    <rect x="60" y="60" width="380" height="280" rx="20" fill="#F0F9FF" />
    <rect x="90" y="100" width="200" height="30" rx="6" fill="#CCE3F4" />
    <rect x="90" y="150" width="320" height="16" rx="4" fill="#99C7E9" />
    <rect x="90" y="180" width="280" height="16" rx="4" fill="#99C7E9" />
    <rect x="90" y="210" width="300" height="16" rx="4" fill="#99C7E9" />
    <rect x="90" y="260" width="100" height="40" rx="8" fill="#0068B3" />
    <circle cx="380" cy="180" r="40" fill="#0068B3" opacity="0.8" />
    <path d="M160 40 L180 10 L200 40" stroke="#0068B3" strokeWidth="4" />
    <path d="M350 320 L380 350 L410 320" stroke="#0068B3" strokeWidth="4" />
    <circle cx="40" cy="200" r="15" fill="#0068B3" opacity="0.5" />
    <circle cx="460" cy="100" r="10" fill="#0068B3" opacity="0.5" />
    <path d="M90 277 L110 277 L130 277" stroke="white" strokeWidth="2" />
  </svg>
);

function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mobile-container">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BrainCircuit className="text-primary h-8 w-8 mr-2" />
              <span className="font-bold text-xl text-gray-800">AI Scribe</span>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-primary">Features</a>
              <a href="#process" className="text-gray-600 hover:text-primary">Process</a>
              <a href="#technical" className="text-gray-600 hover:text-primary">Technical</a>
              <a href="#faq" className="text-gray-600 hover:text-primary">FAQ</a>
              <button className="btn btn-primary px-4 py-2">
                Get Started
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile navigation menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4 shadow-lg">
            <div className="flex flex-col space-y-3 py-3">
              <a 
                href="#features" 
                className="text-gray-600 hover:text-primary py-2 px-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#process" 
                className="text-gray-600 hover:text-primary py-2 px-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Process
              </a>
              <a 
                href="#technical" 
                className="text-gray-600 hover:text-primary py-2 px-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Technical
              </a>
              <a 
                href="#faq" 
                className="text-gray-600 hover:text-primary py-2 px-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <button className="btn btn-primary px-4 py-2 mt-2">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white mobile-section">
        <div className="mobile-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                AI-Powered Content Creation for WordPress
              </h1>
              <p className="text-lg mb-8 text-white/90">
                AI Scribe leverages OpenAI's GPT-4o models to generate SEO-optimized content through a guided, step-by-step process.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="btn bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-xl font-medium">
                  Learn More
                </button>
                <Link to="/wizard" className="btn bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-xl font-medium">
                  Try It Now
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mobile-section bg-white">
        <div className="mobile-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Core Functionality</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              AI Scribe offers a comprehensive set of features to streamline content creation with 
              advanced AI assistance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={BrainCircuit}
              title="AI-Powered Generation"
              description="Connect to OpenAI's latest GPT-4o (128K tokens) and GPT-4o-mini models to generate comprehensive articles."
            />
            <FeatureCard
              icon={ListTodo}
              title="Step-by-Step Workflow"
              description="Follow a structured process from brainstorming titles to publishing polished content."
            />
            <FeatureCard
              icon={Globe}
              title="Multi-Language Support"
              description="Create content in over 30 languages with customizable writing styles and tones."
            />
            <FeatureCard
              icon={Sparkles}
              title="Humanization Features"
              description="Make AI content sound more natural with specialized humanization modes and personality options."
            />
            <FeatureCard
              icon={Search}
              title="SEO Optimization"
              description="Generate SEO-friendly content with keyword integration, meta descriptions, and compatibility with popular SEO plugins."
            />
            <FeatureCard
              icon={ImageIcon}
              title="DALL-E 3 Integration"
              description="Generate relevant images for your content using OpenAI's DALL-E 3 image generation model."
            />
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="mobile-section bg-gray-50">
        <div className="mobile-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Content Creation Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              AI Scribe guides you through a systematic workflow to create comprehensive, polished content.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <ProcessStep 
              number={1}
              icon={MessageSquareText}
              title="Brainstorm Article Titles"
              description="Generate multiple title options based on your target topic and audience."
            />
            <ProcessStep 
              number={2}
              icon={Search}
              title="Identify Relevant Keywords"
              description="Discover and select high-value keywords to maximize SEO effectiveness."
            />
            <ProcessStep 
              number={3}
              icon={Layers}
              title="Generate Article Outline"
              description="Create a structured outline with headings and subheadings for your content."
            />
            <ProcessStep 
              number={4}
              icon={Edit3}
              title="Draft Content Sections"
              description="Generate introduction, body content, conclusion, and Q&A sections."
            />
            <ProcessStep 
              number={5}
              icon={Star}
              title="Enhance & Optimize"
              description="Polish content with SEO techniques, formatting, and humanization features."
            />
            <ProcessStep 
              number={6}
              icon={CheckCircle}
              title="Review & Publish"
              description="Review the final content, make any needed adjustments, and publish to your site."
            />
          </div>
        </div>
      </section>

      {/* Technical Details Section */}
      <section id="technical" className="mobile-section bg-white">
        <div className="mobile-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Technical Implementation</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              AI Scribe is built with robust technical foundations to ensure security, performance, and reliability.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center mb-6">
                <Database className="text-primary mr-3" size={24} />
                <h3 className="text-xl font-semibold">Database Structure</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Custom table <code>wp_article_builder</code> for storing generated content</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Structured storage for all article components (title, headings, body, etc.)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Efficient data organization for quick retrieval and editing</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="flex items-center mb-6">
                <Cpu className="text-primary mr-3" size={24} />
                <h3 className="text-xl font-semibold">API Integration</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Secure handling of OpenAI API requests</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Configurable API parameters (temperature, frequency penalty, etc.)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Robust error handling and retry mechanisms</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="flex items-center mb-6">
                <BookOpenText className="text-primary mr-3" size={24} />
                <h3 className="text-xl font-semibold">Content Processing</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Custom prompt templates for each content section</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Support for HTML formatting in generated content</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Automatic table of contents (TOC) generation</span>
                </li>
              </ul>
            </div>

            <div className="card p-6">
              <div className="flex items-center mb-6">
                <Settings className="text-primary mr-3" size={24} />
                <h3 className="text-xl font-semibold">Plugin Management</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>Automatic database table creation on activation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>WordPress nonce verification for AJAX requests</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={16} />
                  <span>User capability checks for secure operation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* UI Showcase */}
      <section className="mobile-section bg-gray-50">
        <div className="mobile-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">User Interface</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              AI Scribe features an intuitive, step-by-step interface to guide you through the content creation process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 card overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1607799279861-4dd421887fb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="AI Scribe Interface" 
                className="w-full rounded-t-xl"
              />
              <div className="p-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-800">Content creation interface</h4>
              </div>
            </div>
            <div className="lg:col-span-4 card p-6 flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-4">Intuitive Workflow</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-full mr-3">
                    <TerminalSquare className="text-primary" size={18} />
                  </div>
                  <span className="text-gray-700">Progress bar navigation</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-full mr-3">
                    <Edit3 className="text-primary" size={18} />
                  </div>
                  <span className="text-gray-700">Rich text editor (Quill.js)</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-full mr-3">
                    <Settings className="text-primary" size={18} />
                  </div>
                  <span className="text-gray-700">Comprehensive settings page</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-50 p-2 rounded-full mr-3">
                    <BookOpenText className="text-primary" size={18} />
                  </div>
                  <span className="text-gray-700">Built-in help documentation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="mobile-section bg-white">
        <div className="mobile-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about AI Scribe's functionality and implementation.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <FAQ 
              question="Do I need my own OpenAI API key to use this plugin?"
              answer="Yes, you need to provide your own OpenAI API key in the plugin settings. This ensures you have full control over your API usage and costs."
            />
            <FAQ 
              question="What WordPress versions is AI Scribe compatible with?"
              answer="AI Scribe is compatible with WordPress version 5.6 and above. For the best experience, we recommend using the latest version of WordPress."
            />
            <FAQ 
              question="How does AI Scribe handle content storage?"
              answer="All generated content is stored in a custom database table (wp_article_builder) within your WordPress database. This allows for efficient management and editing of your AI-generated content."
            />
            <FAQ 
              question="Can I customize the prompts used for content generation?"
              answer="Yes, AI Scribe provides customization options for the prompts used to generate different sections of content. This allows you to tailor the AI output to your specific needs and preferences."
            />
            <FAQ 
              question="Is the plugin compatible with popular SEO plugins?"
              answer="Yes, AI Scribe is designed to work seamlessly with popular WordPress SEO plugins like Yoast SEO, Rank Math, and All in One SEO Pack."
            />
            <FAQ 
              question="What happens to my data if I uninstall the plugin?"
              answer="When uninstalling, you have the option to either retain or delete all data created by AI Scribe. This gives you control over your content even after plugin removal."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mobile-section bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="mobile-container text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Content Creation?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Start creating SEO-optimized, high-quality content with AI assistance today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold">
              Get Started
            </button>
            <button className="btn bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 rounded-xl font-semibold">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="mobile-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BrainCircuit className="text-primary-200 h-6 w-6 mr-2" />
                <span className="font-bold text-xl">AI Scribe</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered content creation for WordPress websites.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Content Generation</a></li>
                <li><a href="#" className="hover:text-white">SEO Optimization</a></li>
                <li><a href="#" className="hover:text-white">Humanization</a></li>
                <li><a href="#" className="hover:text-white">Image Generation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API References</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} AI Scribe • Created by <a href="https://web-site.design" target="_blank" className="text-gray-400 hover:text-white underline">AI Website Design Agency</a>. Built in the UK.</p>
          </div>
        </div>
      </footer>
      
      {/* Mobile bottom navigation */}
      <div className="mobile-nav">
        <a href="#features" className="flex flex-col items-center text-gray-600 hover:text-primary">
          <Zap size={20} />
          <span className="text-xs mt-1">Features</span>
        </a>
        <a href="#process" className="flex flex-col items-center text-gray-600 hover:text-primary">
          <ListTodo size={20} />
          <span className="text-xs mt-1">Process</span>
        </a>
        <Link to="/wizard" className="flex flex-col items-center text-primary">
          <PenTool size={20} />
          <span className="text-xs mt-1">Try It</span>
        </Link>
        <a href="#technical" className="flex flex-col items-center text-gray-600 hover:text-primary">
          <Cpu size={20} />
          <span className="text-xs mt-1">Tech</span>
        </a>
        <a href="#faq" className="flex flex-col items-center text-gray-600 hover:text-primary">
          <FileText size={20} />
          <span className="text-xs mt-1">FAQ</span>
        </a>
      </div>
    </div>
  );
}

/**
 * App component for standalone mode
 *
 * This component is only used when the tool is run independently,
 * not when it's integrated into the main SmashingApps.ai application.
 *
 * When integrated, the ArticleSmasherV2App component is used directly.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/wizard" element={
        <ArticleWizardProvider>
          <ArticleWizard />
        </ArticleWizardProvider>
      } />
    </Routes>
  );
}

export default App;