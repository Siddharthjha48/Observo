import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border-2 border-black shadow-neo-md p-6 rounded-none transition-all duration-150 ${
        hoverEffect ? 'hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
