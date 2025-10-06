import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import StructuredData from './StructuredData';
import SEO from './SEO';

const Contact: React.FC = () => {
  return (
    <section id="contact-page" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <SEO overrides={{
        title: 'Contact Us | SmashingApps.ai',
        description: 'Get in touch with the SmashingApps.ai team. We\'d love to hear from you!'
      }} />
      
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          'name': 'Contact SmashingApps.ai',
          'url': 'https://smashingapps.ai/contact',
          'description': 'Contact information for SmashingApps.ai',
          'mainEntity': {
            '@type': 'Organization',
            'name': 'Opace Ltd',
            'url': 'https://opace.digital',
            'logo': 'https://smashingapps.ai/smashingapps-ai-small.png',
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': 'Level 1, The Mailbox, Spaces, 3 Wharfside Street',
              'addressLocality': 'Birmingham',
              'postalCode': 'B1 1RD',
              'addressCountry': 'UK'
            },
            'email': 'hello@opace.digital'
          }
        }}
      />
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Get in Touch with the <span className="text-indigo-600">SmashingApps</span> Team
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help with questions, feedback, or partnership ideas. SmashingApps.ai is proudly built and operated by Opace Ltd — a creative team based in Birmingham, UK.
          </p>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-2">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-indigo-500 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Address</h4>
                  <p className="text-gray-600">
                    Opace Ltd<br />
                    Level 1, The Mailbox, Spaces<br />
                    3 Wharfside Street, Birmingham<br />
                    B1 1RD, United Kingdom
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-indigo-500 mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Email</h4>
                  <p className="text-gray-600">
                    <a href="mailto:hello@opace.digital" className="hover:text-indigo-600 transition-colors">
                      hello@opace.digital
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 text-indigo-500 mt-1 mr-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path>
                    <path d="M12 8v4l3 3"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Website</h4>
                  <p className="text-gray-600">
                    <a href="https://opace.digital" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                      opace.digital
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h3>
            <p className="text-gray-600 mb-6">Got a burning idea or need help smashing a task? Drop us a line — we'll get back faster than a tabby on a Zoom call.</p>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="What is this regarding?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;