'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Globe, Target, AlertTriangle, Clock, TrendingUp, Zap, Shield } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { getOrbitClassInfo, getOrbitClassColor, getOrbitClassBgColor } from '@/lib/utils/orbitClasses'

interface AsteroidDetailClientProps {
  asteroidId: string
}

interface AsteroidDetail {
  id: string
  name: string
  diameter: {
    min: number
    max: number
  }
  is_potentially_hazardous: boolean
  close_approach_data: Array<{
    close_approach_date: string
    relative_velocity: {
      kilometers_per_second: string
      kilometers_per_hour: string
    }
    miss_distance: {
      astronomical: string
      lunar: string
      kilometers: string
    }
    orbiting_body: string
  }>
  orbital_data: {
    orbit_class: string
    perihelion_distance: string
    aphelion_distance: string
    inclination: string
    period_yr: string
  }
  absolute_magnitude_h: number
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number
      estimated_diameter_max: number
    }
    kilometers: {
      estimated_diameter_min: number
      estimated_diameter_max: number
    }
  }
}

export default function AsteroidDetailClient({ asteroidId }: AsteroidDetailClientProps) {
  const router = useRouter()
  const [asteroid, setAsteroid] = useState<AsteroidDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAsteroidDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/asteroid/${asteroidId}`)
        
        if (!response.ok) {
          throw new Error('Asteroid not found')
        }
        
        const data = await response.json()
        setAsteroid(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch asteroid details')
      } finally {
        setLoading(false)
      }
    }

    fetchAsteroidDetails()
  }, [asteroidId])

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400 text-lg">Loading asteroid details...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !asteroid) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">Asteroid Not Found</h2>
            <p className="text-gray-300 mb-6">The requested asteroid could not be found.</p>
            <button
              onClick={() => router.push('/neo')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Asteroid Watch</span>
            </button>
          </div>
        </div>
      </>
    )
  }

  const orbitInfo = getOrbitClassInfo(String(asteroid.orbital_data?.orbit_class || 'Unknown'))
  const latestApproach = asteroid.close_approach_data?.[0]
  const diameterKm = asteroid.estimated_diameter?.kilometers

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className="relative z-10 pt-20 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <button
                onClick={() => router.push('/neo')}
                className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Asteroid Watch</span>
              </button>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${asteroid.is_potentially_hazardous ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                  {asteroid.is_potentially_hazardous ? (
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  ) : (
                    <Shield className="w-6 h-6 text-green-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">{asteroid.name}</h1>
                  <p className="text-gray-400">ID: {asteroid.id}</p>
                </div>
              </div>
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
                  src={`https://eyes.nasa.gov/apps/solar-system/#/asteroid/${asteroid.id}?rate=0&shareButton=false&surfaceMapTiling=true&hd=true&spout=false`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  title={`NASA Eyes 3D Visualization - ${asteroid.name}`}
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
                <p className="text-gray-300 mb-2">{asteroid.name}</p>
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
                {/* Physical Properties */}
                <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Physical Properties</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Absolute Magnitude:</span>
                      <span className="text-white font-medium">{asteroid.absolute_magnitude_h}</span>
                    </div>
                    {diameterKm && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Diameter (min):</span>
                          <span className="text-white font-medium">
                            {(diameterKm.estimated_diameter_min * 1000).toFixed(0)} m
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Diameter (max):</span>
                          <span className="text-white font-medium">
                            {(diameterKm.estimated_diameter_max * 1000).toFixed(0)} m
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-300">Potentially Hazardous:</span>
                      <span className={`font-medium ${asteroid.is_potentially_hazardous ? 'text-red-400' : 'text-green-400'}`}>
                        {asteroid.is_potentially_hazardous ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Orbital Data */}
                {asteroid.orbital_data && (
                  <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
                      <Target className="w-5 h-5" />
                      <span>Orbital Data</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Orbit Class:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getOrbitClassBgColor(String(asteroid.orbital_data.orbit_class))} ${getOrbitClassColor(String(asteroid.orbital_data.orbit_class))}`}>
                          {orbitInfo.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Perihelion Distance:</span>
                        <span className="text-white font-medium">{String(asteroid.orbital_data.perihelion_distance || 'N/A')} AU</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Aphelion Distance:</span>
                        <span className="text-white font-medium">{String(asteroid.orbital_data.aphelion_distance || 'N/A')} AU</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Inclination:</span>
                        <span className="text-white font-medium">{String(asteroid.orbital_data.inclination || 'N/A')}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Orbital Period:</span>
                        <span className="text-white font-medium">{String(asteroid.orbital_data.period_yr || 'N/A')} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Eccentricity:</span>
                        <span className="text-white font-medium">{String(asteroid.orbital_data.eccentricity || 'N/A')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Semi-Major Axis:</span>
                        <span className="text-white font-medium">{String(asteroid.orbital_data.semi_major_axis || 'N/A')} AU</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Argument of Perihelion:</span>
                        <span className="text-white font-medium">{String(asteroid.orbital_data.argument_of_perihelion || 'N/A')}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Longitude of Ascending Node:</span>
                        <span className="text-white font-medium">{String(asteroid.orbital_data.longitude_of_ascending_node || 'N/A')}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Mean Anomaly:</span>
                        <span className="text-white font-medium">{String(asteroid.orbital_data.mean_anomaly || 'N/A')}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Mean Motion:</span>
                        <span className="text-white font-medium">{String(asteroid.orbital_data.mean_motion || 'N/A')}°/day</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Right Column - Close Approaches */}
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
                      <Clock className="w-5 h-5" />
                      <span>
                        {new Date(latestApproach.close_approach_date) > new Date() 
                          ? 'Predicted Latest Close Approach' 
                          : 'Latest Close Approach'
                        }
                      </span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">
                          {new Date(latestApproach.close_approach_date) > new Date() 
                            ? 'Predicted Date:' 
                            : 'Date:'
                          }
                        </span>
                        <span className="text-white font-medium">
                          {new Date(latestApproach.close_approach_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Relative Velocity:</span>
                        <span className="text-white font-medium">
                          {latestApproach.relative_velocity?.kilometers_per_second 
                            ? parseFloat(String(latestApproach.relative_velocity.kilometers_per_second)).toFixed(2) 
                            : 'N/A'} km/s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Miss Distance:</span>
                        <span className="text-white font-medium">
                          {latestApproach.miss_distance?.kilometers 
                            ? parseFloat(String(latestApproach.miss_distance.kilometers)).toFixed(0) 
                            : 'N/A'} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Miss Distance (lunar):</span>
                        <span className="text-white font-medium">
                          {latestApproach.miss_distance?.lunar 
                            ? parseFloat(String(latestApproach.miss_distance.lunar)).toFixed(2) 
                            : 'N/A'} LD
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Orbiting Body:</span>
                        <span className="text-white font-medium">{String(latestApproach.orbiting_body || 'N/A')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Assessment */}
                <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Risk Assessment</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Hazard Level:</span>
                      <span className={`font-medium ${asteroid.is_potentially_hazardous ? 'text-red-400' : 'text-green-400'}`}>
                        {asteroid.is_potentially_hazardous ? 'High' : 'Low'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Monitoring Status:</span>
                      <span className="text-yellow-400 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Data Source:</span>
                      <span className="text-cyan-400 font-medium">NASA JPL</span>
                    </div>
                  </div>
                </div>
              </motion.div>
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
          </div>
        </div>
      </div>
    </>
  )
}
