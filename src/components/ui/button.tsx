import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'border-2 border-black font-bold uppercase tracking-wide px-4 py-2 transition-all duration-150 rounded-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black';
  
  const variants = {
    primary: 'bg-neo-yellow text-black shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none',
    danger: 'bg-neo-coral text-black shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none',
    ghost: 'bg-white text-black shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none',
  };

  const widthStyle = fullWidth ? 'w-full' : '';
  const disabledStyle = props.disabled ? 'opacity-60 cursor-not-allowed translate-x-0.5 translate-y-0.5 shadow-none' : '';

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${widthStyle} ${disabledStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
