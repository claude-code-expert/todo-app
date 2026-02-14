'use client';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  onClick,
  children,
}: ButtonProps) {
  const className = `btn btn-${variant} btn-${size}`;

  return (
    <button
      className={className}
      disabled={isLoading}
      onClick={isLoading ? undefined : onClick}
    >
      {isLoading ? '처리중...' : children}
    </button>
  );
}
