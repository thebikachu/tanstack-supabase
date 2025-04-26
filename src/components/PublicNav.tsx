import { Link } from '@tanstack/react-router';
import { Nav } from './Nav';
import { useAuth } from '~/auth/AuthContext';

export function PublicNav() {
  const { user, loading, logout } = useAuth();

  const links = [
    { to: '/', label: 'Home' },
    { label: 'Features', isScroll: true, scrollTo: 'features' },
    { label: 'Pricing', isScroll: true, scrollTo: 'pricing' }
  ];

  const loadingButtons = (
    <>
      <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-gray-100 animate-pulse w-20 h-9" />
      <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md bg-gray-100 animate-pulse w-24 h-9" />
    </>
  );

  const authenticatedButtons = (
    <>
      <Link
        to="/app"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <span className="flex items-center">
          Go to App
          <svg className="ml-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </Link>
      <button
        onClick={logout}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Sign out
      </button>
    </>
  );

  const unauthenticatedButtons = (
    <>
      <Link
        to="/login"
        search={{ redirect: undefined }}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Sign in
      </Link>
      <Link
        to="/register"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Get Started
      </Link>
    </>
  );

  const rightButtons = loading
    ? loadingButtons
    : user
      ? authenticatedButtons 
      : unauthenticatedButtons;

  return (
    <Nav
      links={links}
      rightButtons={rightButtons}
      logo="SaaS Template"
    />
  );
}