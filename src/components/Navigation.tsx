'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Menu, X } from 'lucide-react'

interface NavigationProps {
  // Empty interface for future props
}

export default function Navigation({}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="relative z-50 bg-black/20 backdrop-blur-sm border-b border-cyan-500/20">
      <div className="max-w-7xl 2xl:max-w-[140rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex justify-between items-center py-3 sm:py-4 lg:py-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 sm:space-x-3"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center glow-blue">
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-cyan-400">
              Meteor Madness
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8 2xl:space-x-10">
            <a href="/dashboard" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium text-sm lg:text-base xl:text-lg 2xl:text-xl">
              Dashboard
            </a>
            <a href="/neo" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium text-sm lg:text-base xl:text-lg 2xl:text-xl">
              Near Earth Objects
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-cyan-500/10"
            >
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg mt-2 shadow-lg"
          >
            <div className="px-4 py-2 space-y-1">
              <a 
                href="/dashboard" 
                className="block text-gray-300 hover:text-cyan-400 py-3 px-2 transition-colors font-medium text-base rounded-lg hover:bg-cyan-500/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </a>
              <a 
                href="/neo" 
                className="block text-gray-300 hover:text-cyan-400 py-3 px-2 transition-colors font-medium text-base rounded-lg hover:bg-cyan-500/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Near Earth Objects
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
