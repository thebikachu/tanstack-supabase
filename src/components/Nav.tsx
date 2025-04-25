import { Link, useLocation, useNavigate, useRouter } from '@tanstack/react-router';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HamburgerMenu } from './ui/hamburger-menu';
import { useMutation } from '~/hooks/useMutation';
import { useToast } from '~/hooks/use-toast';
import { logoutFn } from '~/routes/_authed/-server';

// Animation variants
const menuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  open: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const mobileLinkVariants = {
  closed: { opacity: 0, x: -10 },
  open: { opacity: 1, x: 0 },
};

interface NavLink {
  to?: string;
  label: string;
  onClick?: () => void;
  isScroll?: boolean;
  scrollTo?: string;
}

interface NavProps {
  isProtected?: boolean;
  links: NavLink[];
  logo?: string;
  rightButtons?: React.ReactNode;
}

export function Nav({ isProtected = false, links, logo = "SaaS Template", rightButtons }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const router = useRouter();
  const navigate = useNavigate();
  const { toast } = useToast();
  const navRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const navHeight = navRef.current?.offsetHeight || 0;
    
    // Get the section's padding
    const sectionStyles = window.getComputedStyle(element);
    const paddingTop = parseInt(sectionStyles.paddingTop, 10);
    
    // Calculate position including the section's top padding
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
    const targetPosition = elementTop - navHeight - 48; // Increased offset for better spacing

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle scroll on hash change or initial load
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      scrollToSection(id);
    }
  }, [location.hash, scrollToSection]);

  const handleLinkClick = useCallback((link: NavLink, e?: React.MouseEvent) => {
    if (link.isScroll && link.scrollTo) {
      // Prevent default hash behavior
      e?.preventDefault();
      // Update URL hash without navigating
      window.history.pushState(null, '', `#${link.scrollTo}`);
      scrollToSection(link.scrollTo);
    }
    if (link.onClick) {
      link.onClick();
    }
    setIsOpen(false);
  }, [scrollToSection]);

  // Handle smooth scrolling for hash changes
  useEffect(() => {
    const handleHashChange = (e: HashChangeEvent) => {
      if (location.hash) {
        e.preventDefault();
        const id = location.hash.replace('#', '');
        scrollToSection(id);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [location.hash, scrollToSection]);

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <nav ref={navRef} className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Side: Logo and Desktop Links */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                {logo}
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {links.map((link, index) => (
                link.to ? (
                  <Link
                    key={index}
                    to={link.to}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                    activeProps={{
                      className: 'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-indigo-500 text-gray-900',
                    }}
                    onClick={(e) => handleLinkClick(link, e)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={index}
                    onClick={(e) => handleLinkClick(link, e)}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {link.label}
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center">
            {/* Desktop Right Buttons */}
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              {rightButtons}
            </div>

            {/* Mobile menu button */}
            <div className="ml-4 flex items-center md:hidden">
              <HamburgerMenu
                isOpen={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-md p-0.5"
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
              className="md:hidden absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            {/* Primary Links */}
            <motion.div
              className="pt-2 pb-3 space-y-1 px-2"
              variants={{
                open: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
                closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
              }}
            >
              {links.map((link, index) => (
                <motion.div key={index} variants={mobileLinkVariants}>
                  {link.to ? (
                    <Link
                      to={link.to}
                      className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      activeProps={{
                        className: 'block pl-3 pr-4 py-2 text-base font-medium text-indigo-700 bg-indigo-50 border-l-4 border-indigo-500',
                      }}
                      onClick={(e) => handleLinkClick(link, e)}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      onClick={(e) => handleLinkClick(link, e)}
                      className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    >
                      {link.label}
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Mobile Right Buttons */}
            <motion.div
              className="pt-4 pb-3 border-t border-gray-200"
              variants={{
                open: { opacity: 1, transition: { delay: 0.2 } },
                closed: { opacity: 0 }
              }}
            >
              <div className="px-4 py-2 flex items-center justify-center space-x-4">
                {rightButtons}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
    </>
  );
}