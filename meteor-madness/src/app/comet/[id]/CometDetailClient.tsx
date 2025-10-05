'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, AlertTriangle, Calendar, Target, Zap, Info } from 'lucide-react'
import { getOrbitClassInfo, getOrbitClassColor, getOrbitClassBgColor } from '@/lib/utils/orbitClasses'

interface CometDetailClientProps {
  cometId: string
}

interface CometData {
  id: string
  name: string
  type: 'comet'
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number
      estimated_diameter_max: number
    }
  }
  is_potentially_hazardous_asteroid: boolean
  absolute_magnitude_h: number
  orbital_data: {
    orbit_class: {
      orbit_class_type: string
      orbit_class_description: string
    }
    last_observation_date: string
    perihelion_distance: string
    aphelion_distance: string
    orbital_period: string
    inclination: string
    eccentricity: string
  }
  close_approach_data: Array<{
    close_approach_date: string
    miss_distance: {
      astronomical: string
      lunar: string
    }
    relative_velocity: {
      kilometers_per_second: string
      kilometers_per_hour: string
    }
    orbiting_body: string
  }>
}

export default function CometDetailClient({ cometId }: CometDetailClientProps) {
  const [comet, setComet] = useState<CometData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const fetchCometData = async () => {
      try {
        console.log('Fetching comet data for ID:', cometId)
        setLoading(true)
        const response = await fetch(`/api/comet/${cometId}`)
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch comet data: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Received data:', data)
        setComet(data.data)
      } catch (err) {
        console.error('Error fetching comet data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load comet data')
      } finally {
        setLoading(false)
      }
    }

    fetchCometData()
  }, [cometId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 relative overflow-hidden">
        <div className="max-w-7xl 2xl:max-w-[140rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12 relative z-10">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-cyan-400 text-lg">Loading comet data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !comet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 relative overflow-hidden">
        <div className="max-w-7xl 2xl:max-w-[140rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12 relative z-10">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 text-lg">Failed to load comet data</p>
              <p className="text-gray-400 text-sm mt-2">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const latestApproach = comet.close_approach_data?.[0]
  const diameterKm = comet.estimated_diameter?.kilometers

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
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg glow-orange"
          >
            <Globe className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4"
          >
            {comet.name}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-center justify-center space-x-4"
          >
            <span className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium">
              Comet
            </span>
            {comet.is_potentially_hazardous_asteroid && (
              <span className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Potentially Hazardous</span>
              </span>
            )}
            <div className="text-gray-400">
              <p className="text-gray-400">ID: {comet.id}</p>
            </div>
          </motion.div>
        </motion.div>

            {/* 3D Object Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6"
            >
              <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>3D Object Visualization</span>
              </h3>
          <div className="h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
            <iframe
              src={`https://eyes.nasa.gov/apps/solar-system/#/asteroid/${comet.id}?rate=0&shareButton=false&surfaceMapTiling=true&hd=true&spout=false`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              title={`NASA Eyes 3D Visualization - ${comet.name}`}
              className="w-full h-full"
              onError={(e) => {
                console.warn('NASA Eyes iframe failed to load, showing fallback');
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="flex items-center justify-center h-full text-gray-400">
                    <div class="text-center">
                      <div class="text-4xl mb-2">🌌</div>
                      <p>3D visualization temporarily unavailable</p>
                      <p class="text-sm mt-1">Visit <a href="https://eyes.nasa.gov/apps/solar-system/" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">NASA Eyes on Solar System</a> directly</p>
                    </div>
                  </div>
                `;
              }}
            />
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-300 mb-2">{comet.name}</p>
                <p className="text-sm text-gray-400">
                  {diameterKm ? `${(diameterKm.estimated_diameter_min * 1000).toFixed(0)}m - ${(diameterKm.estimated_diameter_max * 1000).toFixed(0)}m diameter` : 'Size unknown'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
              Interactive 3D visualization powered by NASA Eyes on the Solar System
                </p>
              </div>
            </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Physical Characteristics */}
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Physical Characteristics</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Name:</span>
                  <span className="text-white font-medium">{comet.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Type:</span>
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-sm">Comet</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Diameter:</span>
                  <span className="text-white font-medium">
                    {diameterKm ? `${diameterKm.estimated_diameter_min.toFixed(2)} - ${diameterKm.estimated_diameter_max.toFixed(2)} km` : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Absolute Magnitude:</span>
                  <span className="text-white font-medium">{comet.absolute_magnitude_h?.toFixed(2) || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Last Observed:</span>
                  <span className="text-white font-medium">{String(comet.orbital_data?.last_observation_date || 'Unknown')}</span>
                </div>
              </div>
            </div>

            {/* Orbital Information */}
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Orbital Information</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Orbit Class:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getOrbitClassBgColor(String(comet.orbital_data?.orbit_class?.orbit_class_type || 'Unknown'))} ${getOrbitClassColor(String(comet.orbital_data?.orbit_class?.orbit_class_type || 'Unknown'))}`}>
                    {getOrbitClassInfo(String(comet.orbital_data?.orbit_class?.orbit_class_type || 'Unknown')).name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Perihelion Distance:</span>
                  <span className="text-white font-medium">{String(comet.orbital_data?.perihelion_distance || 'Unknown')} AU</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Aphelion Distance:</span>
                  <span className="text-white font-medium">{String(comet.orbital_data?.aphelion_distance || 'Unknown')} AU</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Orbital Period:</span>
                  <span className="text-white font-medium">{String(comet.orbital_data?.orbital_period || 'Unknown')} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Inclination:</span>
                  <span className="text-white font-medium">{String(comet.orbital_data?.inclination || 'Unknown')}°</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Eccentricity:</span>
                  <span className="text-white font-medium">{String(comet.orbital_data?.eccentricity || 'Unknown')}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Approach Data */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Latest Close Approach */}
            {latestApproach && (
              <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date(String(latestApproach.close_approach_date)) > new Date() 
                      ? 'Predicted Latest Close Approach' 
                      : 'Latest Close Approach'
                    }
                  </span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">
                      {new Date(String(latestApproach.close_approach_date)) > new Date() 
                        ? 'Predicted Date:' 
                        : 'Date:'
                      }
                    </span>
                    <span className="text-white font-medium">{String(latestApproach.close_approach_date)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Miss Distance:</span>
                    <span className="text-white font-medium">{String(latestApproach.miss_distance?.astronomical || 'Unknown')} AU</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Velocity:</span>
                    <span className="text-white font-medium">{String(latestApproach.relative_velocity?.kilometers_per_second || 'Unknown')} km/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Orbiting Body:</span>
                    <span className="text-white font-medium">{String(latestApproach.orbiting_body)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Assessment */}
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Risk Assessment</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Hazardous:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${comet.is_potentially_hazardous_asteroid ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {comet.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}
                  </span>
                </div>
                {comet.is_potentially_hazardous_asteroid && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-red-400 font-medium text-sm">Potentially Hazardous Comet</p>
                        <p className="text-gray-400 text-xs mt-1">
                          This comet has been classified as potentially hazardous due to its size and close approach distance.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>Additional Information</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">NEOWatch ID:</span>
                  <span className="text-white font-medium font-mono">{comet.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Data Source:</span>
                  <span className="text-white font-medium">NASA JPL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Last Updated:</span>
                  <span className="text-white font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* NEOWatch Footer */}
      <div className="mt-12 pt-8 border-t border-cyan-500/20">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="text-center">
            <h4 className="text-lg font-bold text-cyan-400">NEOWatch</h4>
            <p className="text-sm text-gray-400">Professional Near Earth Objects Monitoring System</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
            Powered by NASA API
          </p>
        </div>
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