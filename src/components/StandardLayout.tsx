'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Navigation from './Navigation'

interface StandardLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showBackButton?: boolean
  onBackClick?: () => void
}

export default function StandardLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = false, 
  onBackClick 
}: StandardLayoutProps) {
  return (
    <div className="min-h-screen nasa-bg">
      <Navigation />
      
      <div className="max-w-7xl 2xl:max-w-[140rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12 relative z-10">
        {/* Header Section */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            {showBackButton && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                onClick={onBackClick}
                className="inline-flex items-center px-4 py-2 mb-6 text-cyan-400 hover:text-cyan-300 transition-colors duration-200 bg-black/20 backdrop-blur-sm border border-cyan-500/30 rounded-lg hover:bg-black/40"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </motion.button>
            )}
            
            {title && (
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4"
              >
                {title}
              </motion.h1>
            )}
            
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-gray-300 max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto"
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
