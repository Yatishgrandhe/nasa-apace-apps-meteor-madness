'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, ExternalLink, RefreshCw } from 'lucide-react'

interface Object3DViewerProps {
  objectId: string
  objectName: string
  objectType: 'asteroid' | 'comet'
  className?: string
}

export default function Object3DViewer({ 
  objectId, 
  objectName, 
  objectType, 
  className = "" 
}: Object3DViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleIframeLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const refreshViewer = () => {
    setIsLoading(true)
    setHasError(false)
    // Force iframe reload by changing src slightly
    const iframe = document.getElementById(`3d-viewer-${objectId}`) as HTMLIFrameElement
    if (iframe) {
      const currentSrc = iframe.src
      iframe.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 't=' + Date.now()
    }
  }

  return (
    <div className={`bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-cyan-400 flex items-center space-x-2">
          <Globe className="w-5 h-5" />
          <span>3D Object Visualization</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshViewer}
            className="p-2 text-gray-400 hover:text-cyan-400 transition-colors duration-200 bg-black/20 rounded-lg hover:bg-black/40"
            title="Refresh 3D viewer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={`https://eyes.nasa.gov/apps/solar-system/#/asteroid/${objectId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-cyan-400 transition-colors duration-200 bg-black/20 rounded-lg hover:bg-black/40"
            title="Open in NASA Eyes"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
      
      <div className="h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-cyan-400 text-sm">Loading 3D visualization...</p>
            </div>
          </div>
        )}
        
        {hasError ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-4">🌌</div>
              <p className="text-lg mb-2">3D visualization temporarily unavailable</p>
              <p className="text-sm mb-4">The NASA Eyes viewer may be experiencing issues</p>
              <div className="space-y-2">
                <button
                  onClick={refreshViewer}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-200 text-sm"
                >
                  Try Again
                </button>
                <div className="text-xs">
                  <a 
                    href={`https://eyes.nasa.gov/apps/solar-system/#/asteroid/${objectId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    Open directly in NASA Eyes
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            id={`3d-viewer-${objectId}`}
            src={`https://eyes.nasa.gov/apps/solar-system/#/asteroid/${objectId}?rate=0&shareButton=false&surfaceMapTiling=true&hd=true&spout=false`}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            title={`NASA Eyes 3D Visualization - ${objectName}`}
            className="w-full h-full"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-400 text-center">
        Powered by NASA Eyes on the Solar System • 
        <span className="ml-1 capitalize">{objectType}</span> ID: {objectId}
      </div>
    </div>
  )
}
