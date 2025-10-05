'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertTriangle, Calendar, Target, Zap, Info, Clock, TrendingUp, Globe, ExternalLink, Shield } from 'lucide-react'
import StandardLayout from '@/components/StandardLayout'
import Object3DViewer from '@/components/Object3DViewer'
import AIResponse from '@/components/AIResponse'
import ImpactMap from '@/components/ImpactMap'
import MitigationStrategies from '@/components/MitigationStrategies'
import { getOrbitClassInfo, getOrbitClassColor, getOrbitClassBgColor } from '@/lib/utils/orbitClasses'
import { analyzeSingleObjectWithGemini, type SingleObjectAnalysisRequest } from '@/lib/api/gemini'

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
    meters?: {
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
  const router = useRouter()
  const [comet, setComet] = useState<CometData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(false)

  const handleBackClick = () => {
    // Use document.referrer to check if user came from another page
    const referrer = document.referrer
    const currentPath = window.location.pathname
    
    if (referrer && referrer !== window.location.href && referrer.includes(window.location.origin)) {
      // User came from another page in our app, go back
      router.back()
    } else {
      // User came from external source or direct URL, go to NEO page
      router.push('/neo')
    }
  }

  useEffect(() => {
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

  useEffect(() => {
    const runAiAnalysis = async () => {
      if (!comet) return
      
      try {
        setAiLoading(true)
        const closestApproach = comet.close_approach_data[0]
        
        const analysisData: SingleObjectAnalysisRequest = {
          name: comet.name,
          type: 'comet',
          diameter: {
            min: comet.estimated_diameter.meters?.estimated_diameter_min || 
                 comet.estimated_diameter.kilometers.estimated_diameter_min * 1000,
            max: comet.estimated_diameter.meters?.estimated_diameter_max || 
                 comet.estimated_diameter.kilometers.estimated_diameter_max * 1000
          },
          isHazardous: comet.is_potentially_hazardous_asteroid,
          missDistance: parseFloat(closestApproach.miss_distance.astronomical),
          velocity: parseFloat(closestApproach.relative_velocity.kilometers_per_second),
          approachDate: closestApproach.close_approach_date,
          orbitClass: comet.orbital_data.orbit_class.orbit_class_type,
          magnitude: comet.absolute_magnitude_h,
          orbitalPeriod: comet.orbital_data.orbital_period,
          inclination: comet.orbital_data.inclination,
          eccentricity: comet.orbital_data.eccentricity,
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
  }, [comet])

  if (loading) {
    return (
      <StandardLayout 
        title="Loading..." 
        subtitle="Fetching comet data from NASA..." 
        showBackButton={true} 
        onBackClick={handleBackClick}
      >
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-cyan-400 text-lg">Loading comet data...</p>
            </div>
          </div>
      </StandardLayout>
    )
  }

  if (error || !comet) {
    return (
      <StandardLayout 
        title="Comet Not Found" 
        subtitle="The requested comet could not be found." 
        showBackButton={true} 
        onBackClick={handleBackClick}
      >
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 text-lg">Failed to load comet data</p>
              <p className="text-gray-400 text-sm mt-2">{error}</p>
            </div>
          </div>
      </StandardLayout>
    )
  }

  const latestApproach = comet.close_approach_data?.[0]
  const diameterKm = comet.estimated_diameter?.kilometers

  const orbitClassType = comet.orbital_data?.orbit_class?.orbit_class_type
  const orbitInfo = getOrbitClassInfo(orbitClassType || 'Unknown')

  // Transform comet data for map component
  const cometForMap = comet ? {
    id: comet.id,
    name: comet.name,
    estimated_diameter: {
      meters: {
        estimated_diameter_min: comet.estimated_diameter.meters?.estimated_diameter_min || 
                               comet.estimated_diameter.kilometers.estimated_diameter_min * 1000,
        estimated_diameter_max: comet.estimated_diameter.meters?.estimated_diameter_max || 
                               comet.estimated_diameter.kilometers.estimated_diameter_max * 1000
      }
    },
    is_potentially_hazardous: comet.is_potentially_hazardous_asteroid,
    close_approach_data: comet.close_approach_data,
    absolute_magnitude_h: comet.absolute_magnitude_h,
    orbital_data: {
      orbit_class: comet.orbital_data.orbit_class.orbit_class_type,
      perihelion_distance: comet.orbital_data.perihelion_distance,
      aphelion_distance: comet.orbital_data.aphelion_distance,
      inclination: comet.orbital_data.inclination,
      period_yr: comet.orbital_data.orbital_period,
    }
  } : null

  return (
    <StandardLayout 
      title={comet.name} 
      subtitle={`Comet ID: ${comet.id}`}
      showBackButton={true} 
      onBackClick={handleBackClick}
    >
      {/* Enhanced Status Indicator */}
      <div className="mb-8">
        <div className={`w-full p-6 rounded-xl border-2 shadow-lg ${comet.is_potentially_hazardous_asteroid 
          ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50 glow-red' 
          : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50 glow-blue'
        }`}>
          <div className="flex items-center justify-center space-x-4">
            <div className={`p-3 rounded-full ${comet.is_potentially_hazardous_asteroid 
              ? 'bg-gradient-to-r from-red-500 to-orange-500' 
              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
            }`}>
              {comet.is_potentially_hazardous_asteroid ? (
                <AlertTriangle className="w-8 h-8 text-white" />
              ) : (
                <Target className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="text-center">
              <h2 className={`text-2xl font-bold ${comet.is_potentially_hazardous_asteroid ? 'text-red-400' : 'text-blue-400'}`}>
                {comet.is_potentially_hazardous_asteroid ? 'POTENTIALLY HAZARDOUS' : 'COMET'}
              </h2>
              <p className={`text-lg ${comet.is_potentially_hazardous_asteroid ? 'text-red-300' : 'text-blue-300'}`}>
                {comet.is_potentially_hazardous_asteroid 
                  ? 'This comet poses a potential threat to Earth' 
                  : 'This comet is being monitored for scientific study'
                }
              </p>
              <div className="flex items-center justify-center space-x-4 mt-2">
                <span className="text-sm text-gray-300">
                  Orbit Class: <span className="font-semibold text-white">{orbitInfo.name}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-300">
                  Risk Level: <span className={`font-semibold ${orbitInfo.riskLevel === 'High' ? 'text-red-400' : orbitInfo.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-blue-400'}`}>
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
        objectId={comet.id} 
        objectName={comet.name} 
        objectType="comet"
        className="mb-8"
      />

      {/* Comet Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Physical Properties */}
        <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue">
          <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Physical Properties</span>
          </h3>
          <div className="space-y-4">
            {diameterKm && diameterKm.estimated_diameter_min && diameterKm.estimated_diameter_max ? (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Diameter:</span>
                <span className="text-white font-medium">
                  {diameterKm.estimated_diameter_min.toFixed(2)} - {diameterKm.estimated_diameter_max.toFixed(2)} km
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Diameter:</span>
                <span className="text-gray-400 font-medium">Not available</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Absolute Magnitude:</span>
              <span className="text-white font-medium">{comet.absolute_magnitude_h}</span>
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
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Perihelion Distance:</span>
              <span className="text-white font-medium">
                {comet.orbital_data?.perihelion_distance 
                  ? `${parseFloat(comet.orbital_data.perihelion_distance).toFixed(3)} AU`
                  : 'Not available'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Aphelion Distance:</span>
              <span className="text-white font-medium">
                {comet.orbital_data?.aphelion_distance 
                  ? `${parseFloat(comet.orbital_data.aphelion_distance).toFixed(3)} AU`
                  : 'Not available'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Inclination:</span>
              <span className="text-white font-medium">
                {comet.orbital_data?.inclination 
                  ? `${parseFloat(comet.orbital_data.inclination).toFixed(2)}°`
                  : 'Not available'
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Orbital Period:</span>
              <span className="text-white font-medium">
                {comet.orbital_data?.orbital_period 
                  ? `${parseFloat(comet.orbital_data.orbital_period).toFixed(2)} years`
                  : 'Not available'
                }
              </span>
            </div>
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
            <div className={`w-3 h-3 rounded-full mt-2 ${getOrbitClassColor(orbitInfo.name)}`}></div>
            <div>
              <h4 className="text-white font-medium">{orbitInfo.name}</h4>
              <p className="text-gray-300 text-sm">{orbitInfo.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Close Approach Data */}
      {latestApproach ? (
        <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue">
          <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Latest Close Approach</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {latestApproach.close_approach_date 
                  ? new Date(latestApproach.close_approach_date).toLocaleDateString()
                  : 'Not available'
                }
              </div>
              <div className="text-sm text-gray-400">Approach Date</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {latestApproach.miss_distance?.astronomical
                  ? parseFloat(latestApproach.miss_distance.astronomical).toFixed(3)
                  : 'Not available'
                }
              </div>
              <div className="text-sm text-gray-400">Miss Distance (AU)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {latestApproach.relative_velocity?.kilometers_per_second
                  ? parseFloat(latestApproach.relative_velocity.kilometers_per_second).toFixed(2)
                  : 'Not available'
                }
              </div>
              <div className="text-sm text-gray-400">Velocity (km/s)</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 shadow-lg glow-blue">
          <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Close Approach Data</span>
          </h3>
          <div className="text-center py-8">
            <p className="text-gray-400">Close approach data not available for this comet.</p>
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
            <p className="text-gray-400">Analyzing comet data with AI...</p>
          </div>
        ) : aiAnalysis ? (
          <AIResponse 
            content={aiAnalysis} 
            title="Comet Impact Risk Assessment"
            type="analysis"
            className="mb-4"
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">AI analysis will appear here once data is loaded.</p>
          </div>
        )}
      </div>

      {/* Impact Prediction Map - Only for hazardous comets */}
      {cometForMap && cometForMap.is_potentially_hazardous ? (
        <ImpactMap 
          asteroid={cometForMap} 
          className="mt-8"
        />
      ) : cometForMap && (
        <div className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 shadow-lg glow-green mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">No Impact Risk</h3>
              <p className="text-gray-400 text-sm">This comet poses no threat to Earth</p>
            </div>
          </div>
          <div className="text-gray-300 text-sm space-y-2">
            <p>This comet has been classified as non-hazardous and poses no significant risk of impact with Earth.</p>
            <p>The object's orbital parameters indicate a safe trajectory that will not bring it into dangerous proximity to our planet.</p>
          </div>
        </div>
      )}

      {/* Mitigation Strategies - Only for hazardous comets */}
      {cometForMap && cometForMap.is_potentially_hazardous && (
        <MitigationStrategies 
          asteroid={cometForMap}
          className="mt-8"
        />
      )}

    </StandardLayout>
  )
}
