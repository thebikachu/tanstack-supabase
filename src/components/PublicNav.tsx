import { Link } from '@tanstack/react-router'

export function PublicNav() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                SaaS Template
              </Link>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                activeProps={{
                  className: 'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-indigo-500 text-gray-900',
                }}
                activeOptions={{ exact: true }}
              >
                Home
              </Link>
              <Link
                to="/#features"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Features
              </Link>
              <Link
                to="/#pricing"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}