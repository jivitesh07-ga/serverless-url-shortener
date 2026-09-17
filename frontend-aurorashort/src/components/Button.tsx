import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';
import './Button.css';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = 'secondary',
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-${variant}${className ? ` ${className}` : ''}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <Icon name="spinner" size={16} className="btn-spinner" />
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
}
