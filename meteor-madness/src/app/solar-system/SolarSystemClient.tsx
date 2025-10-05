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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
      
      <div className="max-w-7xl 2xl:max-w-[140rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-6 shadow-lg glow-blue"
          >
            <Globe className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4"
          >
            Solar System 3D
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-base sm:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl text-gray-300 max-w-2xl xl:max-w-4xl 2xl:max-w-5xl mx-auto mb-6 sm:mb-8"
          >
            Explore our solar system with interactive 3D visualization powered by NASA Eyes
          </motion.p>
          
          {/* Info Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex justify-center"
          >
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
            >
              <Info className="w-5 h-5" />
              <span>How to Use</span>
            </button>
          </motion.div>
        </motion.div>
        
        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: showInfo ? 1 : 0, height: showInfo ? 'auto' : 0 }}
          className="max-w-7xl 2xl:max-w-[140rem] mx-auto mb-8 bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 mb-3">Navigation Controls</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>Mouse:</strong> Click and drag to rotate view</li>
                <li>• <strong>Scroll:</strong> Zoom in/out</li>
                <li>• <strong>Right-click:</strong> Pan the view</li>
                <li>• <strong>Double-click:</strong> Focus on object</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Real-time planetary positions</li>
                <li>• Spacecraft trajectories</li>
                <li>• Time controls</li>
                <li>• Educational content</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 mb-3">Mobile Controls</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong>Touch:</strong> Single finger to rotate</li>
                <li>• <strong>Pinch:</strong> Zoom in/out</li>
                <li>• <strong>Two-finger:</strong> Pan the view</li>
                <li>• <strong>Tap:</strong> Focus on object</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 mb-3">Data Source</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• NASA JPL Solar System Dynamics</li>
                <li>• Real-time orbital mechanics</li>
                <li>• Spacecraft telemetry data</li>
                <li>• Updated continuously</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-7xl 2xl:max-w-[140rem] mx-auto"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-cyan-400 text-lg">Loading Solar System...</p>
              </div>
            </div>
          )}

          {/* NASA Eyes on Solar System Embed */}
          <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4">
              <iframe
                src="https://eyes.nasa.gov/apps/solar-system/#/home?rate=0&time=2049-12-30T23%3A59%3A59.999+00%3A00&featured=false&shareButton=false&surfaceMapTiling=true&hd=true&spout=false"
                width="100%"
                height="700"
                frameBorder="0"
                allowFullScreen
                title="NASA Eyes on the Solar System"
                onError={(e) => {
                  console.warn('NASA Eyes iframe failed to load, showing fallback');
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div class="flex items-center justify-center h-full text-gray-400 min-h-[700px]">
                      <div class="text-center">
                        <div class="text-6xl mb-4">🌌</div>
                        <h3 class="text-xl font-semibold mb-2">Solar System 3D Visualization</h3>
                        <p class="mb-4">3D visualization temporarily unavailable</p>
                        <a href="https://eyes.nasa.gov/apps/solar-system/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors">
                          <span>Visit NASA Eyes on Solar System</span>
                          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </a>
                      </div>
                    </div>
                  `;
                }}
                className="w-full h-full rounded-lg shadow-2xl"
                onLoad={() => setIsLoading(false)}
              />
            </div>
          </div>

          {/* Footer Attribution */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
              Powered by NASA API
            </p>
          </div>
        </motion.div>

        {/* Custom Styles */}
        <style jsx>{`
          .glow-orange {
            box-shadow: 0 0 20px rgba(251, 146, 60, 0.3);
          }
        `}</style>
      </div>
  )
}
