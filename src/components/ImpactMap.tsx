'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, AlertTriangle, Maximize2, Minimize2, Target, Info, Zap, Shield, Plus, Minus } from 'lucide-react'
import { predictAsteroidImpact, generateImpactScenarios, type AsteroidData, type ImpactPrediction } from '@/lib/utils/impactCalculator'

// Import MapLibre GL JS
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

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
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null)

  useEffect(() => {
    console.log('ImpactMap received asteroid data:', asteroid)
    // Calculate impact predictions
    const prediction = predictAsteroidImpact(asteroid)
    const allScenarios = generateImpactScenarios(asteroid)
    
    console.log('Impact prediction result:', prediction)
    console.log('All scenarios:', allScenarios)
    
    setImpactPrediction(prediction)
    setScenarios(allScenarios)
  }, [asteroid])

  useEffect(() => {
    if (!mapRef.current || !impactPrediction) {
      setMapLoaded(true)
      return
    }

    const tomtomApiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY
    
    // Use OpenStreetMap style for reliable rendering without API key issues
    const mapStyle = tomtomApiKey && tomtomApiKey !== 'your_actual_tomtom_api_key_here' 
      ? `https://api.tomtom.com/map/1/style/basic/main.json?key=${tomtomApiKey}`
      : {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }
          ]
        }

    try {
      // Initialize MapLibre GL JS
      const map = new maplibregl.Map({
        container: mapRef.current,
        style: mapStyle,
        center: [impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude],
        zoom: 8,
        pitch: 0,
        bearing: 0
      })

      map.on('load', () => {
        setMapLoaded(true)

        // Add impact prediction marker
        new maplibregl.Marker({
          color: '#ff4444',
          scale: 1.5
        })
          .setLngLat([impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude])
          .addTo(map)

        // Add impact zone circle using GeoJSON
        const impactZoneGeoJSON = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude]
            },
            properties: {
              radius: impactPrediction.affectedRadius * 1000 // Convert km to meters
            }
          }]
        }

        // Add crater zone circle using GeoJSON
        const craterZoneGeoJSON = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude]
            },
            properties: {
              radius: impactPrediction.craterSize.diameter / 2 // meters
            }
          }]
        }

        // Add impact zone circle
        map.addSource('impact-zone', {
          type: 'geojson',
          data: impactZoneGeoJSON
        })

        map.addLayer({
          id: 'impact-zone-circle',
          type: 'circle',
          source: 'impact-zone',
          paint: {
            'circle-radius': {
              property: 'radius',
              type: 'identity'
            },
            'circle-color': '#ff4444',
            'circle-opacity': 0.3,
            'circle-stroke-color': '#ff4444',
            'circle-stroke-opacity': 0.8,
            'circle-stroke-width': 2
          }
        })

        // Add crater zone circle
        map.addSource('crater-zone', {
          type: 'geojson',
          data: craterZoneGeoJSON
        })

        map.addLayer({
          id: 'crater-zone-circle',
          type: 'circle',
          source: 'crater-zone',
          paint: {
            'circle-radius': {
              property: 'radius',
              type: 'identity'
            },
            'circle-color': '#ff6666',
            'circle-opacity': 0.6,
            'circle-stroke-color': '#ff6666',
            'circle-stroke-opacity': 1,
            'circle-stroke-width': 3
          }
        })

        // Store map reference for fullscreen functionality and zoom controls
        ;(mapRef.current as any).maplibreMap = map
        setMapInstance(map)
      })

      map.on('error', (error) => {
        console.error('MapLibre GL JS error:', error)
        setMapLoaded(true)
      })

      // Cleanup function
      return () => {
        if (map) {
          map.remove()
        }
        setMapInstance(null)
      }

    } catch (error) {
      console.error('Error initializing MapLibre GL JS map:', error)
      setMapLoaded(true) // Still show the component even if map fails
    }
  }, [impactPrediction])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const zoomIn = () => {
    const map = mapInstance || (mapRef.current as any)?.maplibreMap
    if (map) {
      const currentZoom = map.getZoom()
      map.zoomTo(currentZoom + 1, { duration: 300 })
    }
  }

  const zoomOut = () => {
    const map = mapInstance || (mapRef.current as any)?.maplibreMap
    if (map) {
      const currentZoom = map.getZoom()
      map.zoomTo(currentZoom - 1, { duration: 300 })
    }
  }

  const resetView = () => {
    const map = mapInstance || (mapRef.current as any)?.maplibreMap
    if (map && impactPrediction) {
      map.flyTo({
        center: [impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude],
        zoom: 8,
        duration: 1000
      })
    }
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

  // Calculate visual scale factors for impact zones (fallback visualization)
  const maxRadius = Math.max(currentScenario.affectedRadius, currentScenario.craterSize.diameter / 1000)
  const scaleFactor = Math.min(200 / maxRadius, 1) // Scale to fit in 200px max
  
  const affectedRadiusPx = Math.max(currentScenario.affectedRadius * scaleFactor, 20)
  const craterRadiusPx = Math.max(currentScenario.craterSize.diameter * scaleFactor / 1000, 10)

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
                
                {/* Zoom Controls */}
                {mapLoaded && (mapInstance || (mapRef.current as any)?.maplibreMap) && (
                  <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
                    <button
                      onClick={zoomIn}
                      className="p-2 bg-black/80 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 rounded-lg transition-colors shadow-lg"
                      title="Zoom In"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={zoomOut}
                      className="p-2 bg-black/80 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 rounded-lg transition-colors shadow-lg"
                      title="Zoom Out"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={resetView}
                      className="p-2 bg-black/80 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 rounded-lg transition-colors shadow-lg"
                      title="Reset View"
                    >
                      <Target className="w-4 h-4" />
                    </button>
                  </div>
                )}
        
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-b-xl">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-cyan-400">Loading Impact Map...</p>
                      <p className="text-gray-400 text-sm mt-2">Initializing MapLibre GL JS...</p>
                    </div>
                  </div>
                )}

        {/* Fallback Custom Visualization when map fails to load */}
        {mapLoaded && !(mapRef.current as any)?.maplibreMap && (
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 rounded-b-xl overflow-hidden">
            {/* Earth surface pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-gradient-radial from-green-600/20 via-blue-600/10 to-transparent"></div>
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-500/10 rounded-full"></div>
              <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-green-500/10 rounded-full"></div>
              <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-green-500/10 rounded-full"></div>
              <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-green-500/10 rounded-full"></div>
            </div>

            {/* Grid lines for reference */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full">
                {/* Latitude lines */}
                {[0.25, 0.5, 0.75].map((y, i) => (
                  <div key={i} className="absolute w-full border-t border-white/20" style={{ top: `${y * 100}%` }}></div>
                ))}
                {/* Longitude lines */}
                {[0.25, 0.5, 0.75].map((x, i) => (
                  <div key={i} className="absolute h-full border-l border-white/20" style={{ left: `${x * 100}%` }}></div>
                ))}
              </div>
            </div>

            {/* Impact visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Affected area circle */}
              <div 
                className="absolute border-2 border-red-500/60 rounded-full animate-pulse"
                style={{ 
                  width: `${affectedRadiusPx}px`,
                  height: `${affectedRadiusPx}px`,
                  animationDuration: '3s'
                }}
              >
                <div className="absolute inset-0 rounded-full bg-red-500/10"></div>
              </div>
              
              {/* Secondary blast wave */}
              <div 
                className="absolute border border-red-400/40 rounded-full"
                style={{ 
                  width: `${affectedRadiusPx * 1.5}px`,
                  height: `${affectedRadiusPx * 1.5}px`,
                  animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              >
                <div className="absolute inset-0 rounded-full bg-red-400/5"></div>
              </div>
              
              {/* Crater zone circle */}
              <div 
                className="absolute border-2 border-red-400 rounded-full bg-red-500/20"
                style={{ 
                  width: `${craterRadiusPx}px`,
                  height: `${craterRadiusPx}px`
                }}
              ></div>
              
              {/* Impact point marker */}
              <div className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse">
                <div className="absolute inset-0 rounded-full bg-red-400 animate-ping"></div>
              </div>
            </div>

            {/* Impact effects visualization */}
            <div className="absolute top-4 left-4 space-y-2">
              {currentScenario.impactProbability > 0.001 && (
                <div className="bg-red-900/80 backdrop-blur-sm border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-red-400" />
                    <span className="font-semibold">Impact Detected</span>
                  </div>
                </div>
              )}
              
              {currentScenario.impactEnergy > 1 && (
                <div className="bg-orange-900/80 backdrop-blur-sm border border-orange-500/50 rounded-lg p-3 text-orange-200 text-sm">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-orange-400" />
                    <span className="font-semibold">High Energy Release</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 text-white text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <span>Predicted Impact Point</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-400 rounded-full border border-red-400"></div>
              <span>Crater Zone ({currentScenario.craterSize.diameter.toFixed(0)}m)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500/60 rounded-full border border-red-500"></div>
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
