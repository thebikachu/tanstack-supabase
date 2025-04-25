import { Nav } from './Nav';
import { useMutation } from '~/hooks/useMutation';
import { useToast } from '~/hooks/use-toast';
import { logoutFn } from '~/routes/_authed/-server';
import { useRouter } from '@tanstack/react-router';

export function ProtectedNav() {
  const router = useRouter();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    fn: logoutFn,
    onSuccess: async ({ data: response }) => {
      if (!response.error) {
        toast({
          title: "Success",
          description: "Successfully logged out",
          variant: "default",
        });
        await router.invalidate();
        router.navigate({
          to: '/login',
          search: { redirect: undefined },
          replace: true
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to logout",
          variant: "destructive",
        });
      }
    }
  });

  const links = [
    { to: '/app/dashboard', label: 'Dashboard' },
    { to: '/app/alerts', label: 'Alerts' },
    { to: '/app/settings', label: 'Settings' },
    { to: '/app/billing', label: 'Billing' }
  ];

  const rightButtons = (
    <button
      onClick={() => logoutMutation.mutate({})}
      disabled={logoutMutation.status === 'pending'}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {logoutMutation.status === 'pending' ? 'Signing out...' : 'Sign out'}
    </button>
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