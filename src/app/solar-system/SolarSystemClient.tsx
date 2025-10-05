'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, Zap, Info, ExternalLink as ExternalLinkIcon } from 'lucide-react'
import StandardLayout from '@/components/StandardLayout'

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
    <StandardLayout
      title="Solar System 3D"
      subtitle="Explore our solar system with interactive 3D visualization powered by NASA Eyes"
    >
      {/* Info Toggle */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
        >
          <Info className="w-5 h-5" />
          <span>How to Use</span>
        </button>
      </div>
        
      {/* Info Panel */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: showInfo ? 1 : 0, height: showInfo ? 'auto' : 0 }}
        className="mb-8 bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6"
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

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
          {/* Loading State */}
          {isLoading && (
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-2 sm:p-4 lg:p-6">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/12] lg:aspect-[16/10] xl:aspect-[21/12] 2xl:aspect-[24/10] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-cyan-400 text-sm sm:text-base lg:text-lg">Loading Solar System...</p>
                </div>
              </div>
            </div>
          )}

          {/* NASA Eyes on Solar System Embed */}
          <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-2 sm:p-4 lg:p-6">
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/12] lg:aspect-[16/10] xl:aspect-[21/12] 2xl:aspect-[24/10]">
                <iframe
                  src="https://eyes.nasa.gov/apps/solar-system/#/home?rate=0&time=2049-12-30T23%3A59%3A59.999+00%3A00&featured=false&shareButton=false&surfaceMapTiling=true&hd=true&spout=false"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  title="NASA Eyes on the Solar System"
                  onError={(e) => {
                    console.warn('NASA Eyes iframe failed to load, showing fallback');
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="flex items-center justify-center h-full text-gray-400 min-h-[600px] sm:min-h-[700px] lg:min-h-[800px] xl:min-h-[900px] 2xl:min-h-[1000px]">
                        <div class="text-center p-4">
                          <div class="text-4xl sm:text-5xl lg:text-6xl mb-4">🌌</div>
                          <h3 class="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">Solar System 3D Visualization</h3>
                          <p class="text-sm sm:text-base mb-4">3D visualization temporarily unavailable</p>
                          <a href="https://eyes.nasa.gov/apps/solar-system/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors text-sm sm:text-base">
                            <span>Visit NASA Eyes on Solar System</span>
                            <svg class="w-3 h-3 sm:w-4 sm:h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                          </a>
                        </div>
                      </div>
                    `;
                  }}
                  className="absolute inset-0 w-full h-full rounded-lg shadow-2xl"
                  onLoad={() => setIsLoading(false)}
                />
              </div>
            </div>
          </div>

        {/* Footer Attribution */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-400 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
            Powered by NASA API
          </p>
        </div>
      </motion.div>
    </StandardLayout>
  )
}
