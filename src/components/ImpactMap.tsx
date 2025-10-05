'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, AlertTriangle, Maximize2, Minimize2, Target, Info, Zap, Shield, Plus, Minus } from 'lucide-react'
import { predictAsteroidImpact, generateImpactScenarios, type AsteroidData, type ImpactPrediction } from '@/lib/utils/impactCalculator'

// Import MapLibre GL JS with dynamic import for client-side only
let maplibregl: any = null

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
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [maplibreLoaded, setMaplibreLoaded] = useState(false)

  // Client-side detection
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Dynamic MapLibre import
  useEffect(() => {
    if (!isClient) return

    const loadMapLibre = async () => {
      try {
        const maplibreModule = await import('maplibre-gl')
        maplibregl = maplibreModule.default
        
        // CSS will be loaded by the browser automatically
        
        setMaplibreLoaded(true)
        console.log('MapLibre GL JS loaded successfully')
      } catch (error: any) {
        console.error('Failed to load MapLibre GL JS:', error)
        setMapLoaded(true) // Still show fallback UI
      }
    }

    loadMapLibre()
  }, [isClient])

  useEffect(() => {
    console.log('ImpactMap received asteroid data:', asteroid)
    
    // Only calculate impact predictions for hazardous asteroids
    if (!asteroid.isHazardous) {
      console.log('Asteroid is not hazardous, skipping impact prediction')
      setImpactPrediction(null)
      setScenarios([])
      return
    }
    
    // Calculate impact predictions
    const prediction = predictAsteroidImpact(asteroid)
    const allScenarios = generateImpactScenarios(asteroid)
    
    console.log('Impact prediction result:', prediction)
    console.log('All scenarios:', allScenarios)
    
    setImpactPrediction(prediction)
    setScenarios(allScenarios)
  }, [asteroid])

  useEffect(() => {
    // Enhanced null checks and early return
    if (!isClient || !maplibreLoaded || !maplibregl || !mapRef.current || !impactPrediction) {
      setMapLoaded(true)
      return
    }

    // Additional safety check for container element
    const container = mapRef.current
    if (!container || !container.offsetParent && container.offsetWidth === 0 && container.offsetHeight === 0) {
      console.warn('Map container not ready, delaying map initialization')
      setMapLoaded(true)
      return
    }

    // Wait for container to have proper dimensions
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      console.warn('Map container has zero dimensions, delaying initialization')
      const timeoutId = setTimeout(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
          // Retry initialization after a delay
          setMapLoaded(false)
        }
      }, 100)
      return () => clearTimeout(timeoutId)
    }

    // Clean up any existing map instance
    if (mapInstance) {
      try {
        mapInstance.remove()
        setMapInstance(null)
      } catch (error: any) {
        console.warn('Error removing existing map:', error)
      }
    }

    const tomtomApiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY
    
    // Realistic Earth map with satellite imagery and topographic features
    const mapStyle = {
      version: 8 as const,
      sources: {
        'satellite': {
          type: 'raster' as const,
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
        },
        'topographic': {
          type: 'raster' as const,
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: '© Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
        },
        'ocean-basemap': {
          type: 'raster' as const,
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: '© Esri, Garmin, GEBCO, NOAA NGDC, and other contributors'
        },
        'osm-terrain': {
          type: 'raster' as const,
          tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenTopoMap, © OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'ocean-basemap-layer',
          type: 'raster' as const,
          source: 'ocean-basemap',
          paint: {
            'raster-opacity': 0.7
          }
        },
        {
          id: 'satellite-layer',
          type: 'raster' as const,
          source: 'satellite',
          paint: {
            'raster-opacity': 0.8
          }
        },
        {
          id: 'topographic-overlay',
          type: 'raster' as const,
          source: 'topographic',
          paint: {
            'raster-opacity': 0.3
          }
        },
        {
          id: 'terrain-overlay',
          type: 'raster' as const,
          source: 'osm-terrain',
          paint: {
            'raster-opacity': 0.2
          }
        }
      ]
    }

    try {
      // Validate impact prediction data before map initialization
      if (!impactPrediction.impactLocation || 
          typeof impactPrediction.impactLocation.longitude !== 'number' || 
          typeof impactPrediction.impactLocation.latitude !== 'number') {
        console.warn('Invalid impact prediction data, using fallback coordinates')
        impactPrediction.impactLocation = {
          longitude: 0,
          latitude: 0,
          country: 'Unknown',
          region: 'Unknown',
          isLand: false
        }
      }

      // Initialize MapLibre GL JS with realistic Earth styling
      const map = new maplibregl.Map({
        container: container,
        style: mapStyle,
        center: [impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude],
        zoom: 10,
        pitch: 60,
        bearing: 0,
        maxZoom: 20,
        minZoom: 1,
        maxBounds: [[-180, -85], [180, 85]],
        fadeDuration: 500,
        renderWorldCopies: false,
        localIdeographFontFamily: 'Arial, sans-serif'
      })

      map.on('load', () => {
        setMapLoaded(true)

        try {
          // Add realistic impact prediction marker with enhanced visuals
          const impactMarker = document.createElement('div')
          impactMarker.className = 'impact-marker'
          impactMarker.style.cssText = `
            width: 50px;
            height: 50px;
            background: radial-gradient(circle, #ff6b35 0%, #f7931e 30%, #ff0000 70%, #8b0000 100%);
            border: 4px solid #ffffff;
            border-radius: 50%;
            box-shadow: 
              0 0 25px #ff6b35,
              0 0 50px #ff4444,
              0 0 75px #ff0000,
              inset 0 0 15px rgba(255,255,255,0.4),
              inset 0 0 30px rgba(255,255,255,0.1);
            animation: realistic-impact-pulse 3s ease-in-out infinite;
            position: relative;
            cursor: pointer;
          `
          
          // Add realistic pulsing animation with multiple effects
          const style = document.createElement('style')
          style.textContent = `
            @keyframes realistic-impact-pulse {
              0% { 
                transform: scale(1) rotate(0deg); 
                box-shadow: 
                  0 0 25px #ff6b35,
                  0 0 50px #ff4444,
                  0 0 75px #ff0000,
                  inset 0 0 15px rgba(255,255,255,0.4),
                  inset 0 0 30px rgba(255,255,255,0.1);
              }
              25% { 
                transform: scale(1.1) rotate(90deg); 
                box-shadow: 
                  0 0 35px #ff6b35,
                  0 0 70px #ff4444,
                  0 0 105px #ff0000,
                  inset 0 0 20px rgba(255,255,255,0.5),
                  inset 0 0 40px rgba(255,255,255,0.2);
              }
              50% { 
                transform: scale(1.3) rotate(180deg); 
                box-shadow: 
                  0 0 45px #ff6b35,
                  0 0 90px #ff4444,
                  0 0 135px #ff0000,
                  inset 0 0 25px rgba(255,255,255,0.6),
                  inset 0 0 50px rgba(255,255,255,0.3);
              }
              75% { 
                transform: scale(1.1) rotate(270deg); 
                box-shadow: 
                  0 0 35px #ff6b35,
                  0 0 70px #ff4444,
                  0 0 105px #ff0000,
                  inset 0 0 20px rgba(255,255,255,0.5),
                  inset 0 0 40px rgba(255,255,255,0.2);
              }
              100% { 
                transform: scale(1) rotate(360deg); 
                box-shadow: 
                  0 0 25px #ff6b35,
                  0 0 50px #ff4444,
                  0 0 75px #ff0000,
                  inset 0 0 15px rgba(255,255,255,0.4),
                  inset 0 0 30px rgba(255,255,255,0.1);
              }
            }
          `
          document.head.appendChild(style)

          new maplibregl.Marker(impactMarker)
            .setLngLat([impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude])
            .addTo(map)
        } catch (error: any) {
          console.warn('Error adding impact marker:', error)
        }

        // Add impact zone circle using GeoJSON
        const impactZoneGeoJSON = {
          type: 'FeatureCollection' as const,
          features: [{
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude]
            },
            properties: {
              radius: impactPrediction.affectedRadius * 1000 // Convert km to meters
            }
          }]
        }

        // Add crater zone circle using GeoJSON
        const craterZoneGeoJSON = {
          type: 'FeatureCollection' as const,
          features: [{
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude]
            },
            properties: {
              radius: impactPrediction.craterSize.diameter / 2 // meters
            }
          }]
        }

        try {
          // Add realistic impact zone with enhanced visuals
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
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'radius'],
                0, '#ff6b35',
                5000, '#f7931e',
                15000, '#ff4444',
                30000, '#ff6666',
                50000, '#ff8888'
              ],
              'circle-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                6, 0.15,
                10, 0.25,
                14, 0.35,
                18, 0.45
              ],
              'circle-stroke-color': '#ff6b35',
              'circle-stroke-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                6, 0.6,
                10, 0.7,
                14, 0.8,
                18, 0.9
              ],
              'circle-stroke-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                6, 1,
                10, 2,
                14, 3,
                18, 4
              ]
            }
          })
        } catch (error: any) {
          console.warn('Error adding impact zone:', error)
        }

        // Add animated ripple effect for impact zone
        map.addLayer({
          id: 'impact-zone-ripple',
          type: 'circle',
          source: 'impact-zone',
          paint: {
            'circle-radius': {
              property: 'radius',
              type: 'identity'
            },
            'circle-color': '#ff6b35',
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['get', 'radius'],
              0, 0.3,
              10000, 0.2,
              25000, 0.15,
              40000, 0.1,
              50000, 0.05
            ],
            'circle-stroke-color': '#f7931e',
            'circle-stroke-opacity': [
              'interpolate',
              ['linear'],
              ['get', 'radius'],
              0, 0.6,
              10000, 0.4,
              25000, 0.3,
              40000, 0.2,
              50000, 0.1
            ],
            'circle-stroke-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              6, 1,
              10, 2,
              14, 3,
              18, 4
            ]
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
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'radius'],
              0, '#8b0000',
              50, '#ff0000',
              200, '#ff4444',
              500, '#ff6666',
              1000, '#ff8888'
            ],
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              6, 0.3,
              10, 0.5,
              14, 0.7,
              18, 0.9
            ],
            'circle-stroke-color': '#8b0000',
            'circle-stroke-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              6, 0.8,
              10, 0.9,
              14, 1,
              18, 1
            ],
            'circle-stroke-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              6, 2,
              10, 3,
              14, 4,
              18, 5
            ]
          }
        })

        // Add enhanced crater visualization with heat effect
        map.addLayer({
          id: 'crater-heat-zone',
          type: 'circle',
          source: 'crater-zone',
          paint: {
            'circle-radius': {
              property: 'radius',
              type: 'identity'
            },
            'circle-color': '#ff8800',
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['get', 'radius'],
              0, 0.3,
              100, 0.2,
              500, 0.1
            ],
            'circle-stroke-color': '#ff4400',
            'circle-stroke-opacity': 0.4,
            'circle-stroke-width': 1
          }
        })

        // Store map reference for fullscreen functionality and zoom controls
        ;(mapRef.current as any).maplibreMap = map
        setMapInstance(map)
      })

      map.on('error', (error: any) => {
        console.error('MapLibre GL JS error:', error)
        setMapLoaded(true)
      })

      // Store map instance for cleanup
      setMapInstance(map)

      // Cleanup function
      return () => {
        try {
          if (map && !map._removed) {
            map.remove()
          }
      } catch (error: any) {
        console.warn('Error during map cleanup:', error)
        }
        setMapInstance(null)
      }

      } catch (error: any) {
        console.error('Error initializing MapLibre GL JS map:', error)
      setMapLoaded(true) // Still show the component even if map fails
    }
  }, [impactPrediction, mapInstance, isClient, maplibreLoaded])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const zoomIn = () => {
    const map = mapInstance || (mapRef.current as any)?.maplibreMap
    if (map && !map._removed) {
      try {
        const currentZoom = map.getZoom()
        map.zoomTo(currentZoom + 1, { duration: 300 })
      } catch (error: any) {
        console.warn('Error zooming in:', error)
      }
    }
  }

  const zoomOut = () => {
    const map = mapInstance || (mapRef.current as any)?.maplibreMap
    if (map && !map._removed) {
      try {
        const currentZoom = map.getZoom()
        map.zoomTo(currentZoom - 1, { duration: 300 })
      } catch (error: any) {
        console.warn('Error zooming out:', error)
      }
    }
  }

  const resetView = () => {
    const map = mapInstance || (mapRef.current as any)?.maplibreMap
    if (map && !map._removed && impactPrediction) {
      try {
        map.flyTo({
          center: [impactPrediction.impactLocation.longitude, impactPrediction.impactLocation.latitude],
          zoom: 8,
          duration: 1000
        })
      } catch (error: any) {
        console.warn('Error resetting view:', error)
      }
    }
  }

  // Server-side rendering fallback
  if (!isClient) {
    return (
      <div className={`bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading impact map...</p>
        </div>
      </div>
    )
  }

  if (!impactPrediction) {
    // Check if asteroid is non-hazardous
    if (!asteroid.isHazardous) {
      return (
        <div className={`bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 shadow-lg glow-green ${className}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">No Impact Risk</h3>
              <p className="text-gray-400 text-sm">Asteroid: {asteroid.name}</p>
            </div>
          </div>
          <div className="text-gray-300 text-sm space-y-2">
            <p>This asteroid has been classified as non-hazardous and poses no significant risk of impact with Earth.</p>
            <p>The object's orbital parameters indicate a safe trajectory that will not bring it into dangerous proximity to our planet.</p>
            <p>No impact prediction analysis is required for this object.</p>
          </div>
        </div>
      )
    }
    
    // Loading state for hazardous asteroids
    return (
      <div className={`bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Calculating impact prediction...</p>
        </div>
      </div>
    )
  }

  // Show loading while MapLibre is loading
  if (!maplibreLoaded) {
    return (
      <div className={`bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading map engine...</p>
        </div>
      </div>
    )
  }

  const currentScenario = scenarios.find(s => s.scenario === selectedScenario) || impactPrediction

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
                
                {/* Enhanced Map Controls */}
                {mapLoaded && (mapInstance || (mapRef.current as any)?.maplibreMap) && (
                  <div className="absolute top-4 right-4 flex flex-col space-y-3 z-10">
                    {/* Navigation Controls */}
                    <div className="flex flex-col space-y-2">
                    <button
                      onClick={zoomIn}
                        className="group p-3 bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 text-cyan-400 rounded-xl transition-all duration-300 shadow-xl hover:shadow-cyan-500/25 hover:scale-105"
                      title="Zoom In"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={zoomOut}
                        className="group p-3 bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 text-cyan-400 rounded-xl transition-all duration-300 shadow-xl hover:shadow-cyan-500/25 hover:scale-105"
                      title="Zoom Out"
                    >
                        <Minus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={resetView}
                        className="group p-3 bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 text-cyan-400 rounded-xl transition-all duration-300 shadow-xl hover:shadow-cyan-500/25 hover:scale-105"
                      title="Reset View"
                    >
                        <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    </div>

                    {/* Map Style Toggle - Enhanced for realistic Earth views */}
                    {mapInstance && !mapInstance._removed && mapInstance.getLayer('satellite-layer') && mapInstance.getLayer('topographic-overlay') && (
                      <div className="bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-2">
                        <div className="text-xs text-cyan-400 text-center mb-2 font-medium">Map Style</div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              const map = mapInstance
                              if (map && !map._removed && map.getLayer('satellite-layer') && map.getLayer('topographic-overlay')) {
                                try {
                                  map.setPaintProperty('satellite-layer', 'raster-opacity', 0.9)
                                  map.setPaintProperty('topographic-overlay', 'raster-opacity', 0.1)
                                  map.setPaintProperty('terrain-overlay', 'raster-opacity', 0.1)
                                } catch (error: any) {
                                  console.warn('Failed to set satellite view:', error)
                                }
                              }
                            }}
                            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors flex items-center justify-center"
                            title="Satellite View"
                          >
                            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          </button>
                          <button
                            onClick={() => {
                              const map = mapInstance
                              if (map && !map._removed && map.getLayer('satellite-layer') && map.getLayer('topographic-overlay')) {
                                try {
                                  map.setPaintProperty('satellite-layer', 'raster-opacity', 0.3)
                                  map.setPaintProperty('topographic-overlay', 'raster-opacity', 0.8)
                                  map.setPaintProperty('terrain-overlay', 'raster-opacity', 0.5)
                                } catch (error: any) {
                                  console.warn('Failed to set topographic view:', error)
                                }
                              }
                            }}
                            className="w-8 h-8 bg-white hover:bg-gray-100 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center"
                            title="Topographic View"
                          >
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          </button>
                          <button
                            onClick={() => {
                              const map = mapInstance
                              if (map && !map._removed && map.getLayer('satellite-layer') && map.getLayer('topographic-overlay')) {
                                try {
                                  map.setPaintProperty('satellite-layer', 'raster-opacity', 0.6)
                                  map.setPaintProperty('topographic-overlay', 'raster-opacity', 0.4)
                                  map.setPaintProperty('terrain-overlay', 'raster-opacity', 0.3)
                                } catch (error: any) {
                                  console.warn('Failed to set hybrid view:', error)
                                }
                              }
                            }}
                            className="w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-lg border border-purple-500 hover:border-purple-400 transition-colors flex items-center justify-center"
                            title="Hybrid View"
                          >
                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
        
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/80 via-black/60 to-gray-800/80 rounded-b-xl backdrop-blur-sm">
                    <div className="text-center">
                      <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-cyan-400/50 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                      </div>
                      <p className="text-cyan-400 text-lg font-medium">Loading Impact Map...</p>
                      <p className="text-gray-400 text-sm mt-2">Initializing beautiful map visualization...</p>
                      <div className="mt-4 flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

        {/* Enhanced Fallback Custom Visualization when map fails to load */}
        {mapLoaded && !(mapRef.current as any)?.maplibreMap && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 rounded-b-xl overflow-hidden">
            {/* Beautiful Earth-like background with animated elements */}
            <div className="absolute inset-0">
              <div className="w-full h-full bg-gradient-radial from-emerald-600/30 via-blue-600/20 to-slate-800/40"></div>
              
              {/* Animated floating continents */}
              <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-emerald-500/15 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
              <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-green-500/20 rounded-full animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
              <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-blue-500/15 rounded-full animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
              <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-teal-500/20 rounded-full animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}></div>
              
              {/* Additional decorative elements */}
              <div className="absolute top-1/6 left-1/6 w-16 h-16 bg-cyan-500/10 rounded-full animate-bounce" style={{ animationDuration: '6s' }}></div>
              <div className="absolute bottom-1/6 right-1/6 w-20 h-20 bg-indigo-500/15 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
            </div>

            {/* Enhanced grid lines with glow effect */}
            <div className="absolute inset-0 opacity-15">
              <div className="w-full h-full">
                {/* Latitude lines with gradient */}
                {[0.2, 0.4, 0.6, 0.8].map((y, i) => (
                  <div key={i} className="absolute w-full border-t border-gradient-to-r from-transparent via-cyan-400/30 to-transparent" style={{ top: `${y * 100}%` }}></div>
                ))}
                {/* Longitude lines with gradient */}
                {[0.2, 0.4, 0.6, 0.8].map((x, i) => (
                  <div key={i} className="absolute h-full border-l border-gradient-to-b from-transparent via-cyan-400/30 to-transparent" style={{ left: `${x * 100}%` }}></div>
                ))}
              </div>
            </div>

            {/* Enhanced Impact visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Outer blast wave */}
              <div 
                className="absolute border-2 border-orange-400/30 rounded-full animate-pulse"
                style={{ 
                  width: `${affectedRadiusPx * 2}px`,
                  height: `${affectedRadiusPx * 2}px`,
                  animationDuration: '6s'
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-radial from-orange-500/5 to-transparent"></div>
              </div>
              
              {/* Affected area circle */}
              <div 
                className="absolute border-2 border-red-500/60 rounded-full animate-pulse"
                style={{ 
                  width: `${affectedRadiusPx}px`,
                  height: `${affectedRadiusPx}px`,
                  animationDuration: '3s'
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-radial from-red-500/20 to-red-500/5"></div>
                <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: '3s' }}></div>
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
                <div className="absolute inset-0 rounded-full bg-gradient-radial from-red-400/8 to-transparent"></div>
              </div>
              
              {/* Crater zone circle with heat effect */}
              <div 
                className="absolute border-2 border-red-400 rounded-full"
                style={{ 
                  width: `${craterRadiusPx}px`,
                  height: `${craterRadiusPx}px`
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-radial from-red-500/30 via-orange-500/20 to-yellow-500/10"></div>
                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" style={{ animationDuration: '2s' }}></div>
              </div>
              
              {/* Enhanced impact point marker */}
              <div className="absolute w-8 h-8 bg-gradient-radial from-red-500 via-red-600 to-red-800 rounded-full border-2 border-white shadow-xl animate-pulse">
                <div className="absolute inset-0 rounded-full bg-red-400 animate-ping" style={{ animationDuration: '1.5s' }}></div>
                <div className="absolute inset-1 rounded-full bg-white/30"></div>
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

        {/* Enhanced Map Legend */}
        <div className="absolute bottom-4 left-4 bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-4 text-white text-sm shadow-xl">
          <div className="text-cyan-400 font-medium mb-3 text-center">Impact Analysis</div>
          <div className="space-y-3">
            {/* Impact Location Info */}
            <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${currentScenario.impactLocation.isLand ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                <span className="text-xs font-medium">
                  {currentScenario.impactLocation.isLand ? 'Land Impact' : 'Ocean Impact'}
                </span>
              </div>
              <div className="text-xs text-gray-300">
                <div>{currentScenario.impactLocation.country}</div>
                <div className="text-gray-400">{currentScenario.impactLocation.region}</div>
              </div>
            </div>
            
            {/* Impact Zones */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-5 h-5 bg-gradient-radial from-red-500 via-red-600 to-red-800 rounded-full border border-white shadow-lg"></div>
                  <div className="absolute inset-0 w-5 h-5 bg-red-400 animate-ping rounded-full"></div>
                </div>
                <span className="text-sm">Impact Point</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gradient-radial from-red-500/30 via-orange-500/20 to-yellow-500/10 rounded-full border-2 border-red-400"></div>
                <span className="text-sm">Crater Zone ({currentScenario.craterSize.diameter.toFixed(0)}m)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gradient-radial from-red-500/20 to-red-500/5 rounded-full border-2 border-red-500/60"></div>
                <span className="text-sm">Affected Area ({currentScenario.affectedRadius.toFixed(1)}km)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gradient-radial from-orange-500/5 to-transparent rounded-full border-2 border-orange-400/30"></div>
                <span className="text-sm">Blast Wave</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Warning Notice */}
        {currentScenario.impactProbability > 0.01 && (
          <div className="absolute top-4 right-4 bg-gradient-to-br from-red-900/90 to-red-800/80 backdrop-blur-md border border-red-500/60 rounded-xl p-4 text-red-200 text-sm max-w-xs shadow-xl animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="relative">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div className="absolute inset-0 w-6 h-6 text-red-400 animate-ping">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="font-bold text-red-300 text-base">High Impact Risk</div>
                <div className="text-xs mt-2 leading-relaxed">
                  This asteroid has a significant impact probability. Monitor closely for orbital updates and coordinate with planetary defense agencies.
                </div>
                <div className="mt-2 text-xs text-red-400 font-medium">
                  Risk Level: {currentScenario.riskLevel}
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
                <span className="text-gray-400">Location:</span>
                <span className="text-white">{currentScenario.impactLocation.country || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Region:</span>
                <span className="text-white">{currentScenario.impactLocation.region || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Surface:</span>
                <span className={`${currentScenario.impactLocation.isLand ? 'text-green-400' : 'text-blue-400'}`}>
                  {currentScenario.impactLocation.isLand ? 'Land' : 'Ocean'}
                </span>
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
