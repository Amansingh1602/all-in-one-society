import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export function Loading({ small }) {
  return (
    <div className={`flex justify-center items-center ${small ? 'p-2' : 'p-8'}`}>
      <div className="animate-spin rounded-full border-t-2 border-b-2 border-blue-500 dark:border-blue-400 h-6 w-6"></div>
    </div>
  )
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-blue-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}

export function Button({ children, loading, variant = 'primary', size = 'md', as: Component = 'button', ...props }) {
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm',
    success: 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 shadow-sm',
    secondary: 'bg-white border border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 shadow-sm'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <Component 
      {...props} 
      disabled={loading}
      className={`${styles[variant]} ${sizes[size]} rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${props.className || ''}`}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          <span>Loading...</span>
        </div>
      ) : children}
    </Component>
  )
}

export function Input({ label, error, icon, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`
            block w-full rounded-md 
            ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2
            ${error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:text-red-100 dark:placeholder-red-400 dark:focus:ring-red-400 dark:focus:border-red-400'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:focus:ring-blue-400 dark:focus:border-blue-400'
            }
            ${props.disabled 
              ? 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400' 
              : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
            }
            shadow-sm
            transition-colors
            ${props.className || ''}
          `}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-300 dark:border-gray-600 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
