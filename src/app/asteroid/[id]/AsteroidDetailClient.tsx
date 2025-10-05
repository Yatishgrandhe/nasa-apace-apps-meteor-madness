'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Target, AlertTriangle, Clock, TrendingUp, Zap, Shield, Info, Globe, ExternalLink } from 'lucide-react'
import StandardLayout from '@/components/StandardLayout'
import Object3DViewer from '@/components/Object3DViewer'
import AIResponse from '@/components/AIResponse'
import ImpactMap from '@/components/ImpactMap'
import MitigationStrategies from '@/components/MitigationStrategies'
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
    orbit_class_description?: string
    orbit_class_confidence?: number
    orbit_class_method?: string
    orbit_class_risk_level?: string
    perihelion_distance?: string
    aphelion_distance?: string
    inclination?: string
    period_yr?: string
    semi_major_axis?: string
    eccentricity?: string
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

  const handleBackClick = () => {
    // Try to go back, if no history, go to NEO page
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/neo')
    }
  }

  useEffect(() => {
    const fetchAsteroidDetails = async () => {
      try {
        setLoading(true)
        console.log('Fetching asteroid details for ID:', asteroidId)
        const response = await fetch(`/api/asteroid/${asteroidId}`)
        
        if (!response.ok) {
          throw new Error('Asteroid not found')
        }
        
        const data = await response.json()
        console.log('API response:', data)
        setAsteroid(data.data)
        
        // Prepare asteroid data for impact map
        if (data.data) {
          const closestApproach = data.data.close_approach_data[0]
          console.log('Closest approach data:', closestApproach)
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
          console.log('Setting asteroid map data:', mapData)
          setAsteroidForMap(mapData)
        }
      } catch (err) {
        console.error('Error fetching asteroid details:', err)
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
        onBackClick={handleBackClick}
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
        onBackClick={handleBackClick}
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

  const orbitInfo = getOrbitClassInfo(asteroid.orbital_data?.orbit_class || 'Unknown')
  const latestApproach = asteroid.close_approach_data?.[0]
  const diameterKm = asteroid.estimated_diameter?.kilometers

  return (
    <StandardLayout 
      title={asteroid.name} 
      subtitle={`Asteroid ID: ${asteroid.id}`}
      showBackButton={true} 
      onBackClick={handleBackClick}
    >
      {/* Enhanced Status Indicator */}
      <div className="mb-8">
        <div className={`w-full p-6 rounded-xl border-2 shadow-lg ${asteroid.is_potentially_hazardous 
          ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50 glow-red' 
          : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 glow-green'
        }`}>
          <div className="flex items-center justify-center space-x-4">
            <div className={`p-3 rounded-full ${asteroid.is_potentially_hazardous 
              ? 'bg-gradient-to-r from-red-500 to-orange-500' 
              : 'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}>
              {asteroid.is_potentially_hazardous ? (
                <AlertTriangle className="w-8 h-8 text-white" />
              ) : (
                <Shield className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="text-center">
              <h2 className={`text-2xl font-bold ${asteroid.is_potentially_hazardous ? 'text-red-400' : 'text-green-400'}`}>
                {asteroid.is_potentially_hazardous ? 'POTENTIALLY HAZARDOUS' : 'SAFE ASTEROID'}
              </h2>
              <p className={`text-lg ${asteroid.is_potentially_hazardous ? 'text-red-300' : 'text-green-300'}`}>
                {asteroid.is_potentially_hazardous 
                  ? 'This asteroid poses a potential threat to Earth' 
                  : 'This asteroid poses no significant threat to Earth'
                }
              </p>
              <div className="flex items-center justify-center space-x-4 mt-2">
                <span className="text-sm text-gray-300">
                  Orbit Class: <span className="font-semibold text-white">{orbitInfo.name}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-300">
                  Risk Level: <span className={`font-semibold ${orbitInfo.riskLevel === 'High' ? 'text-red-400' : orbitInfo.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                    {orbitInfo.riskLevel}
                  </span>
                </span>
              </div>
            </div>
          </div>
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrbitClassBgColor(orbitInfo.name)} ${getOrbitClassColor(orbitInfo.name)}`}>
                {orbitInfo.name}
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

      {/* Enhanced Orbital Classification Info */}
      <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue mb-8">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
          <Info className="w-5 h-5" />
          <span>Orbital Classification</span>
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className={`w-3 h-3 rounded-full mt-2 ${getOrbitClassColor(orbitInfo.name)}`}></div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-white font-medium">{orbitInfo.name}</h4>
                {asteroid.orbital_data?.orbit_class_confidence && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    asteroid.orbital_data.orbit_class_confidence >= 80 ? 'bg-green-500/20 text-green-400' :
                    asteroid.orbital_data.orbit_class_confidence >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {asteroid.orbital_data.orbit_class_confidence}% confidence
                  </span>
                )}
                {asteroid.orbital_data?.orbit_class_method && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                    {asteroid.orbital_data.orbit_class_method}
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-sm mb-2">
                {asteroid.orbital_data?.orbit_class_description || orbitInfo.description}
              </p>
              {asteroid.orbital_data?.orbit_class_risk_level && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">Risk Level:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    asteroid.orbital_data.orbit_class_risk_level === 'High' ? 'bg-red-500/20 text-red-400' :
                    asteroid.orbital_data.orbit_class_risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {asteroid.orbital_data.orbit_class_risk_level}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Additional orbital parameters if available */}
          {(asteroid.orbital_data?.semi_major_axis || asteroid.orbital_data?.eccentricity) && (
            <div className="mt-4 pt-4 border-t border-cyan-500/20">
              <h5 className="text-cyan-400 font-medium mb-2">Orbital Parameters</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {asteroid.orbital_data?.semi_major_axis && (
                  <div>
                    <span className="text-gray-400">Semi-major Axis:</span>
                    <span className="text-white ml-2">{parseFloat(asteroid.orbital_data.semi_major_axis).toFixed(3)} AU</span>
                  </div>
                )}
                {asteroid.orbital_data?.eccentricity && (
                  <div>
                    <span className="text-gray-400">Eccentricity:</span>
                    <span className="text-white ml-2">{parseFloat(asteroid.orbital_data.eccentricity).toFixed(3)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
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

      {/* Impact Prediction Map - Only for hazardous asteroids */}
      {asteroidForMap && asteroidForMap.isHazardous ? (
        <ImpactMap 
          asteroid={asteroidForMap} 
          className="mt-8"
        />
      ) : asteroidForMap && (
        <div className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 shadow-lg glow-green mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">No Impact Risk</h3>
              <p className="text-gray-400 text-sm">This asteroid poses no threat to Earth</p>
            </div>
          </div>
          <div className="text-gray-300 text-sm space-y-2">
            <p>This asteroid has been classified as non-hazardous and poses no significant risk of impact with Earth.</p>
            <p>The object's orbital parameters indicate a safe trajectory that will not bring it into dangerous proximity to our planet.</p>
          </div>
        </div>
      )}

      {/* Mitigation Strategies - Only for hazardous asteroids */}
      {asteroidForMap && asteroidForMap.isHazardous && (
        <MitigationStrategies 
          asteroid={asteroidForMap}
          className="mt-8"
        />
      )}

    </StandardLayout>
  )
}
