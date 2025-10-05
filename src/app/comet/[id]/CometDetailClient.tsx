'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Calendar, Target, Zap, Info, Clock, TrendingUp } from 'lucide-react'
import StandardLayout from '@/components/StandardLayout'
import Object3DViewer from '@/components/Object3DViewer'
import AIResponse from '@/components/AIResponse'
import NASAEyesIframe from '@/components/NASAEyesIframe'
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
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(false)

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
            min: comet.estimated_diameter.kilometers.estimated_diameter_min * 1000, // Convert to meters
            max: comet.estimated_diameter.kilometers.estimated_diameter_max * 1000
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
        onBackClick={() => window.history.back()}
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
        onBackClick={() => window.history.back()}
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

  const orbitInfo = getOrbitClassInfo(String(comet.orbital_data?.orbit_class?.orbit_class_type || 'Unknown'))

  return (
    <StandardLayout 
      title={comet.name} 
      subtitle={`Comet ID: ${comet.id}`}
      showBackButton={true} 
      onBackClick={() => window.history.back()}
    >
      {/* Status Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className={`flex items-center space-x-3 px-6 py-3 rounded-full ${comet.is_potentially_hazardous_asteroid ? 'bg-red-500/20 border border-red-500/30' : 'bg-yellow-500/20 border border-yellow-500/30'}`}>
          {comet.is_potentially_hazardous_asteroid ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : (
            <Target className="w-5 h-5 text-yellow-400" />
          )}
          <span className={`font-medium ${comet.is_potentially_hazardous_asteroid ? 'text-red-400' : 'text-yellow-400'}`}>
            {comet.is_potentially_hazardous_asteroid ? 'Potentially Hazardous' : 'Comet'}
          </span>
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
              <span className="text-white font-medium">{comet.absolute_magnitude_h}</span>
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
            {comet.orbital_data?.perihelion_distance && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Perihelion Distance:</span>
                <span className="text-white font-medium">{parseFloat(comet.orbital_data.perihelion_distance).toFixed(3)} AU</span>
              </div>
            )}
            {comet.orbital_data?.aphelion_distance && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Aphelion Distance:</span>
                <span className="text-white font-medium">{parseFloat(comet.orbital_data.aphelion_distance).toFixed(3)} AU</span>
              </div>
            )}
            {comet.orbital_data?.inclination && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Inclination:</span>
                <span className="text-white font-medium">{parseFloat(comet.orbital_data.inclination).toFixed(2)}°</span>
              </div>
            )}
            {comet.orbital_data?.orbital_period && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Orbital Period:</span>
                <span className="text-white font-medium">{parseFloat(comet.orbital_data.orbital_period).toFixed(2)} years</span>
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

      {/* NASA Eyes on the Solar System */}
      {comet && (
        <NASAEyesIframe
          objectId={comet.id}
          objectName={comet.name}
          objectType="comet"
          className="mt-8"
        />
      )}
    </StandardLayout>
  )
}
