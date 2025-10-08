import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Hammer, Brain, Target, Sparkles, Star, ListChecks, FileText, Palette } from 'lucide-react';
import AICore from '../../core/AICore';

const HomePage: React.FC = () => {
  const aiCore = AICore.getInstance();
  const isConfigured = aiCore.isConfigured();
  const stats = aiCore.getStats();

  const tools = [
    {
      name: 'Article Smasher',
      description: 'Generate high-quality, SEO-optimised articles with AI assistance',
      path: '/tools/article-smasher',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      useCases: [
        { name: 'Blog Post', path: '/tools/article-smasher/blog-post/' },
        { name: 'SEO Article', path: '/tools/article-smasher/seo-article/' },
        { name: 'Academic Paper', path: '/tools/article-smasher/academic-paper/' },
        { name: 'News Article', path: '/tools/article-smasher/news-article/' }
      ]
    },
    {
      name: 'Task Smasher',
      description: 'Turn a single word into a fully organised task list',
      path: '/tools/task-smasher',
      icon: ListChecks,
      color: 'from-purple-500 to-pink-500',
      useCases: [
        { name: 'Marketing Tasks', path: '/tools/task-smasher/marketing-tasks/' },
        { name: 'Daily Organizer', path: '/tools/task-smasher/daily-organizer/' },
        { name: 'Goal Planner', path: '/tools/task-smasher/goal-planner/' },
        { name: 'Recipe Steps', path: '/tools/task-smasher/recipe-steps/' }
      ]
    },
    {
      name: 'Graphics Smasher',
      description: 'Professional-grade, non-destructive image editing with GPU acceleration',
      path: '/tools/graphics-smasher',
      icon: Palette,
      color: 'from-orange-500 to-rose-500',
    },
  ];

  const features = [
    {
      title: 'Smart AI',
      description: 'Built with GPT for rapid results, our tools understand what you need and deliver instantly',
      icon: Brain,
    },
    {
      title: 'Clear Purpose',
      description: 'Each tool does one job extremely well. No confusing options or bloated features',
      icon: Target,
    },
    {
      title: 'Satisfyingly Simple',
      description: 'UX you don\'t have to think about. Intuitive design that just works',
      icon: Sparkles,
    },
    {
      title: 'Centralised AI Management',
      description: 'Configure your AI providers once and use them across all tools',
      icon: Brain,
    },
  ];

  const testimonials = [
    {
      content: "TaskSmasher turned my overwhelming project into a clear plan in seconds. I use it every morning now!",
      author: "Alex K.",
      role: "Freelance Designer",
      avatar: "😎"
    },
    {
      content: "Article Smasher is like having a professional writer on my team. The quality is incredible!",
      author: "Jamie T.",
      role: "Content Creator",
      avatar: "👩‍💻"
    },
    {
      content: "These tools are game-changers for small business owners like me. Simple, fast, and actually useful.",
      author: "Sam P.",
      role: "Startup Founder",
      avatar: "🚀"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-16 sm:py-24">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Smash through tasks with <span className="text-indigo-600">AI-powered simplicity.</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mb-8">
                SmashingApps.ai is your playful productivity toolbox. AI tools that get things done — without the overwhelm.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                {!isConfigured ? (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Get Started - Configure AI
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/tools/article-smasher"
                      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Explore Tools
                    </Link>
                    <Link
                      to="/tools/task-smasher"
                      className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 border border-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Try TaskSmasher Now
                    </Link>
                  </>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 mr-2" />
                  <span>No sign-up required</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 mr-2" />
                  <span>Instant results</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
              <div className="relative mx-auto w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-6 relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full ml-2"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full ml-2"></div>
                    <div className="ml-4 text-gray-700 font-medium">TaskSmasher</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="mt-1.5">
                        <Hammer className="h-5 w-5 text-indigo-600 animate-pulse" />
                      </div>
                      <div className="ml-3 bg-gray-100 rounded-lg p-3 w-full">
                        <p className="text-gray-700 font-medium">Plan marketing campaign</p>
                      </div>
                    </div>

                    <div className="pl-8 space-y-2">
                      <div className="bg-gray-50 rounded-lg p-2 border-l-2 border-indigo-600 animate-pulse">
                        <p className="text-gray-600 text-sm">1. Define target audience</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 border-l-2 border-green-600 animate-pulse" style={{ animationDelay: "0.2s" }}>
                        <p className="text-gray-600 text-sm">2. Set campaign goals</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 border-l-2 border-indigo-600 animate-pulse" style={{ animationDelay: "0.4s" }}>
                        <p className="text-gray-600 text-sm">3. Create content calendar</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-green-500 opacity-30 rounded-full blur-3xl"></div>
                <div className="absolute -top-6 -left-6 w-64 h-64 bg-indigo-600 opacity-30 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {isConfigured && stats.totalRequests > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Total Requests</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalRequests}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Total Tokens</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalTokens.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Total Cost</div>
              <div className="text-3xl font-bold text-gray-900">${stats.totalCost.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Providers</div>
              <div className="text-3xl font-bold text-gray-900">{aiCore.getConfiguredProviders().length}</div>
            </div>
          </div>
        )}

        {/* Tools Section */}
        <section id="tools" className="py-16 bg-white rounded-2xl shadow-sm mb-16">
          <div className="px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Available Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tools.map((tool) => (
                <div key={tool.path} className="group bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all border border-gray-100">
                  <div className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{tool.description}</p>

                  <Link
                    to={tool.path}
                    className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700 mb-4"
                  >
                    Launch Tool
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>

                  {tool.useCases && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Quick start:</p>
                      <div className="flex flex-wrap gap-1">
                        {tool.useCases.slice(0, 4).map((useCase, index) => (
                          <Link
                            key={index}
                            to={useCase.path}
                            className="text-xs bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 px-2 py-1 rounded-full border transition-colors"
                          >
                            {useCase.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="why" className="py-16 bg-gray-50 rounded-2xl mb-16">
          <div className="px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Why <span className="text-indigo-600">Smashing</span><span className="text-green-600">Apps</span>?
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                We're building the toolbox for the AI era — fun, powerful, and designed with humans in mind.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow border-t-4 border-indigo-600">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white mb-4 mx-auto">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 bg-white rounded-2xl shadow-sm mb-16">
          <div className="px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                What People Are <span className="text-green-600">Saying</span>
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of happy users who are smashing through their tasks with our tools.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400" fill="#FCD34D" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-xl mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            {isConfigured
              ? 'Your AI is configured and ready. Choose a tool to begin smashing through your tasks!'
              : 'Configure your AI providers and start using powerful AI tools to boost your productivity.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={isConfigured ? '/tools/article-smasher' : '/admin'}
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isConfigured ? 'Try Article Smasher' : 'Configure AI Now'}
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            {isConfigured && (
              <Link
                to="/tools/task-smasher"
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors"
              >
                Or Try TaskSmasher
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
