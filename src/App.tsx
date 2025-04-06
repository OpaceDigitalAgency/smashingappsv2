/**
 * Main Application Router
 *
 * This is the entry point for the SmashingApps.ai unified application.
 * It handles routing for both the main homepage and all integrated tools.
 *
 * Architecture Overview:
 * - The application follows a unified architecture where multiple tools are integrated
 *   into a single React application.
 * - Each tool is contained in its own directory under src/tools/
 * - The main router (this file) handles routing to all tools
 *
 * Adding a new tool:
 * 1. Create a new directory in src/tools/ with your tool name (kebab-case)
 * 2. Create a main component for your tool (PascalCase + "App.tsx")
 * 3. Import the component here
 * 4. Add routes for your tool following the pattern below
 * 5. Update src/components/Tools.tsx to include your tool in the tools list
 *
 * See CONTRIBUTING.md for more detailed guidelines.
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';
import StructuredData from './components/StructuredData';

// Import main site components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Tools from './components/Tools';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Import tool components
// When adding a new tool, import its main component here
import TaskSmasherApp from './tools/task-smasher/TaskSmasherApp';
// import YourNewToolApp from './tools/your-new-tool/YourNewToolApp';

// Define placeholder use cases for routing
const useCaseDefinitions = {
  daily: { label: "Daily Organizer", description: "Everyday tasks" },
  goals: { label: "Goal Planner", description: "Long-term objectives" },
  marketing: { label: "Marketing Tasks", description: "Marketing campaigns" },
  recipe: { label: "Recipe Steps", description: "Cooking recipes" },
  home: { label: "Home Chores", description: "Household tasks" },
  travel: { label: "Trip Planner", description: "Travel planning" },
  study: { label: "Study Plan", description: "Academic tasks" },
  events: { label: "Event Planning", description: "Party planning" },
  freelance: { label: "Freelancer Projects", description: "Client work" },
  shopping: { label: "Shopping Tasks", description: "Shopping lists" },
  diy: { label: "DIY Projects", description: "Do-it-yourself projects" },
  creative: { label: "Creative Projects", description: "Creative endeavors" }
};

// HomePage component for the root route (without Navbar since it's now global)
const HomePage = () => (
  <div className="min-h-screen bg-gray-50">
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'SmashingApps.ai',
        'url': 'https://smashingapps.ai',
        'description': 'AI-powered micro-apps that help you smash through tasks with smart, fun, and focused tools',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://smashingapps.ai/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }}
    />
    <main>
      <Hero />
      <Tools />
      <Features />
      <Testimonials />
      <CTA />
    </main>
  </div>
);

/**
 * Main App component that handles all routing
 *
 * This component sets up the router and defines all routes for the application.
 * When adding a new tool, follow the pattern established for TaskSmasher:
 * 1. Add routes for the base path (both with and without trailing slash)
 * 2. Add routes for any specialized sub-paths if needed
 */
// BodyClassManager component to manage body classes based on route
const BodyClassManager = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Remove existing classes
    document.body.classList.remove('home', 'task-smasher');
    
    // Add appropriate class based on the current route
    if (location.pathname === '/') {
      document.body.classList.add('home');
    } else if (location.pathname.includes('/tools/task-smasher')) {
      document.body.classList.add('task-smasher');
    }
  }, [location.pathname]);
  
  return null;
};

function App() {
  return (
    <HelmetProvider>
    <HelmetProvider>
      <BrowserRouter>
        {/* Global SEO component - manages all meta tags */}
        <SEO />
        {/* Body class manager component */}
        <BodyClassManager />
        {/* Global Navbar - appears on all pages */}
        <Navbar />
        <div className="pt-0 min-h-screen flex flex-col"> {/* Add padding to account for the navbar */}
          <div className="flex-grow">
            <Routes>
            {/* Main homepage route */}
            <Route path="/" element={<HomePage />} />
            
            {/* Contact page route */}
            <Route path="/contact" element={<Contact />} />
            
            {/*
              Tool Routes Section
              
              Each tool should have at least two routes:
              - One without trailing slash: /tools/tool-name
              - One with trailing slash: /tools/tool-name/
              
              This ensures URLs work consistently regardless of how they're entered.
            */}
            
            {/* TaskSmasher base routes - handle both with and without trailing slash */}
            <Route path="/tools/task-smasher" element={<TaskSmasherApp />} />
            <Route path="/tools/task-smasher/" element={<TaskSmasherApp />} />
            
            {/* Add new tool routes here following the same pattern */}
            {/* Example:
            <Route path="/tools/your-new-tool" element={<YourNewToolApp />} />
            <Route path="/tools/your-new-tool/" element={<YourNewToolApp />} />
            */}
            
            {/* TaskSmasher use case routes - handle both with and without trailing slash */}
            {Object.entries(useCaseDefinitions).flatMap(([id, definition]) => {
              const basePath = `/tools/task-smasher/${definition.label.toLowerCase().replace(/\s+/g, '-')}`;
              const pathWithSlash = `${basePath}/`;
              
              return [
                <Route key={`${id}-no-slash`} path={basePath} element={<TaskSmasherApp />} />,
                <Route key={`${id}-with-slash`} path={pathWithSlash} element={<TaskSmasherApp />} />
              ];
            })}
            
            {/* Catch-all redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          {/* Global Footer - appears on all pages */}
          <Footer />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;