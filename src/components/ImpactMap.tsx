'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, AlertTriangle, Maximize2, Minimize2, Target, Info } from 'lucide-react'
import { predictAsteroidImpact, generateImpactScenarios, type AsteroidData, type ImpactPrediction } from '@/lib/utils/impactCalculator'

interface ImpactMapProps {
  asteroid: AsteroidData
  className?: string
}

export default function ImpactMap({ asteroid, className = '' }: ImpactMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [impactPrediction, setImpactPrediction] = useState<ImpactPrediction | null>(null)
  const [scenarios, setScenarios] = useState<ImpactPrediction[]>([])
  const [selectedScenario, setSelectedScenario] = useState<'nominal' | 'worst_case' | 'best_case'>('nominal')

  useEffect(() => {
    // Calculate impact predictions
    const prediction = predictAsteroidImpact(asteroid)
    const allScenarios = generateImpactScenarios(asteroid)
    
    setImpactPrediction(prediction)
    setScenarios(allScenarios)
  }, [asteroid])

  useEffect(() => {
    if (!mapRef.current || !impactPrediction) return

    const tomtomApiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY
    
    if (!tomtomApiKey || tomtomApiKey === 'your_tomtom_api_key_here') {
      console.warn('TomTom API key not found. Using placeholder map.')
      setMapLoaded(true)
      return
    }

    // Load TomTom Maps API
    const script = document.createElement('script')
    script.src = `https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.24.0/maps-web.min.js`
    script.async = true
    script.onload = () => {
      if (window.tt) {
        initializeMap()
      }
    }
    document.head.appendChild(script)

    // Load TomTom CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.24.0/maps.css'
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(script)
      document.head.removeChild(link)
    }
  }, [impactPrediction])

  const initializeMap = () => {
    if (!mapRef.current || !window.tt || !impactPrediction) return

    const tomtomApiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY

    try {
      // Initialize TomTom map
      const map = new window.tt.Map({
        key: tomtomApiKey,
        container: mapRef.current,
        center: [impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude],
        zoom: 6,
        style: 'dark',
        interactive: true
      })

      map.on('load', () => {
        setMapLoaded(true)

        // Add impact prediction marker
        const impactMarker = new window.tt.Marker({
          color: '#ff4444',
          scale: 1.5
        })
          .setLngLat([impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude])
          .addTo(map)

        // Add impact zone circle
        const impactZone = new window.tt.Circle({
          color: '#ff4444',
          opacity: 0.3,
          strokeColor: '#ff4444',
          strokeOpacity: 0.8,
          strokeWidth: 2
        })
          .setLngLat([impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude])
          .setRadius(impactPrediction.affectedRadius * 1000) // Convert km to meters
          .addTo(map)

        // Add crater size circle (inner)
        const craterZone = new window.tt.Circle({
          color: '#ff6666',
          opacity: 0.6,
          strokeColor: '#ff6666',
          strokeOpacity: 1,
          strokeWidth: 3
        })
          .setLngLat([impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude])
          .setRadius(impactPrediction.craterSize.diameter / 2) // meters
          .addTo(map)

        // Add popup with impact details
        const popup = new window.tt.Popup({ offset: 25, closeButton: true })
          .setHTML(`
            <div class="p-4 bg-black/90 text-white rounded-lg border border-red-500/30">
              <div class="flex items-center space-x-2 mb-3">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <h3 class="text-lg font-bold text-red-400">Predicted Impact Zone</h3>
              </div>
              <div class="space-y-2 text-sm">
                <div><strong>Location:</strong> ${impactPrediction.impactLocation.latitude.toFixed(4)}°, ${impactPrediction.impactLocation.longitude.toFixed(4)}°</div>
                <div><strong>Country:</strong> ${impactPrediction.impactLocation.country || 'Unknown'}</div>
                <div><strong>Probability:</strong> ${(impactPrediction.impactProbability * 100).toFixed(3)}%</div>
                <div><strong>Energy:</strong> ${impactPrediction.impactEnergy.toFixed(2)} MT TNT</div>
                <div><strong>Crater Size:</strong> ${impactPrediction.craterSize.diameter.toFixed(0)}m diameter</div>
                <div><strong>Affected Radius:</strong> ${impactPrediction.affectedRadius.toFixed(1)} km</div>
                <div><strong>Confidence:</strong> ${impactPrediction.confidence.toFixed(1)}%</div>
              </div>
            </div>
          `)

        impactMarker.setPopup(popup)

        // Store map reference for fullscreen functionality
        ;(mapRef.current as any).tomtomMap = map
      })

    } catch (error) {
      console.error('Error initializing TomTom map:', error)
      setMapLoaded(true) // Still show the component even if map fails
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const currentScenario = scenarios.find(s => s.scenario === selectedScenario) || impactPrediction

  if (!impactPrediction) {
    return (
      <div className={`bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Calculating impact prediction...</p>
        </div>
      </div>
    )
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
          <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Impact Prediction Map</h3>
            <p className="text-gray-400 text-sm">Asteroid: {asteroid.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Scenario Selector */}
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value as any)}
            className="bg-black/50 border border-cyan-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
          >
            <option value="nominal">Nominal</option>
            <option value="worst_case">Worst Case</option>
            <option value="best_case">Best Case</option>
          </select>
          
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

      {/* Impact Statistics */}
      <div className="p-6 border-b border-cyan-500/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {(currentScenario.impactProbability * 100).toFixed(3)}%
            </div>
            <div className="text-sm text-gray-400">Impact Probability</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {currentScenario.impactEnergy.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Energy (MT TNT)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {currentScenario.craterSize.diameter.toFixed(0)}m
            </div>
            <div className="text-sm text-gray-400">Crater Diameter</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {currentScenario.confidence.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">Confidence</div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className={`relative ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'}`}>
        <div
          ref={mapRef}
          className="w-full h-full rounded-b-xl"
          style={{ minHeight: '300px' }}
        />
        
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-b-xl">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-cyan-400">Loading Impact Map...</p>
              {(!process.env.NEXT_PUBLIC_TOMTOM_API_KEY || process.env.NEXT_PUBLIC_TOMTOM_API_KEY === 'your_tomtom_api_key_here') && (
                <p className="text-yellow-400 text-sm mt-2">TomTom API key required for map display</p>
              )}
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 text-white text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Predicted Impact Point</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-600 rounded-full border border-red-500"></div>
              <span>Crater Zone ({currentScenario.craterSize.diameter.toFixed(0)}m)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500/30 rounded-full border border-red-500"></div>
              <span>Affected Area ({currentScenario.affectedRadius.toFixed(1)}km)</span>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        {currentScenario.impactProbability > 0.01 && (
          <div className="absolute top-4 right-4 bg-red-900/80 backdrop-blur-sm border border-red-500/50 rounded-lg p-3 text-red-200 text-sm max-w-xs">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-red-300">High Impact Risk</div>
                <div className="text-xs mt-1">
                  This asteroid has a significant impact probability. Monitor closely for orbital updates.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Impact Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Impact Location</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Coordinates:</span>
                <span className="text-white">
                  {currentScenario.impactLocation.latitude.toFixed(4)}°, {currentScenario.impactLocation.longitude.toFixed(4)}°
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Country:</span>
                <span className="text-white">{currentScenario.impactLocation.country || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Region:</span>
                <span className="text-white">{currentScenario.impactLocation.region || 'Unknown'}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span>Impact Effects</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Energy Release:</span>
                <span className="text-white">{currentScenario.impactEnergy.toFixed(2)} MT TNT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Crater Depth:</span>
                <span className="text-white">{currentScenario.craterSize.depth.toFixed(0)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Blast Radius:</span>
                <span className="text-white">{currentScenario.affectedRadius.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Scenario:</span>
                <span className="text-white capitalize">{selectedScenario.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-yellow-200 text-sm">
              <div className="font-semibold mb-1">Disclaimer:</div>
              <div>
                This impact prediction is based on simplified orbital mechanics and current observational data. 
                Actual impact probabilities are subject to significant uncertainty. This tool is for educational 
                and research purposes only. Always refer to official NASA JPL predictions for authoritative impact assessments.
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Extend window interface for TomTom
declare global {
  interface Window {
    tt: any
  }
}
