'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, Zap, Info, ExternalLink as ExternalLinkIcon } from 'lucide-react'

interface SolarSystemClientProps {
  // Empty interface for future props
}

export default function SolarSystemClient({}: SolarSystemClientProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    // Simulate loading time for the iframe
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 relative overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
      
      {/* Compact Header */}
      <div className="relative z-10 pt-4 pb-2 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center glow-orange">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Solar System 3D
            </h1>
          </div>
          
          {/* Info Toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">How to Use</span>
          </button>
        </motion.div>
        
        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: showInfo ? 1 : 0, height: showInfo ? 'auto' : 0 }}
          className="max-w-4xl mx-auto mt-4 bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4"
        >
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 mb-2">Navigation Controls</h3>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• <strong>Mouse:</strong> Click and drag to rotate view</li>
                <li>• <strong>Scroll:</strong> Zoom in/out</li>
                <li>• <strong>Right-click:</strong> Pan the view</li>
                <li>• <strong>Double-click:</strong> Focus on object</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 mb-2">Features</h3>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• Real-time planetary positions</li>
                <li>• Spacecraft trajectories</li>
                <li>• Time controls</li>
                <li>• Educational content</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content - Full Screen */}
      <div className="relative z-10 flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-cyan-400 text-lg">Loading Solar System...</p>
              </div>
            </div>
          )}

          {/* NASA Eyes on Solar System Embed - Full Screen */}
          <div className={`flex-1 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <iframe
              src="https://eyes.nasa.gov/apps/solar-system/"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              title="NASA Eyes on the Solar System"
              className="w-full h-full rounded-lg shadow-2xl border border-cyan-500/30"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </motion.div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glow-orange {
          box-shadow: 0 0 20px rgba(251, 146, 60, 0.3);
        }
      `}</style>
    </div>
  )
}
