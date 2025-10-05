'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Target, AlertTriangle, Clock, TrendingUp, Zap, Shield, Info } from 'lucide-react'
import StandardLayout from '@/components/StandardLayout'
import Object3DViewer from '@/components/Object3DViewer'
import AIResponse from '@/components/AIResponse'
import ImpactMap from '@/components/ImpactMap'
import NASAEyesIframe from '@/components/NASAEyesIframe'
import { getOrbitClassInfo, getOrbitClassColor, getOrbitClassBgColor } from '@/lib/utils/orbitClasses'
import { analyzeSingleObjectWithGemini, type SingleObjectAnalysisRequest } from '@/lib/api/gemini'

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
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(false)
  const [asteroidForMap, setAsteroidForMap] = useState<any>(null)

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
        
        // Prepare asteroid data for impact map
        if (data.data) {
          const closestApproach = data.data.close_approach_data[0]
          const mapData = {
            name: data.data.name,
            diameter: {
              min: data.data.estimated_diameter.meters.estimated_diameter_min,
              max: data.data.estimated_diameter.meters.estimated_diameter_max
            },
            velocity: parseFloat(closestApproach.relative_velocity.kilometers_per_second),
            missDistance: parseFloat(closestApproach.miss_distance.astronomical),
            isHazardous: data.data.is_potentially_hazardous,
            approachDate: closestApproach.close_approach_date,
            inclination: data.data.orbital_data?.inclination,
            orbitClass: data.data.orbital_data?.orbit_class
          }
          setAsteroidForMap(mapData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch asteroid details')
      } finally {
        setLoading(false)
      }
    }

    fetchAsteroidDetails()
  }, [asteroidId])

  useEffect(() => {
    const runAiAnalysis = async () => {
      if (!asteroid) return
      
      try {
        setAiLoading(true)
        const closestApproach = asteroid.close_approach_data[0]
        
        const analysisData: SingleObjectAnalysisRequest = {
          name: asteroid.name,
          type: 'asteroid',
          diameter: {
            min: asteroid.estimated_diameter.meters.estimated_diameter_min,
            max: asteroid.estimated_diameter.meters.estimated_diameter_max
          },
          isHazardous: asteroid.is_potentially_hazardous,
          missDistance: parseFloat(closestApproach.miss_distance.astronomical),
          velocity: parseFloat(closestApproach.relative_velocity.kilometers_per_second),
          approachDate: closestApproach.close_approach_date,
          orbitClass: asteroid.orbital_data.orbit_class,
          magnitude: asteroid.absolute_magnitude_h,
          orbitalPeriod: asteroid.orbital_data.period_yr,
          inclination: asteroid.orbital_data.inclination,
        }

        const result = await analyzeSingleObjectWithGemini(analysisData)
        setAiAnalysis(result.analysis)
      } catch (error) {
        console.error('Error running AI analysis:', error)
        setAiAnalysis('AI analysis temporarily unavailable. Please try again later.')
      } finally {
        setAiLoading(false)
      }
    }

    runAiAnalysis()
  }, [asteroid])

  if (loading) {
    return (
      <StandardLayout 
        title="Loading..." 
        subtitle="Fetching asteroid data from NASA..." 
        showBackButton={true} 
        onBackClick={() => router.push('/neo')}
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400 text-lg">Loading asteroid details...</p>
          </div>
        </div>
      </StandardLayout>
    )
  }

  if (error || !asteroid) {
    return (
      <StandardLayout 
        title="Asteroid Not Found" 
        subtitle="The requested asteroid could not be found." 
        showBackButton={true} 
        onBackClick={() => router.push('/neo')}
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-300 mb-6">Please check the asteroid ID and try again.</p>
          </div>
        </div>
      </StandardLayout>
    )
  }

  const orbitInfo = getOrbitClassInfo(String(asteroid.orbital_data?.orbit_class || 'Unknown'))
  const latestApproach = asteroid.close_approach_data?.[0]
  const diameterKm = asteroid.estimated_diameter?.kilometers

  return (
    <StandardLayout 
      title={asteroid.name} 
      subtitle={`Asteroid ID: ${asteroid.id}`}
      showBackButton={true} 
      onBackClick={() => router.push('/neo')}
    >
      {/* Status Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className={`flex items-center space-x-3 px-6 py-3 rounded-full ${asteroid.is_potentially_hazardous ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'}`}>
          {asteroid.is_potentially_hazardous ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : (
            <Shield className="w-5 h-5 text-green-400" />
          )}
          <span className={`font-medium ${asteroid.is_potentially_hazardous ? 'text-red-400' : 'text-green-400'}`}>
            {asteroid.is_potentially_hazardous ? 'Potentially Hazardous' : 'Safe Asteroid'}
          </span>
        </div>
      </div>

      {/* 3D Object Visualization */}
      <Object3DViewer 
        objectId={asteroid.id} 
        objectName={asteroid.name} 
        objectType="asteroid"
              className="mb-8"
      />

      {/* Asteroid Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Physical Properties */}
        <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue">
          <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Physical Properties</span>
          </h3>
          <div className="space-y-4">
            {diameterKm && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Diameter:</span>
                <span className="text-white font-medium">
                  {diameterKm.estimated_diameter_min.toFixed(2)} - {diameterKm.estimated_diameter_max.toFixed(2)} km
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Absolute Magnitude:</span>
              <span className="text-white font-medium">{asteroid.absolute_magnitude_h}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Orbital Class:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrbitClassBgColor(orbitInfo.type)} ${getOrbitClassColor(orbitInfo.type)}`}>
                {orbitInfo.type}
              </span>
            </div>
          </div>
        </div>

        {/* Orbital Data */}
        <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue">
          <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Orbital Characteristics</span>
          </h3>
          <div className="space-y-4">
            {asteroid.orbital_data?.perihelion_distance && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Perihelion Distance:</span>
                <span className="text-white font-medium">{parseFloat(asteroid.orbital_data.perihelion_distance).toFixed(3)} AU</span>
              </div>
            )}
            {asteroid.orbital_data?.aphelion_distance && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Aphelion Distance:</span>
                <span className="text-white font-medium">{parseFloat(asteroid.orbital_data.aphelion_distance).toFixed(3)} AU</span>
                </div>
            )}
            {asteroid.orbital_data?.inclination && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Inclination:</span>
                <span className="text-white font-medium">{parseFloat(asteroid.orbital_data.inclination).toFixed(2)}°</span>
                </div>
            )}
            {asteroid.orbital_data?.period_yr && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Orbital Period:</span>
                <span className="text-white font-medium">{parseFloat(asteroid.orbital_data.period_yr).toFixed(2)} years</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orbital Classification Info */}
      <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue mb-8">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
          <Info className="w-5 h-5" />
          <span>Orbital Classification</span>
        </h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className={`w-3 h-3 rounded-full mt-2 ${getOrbitClassColor(orbitInfo.type)}`}></div>
            <div>
              <h4 className="text-white font-medium">{orbitInfo.type}</h4>
              <p className="text-gray-300 text-sm">{orbitInfo.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Close Approach Data */}
      {latestApproach && (
        <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Latest Close Approach</span>
              </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {new Date(latestApproach.close_approach_date).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-400">Approach Date</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {parseFloat(latestApproach.miss_distance.astronomical).toFixed(3)}
              </div>
              <div className="text-sm text-gray-400">Miss Distance (AU)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {parseFloat(latestApproach.relative_velocity.kilometers_per_second).toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Velocity (km/s)</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Section */}
      <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue mt-8">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>AI Analysis</span>
        </h3>
        
        {aiLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mb-4 animate-pulse">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400">Analyzing asteroid data with AI...</p>
          </div>
        ) : aiAnalysis ? (
          <AIResponse 
            content={aiAnalysis} 
            title="Asteroid Impact Risk Assessment"
            type="analysis"
            className="mb-4"
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">AI analysis will appear here once data is loaded.</p>
          </div>
        )}
      </div>

      {/* Impact Prediction Map */}
      {asteroidForMap && (
        <ImpactMap 
          asteroid={asteroidForMap} 
          className="mt-8"
        />
      )}

      {/* NASA Eyes on the Solar System */}
      {asteroid && (
        <NASAEyesIframe
          objectId={asteroid.id}
          objectName={asteroid.name}
          objectType="asteroid"
          className="mt-8"
        />
      )}
    </StandardLayout>
  )
}
