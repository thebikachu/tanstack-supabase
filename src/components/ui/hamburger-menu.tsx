import { motion } from 'framer-motion';
import { cn } from '~/lib/utils'; // Assuming this utility exists for class names

interface HamburgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Hamburger Menu component animated using Framer Motion,
 * based on the visual style and animation of "ham8".
 */
export function HamburgerMenu({ isOpen, onClick, className }: HamburgerMenuProps) {
  const transition = { duration: 0.4 }; // Consistent transition duration

  return (
    <motion.svg
      className={cn('cursor-pointer select-none w-10 h-10', className)}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      onClick={onClick}
      initial={false} // Don't animate on initial load
      animate={isOpen ? 'active' : 'inactive'}
      variants={{
        inactive: { rotate: 0 },
        active: { rotate: 45 }, // Overall rotation for the 'X' shape, matching .hamRotate.active
      }}
      transition={transition}
      style={{
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none', // Standard vendor prefixes for user-select might be needed depending on target browsers
        // MozUserSelect: 'none', // Example for Firefox if needed
        // msUserSelect: 'none', // Example for IE/Edge if needed
      }}
    >
      {/* Top line */}
      <motion.path
        className="line top"
        fill="none"
        stroke="currentColor"
        strokeWidth="5.5" // Matches CSS
        strokeLinecap="round" // Matches CSS
        // ham8 path data for the top line
        d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20"
        variants={{
          // Matches .ham8 .top { stroke-dasharray: 40 160; }
          inactive: { strokeDasharray: '40 160', strokeDashoffset: 0 },
          // Matches .ham8.active .top { stroke-dashoffset: -64px; }
          active: { strokeDasharray: '40 160', strokeDashoffset: -64 },
        }}
        transition={transition}
      />
      {/* Middle line */}
      <motion.path
        className="line middle"
        fill="none"
        stroke="currentColor"
        strokeWidth="5.5" // Matches CSS
        strokeLinecap="round" // Matches CSS
        // ham8 path data for the middle line
        d="m 30,50 h 40"
        variants={{
          // Matches .ham8 .middle { stroke-dasharray: 40 142; }
          inactive: {
            strokeDasharray: '40 142',
            rotate: 0, // Initial state: no rotation
          },
          // Matches .ham8.active .middle { transform: rotate(90deg); }
          active: {
            strokeDasharray: '40 142',
            rotate: 90, // Rotates 90 degrees
          },
        }}
        transition={transition} // Uses the same duration
        style={{
          transformOrigin: '50% 50%', // Ensure rotation is centered, matches CSS transform-origin
        }}
      />
      {/* Bottom line */}
      <motion.path
        className="line bottom"
        fill="none"
        stroke="currentColor"
        strokeWidth="5.5" // Matches CSS
        strokeLinecap="round" // Matches CSS
        // ham8 path data for the bottom line
        d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20"
        variants={{
          // Matches .ham8 .bottom { stroke-dasharray: 40 85; }
          inactive: { strokeDasharray: '40 85', strokeDashoffset: 0 },
          // Matches .ham8.active .bottom { stroke-dashoffset: -64px; }
          active: { strokeDasharray: '40 85', strokeDashoffset: -64 },
        }}
        transition={transition} // Uses the same duration
        style={{
            transformOrigin: '50% 50%', // Matches CSS transform-origin
          }}
      />
    </motion.svg>
  );
}