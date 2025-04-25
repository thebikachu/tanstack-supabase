import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { PublicNav } from '~/components/PublicNav'
import { Footer } from '~/components/Footer'
import { useCallback } from 'react'

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

export const Route = createFileRoute('/')({
  component: LandingPage
})

function LandingPage() {
  return (
    <div className="flex flex-col">
      <PublicNav />
      {/* Hero Section */}
      <section className="bg-white min-h-[calc(100vh-64px)] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Modern SaaS Template</span>
              <span className="block text-indigo-600">for Your Next Project</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Start building your SaaS application with our production-ready template.
              Built with React, TanStack Router, and modern tools.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <button
                  onClick={() => scrollToSection('features')}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to build your SaaS
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              All the features you need to move fast and focus on what matters.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Authentication Ready</h3>
              <p className="mt-2 text-base text-gray-500">
                Built-in authentication system with Supabase, including login, registration, and password reset.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Modern Stack</h3>
              <p className="mt-2 text-base text-gray-500">
                Built with React, TanStack Router, and TypeScript for a modern development experience.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Responsive Design</h3>
              <p className="mt-2 text-base text-gray-500">
                Beautiful, responsive UI components built with Tailwind CSS and Framer Motion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              No hidden fees. Cancel anytime.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Starter Plan */}
            <div className="bg-white p-8 border rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">Starter</h3>
              <p className="mt-4 text-sm text-gray-500">Perfect for getting started</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$9</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center">
                  <span className="text-green-500">✓</span>
                  <span className="ml-3 text-sm text-gray-700">Up to 1,000 users</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500">✓</span>
                  <span className="ml-3 text-sm text-gray-700">Basic analytics</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500">✓</span>
                  <span className="ml-3 text-sm text-gray-700">24/7 support</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Get started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 border rounded-lg shadow-sm border-indigo-600">
              <h3 className="text-xl font-semibold text-gray-900">Pro</h3>
              <p className="mt-4 text-sm text-gray-500">For growing businesses</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$29</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center">
                  <span className="text-green-500">✓</span>
                  <span className="ml-3 text-sm text-gray-700">Up to 10,000 users</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500">✓</span>
                  <span className="ml-3 text-sm text-gray-700">Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500">✓</span>
                  <span className="ml-3 text-sm text-gray-700">Priority support</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Get started
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 border rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900">Enterprise</h3>
              <p className="mt-4 text-sm text-gray-500">For large organizations</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$99</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center">
                  <span className="text-green-500">✓</span>
                  <span className="ml-3 text-sm text-gray-700">Unlimited users</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500">✓</span>
                  <span className="ml-3 text-sm text-gray-700">Custom analytics</span>
                </li>
                <li className="flex items-center">
                  <span className="text-green-500">✓</span>
                  <span className="ml-3 text-sm text-gray-700">Dedicated support</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>

  )
}
