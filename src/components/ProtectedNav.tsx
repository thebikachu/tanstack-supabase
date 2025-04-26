import { Nav } from './Nav';
import { useAuth } from '~/auth/AuthContext';
import { getCredits } from '~/routes/_authed/-server';
import { useQuery } from '@tanstack/react-query';

export function ProtectedNav() {
  const { logout } = useAuth();

  const links = [
    { to: '/app/dashboard', label: 'Dashboard' },
    { to: '/app/alerts', label: 'Alerts' },
    { to: '/app/settings', label: 'Settings' },
    { to: '/app/billing', label: 'Billing' }
  ];

  const { data: creditsData, isLoading, error } = useQuery({
    queryKey: ['credits'],
    queryFn: () => getCredits(),
  });

  const rightButtons = (
    <div className="flex items-center space-x-4">
      <div className="px-3 py-2 bg-gray-100 rounded-md">
        <span className="text-sm font-medium text-gray-700">
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </div>
          ) : error ? (
            <div className="text-red-600">Error loading credits</div>
          ) : (
            `Credits: ${creditsData?.credits || 0}`
          )}
        </span>
      </div>
      <button
        onClick={logout}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Sign out
      </button>
    </div>
  );

  return (
    <Nav
      isProtected={true}
      links={links}
      rightButtons={rightButtons}
      logo="Dashboard"
    />
  );
}