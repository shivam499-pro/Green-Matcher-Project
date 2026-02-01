import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Green Matchers - Landing Page
 * Simple, clean landing page with proper sizing and clean colors.
 */
const Landing = () => {
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Matching',
      description: 'AI-powered, skill-based job matching introduction'
    },
    {
      icon: '🌍',
      title: 'Green Jobs Focus',
      description: 'SDG-aligned job opportunities for sustainable careers'
    },
    {
      icon: '🎯',
      title: 'Skill-Based',
      description: 'Find careers based on your skills, not just keywords'
    },
    {
      icon: '🌱',
      title: 'SDG Aligned',
      description: 'All jobs tagged with UN Sustainable Development Goals'
    },
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'Career demand, skill popularity, and salary insights'
    },
    {
      icon: '🚀',
      title: 'Fast & Simple',
      description: 'Quick job search and application process'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Find Your Dream</span>
                  <span className="block text-emerald-600 xl:inline">Green Job</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  India's first AI-native green jobs platform. Discover sustainable career opportunities powered by semantic intelligence.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-lg md:px-10"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/jobs"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 md:py-4 md:text-lg md:px-10"
                    >
                      Browse Jobs
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <p className="text-base text-gray-500 font-semibold tracking-wide uppercase sm:text-lg lg:text-sm">
              Why Choose Green Matchers?
            </p>
            <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 lg:text-5xl">
              Everything you need to build a sustainable career
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-xl text-gray-500">
              Our AI-powered platform helps you find the perfect green job based on your skills, not just keywords.
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-emerald-500 text-white">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-600">
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to start your green career?
          </h2>
          <p className="mt-4 text-lg leading-6 text-emerald-100">
            Join thousands of job seekers finding sustainable opportunities in India's growing green economy.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="rounded-md shadow">
              <Link
                to="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50 md:py-4 md:text-lg md:px-10"
              >
                Sign Up Free
              </Link>
            </div>
            <div className="rounded-md shadow">
              <Link
                to="/careers"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-700 hover:bg-emerald-800 md:py-4 md:text-lg md:px-10"
              >
                Explore Careers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
