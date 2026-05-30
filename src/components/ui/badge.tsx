import React from 'react';

type BadgeStatus = 'UP' | 'DOWN' | 'DEGRADED' | 'HEALTHY' | 'MISSED' | 'WAITING' | 'UNKNOWN';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
  variant?: 'yellow' | 'coral' | 'cyan' | 'green' | 'white';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  status,
  variant,
  className = '',
  ...props
}) => {
  const getColors = () => {
    if (variant) {
      const variantColors = {
        yellow: 'bg-neo-yellow text-black',
        coral: 'bg-neo-coral text-black',
        cyan: 'bg-neo-cyan text-black',
        green: 'bg-neo-green text-black',
        white: 'bg-white text-black',
      };
      return variantColors[variant];
    }

    if (status) {
      switch (status) {
        case 'UP':
        case 'HEALTHY':
          return 'bg-neo-green text-black';
        case 'DOWN':
        case 'MISSED':
          return 'bg-neo-coral text-black';
        case 'DEGRADED':
          return 'bg-neo-yellow text-black';
        case 'WAITING':
        case 'UNKNOWN':
        default:
          return 'bg-neo-cyan text-black';
      }
    }

    return 'bg-white text-black';
  };

  return (
    <span
      className={`${getColors()} border border-black font-bold uppercase text-xs px-2 py-0.5 inline-block rounded-none font-mono ${className}`}
      {...props}
    >
      {children || status || 'UNKNOWN'}
    </span>
  );
};
