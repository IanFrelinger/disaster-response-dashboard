import React from 'react'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  className = ''
}) => {
  const baseClasses = 'badge'
  
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info'
  }
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ')
  
  return (
    <span className={classes}>
      {children}
    </span>
  )
}
