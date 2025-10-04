'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Menu, X } from 'lucide-react'

interface NavigationProps {}

export default function Navigation({}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="relative z-50 bg-black/20 backdrop-blur-sm border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center glow-blue">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-cyan-400">
              Meteor Madness
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/dashboard" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
              Dashboard
            </a>
            <a href="/missions" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
              Missions
            </a>
            <a href="/neo" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium">
              Near Earth Objects
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-cyan-400 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            <div className="px-4 py-2 space-y-2">
              <a href="/dashboard" className="block text-gray-300 hover:text-cyan-400 py-2 transition-colors font-medium">
                Dashboard
              </a>
              <a href="/missions" className="block text-gray-300 hover:text-cyan-400 py-2 transition-colors font-medium">
                Missions
              </a>
              <a href="/neo" className="block text-gray-300 hover:text-cyan-400 py-2 transition-colors font-medium">
                Near Earth Objects
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}
