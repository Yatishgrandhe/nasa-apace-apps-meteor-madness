'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, ExternalLink, Maximize2, Minimize2, Loader, AlertCircle } from 'lucide-react'

interface NASAEyesIframeProps {
  objectId: string
  objectName: string
  objectType: 'asteroid' | 'comet'
  className?: string
}

export default function NASAEyesIframe({ objectId, objectName, objectType, className = '' }: NASAEyesIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [iframeUrl, setIframeUrl] = useState('')

  useEffect(() => {
    // Generate NASA Eyes URL for the specific object
    const baseUrl = 'https://eyes.nasa.gov/apps/solar-system'
    const objectParam = objectType === 'asteroid' ? 'asteroid' : 'comet'
    
    // NASA Eyes URL structure for specific objects
    const url = `${baseUrl}?object=${objectParam}&id=${objectId}`
    
    setIframeUrl(url)
    setIsLoading(true)
    setHasError(false)
  }, [objectId, objectName, objectType])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const openInNewTab = () => {
    window.open(iframeUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl shadow-lg glow-blue ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-cyan-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">NASA Eyes on the Solar System</h3>
            <p className="text-gray-400 text-sm">
              {objectType === 'asteroid' ? 'Asteroid' : 'Comet'}: {objectName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* External Link */}
          <button
            onClick={openInNewTab}
            className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
          
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="px-6 py-4 border-b border-cyan-500/20 bg-blue-900/10">
        <div className="flex items-start space-x-3">
          <div className="w-3 h-3 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
          <div className="text-blue-200 text-sm">
            <div className="font-semibold mb-1">Interactive 3D Visualization</div>
            <div>
              This NASA Eyes simulation automatically loads {objectName} in real-time. 
              Use the controls to explore the object's orbit, approach trajectory, and position in the solar system.
            </div>
          </div>
        </div>
      </div>

      {/* Iframe Container */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-b-xl z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-blue-400 text-lg">Loading NASA Eyes visualization...</p>
              <p className="text-gray-400 text-sm mt-2">
                Loading {objectType} {objectName} in 3D solar system
              </p>
            </div>
          </div>
        )}

        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 rounded-b-xl">
            <div className="text-center p-8">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-red-300 mb-2">Failed to Load NASA Eyes</h4>
              <p className="text-gray-300 mb-4">
                Unable to load the NASA Eyes visualization for {objectName}.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setHasError(false)
                    setIsLoading(true)
                    // Force reload
                    if (iframeRef.current) {
                      iframeRef.current.src = iframeUrl
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Retry Loading
                </button>
                <div className="text-center">
                  <button
                    onClick={openInNewTab}
                    className="text-blue-400 hover:text-blue-300 underline text-sm"
                  >
                    Open in new tab instead
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="w-full h-full rounded-b-xl"
            title={`NASA Eyes visualization of ${objectName}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="fullscreen; geolocation"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            style={{
              border: 'none',
              background: '#000'
            }}
          />
        )}

        {/* Loading Overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-gray-900/50 rounded-b-xl flex items-center justify-center">
            <div className="text-center">
              <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-blue-400">Loading NASA Eyes visualization...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls Info */}
      <div className="p-6 bg-gray-900/20">
        <h4 className="text-lg font-semibold text-cyan-400 mb-3">Controls</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <div className="font-semibold text-white mb-2">Mouse Controls:</div>
            <ul className="space-y-1">
              <li>• Left click + drag: Rotate view</li>
              <li>• Right click + drag: Pan view</li>
              <li>• Scroll wheel: Zoom in/out</li>
              <li>• Double click: Focus on object</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white mb-2">Features:</div>
            <ul className="space-y-1">
              <li>• Real-time orbital data</li>
              <li>• Approach trajectory visualization</li>
              <li>• Time controls (play/pause/speed)</li>
              <li>• Multiple viewing angles</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-6 pb-6">
        <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <Globe className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-blue-200 text-sm">
              <div className="font-semibold mb-1">NASA Eyes on the Solar System</div>
              <div>
                This visualization is powered by NASA's Eyes on the Solar System application, 
                providing real-time orbital mechanics and 3D visualization of {objectName}'s 
                trajectory through our solar system.
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
