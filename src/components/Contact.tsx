import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section id="contact-page" className="py-16 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Get in <span className="text-secondary">Touch</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about our AI tools? Want to provide feedback? We'd love to hear from you!
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-primary mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Email</h4>
                  <p className="text-gray-600">contact@smashingapps.ai</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-primary mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Phone</h4>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-primary mt-1 mr-4" />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Address</h4>
                  <p className="text-gray-600">
                    123 AI Innovation Street<br />
                    Tech Valley, CA 94043<br />
                    United States
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h3>
            
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
                className="btn-primary py-2 px-6 rounded-md"
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